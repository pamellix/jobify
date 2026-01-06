import { integer, pgEnum, pgTable, primaryKey, text, uuid, varchar } from "drizzle-orm/pg-core";
import { JobListingTable } from "./jobListing";
import { UserTable } from "./user";
import { createdAt, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";

export const applicationStage = ["applied", "denied", "interested", "hired", "interviewed"] as const;
export type ApplicationStage = (typeof applicationStage)[number];
export const applicationStageEnum = pgEnum("job_listing_applications_stage", applicationStage);

export const JobListingApplicationTable = pgTable("job_listing_applications", 
    {
        jobListingId: uuid().references(() => JobListingTable.id, { onDelete: 'cascade' }).notNull(),
        userId: varchar().references(() => UserTable.id, { onDelete: 'cascade' }).notNull(),
        coverLetter: text(),
        rating: integer(),
        stage: applicationStageEnum().notNull().default("applied"),
        createdAt,
        updatedAt
    },
    table => [primaryKey({ columns: [table.jobListingId, table.userId] })]
)

export const jobListingApplicationRelations = relations(
    JobListingApplicationTable,
    ({ one }) => ({
      jobListing: one(JobListingTable, {
        fields: [JobListingApplicationTable.jobListingId],
        references: [JobListingTable.id],
      }),
      user: one(UserTable, {
        fields: [JobListingApplicationTable.userId],
        references: [UserTable.id],
      }),
    })
  )