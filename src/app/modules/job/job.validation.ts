import { z } from "zod";

const createJobValidationSchema = z.object({
    body: z.object({
        title: z.string({ message: "Job title is required" }),
        description: z.string({ message: "Job description is required" }),
        salaryRange: z.string({ message: "Salary range is required" }),
        location: z.string({ message: "Location is required" }),
        employmentType: z.string({ message: "Employment type is required" }),
        experienceLevel: z.string({ message: "Experience level is required" }),
        requiredSkills: z.array(z.string(), {
            message: "Required skills are required",
        }),
        vacancyCount: z
            .number({ message: "Vacancy count is required" })
            .int(),
        applicationDeadline: z
            .string({ message: "Application deadline is required" })
            .refine((val) => !isNaN(Date.parse(val)), {
                message: "Invalid application deadline format",
            }),
        remoteInfo: z.string({
            message: "Remote/on-site information is required",
        }),
    }),
});

const updateJobValidationSchema = z.object({
    body: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        salaryRange: z.string().optional(),
        location: z.string().optional(),
        employmentType: z.string().optional(),
        experienceLevel: z.string().optional(),
        requiredSkills: z.array(z.string()).optional(),
        vacancyCount: z.number().int().optional(),
        applicationDeadline: z
            .string()
            .refine((val) => !isNaN(Date.parse(val)), {
                message: "Invalid application deadline format",
            })
            .optional(),
        remoteInfo: z.string().optional(),
    }),
});

export const JobValidation = {
    createJobValidationSchema,
    updateJobValidationSchema,
};
