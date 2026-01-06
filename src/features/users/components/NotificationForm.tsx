"use client"

import { UserNotificationSettingsTable } from "@/drizzle/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNotificationSettingSchema } from "../actions/schema";
import z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/LoadingSwap";
import { toast } from "sonner";
import { updateUserNotificationSettings } from "../actions/userNotificationSettings";

export function NotificationForm({
    notificationSettings
}: {
    notificationSettings?: Pick<
        typeof UserNotificationSettingsTable.$inferSelect, "newJobEmailNotifications" | "aiPrompt">
}) {
    const form = useForm({
        resolver: zodResolver(useNotificationSettingSchema),
        defaultValues: notificationSettings ?? {
            aiPrompt: "",
            newJobEmailNotifications: false
        }
    })

    async function onSubmit(data: z.infer<typeof useNotificationSettingSchema>) {
        const result = await updateUserNotificationSettings(data);

        if (result.error) {
            toast.error(result.message)
        } else {
            toast.success(result.message)
        }
    }

    const newJobEmailNotifications = form.watch("newJobEmailNotifications");

    return <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="border rounded-lg p-4 shadow-sm space-y-6">
                <FormField
                    name="newJobEmailNotifications"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <FormLabel>New Job Email Notifications</FormLabel>
                                    <FormDescription>
                                        Receive emails about new job listings that match your search criteria.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </div>
                        </FormItem>
                    )}>

                </FormField>
                {newJobEmailNotifications && (
                    <FormField
                        name="aiPrompt"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <div className="space-y-0.5">
                                    <FormLabel>Filter Prompt</FormLabel>
                                    <FormDescription>
                                        Our AI will use this prompt to filter job listings and only send you notifications for jobs that match your criteria.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        value={field.value ?? ""}
                                        className="min-h-32"
                                        placeholder="Describe the jobs you are interested in receiving notifications for. For example: 'Remote jobs in San Francisco, CA as a junior software engineer'">

                                    </Textarea>
                                </FormControl>
                                <FormDescription>
                                    Leave blank to receive notifications of all new job listings.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}>

                    </FormField>
                )}
            </div>
            <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full">
                <LoadingSwap isLoading={form.formState.isSubmitting}>
                    Save Notification Settings
                </LoadingSwap>
            </Button>
        </form>
    </Form>;
}