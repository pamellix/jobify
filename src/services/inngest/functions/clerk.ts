import { inngest } from "../client";
import { Webhook } from "svix";
import { env } from "@/data/env/server";
import { NonRetriableError } from "inngest";
import { deleteOrganization, insertOrganization, updateOrganization } from "@/features/organizations/db/organizations";
import { insertUser, updateUser, deleteUser } from "@/features/users/db/users";
import { insertUserNotificationSettings } from "@/features/users/db/userNotificationSettings";
import { deleteOrganizationUserSettings, insertOrganizationUserSettings } from "@/features/organizations/db/organizationUserSettings";

function verifyWebhook({ raw, headers }: { raw: string, headers: Record<string, string> }) {
    return new Webhook(env.CLERK_WEBHOOK_SECRET).verify(raw, headers);
}


export const clerkCreateUser = inngest.createFunction(
    {
        id: "clerk/create-db-user",
        name: "Clerk - Create DB User"
    },
    {
        event: "clerk/user.created"
    }, async ({ event, step }) => {
        await step.run("verify-webhook", async () => {
            try {
                verifyWebhook(event.data)
            } catch (error) {
                throw new NonRetriableError("Invalid webhook")
            }
        })

        const userId = await step.run("create-user", async () => {
            const userData = event.data.data;
            const email = userData.email_addresses.find(
                email => email.id === userData.primary_email_address_id
            )

            if (email == null) {
                throw new NonRetriableError("No email found")
            }

            await insertUser({
                id: userData.id,
                name: `${userData.first_name} ${userData.last_name}`,
                imageUrl: userData.image_url,
                email: email.email_address,
                createdAt: new Date(userData.created_at),
                updatedAt: new Date(userData.updated_at),
            });

            return userData.id;
        })

        await step.run("create-user-notification-settings", async () => {
            await insertUserNotificationSettings({ userId });
        })
    });

export const clerkUpdateUser = inngest.createFunction(
    { id: "clerk/update-db-user", name: "Clerk - Update DB User" },
    { event: "clerk/user.updated" },
    async ({ event, step }) => {
        await step.run("verify-webhook", async () => {
            try {
                verifyWebhook(event.data)
            } catch (error) {
                throw new NonRetriableError("Invalid webhook")
            }
        })

        await step.run("update-user", async () => {
            const userData = event.data.data;
            const email = userData.email_addresses.find(
                email => email.id === userData.primary_email_address_id
            )

            if (email == null) {
                throw new NonRetriableError("No email found")
            }

            await updateUser(userData.id, {
                name: `${userData.first_name} ${userData.last_name}`,
                imageUrl: userData.image_url,
                email: email.email_address,
                updatedAt: new Date(userData.updated_at),
            })
        })
    })

export const clerkDeleteUser = inngest.createFunction(
    { id: "clerk/delete-db-user", name: "Clerk - Delete DB User" },
    { event: "clerk/user.deleted" },
    async ({ event, step }) => {
        await step.run("verify-webhook", async () => {
            try {
                verifyWebhook(event.data)
            } catch (error) {
                throw new NonRetriableError("Invalid webhook")
            }
        })

        await step.run("delete-user", async () => {
            const { id } = event.data.data

            if (id == null) {
                throw new NonRetriableError("No user ID found")
            }

            await deleteUser(id);
        })
    }
)

export const clerkCreateOrganization = inngest.createFunction(
    {
        id: "clerk/create-db-organization",
        name: "Clerk - Create DB Organization"
    },
    {
        event: "clerk/organization.created"
    }, async ({ event, step }) => {
        await step.run("verify-webhook", async () => {
            try {
                verifyWebhook(event.data)
            } catch (error) {
                throw new NonRetriableError("Invalid webhook")
            }
        })

        const orgId = await step.run("create-organization", async () => {
            const orgData = event.data.data;

            await insertOrganization({
                id: orgData.id,
                name: orgData.name,
                imageUrl: orgData.image_url,
                createdAt: new Date(orgData.created_at),
                updatedAt: new Date(orgData.updated_at),
            });
        })
    });

export const clerkDeleteOrgMembership = inngest.createFunction(
    {
        id: "clerk/delete-db-organization-membership",
        name: "Clerk - Delete DB Organization Membership"
    },
    {
        event: "clerk/organizationMembership.deleted"
    }, async ({ event, step }) => {
        await step.run("verify-webhook", async () => {
            try {
                verifyWebhook(event.data)
            } catch (error) {
                throw new NonRetriableError("Invalid webhook")
            }
        })

        await step.run("delete-organization-user-settings", async () => {
            const userId = event.data.data.public_user_data.user_id;
            const orgId = event.data.data.organization.id;

            await deleteOrganizationUserSettings({
                userId,
                organizationId: orgId
            });
        })
    });

export const clerkCreateOrgMembership = inngest.createFunction(
    {
        id: "clerk/create-organization-user-settings",
        name: "Clerk - Create Organization User Settings"
    },
    {
        event: "clerk/organizationMembership.created"
    }, async ({ event, step }) => {
        await step.run("verify-webhook", async () => {
            try {
                verifyWebhook(event.data)
            } catch (error) {
                throw new NonRetriableError("Invalid webhook")
            }
        })

        await step.run("create-organization-user-settings", async () => {
            const userId = event.data.data.public_user_data.user_id;
            const orgId = event.data.data.organization.id;

            await insertOrganizationUserSettings({
                userId,
                organizationId: orgId
            });
        })
    });

export const clerkUpdateOrganization = inngest.createFunction(
    { id: "clerk/update-db-organization", name: "Clerk - Update DB Organization" },
    { event: "clerk/organization.updated" },
    async ({ event, step }) => {
        await step.run("verify-webhook", async () => {
            try {
                verifyWebhook(event.data)
            } catch (error) {
                throw new NonRetriableError("Invalid Webhook")
            }
        })

        await step.run("update-organization", async () => {
            const orgData = event.data.data;

            await updateOrganization(orgData.id, {
                name: orgData.name,
                imageUrl: orgData.image_url,
                updatedAt: new Date(orgData.updated_at)
            })
        })
    }
)

export const clerkDeleteOrganization = inngest.createFunction(
    { id: "clerk/delete-db-organization", name: "Clerk - Update DB Organization" },
    { event: "clerk/organization.deleted" },
    async ({ event, step }) => {
        await step.run("verify-webhook", async () => {
            try {
                verifyWebhook(event.data)
            } catch (error) {
                throw new NonRetriableError("Invalid Webhook")
            }
        })

        await step.run("delete-organization", async () => {
            const { id } = event.data.data

            if (id == null) {
                throw new NonRetriableError("No organization ID found")
            }

            await deleteOrganization(id)
        })
    }
)