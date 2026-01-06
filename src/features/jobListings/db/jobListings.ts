import { db } from "@/drizzle/db";
import { JobListingTable } from "@/drizzle/schema";
import { revalidateJobListingsCache } from "./cache/jobListings";
import { eq } from "drizzle-orm";

export async function insertJobListing(data: typeof JobListingTable.$inferInsert) {
    const [newListing] = await db.insert(JobListingTable).values(data).returning({
        id: JobListingTable.id,
        orgId: JobListingTable.organizationId,
    })

    revalidateJobListingsCache(newListing)

    return newListing;
}

export async function updateJobListing(id: string, data: Partial<typeof JobListingTable.$inferInsert>) {
    const [updatedListing] = await db
        .update(JobListingTable)
        .set(data)
        .where(eq(JobListingTable.id, id))
        .returning({
            id: JobListingTable.id,
            orgId: JobListingTable.organizationId
        })

    revalidateJobListingsCache(updatedListing)

    return updatedListing;
}

export async function deleteJobListingDb(id: string) {
    const [deletedListing] = await db
        .delete(JobListingTable)
        .where(
            eq(JobListingTable.id, id)
        )
        .returning({
            id: JobListingTable.id,
            orgId: JobListingTable.organizationId
        })

    revalidateJobListingsCache(deletedListing)

    return deletedListing;
}