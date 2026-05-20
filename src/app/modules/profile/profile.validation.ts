import { z } from "zod";

const createOrUpdateCandidateProfileSchema = z.object({
    body: z.object({
        email: z
            .string()
            .email("Invalid email address")
            .optional(),
        phoneNumber: z.string({
            message: "Phone number is required",
        }),
        skills: z.array(z.string(), {
            message: "Skills are required",
        }),
        experience: z.string({
            message: "Experience is required",
        }),
        education: z.string({
            message: "Education is required",
        }),
        resume: z.string({
            message: "Resume is required",
        }),
        githubLink: z.string().url("Invalid GitHub URL").optional().nullable(),
        linkedInLink: z
            .string()
            .url("Invalid LinkedIn URL")
            .optional()
            .nullable(),
    }),
});

const createOrUpdateRecruiterProfileSchema = z.object({
    body: z.object({
        companyName: z.string({
            message: "Company name is required",
        }),
        website: z
            .string({
                message: "Company website is required",
            })
            .url("Invalid company website URL"),
        description: z.string({
            message: "Company description is required",
        }),
        location: z.string({
            message: "Company location is required",
        }),
        logo: z.string({
            message: "Company logo is required",
        }),
    }),
});

const updateSecuritySchema = z.object({
    body: z
        .object({
            oldPassword: z
                .string()
                .min(1, { message: "Current password is required" }),
            newPassword: z
                .string()
                .min(8, {
                    message: "New password must be at least 8 characters long",
                }),
            confirmPassword: z
                .string()
                .min(1, { message: "Confirm password is required" }),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
            message: "New password and confirmation password do not match",
            path: ["confirmPassword"],
        }),
});

export const ProfileValidation = {
    createOrUpdateCandidateProfileSchema,
    createOrUpdateRecruiterProfileSchema,
    updateSecuritySchema,
};
