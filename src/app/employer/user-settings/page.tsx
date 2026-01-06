import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { OrganizationUserSettingsTable } from "@/drizzle/schema";
import { NotificationForm } from "@/features/organizations/components/NotificationForm";
import { getOrganizationUserSettingsIdTag } from "@/features/organizations/db/cache/organizationUserSettings";
import { getCurrentOrganization, getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default function EmployerUserSettingsPage() {
    return (
        <Suspense>
            <SuspendedComponent />
        </Suspense>
    );
}

async function SuspendedComponent() {
    const { userId } = await getCurrentUser()
    const { orgId } = await getCurrentOrganization()
    if (userId == null || orgId == null) return notFound()

    return <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">
            Notifications Settings
        </h1>
        <Card>
            <CardContent>
                <Suspense fallback={<LoadingSpinner />}>
                    <SuspendedForm userId={userId} orgId={orgId} />
                </Suspense>
            </CardContent>
        </Card>
    </div>
}

async function SuspendedForm({ userId, orgId }: { userId: string, orgId: string }) {
    const notificationSettings = await getNotificationSettings({
        userId,
        orgId
    });

    return <NotificationForm notificationSettings={notificationSettings} />;
}

async function getNotificationSettings({ userId, orgId }: { userId: string, orgId: string }) {
    "use cache"
    cacheTag(getOrganizationUserSettingsIdTag({ userId, organizationId: orgId }))

    return db.query.OrganizationUserSettingsTable.findFirst({
        where: and(eq(OrganizationUserSettingsTable.userId, userId), eq(OrganizationUserSettingsTable.organizationId, orgId)),
        columns: {
            newApplicationEmailNotifications: true,
            minimumRating: true,
        }
    })
}