"use client"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExperienceLevel, experienceLevel, JobListingType, jobListingType, LocationRequirement, locationRequirements } from "@/drizzle/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod";
import { formatExperienceLevel, formatJobType, formatLocationRequirement } from "../lib/formatters";
import { StateSelectItems } from "./StateSelectItems";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/LoadingSwap";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";

const ANY_VALUE = "any"

const jobListingFilterSchema = z.object({
    title: z.string().optional(),
    city: z.string().optional(),
    stateAbbreviation: z.string().or(z.literal(ANY_VALUE)).optional(),
    experienceLevel: z.enum(experienceLevel).or(z.literal(ANY_VALUE)).optional(),
    type: z.enum(jobListingType).or(z.literal(ANY_VALUE)).optional(),
    locationRequirement: z.enum(locationRequirements).or(z.literal(ANY_VALUE)).optional(),
})

export function JobListingFilterForm() {
    const searchParams = useSearchParams()

    const router = useRouter();
    const pathname = usePathname();
    const { setOpenMobile } = useSidebar();

    const form = useForm({
        resolver: zodResolver(jobListingFilterSchema),
        defaultValues: {
            title: searchParams.get("title") ?? "",
            city: searchParams.get("city") ?? "",
            stateAbbreviation: searchParams.get("state") ?? ANY_VALUE,
            experienceLevel: (searchParams.get("experience") as ExperienceLevel) ?? ANY_VALUE,
            type: (searchParams.get("type") as JobListingType) ?? ANY_VALUE,
            locationRequirement: (searchParams.get("locationRequirement") as LocationRequirement) ?? ANY_VALUE,
        }
    })

    function onSubmit(data: z.infer<typeof jobListingFilterSchema>) {
        const newParams = new URLSearchParams()

        if (data.city) newParams.set("city", data.city)
        if (data.stateAbbreviation && data.stateAbbreviation !== ANY_VALUE) newParams.set("state", data.stateAbbreviation)
        if (data.experienceLevel && data.experienceLevel !== ANY_VALUE) newParams.set("experience", data.experienceLevel)
        if (data.type && data.type !== ANY_VALUE) newParams.set("type", data.type)
        if (data.locationRequirement && data.locationRequirement !== ANY_VALUE) newParams.set("locationRequirement", data.locationRequirement)
        if (data.title) newParams.set("title", data.title)

        router.push(`${pathname}?${newParams.toString()}`)
        setOpenMobile(false)
    }

    return <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
                name="title"
                control={form.control}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}>

            </FormField>
            <FormField
                name="locationRequirement"
                control={form.control}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Location Requirement</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value={ANY_VALUE}>Any</SelectItem>
                                {locationRequirements.map(lr => (
                                    <SelectItem key={lr} value={lr}>
                                        {formatLocationRequirement(lr)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormItem>
                )}>
            </FormField>
            <FormField
                name="city"
                control={form.control}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}>
            </FormField>
            <FormField
                name="stateAbbreviation"
                control={form.control}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>State</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value={ANY_VALUE}>Any</SelectItem>
                                <StateSelectItems />
                            </SelectContent>
                        </Select>
                    </FormItem>
                )}>
            </FormField>
            <FormField
                name="type"
                control={form.control}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Job Type</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value={ANY_VALUE}>Any</SelectItem>
                                {jobListingType.map(type => (
                                    <SelectItem key={type} value={type}>
                                        {formatJobType(type)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormItem>
                )}>
            </FormField>
            <FormField
                name="experienceLevel"
                control={form.control}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Experience Level</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value={ANY_VALUE}>Any</SelectItem>
                                {experienceLevel.map(experience => (
                                    <SelectItem key={experience} value={experience}>
                                        {formatExperienceLevel(experience)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormItem>
                )}>
            </FormField>
            <Button disabled={form.formState.isSubmitting} type="submit" className="w-full">
                <LoadingSwap isLoading={form.formState.isSubmitting}>
                    Filter
                </LoadingSwap>
            </Button>
        </form>
    </Form>;
}