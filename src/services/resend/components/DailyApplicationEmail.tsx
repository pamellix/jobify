import { JobListingApplicationTable } from "@/drizzle/schema";
import { Container, Head, Heading, Html, Section, Tailwind, Text } from "@react-email/components";
import { ReactNode } from "react";
import tailwindConfig from "../data/tailwindConfig";
import { cn } from "@/lib/utils";

type Application = Pick<
    typeof JobListingApplicationTable.$inferSelect,
    "rating"
> & {
    userName: string,
    organizationId: string,
    organizationName: string,
    jobListingId: string,
    jobListingTitle: string
}

export default function DailyApplicationEmail({
    userName,
    applications
}: {
    userName: string,
    applications: Application[],
}): ReactNode {
    return <Tailwind config={tailwindConfig}>
        <Html>
            <Head />
            <Container className="font-sans">
                <Heading as="h1">
                    New Applications!
                </Heading>

                <Text>Hi {userName}. Here are the new applications that were submitted today:</Text>

                {Object.entries
                    (Object.groupBy(applications, a => a.organizationId))
                    .map(([orgId, orgApplications], i) => {
                        if (orgApplications == null || orgApplications.length === 0) return null;

                        return <OrganizationSection key={orgId} orgName={orgApplications[0].organizationName} applications={orgApplications} noMargin={i === 0} />
                    })}
            </Container>
        </Html>
    </Tailwind>;
}

function OrganizationSection({
    orgName,
    applications,
    noMargin = false
}: {
    orgName: string,
    applications: Application[],
    noMargin?: boolean
}) {
    return <Section className={noMargin ? undefined : "mt-8"}>
        <Heading as="h2" className="leading-none font-semibold text-3xl my-4">
            {orgName}
        </Heading>
        {Object.entries(Object.groupBy(applications, a => a.jobListingId)).map((
            [jobListingId, jobListingApplications], j) => {
            if (jobListingApplications == null || jobListingApplications.length === 0) return null;

            return (
                <JobListingCard
                    key={jobListingId}
                    jobListingTitle={jobListingApplications[0].jobListingTitle}
                    applications={jobListingApplications}
                />
            )
        }
        )}
    </Section>
}

function JobListingCard({
    jobListingTitle,
    applications,
    noMargin = false
}: {
    jobListingTitle: string,
    applications: Application[],
    noMargin?: boolean
}) {
    return (
        <div className={cn("bg-card text-card-foreground rounded-lg border p-4 border-primary border-solid", !noMargin && "mt-6")}>
            <Heading as="h3" className="leading-none font-semibold text-xl mt-0 mb-3">
                {jobListingTitle}
            </Heading>
            {applications.map((applications, i) => {
                return (
                    <Text key={i} className="mt-2 mb-0">
                        <span>{applications.userName}: </span>
                        <RatingIcons rating={applications.rating} />
                    </Text>
                )
            })}
        </div>
    )
}

function RatingIcons({
    rating
}: {
    rating: number | null
}) {
    if (rating == null || rating < 1 || rating > 5) {
        return "Unrated";
    }

    const stars: ReactNode[] = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <span key={i} className="w-3 -mb-[7px] mr-0.5">
                {rating >= i ? "★" : "☆"}
            </span>
        )
    }

    return stars;
}

DailyApplicationEmail.PreviewProps = {
    userName: "John Doe",
    applications: [
        {
            rating: 4,
            userName: "John Doe",
            organizationId: crypto.randomUUID(),
            organizationName: "Web Dev Simplified",
            jobListingId: crypto.randomUUID(),
            jobListingTitle: "Frontend Developer",
        },
        {
            rating: 3,
            userName: "Jane Doe",
            organizationId: crypto.randomUUID(),
            organizationName: "Google",
            jobListingId: crypto.randomUUID(),
            jobListingTitle: "Software Engineer",
        },
        {
            rating: 5,
            userName: "Jim Doe",
            organizationId: crypto.randomUUID(),
            organizationName: "Microsoft",
            jobListingId: crypto.randomUUID(),
            jobListingTitle: "Full Stack Developer",
        },
        {
            rating: 2,
            userName: "Jill Doe",
            organizationId: crypto.randomUUID(),
            organizationName: "Amazon",
            jobListingId: crypto.randomUUID(),
            jobListingTitle: "Backend Developer",
        },
        {
            rating: 1,
            userName: "Jack Doe",
            organizationId: crypto.randomUUID(),
            organizationName: "Apple",
            jobListingId: crypto.randomUUID(),
            jobListingTitle: "DevOps Engineer",
        },

    ]
} satisfies Parameters<typeof DailyApplicationEmail>[0]