import z from "zod";

export const newJobListingApplicationSchema = z.object({
    coverLetter: z.string().transform(val => {
        return val?.trim() === "" ? null : val;
    }).nullable()
});
