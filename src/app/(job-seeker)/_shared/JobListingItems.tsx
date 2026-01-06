import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { experienceLevel, JobListingTable, jobListingType, locationRequirements, OrganizationTable } from "@/drizzle/schema";
import { convertSearchParamsToString } from "@/lib/convertSearchParamsToString";
import { cn } from "@/lib/utils";
import { and, desc, eq, ilike, or, SQL } from "drizzle-orm";
import Link from "next/link";
import { Suspense } from "react";
import { differenceInDays } from "date-fns";
import { connection } from "next/server";
import { Badge } from "lucide-react";
import { JobListingBadges } from "@/features/jobListings/components/jobListingBadges";
import z from "zod";
import { cacheTag } from "next/cache";
import { getJobListingsGlobalTag } from "@/features/jobListings/db/cache/jobListings";
import { getOrganizationIdTag } from "@/features/organizations/db/cache/organizations";

type Props = {
    searchParams: Promise<Record<string, string | string[]>>,
    params?: Promise<{ jobListingId: string }>
}

const searchParamsSchema = z.object({
    title: z.string().optional().catch(undefined),
    city: z.string().optional().catch(undefined),
    state: z.string().optional().catch(undefined),
    experienceLevel: z.enum(experienceLevel).optional().catch(undefined),
    locationRequirement: z.enum(locationRequirements).optional().catch(undefined),
    type: z.enum(jobListingType).optional().catch(undefined),
    jobIds: z.union([z.string(), z.array(z.string())])
        .transform(val => {
            if (Array.isArray(val)) {
                // Каждый элемент массива тоже может содержать запятые
                return val.flatMap(v => v.split(',').map(s => s.trim()).filter(Boolean))
            }
            return val.split(',').map(s => s.trim()).filter(Boolean)
        })
        .optional()
        .catch([]),
})

export function JobListingItems(props: Props) {
    return <Suspense>
        <SuspendedComponent {...props} />
    </Suspense>;
}

async function SuspendedComponent({ searchParams, params }: Props) {
    const jobListingId = params ? (await params).jobListingId : undefined
    const { success, data } = searchParamsSchema.safeParse(await searchParams)
    const search = success ? data : {};
    const jobListings = await getJobListings(search, jobListingId)

    if (jobListings.length === 0) {
        return <div className="text-muted-foreground p-4">
            No job listings found
        </div>
    }

    return <div className="space-y-4">
        {jobListings.map(jobListing => (
            <Link className="block" key={jobListing.id} href={`/job-listings/${jobListing.id}?${convertSearchParamsToString(search)}`}>
                <JobListingsItem
                    jobListing={jobListing}
                    organization={jobListing.organization}
                />
            </Link>
        ))}
    </div>
}

async function getJobListings(
    searchParams: z.infer<typeof searchParamsSchema>,
    jobListingId: string | undefined
) {
    "use cache"
    cacheTag(getJobListingsGlobalTag())

    const whereConditions: (SQL | undefined)[] = [];

    if (searchParams.title) {
        whereConditions.push(ilike(JobListingTable.title, `%${searchParams.title}%`))
    }

    if (searchParams.locationRequirement) {
        whereConditions.push(eq(JobListingTable.locationRequirement, searchParams.locationRequirement))
    }

    if (searchParams.city) {
        whereConditions.push(ilike(JobListingTable.city, `%${searchParams.city}%`))
    }

    if (searchParams.state) {
        whereConditions.push(ilike(JobListingTable.stateAbbreviation, `%${searchParams.state}%`))
    }

    if (searchParams.experienceLevel) {
        whereConditions.push(eq(JobListingTable.experienceLevel, searchParams.experienceLevel))
    }

    if (searchParams.type) {
        whereConditions.push(eq(JobListingTable.type, searchParams.type))
    }

    if (searchParams.jobIds) {
        whereConditions.push(
            or(...searchParams.jobIds.map(jobId => eq(JobListingTable.id, jobId)))
        )
    }

    const data = await db.query.JobListingTable.findMany({
        where: or(jobListingId ? and(eq(JobListingTable.status, "published"),
            eq(JobListingTable.id, jobListingId)) : undefined,
            and(eq(JobListingTable.status, "published"), ...whereConditions)),
        with: {
            organization: {
                columns: {
                    id: true,
                    name: true,
                    imageUrl: true
                }
            }
        },
        orderBy: [desc(JobListingTable.isFeatured), desc(JobListingTable.postedAt)]
    })

    data.forEach(listing => {
        cacheTag(getOrganizationIdTag(listing.organization.id))
    })

    return data;
}

function JobListingsItem({
    jobListing,
    organization
}: {
    jobListing: Pick<typeof JobListingTable.$inferSelect,
        | "title"
        | "stateAbbreviation"
        | "city"
        | "postedAt"
        | "wage"
        | "wageInterval"
        | "experienceLevel"
        | "locationRequirement"
        | "type"
        | "isFeatured"
    >,
    organization: Pick<typeof OrganizationTable.$inferSelect, "name" | "imageUrl">
}) {
    const nameInitials = organization?.name
        .split(" ")
        .splice(0, 4)
        .map(word => word[0])
        .join("")

    return <Card className={cn("@container", jobListing.isFeatured &&
        "border-featured bg-featured/20"
    )}>
        <CardHeader>
            <div className="flex gap-4">
                <Avatar className="size-14 @max-sm:hidden">
                    <AvatarImage src={organization.imageUrl ?? undefined} alt={organization.name} />
                    <AvatarFallback className="uppercase bg-primary text-primary-foreground">
                        {nameInitials}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col grid-1">
                    <CardTitle className="text-xl">
                        {jobListing.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                        {organization.name}
                    </CardDescription>
                    {jobListing.postedAt != null && (
                        <div className="text-sm font-medium text-primary @min-md:hidden">
                            <Suspense fallback={jobListing.postedAt.toLocaleDateString()}>
                                <DaysSincePosting postedAt={jobListing.postedAt} />
                            </Suspense>
                        </div>
                    )}
                </div>
                {jobListing.postedAt != null && (
                    <div className="text-sm font-medium text-primary min-md:hidden ml-auto @max-md:hidden">
                        <Suspense fallback={jobListing.postedAt.toLocaleDateString()}>
                            <DaysSincePosting postedAt={jobListing.postedAt} />
                        </Suspense>
                    </div>
                )}
            </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
            <JobListingBadges jobListing={jobListing} className={jobListing.isFeatured ? "border-primary/35" : undefined} />
        </CardContent>
    </Card>
}

async function DaysSincePosting({ postedAt }: { postedAt: Date }) {
    await connection()
    const daysSincePosted = differenceInDays(postedAt, Date.now())

    if (daysSincePosted === 0) {
        return <Badge>New</Badge>
    }

    return new Intl.RelativeTimeFormat(undefined, {
        style: "narrow",
        numeric: "always"
    }).format(daysSincePosted, "days")
}