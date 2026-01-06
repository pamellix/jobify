import { auth } from "@clerk/nextjs/server";

type UserPermission =
    | "org:job_listing_applications:change_rating"
    | "org:job_listing_applications:change_stage"
    | "org:job_listing_applications:change_status"
    | "org:job_listing_applications:create"
    | "org:job_listing_applications:delete"
    | "org:job_listing_applications:update"


export async function hasOrgUserPermission(permission: UserPermission) {
    const { has } = await auth();

    return has({ permission })
}