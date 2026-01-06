import { ExperienceLevel, JobListingStatus, JobListingType, LocationRequirement, WageInterval } from "@/drizzle/schema";

export function formatWageInterval(interval: WageInterval) {
    switch (interval) {
        case "hourly":
            return "Hour"
        case "yearly":
            return "Year"
        case "daily":
            return "Day"
        case "weekly":
            return "Week"
        case "monthly":
            return "Month"
        default:
            throw new Error(`Invalid wage interval: ${interval satisfies never}`)
    }
}

export function formatLocationRequirement(requirement: LocationRequirement) {
    switch (requirement) {
        case "remote":
            return "Remote"
        case "in-office":
            return "In-Office"
        case "hybrid":
            return "Hybrid"
        default:
            throw new Error(`Invalid location requirement: ${requirement satisfies never}`)
    }
}

export function formatExperienceLevel(level: ExperienceLevel) {
    switch (level) {
        case "junior":
            return "Junior"
        case "mid-level":
            return "Mid-Level"
        case "senior":
            return "Senior"
        default:
            throw new Error(`Invalid experience level: ${level satisfies never}`)
    }
}

export function formatJobType(type: JobListingType) {
    switch (type) {
        case "full-time":
            return "Full-Time"
        case "part-time":
            return "Part-Time"
        case "internship":
            return "Internship"
        default:
            throw new Error(`Invalid job type: ${type satisfies never}`)
    }
}

export function formatJobListingStatus(status: JobListingStatus) {
    switch (status) {
        case "draft":
            return "Draft"
        case "published":
            return "Published"
        case "delisted":
            return "Delisted"
        default:
            throw new Error(`Invalid job listing status: ${status satisfies never}`)
    }
}

export function formatJobListingLocation({ stateAbbreviation, city }: { stateAbbreviation: string | null, city: string | null }) {
    if (stateAbbreviation == null && city == null) return "None"

    const locationParts = []
    if (city != null) {
        locationParts.push(city)
    }
    if (stateAbbreviation != null) {
        locationParts.push(stateAbbreviation.toUpperCase())
    }

    return locationParts.join(", ")
}