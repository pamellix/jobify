"use server"

import z from "zod";
import { useNotificationSettingSchema } from "./schema";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { updateUserNotificationSettingsDb } from "../db/userNotificationSettings";

export async function updateUserNotificationSettings(
    unsafeData: z.infer<typeof useNotificationSettingSchema>
) {
    const { userId } = await getCurrentUser();

    if (userId == null) {
        return {
            error: true,
            message: "You must be logged in to update your notification settings"
        }
    }

    const { success, data } = useNotificationSettingSchema.safeParse(unsafeData);
    if (!success) {
        return {
            error: true,
            message: "There was an error updating your notification settings"
        }
    }

    await updateUserNotificationSettingsDb(userId, data);

    return {
        error: false,
        message: "Notification settings updated successfully"
    }
}