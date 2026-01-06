import { getGlobalTag, getIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getOrganizationGlobalTag() {
    return getGlobalTag("organizations")
}

export function getOrganizationIdTag(orgId: string) {
    return getIdTag("organizations", orgId)
}

export function revalidateOrganizationCache(id: string) {
    revalidateTag(getOrganizationGlobalTag(), "max")
    revalidateTag(getOrganizationIdTag(id), "max")
}