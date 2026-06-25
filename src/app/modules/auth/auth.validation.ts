import { z } from "zod";

const loginValidationSchema = z.object({
    body: z.object({
        email: z
            .string({
                message: "Email is required",
            })
            .email("Invalid email address"),
        password: z.string({
            message: "Password is required",
        }),
    }),
});

const registerValidationSchema = z.object({
    body: z
        .object({
            name: z.string({
                message: "Name is required",
            }),
            email: z
                .string({
                    message: "Email is required",
                }),
            password: z
                .string({
                    message: "Password is required",
                })
                .min(6, "Password must be at least 6 characters long"),
            confirmPassword: z.string({
                message: "Confirm password is required",
            }),
        })
        .refine((data) => data.password === data.confirmPassword, {
            message: "Passwords do not match",
            path: ["confirmPassword"],
        }),
});

const refreshTokenValidationSchema = z.object({
    cookies: z.object({
        refreshToken: z.string({
            message: "Refresh token is required in cookies",
        }),
    }),
});

export const AuthValidation = {
    loginValidationSchema,
    registerValidationSchema,
    refreshTokenValidationSchema,
};
