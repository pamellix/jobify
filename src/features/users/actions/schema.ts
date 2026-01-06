import z from "zod";

export const useNotificationSettingSchema = z.object({
    newJobEmailNotifications: z.boolean(),
    aiPrompt: z.string().transform(val => val.trim() === "" ? null : val).nullable()
})