import { pgTable, varchar, text, integer, pgEnum, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { OrganizationTable } from "./organization";
import { relations } from "drizzle-orm";
import { JobListingApplicationTable } from "./jobListingApplication";

export const wageIntervals = ["hourly", "daily", "weekly", "monthly", "yearly"] as const;
export type WageInterval = (typeof wageIntervals)[number];
export const wageIntervalEnum = pgEnum("job_listings_wage_interval", wageIntervals);

export const locationRequirements = ["remote", "in-office", "hybrid"] as const;
export type LocationRequirement = (typeof locationRequirements)[number];
export const locationRequirementEnum = pgEnum("job_listings_location_requirement", locationRequirements);

export const experienceLevel = ["junior", "mid-level", "senior"] as const;
export type ExperienceLevel = (typeof experienceLevel)[number];
export const experienceLevelEnum = pgEnum("job_listings_experience_level", experienceLevel);

export const jobListingStatus = ["draft", "published", "delisted"] as const;
export type JobListingStatus = (typeof jobListingStatus)[number];
export const jobListingStatusEnum = pgEnum("job_listings_status", jobListingStatus);

export const jobListingType = ["full-time", "part-time", "internship"] as const;
export type JobListingType = (typeof jobListingType)[number];
export const jobListingTypeEnum = pgEnum("job_listings_type", jobListingType);

export const JobListingTable = pgTable("job_listings", {
    id,
    organizationId: varchar().references(() => OrganizationTable.id, { onDelete: 'cascade' }).notNull(),
    title: varchar().notNull(),
    description: text().notNull(),
    wage: integer(),
    wageInterval: wageIntervalEnum(),
    stateAbbreviation: varchar(),
    city: varchar(),
    isFeatured: boolean().notNull().default(false),
    locationRequirement: locationRequirementEnum().notNull(),
    experienceLevel: experienceLevelEnum().notNull(),
    status: jobListingStatusEnum().notNull().default("draft"),
    type: jobListingTypeEnum().notNull(),
    postedAt: timestamp({ withTimezone: true }),
    createdAt,
    updatedAt
},
table => [index().on(table.stateAbbreviation)]);

export const jobListingReferences = relations(
    JobListingTable,
    ({ one, many }) => ({
      organization: one(OrganizationTable, {
        fields: [JobListingTable.organizationId],
        references: [OrganizationTable.id],
      }),
      applications: many(JobListingApplicationTable),
    })
  )