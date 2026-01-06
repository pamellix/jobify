import { db } from "@/drizzle/db";
import { inngest } from "../client";
import { eq } from "drizzle-orm";
import { UserResumeTable } from "@/drizzle/schema";
import { env } from "@/data/env/server";
import { updateUserResume } from "@/features/users/db/userResumes";

export const createAiSummaryOfUploadedResume = inngest.createFunction({
    id: "create-ai-summary-of-uploaded-resume",
    name: "Create AI Summary of Uploaded Resume",
}, {
    event: "app/resume.uploaded"
}, async ({ event, step }) => {
    const { id: userId } = event.user

    const userResume = await step.run("get-user-resume", async () => {
        return await db.query.UserResumeTable.findFirst({
            where: eq(UserResumeTable.userId, userId),
            columns: {
                resumeFileUrl: true
            }
        })
    })

    if (userResume == null) return;

    const resumeText = await step.run("extract-pdf-text", async () => {
        const response = await fetch(userResume.resumeFileUrl)
        if (!response.ok) {
            throw new Error(`Failed to fetch PDF: ${response.status}`)
        }

        const contentType = response.headers.get("content-type")
        if (!contentType?.includes("application/pdf")) {
            throw new Error(`Expected PDF but got: ${contentType}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Import from lib directly to avoid pdf-parse loading test file
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require("pdf-parse/lib/pdf-parse.js") as typeof import("pdf-parse")
        const data = await pdfParse(buffer)
        return data.text
    })

    const result = await step.ai.infer("create-ai-summary", {
        model: step.ai.models.openai({
            model: "openai/gpt-5-nano",
            baseUrl: "https://openrouter.ai/api/v1",
            apiKey: env.ANTHROPIC_API_KEY,
            defaultParameters: { max_completion_tokens: 8192 }
        }),
        body: {
            messages: [
                {
                    role: "system",
                    content: "You are a professional HR assistant. Analyze resumes and provide structured summaries in english language."
                },
                {
                    role: "user",
                    content: `Analyze this resume and create a short professional summary. Extract:
1. Name and contact details
2. Desired position
3. Top 10 skills
4. Work experience (companies, positions, main achievements)
5. Education

Resume:
${resumeText}

This summary should be formatted as markdown. Do not return any other text. If the file does not look like a resume, return the text 'N/A'`
                }
            ]
        }
    })

    await step.run("save-ai-summary", async () => {
        const message = result.choices[0].message.content
        if (!message) return

        await updateUserResume(userId, { aiSummary: message })
    })

    return result
})