import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { JobListingTable } from "@/drizzle/schema";
import { JobListingForm } from "@/features/jobListings/components/JobListingForm";
import { getJobListingsIdTag } from "@/features/jobListings/db/cache/jobListings";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Props = {
    params: Promise<{ jobListingId: string }>
}

export default function EditJobListingPage(props: Props) {
    return <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-2">Edit Job Listing</h1>
        <p className="text-muted-foreground mb-6">This does not post the listing yet. It just saves a draft.</p>
        <Card>
            <CardContent>
                <Suspense>
                    <SuspendedPage {...props} />
                </Suspense>
            </CardContent>
        </Card>
    </div>
}

async function SuspendedPage({ params }: Props) {
    const { jobListingId } = await params;
    const { orgId } = await getCurrentOrganization();

    if (orgId == null) return notFound();

    const jobListing = await getJobListing(jobListingId, orgId);
    if (jobListing == null) return notFound();


    return <JobListingForm jobListing={jobListing} />
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