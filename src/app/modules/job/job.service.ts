import prisma from "../../shared/prisma";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { normalizeFilePathToUrl } from "../../utils/publicAssetUrl";


const normalizeRecruiterMedia = (recruiter: any) => {
    if (!recruiter) return recruiter;

    return {
        ...recruiter,
        logo: normalizeFilePathToUrl(recruiter.logo),
        user: recruiter.user
            ? {
                  ...recruiter.user,
                  avatar: normalizeFilePathToUrl(recruiter.user.avatar),
              }
            : recruiter.user,
    };
};

const normalizeJobRecruiter = (job: any) => {
    if (!job?.recruiter) return job;

    return {
        ...job,
        recruiter: normalizeRecruiterMedia(job.recruiter),
    };
};

const createJobIntoDB = async (userId: string, payload: any) => {
    const recruiterProfile = await prisma.recruiterProfile.findUnique({
        where: { userId },
    });

    if (!recruiterProfile) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Recruiter profile not found. Please complete your recruiter profile details before posting a job.",
        );
    }

    const jobData = {
        ...payload,
        applicationDeadline: new Date(payload.applicationDeadline),
        recruiterId: recruiterProfile.id,
    };

    const result = await prisma.job.create({
        data: jobData,
        include: {
            recruiter: true,
        },
    });

    return normalizeJobRecruiter(result);
};

const getAllJobsFromDB = async (query: Record<string, any>) => {
    const {
        searchTerm,
        employmentType,
        experienceLevel,
        remoteInfo,
        location,
        salaryRange,
        recruiterId,
        sortBy,
        sortOrder,
    } = query;
    const andConditions: any[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: [
                { title: { contains: searchTerm, mode: "insensitive" } },
                { description: { contains: searchTerm, mode: "insensitive" } },
                { location: { contains: searchTerm, mode: "insensitive" } },
                { requiredSkills: { hasSome: [searchTerm] } },
                {
                    recruiter: {
                        companyName: {
                            contains: searchTerm,
                            mode: "insensitive",
                        },
                    },
                },
            ],
        });
    }

    if (employmentType) {
        andConditions.push({
            employmentType: { equals: employmentType, mode: "insensitive" },
        });
    }

    if (experienceLevel) {
        andConditions.push({
            experienceLevel: { equals: experienceLevel, mode: "insensitive" },
        });
    }

    if (remoteInfo) {
        andConditions.push({
            remoteInfo: { equals: remoteInfo, mode: "insensitive" },
        });
    }

    if (location) {
        andConditions.push({
            location: { contains: location, mode: "insensitive" },
        });
    }

    if (salaryRange) {
        andConditions.push({
            salaryRange: { contains: salaryRange, mode: "insensitive" },
        });
    }

    if (recruiterId) {
        andConditions.push({
            recruiterId: recruiterId,
        });
    }

    const whereConditions =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.job.findMany({
        where: whereConditions,
        include: {
            recruiter: true,
        },
        orderBy: {
            [sortBy || "createdAt"]: sortOrder || "desc",
        },
    });

    return result.map(normalizeJobRecruiter);
};

const getSingleJobFromDB = async (id: string) => {
    const result = await prisma.job.findUnique({
        where: { id },
        include: {
            recruiter: {
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            avatar: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, "Job not found!");
    }

    return normalizeJobRecruiter(result);
};

const updateJobInDB = async (id: string, userId: string, payload: any) => {
    // 1. Ensure job exists
    const job = await prisma.job.findUnique({
        where: { id },
    });

    if (!job) {
        throw new AppError(httpStatus.NOT_FOUND, "Job not found!");
    }

    // 2. Ensure recruiter profile exists and matches ownership
    const recruiterProfile = await prisma.recruiterProfile.findUnique({
        where: { userId },
    });

    if (!recruiterProfile || job.recruiterId !== recruiterProfile.id) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are not authorized to update this job post!",
        );
    }

    const updateData = { ...payload };
    if (payload.applicationDeadline) {
        updateData.applicationDeadline = new Date(payload.applicationDeadline);
    }

    // 3. Update job
    const result = await prisma.job.update({
        where: { id },
        data: updateData,
        include: {
            recruiter: true,
        },
    });

    return normalizeJobRecruiter(result);
};

const deleteJobFromDB = async (id: string, userId: string) => {
    // 1. Ensure job exists
    const job = await prisma.job.findUnique({
        where: { id },
    });

    if (!job) {
        throw new AppError(httpStatus.NOT_FOUND, "Job not found!");
    }

    // 2. Ensure recruiter profile exists and matches ownership
    const recruiterProfile = await prisma.recruiterProfile.findUnique({
        where: { userId },
    });

    if (!recruiterProfile || job.recruiterId !== recruiterProfile.id) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are not authorized to delete this job post!",
        );
    }

    // 3. Delete job
    const result = await prisma.job.delete({
        where: { id },
    });

    return result;
};

export const JobService = {
    createJobIntoDB,
    getAllJobsFromDB,
    getSingleJobFromDB,
    updateJobInDB,
    deleteJobFromDB,
};
