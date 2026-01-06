"use server"

import { getCurrentOrganization, getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { jobListingAiSearchFormSchema, jobListingSchema } from "./schema";
import { z } from "zod";
import { redirect } from "next/navigation";
import { insertJobListing, updateJobListing as updateJobListingDb } from "../db/jobListings";
import { cacheTag } from "next/cache";
import { getJobListingsGlobalTag, getJobListingsIdTag } from "../db/cache/jobListings";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { JobListingTable } from "@/drizzle/schema";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermissions";
import { getNextJobListingStatus } from "../lib/utils";
import { hasReachedMaxFeaturedJobListings, hasReachedMaxPublishedJobListings } from "../lib/planFeatureHelpers";
import { deleteJobListingDb } from "../db/jobListings";
import { getMatchingJobListings } from "@/services/inngest/ai/getMatchingJobListings";

export async function createJobListing(unsafeData: z.infer<typeof jobListingSchema>) {
    const { orgId } = await getCurrentOrganization()

    if (orgId == null || !(await hasOrgUserPermission("org:job_listing_applications:create"))) {
        return {
            error: true,
            message: "You don't have permission to create a job listing"
        }
    }

    const { success, data } = jobListingSchema.safeParse(unsafeData)

    if (!success) {
        return {
            error: true,
            message: "There was an error creating your job listing"
        }
    }



    const jobListing = await insertJobListing({
        ...data,
        organizationId: orgId,
        status: "draft"
    })

    redirect(`/employer/job-listings/${jobListing.id}`)
}

export async function updateJobListing(id: string, unsafeData: z.infer<typeof jobListingSchema>) {
    const { orgId } = await getCurrentOrganization()

    if (orgId == null || !(await hasOrgUserPermission("org:job_listing_applications:update"))) {
        return {
            error: true,
            message: "You don't have permission to update a job listing"
        }
    }

    const { success, data } = jobListingSchema.safeParse(unsafeData)

    if (!success) {
        return {
            error: true,
            message: "There was an error creating your job listing"
        }
    }

    const jobListing = await getJobListing(id, orgId)

    if (jobListing == null) {
        return {
            error: true,
            message: "Job listing not found"
        }
    }

    const updatedJobListing = await updateJobListingDb(id, data)

    redirect(`/employer/job-listings/${updatedJobListing.id}`)
}

async function getJobListing(jobListingId: string, orgId: string) {
    "use cache"
    cacheTag(getJobListingsIdTag(jobListingId))

    return db.query.JobListingTable.findFirst({
        where: and(
            eq(JobListingTable.id, jobListingId),
            eq(JobListingTable.organizationId, orgId))
    })
}

export async function toggleJobListingStatus(id: string) {
    const error = {
        error: true,
        message: "You don't have permission to update this job listing status"
    }

    const { orgId } = await getCurrentOrganization();

    if (orgId == null) {
        return error;
    }

    const jobListing = await getJobListing(id, orgId);

    if (jobListing == null) {
        return {
            error: true,
            message: "There was an error finding your job listing"
        }
    }

    const newStatus = getNextJobListingStatus(jobListing.status);
    if (!(await hasOrgUserPermission("org:job_listing_applications:change_status")) || (newStatus === "published" && (await hasReachedMaxPublishedJobListings()))) {
        return error;
    }

    await updateJobListingDb(id, {
        status: newStatus,
        isFeatured: newStatus === "published" ? undefined : false,
        postedAt: newStatus === "published" && jobListing.postedAt === null ? new Date() : undefined,
    })

    return { error: false, }
}

export async function toggleJobListingFeatured(id: string) {
    const error = {
        error: true,
        message: "You don't have permission to update this job listing featured status"
    }

    const { orgId } = await getCurrentOrganization();

    if (orgId == null) {
        return error;
    }

    const jobListing = await getJobListing(id, orgId);

    if (jobListing == null) {
        return {
            error: true,
            message: "There was an error finding your job listing"
        }
    }

    const newFeaturedStatus = !jobListing.isFeatured;
    if (!(await hasOrgUserPermission("org:job_listing_applications:change_status")) || (newFeaturedStatus && (await hasReachedMaxFeaturedJobListings()))) {
        return error;
    }

    await updateJobListingDb(id, {
        isFeatured: newFeaturedStatus
    })

    return { error: false, }
}

export async function deleteJobListing(id: string) {
    const error = {
        error: true,
        message: "You don't have permission to delete this job listing"
    }

    const { orgId } = await getCurrentOrganization();

    if (orgId == null) {
        return error;
    }

    const jobListing = await getJobListing(id, orgId);

    if (jobListing == null) {
        return error
    }

    if (!(await hasOrgUserPermission("org:job_listing_applications:delete"))) {
        return error;
    }

    await deleteJobListingDb(id);

    redirect("/employer")
}

export async function getAiJobListingSearchResults(unsafeData: z.infer<typeof jobListingAiSearchFormSchema>): Promise<
    { error: true, message: string } | { error: false, jobIds: string[] }> {
    const { success, data } = jobListingAiSearchFormSchema.safeParse(unsafeData)

    if (!success) {
        return {
            error: true,
            message: "There was an error searching for job listings"
        }
    }

    const { userId } = await getCurrentUser()

    if (userId == null) {
        return {
            error: true,
            message: "You need an account to use AI job search"
        }
    }

    const allListings = await getPublicJobListings()
    const matchedListings = await getMatchingJobListings(data.query, allListings, {
        maxNumberOfJobs: 10
    })

    if (matchedListings.length === 0) {
        return {
            error: true,
            message: "No jobs match your search criteria"
        }
    }

    return { error: false, jobIds: matchedListings }
}

async function getPublicJobListings() {
    "use cache"
    cacheTag(getJobListingsGlobalTag())

    return db.query.JobListingTable.findMany({
        where: eq(JobListingTable.status, "published"),
    })
}