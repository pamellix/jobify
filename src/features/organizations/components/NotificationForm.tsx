"use client"

import { OrganizationUserSettingsTable} from "@/drizzle/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/LoadingSwap";
import { toast } from "sonner";
import { organizationUserSettingsSchema as organizationUserSettingsSchema } from "../actions/schemas";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RatingIcons } from "@/features/jobListingApplications/components/RatingIcons";
import { RATING_OPTIONS } from "@/features/jobListingApplications/data/constants";
import { updateOrganizationUserSettings } from "../actions/organizationUserSettingsActions";

const ANY_VALUE = "any"

export function NotificationForm({
    notificationSettings
}: {
    notificationSettings?: Pick<
        typeof OrganizationUserSettingsTable.$inferSelect, "newApplicationEmailNotifications" | "minimumRating">
}) {
    const form = useForm({
        resolver: zodResolver(organizationUserSettingsSchema),
        defaultValues: notificationSettings ?? {
            newApplicationEmailNotifications: false,
            minimumRating: null
        }
    })

    async function onSubmit(data: z.infer<typeof organizationUserSettingsSchema>) {
        const result = await updateOrganizationUserSettings(data);

        if (result.error) {
            toast.error(result.message)
        } else {
            toast.success(result.message)
        }
    }

    const newApplicationEmailNotifications = form.watch("newApplicationEmailNotifications");

    return <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="border rounded-lg p-4 shadow-sm space-y-6">
                <FormField
                    name="newApplicationEmailNotifications"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <FormLabel>New Job Email Notifications</FormLabel>
                                    <FormDescription>
                                        Receive summary email of all new job listings applications
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </div>
                        </FormItem>
                    )}>

                </FormField>
                {newApplicationEmailNotifications && (
                    <FormField
                        name="minimumRating"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Minimum Rating</FormLabel>
                                <Select value={field.value ? field.value.toString() : ANY_VALUE}
                                    onValueChange={val => field.onChange(val === ANY_VALUE ? null : parseInt(val))}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue asChild>
                                                {field.value == null ? <span>Any rating</span> : <RatingIcons className="text-inherit" rating={field.value} />}
                                            </SelectValue>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value={ANY_VALUE}>Any rating</SelectItem>
                                        {RATING_OPTIONS.filter(r => r != null).map(rating => (
                                            <SelectItem key={rating} value={rating.toString()}>
                                                <RatingIcons className="text-inherit" rating={rating} />
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Only receive notifications for applications with a rating greater than or equal to the selected rating. Candidates with a rating lower than the selected rating will not be notified.
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