import { Badge } from "@/components/ui/badge";
import { JobListingTable, WageInterval } from "@/drizzle/schema";
import { BanknoteIcon, BuildingIcon, GraduationCapIcon, HourglassIcon, MapPinIcon } from "lucide-react";
import { ComponentProps } from "react";
import { formatExperienceLevel, formatJobListingLocation, formatJobType, formatLocationRequirement } from "../lib/formatters";
import { cn } from "@/lib/utils";

export function JobListingBadges({ jobListing: {
    isFeatured,
    wage,
    wageInterval,
    experienceLevel,
    locationRequirement,
    stateAbbreviation,
    city,
    type
}, className }: {
    jobListing: Pick<typeof JobListingTable.$inferSelect,
        | "wage"
        | "wageInterval"
        | "locationRequirement"
        | "stateAbbreviation"
        | "city"
        | "type"
        | "experienceLevel"
        | "isFeatured"
    >,
    className?: string
}) {
    const badgeProps = {
        variant: "outline",
        className
    } satisfies ComponentProps<typeof Badge>

    return <>
        {isFeatured && (
            <Badge {...badgeProps} className={cn(className, "border-featured bg-featured text-featured-foreground")}>Featured</Badge>
        )}
        {wage != null && wageInterval != null && (
            <Badge {...badgeProps}>
                <BanknoteIcon /> {formatWage(wage, wageInterval)}
            </Badge>
        )}
        {(stateAbbreviation != null || city != null) && (
            <Badge {...badgeProps}>
                <MapPinIcon className="size-10" />
                {formatJobListingLocation({ stateAbbreviation, city })}
            </Badge>
        )}
        <Badge {...badgeProps}>
            <BuildingIcon />
            {formatLocationRequirement(locationRequirement)}
        </Badge>
        <Badge {...badgeProps}>
            <HourglassIcon />
            {formatJobType(type)}
        </Badge>
        <Badge {...badgeProps}>
            <GraduationCapIcon />
            {formatExperienceLevel(experienceLevel)}
        </Badge>
    </>
}

export function formatWage(wage: number, wageInterval: WageInterval) {
    const wageFormatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0
    })

    switch (wageInterval) {
        case "hourly": {
            return `${wageFormatter.format(wage)} / hr`
        }
        case "daily": {
            return `${wageFormatter.format(wage)} / day`
        }
        case "weekly": {
            return `${wageFormatter.format(wage)} / week`
        }
        case "monthly": {
            return `${wageFormatter.format(wage)} / month`
        }
        case "yearly": {
            return `${wageFormatter.format(wage)} / year`
        }
    }
}