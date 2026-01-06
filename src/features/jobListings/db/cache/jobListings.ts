import { getGlobalTag, getIdTag, getOrganizationTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getJobListingsGlobalTag() {
    return getGlobalTag("jobListings")
}

export function getJobListingsOrganizationTag(orgId: string) {
    return getOrganizationTag("jobListings", orgId)
}

export function getJobListingsIdTag(jobListingId: string) {
    return getIdTag("jobListings", jobListingId)
}

export function revalidateJobListingsCache({ id, orgId }: { id: string, orgId: string }) {
    revalidateTag(getJobListingsGlobalTag(), "max")
    revalidateTag(getJobListingsOrganizationTag(orgId), "max")
    revalidateTag(getJobListingsIdTag(id), "max")
}