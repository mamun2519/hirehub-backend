import prisma from "../../shared/prisma";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import ROLES from "../../constants/roles";
import bcrypt from "bcryptjs";
import config from "../../config";

const getProfileFromDB = async (userId: string, role: string) => {
    if (role === ROLES.CANDIDATE) {
        const profile = await prisma.candidateProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        avatar: true,
                        name: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        });
        if (profile) {
            return {
                ...profile,
                fullName: profile.user?.name || "",
            };
        }
        return profile;
    } else if (role === ROLES.RECRUITER) {
        const profile = await prisma.recruiterProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        avatar: true,
                        name: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        });
        if (profile) {
            return {
                ...profile,
                name: profile.companyName, // mapped virtually to 'name' for backward compatibility
            };
        }
        return profile;
    } else if (role === ROLES.ADMIN) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                avatar: true,
                name: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, "Admin user not found");
        }
        return {
            id: userId,
            fullName: user.name || "Administrator",
            email: user.email,
            user,
        };
    } else {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid user role");
    }
};

const createOrUpdateCandidateProfileInDB = async (
    userId: string,
    payload: any,
) => {
    // Ensure user exists
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (user.role !== ROLES.CANDIDATE) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "Only candidates can manage candidate profiles",
        );
    }

    const profile = await prisma.candidateProfile.upsert({
        where: { userId },
        update: payload,
        create: {
            userId,
            ...payload,
            email: payload.email || user.email,
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    avatar: true,
                },
            },
        },
    });

    return profile;
};

const createOrUpdateRecruiterProfileInDB = async (
    userId: string,
    payload: any,
) => {
    // Ensure user exists
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (user.role !== ROLES.RECRUITER) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "Only recruiters can manage recruiter profiles",
        );
    }

    const profile = await prisma.recruiterProfile.upsert({
        where: { userId },
        update: payload,
        create: {
            userId,
            ...payload,
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    avatar: true,
                },
            },
        },
    });

    return profile;
};

const updatePersonalInfoInDB = async (
    userId: string,
    role: string,
    payload: any,
) => {
    const { avatar, name, fullName, email } = payload;

    const userUpdateData: any = {};
    if (avatar !== undefined) userUpdateData.avatar = avatar;
    if (email !== undefined) userUpdateData.email = email;
    if (name !== undefined) userUpdateData.name = name;
    if (fullName !== undefined) userUpdateData.name = fullName;

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: userUpdateData,
    });

    if (role === ROLES.CANDIDATE) {
        const candidateUpdateData: any = {};
        if (email !== undefined) candidateUpdateData.email = email;

        await prisma.candidateProfile.upsert({
            where: { userId },
            update: candidateUpdateData,
            create: {
                userId,
                email: email || updatedUser.email,
                phoneNumber: "",
                skills: [],
                experience: "",
                education: "",
                resume: "",
            },
        });
    } else if (role === ROLES.RECRUITER) {
        const recruiterUpdateData: any = {};

        await prisma.recruiterProfile.upsert({
            where: { userId },
            update: recruiterUpdateData,
            create: {
                userId,
                companyName: "",
                website: "",
                description: "",
                location: "",
                logo: "",
            },
        });
    }

    return getProfileFromDB(userId, role);
};

const updateSecurityInfoInDB = async (userId: string, payload: any) => {
    const { oldPassword, newPassword } = payload;

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Current password is incorrect",
        );
    }

    const hashedPassword = await bcrypt.hash(
        newPassword,
        config.bcrypt_salt_rounds,
    );

    await prisma.user.update({
        where: { id: userId },
        data: {
            password: hashedPassword,
        },
    });

    return {
        message: "Password updated successfully!",
    };
};

export const ProfileService = {
    getProfileFromDB,
    createOrUpdateCandidateProfileInDB,
    createOrUpdateRecruiterProfileInDB,
    updatePersonalInfoInDB,
    updateSecurityInfoInDB,
};
