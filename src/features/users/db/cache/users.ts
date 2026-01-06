import { getGlobalTag, getIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getUserGlobalTag() {
    return getGlobalTag("users")
}

export function getUserIdTag(userId: string) {
    return getIdTag("users", userId)
}

export function revalidateUserCache(id: string) {
    revalidateTag(getUserGlobalTag(), "max")
    revalidateTag(getUserIdTag(id), "max")
}