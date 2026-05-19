import bcrypt from "bcryptjs";
import prisma from "../../shared/prisma";
import { excludeFields } from "../../utils/excludeFields";

const getAllUsersFromDB = async (query: any) => {
    const { role, search, page, limit } = query || {};

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const whereConditions: any = {};

    if (role) {
        whereConditions.role = role;
    }

    if (search) {
        whereConditions.OR = [
            {
                email: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                recruiterProfile: {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
            {
                recruiterProfile: {
                    location: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
            {
                candidateProfile: {
                    fullName: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
            {
                candidateProfile: {
                    email: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
        ];
    }

    const [total, result] = await prisma.$transaction([
        prisma.user.count({
            where: whereConditions,
        }),
        prisma.user.findMany({
            where: whereConditions,
            skip,
            take: limitNum,
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                candidateProfile: true,
                recruiterProfile: true,
            },
        }),
    ]);

    return {
        meta: {
            page: pageNum,
            limit: limitNum,
            total,
        },
        data: result,
    };
};

const getSingleUserFromDB = async (id: string) => {
    const result = await prisma.user.findUniqueOrThrow({
        where: { id },
        select: {
            id: true,
            email: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return result;
};

const createAnUserToDB = async (data: any) => {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const result = await prisma.$transaction(async (tx) => {
        // 1. Create the user
        const user = await tx.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                role: data.role || "candidate",
            },
        });

        // 2. Create the associated profile if recruiter or candidate
        if (data.role === "recruiter") {
            await tx.recruiterProfile.create({
                data: {
                    userId: user.id,
                    name: data.name || "",
                    website: data.website || "",
                    location: data.location || "",
                    description: data.description || "",
                    logo: data.logo || "",
                },
            });
        } else if (data.role === "candidate") {
            await tx.candidateProfile.create({
                data: {
                    userId: user.id,
                    fullName: data.name || data.fullName || "",
                    email: data.email,
                    phoneNumber: data.phoneNumber || "",
                    skills: data.skills || [],
                    experience: data.experience || "",
                    education: data.education || "",
                    resume: data.resume || "",
                    githubLink: data.githubLink || null,
                    linkedInLink: data.linkedInLink || null,
                },
            });
        }

        return user;
    });

    return excludeFields(result, ["password"]);
};

export const UserService = {
    getAllUsersFromDB,
    getSingleUserFromDB,
    createAnUserToDB,
};
