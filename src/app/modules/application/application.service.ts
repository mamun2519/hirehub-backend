import prisma from "../../shared/prisma";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

const generateApplicationId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `HH-${Date.now().toString().slice(-6)}-${result}`;
};

const applyJobInDB = async (
    payload: {
        jobId: string;
        fullName: string;
        email: string;
        phone: string;
        coverLetter?: string;
        linkedInUrl?: string;
    },
    file?: Express.Multer.File,
    userEmail?: string,
) => {
    const job = await prisma.job.findUnique({
        where: { id: payload.jobId },
    });

    if (!job) {
        throw new AppError(httpStatus.NOT_FOUND, "Job not found");
    }

    if (new Date() > new Date(job.applicationDeadline)) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "The application deadline for this job has passed.",
        );
    }

    if (!file) {
        throw new AppError(httpStatus.BAD_REQUEST, "Resume file is required");
    }

    let candidateId: string | null = null;
    if (userEmail) {
        const candidateProfile = await prisma.candidateProfile.findFirst({
            where: {
                user: { email: userEmail },
            },
        });
        if (candidateProfile) {
            candidateId = candidateProfile.id;
        }
    }

    const getFileUrl = (file: Express.Multer.File): string => {
        const dest = file.destination.replace(/\\/g, "/");
        const normalizedDest = dest.startsWith("/") ? dest : "/" + dest;
        return `${normalizedDest}/${file.filename}`;
    };

    const resumeUrl = getFileUrl(file);
    const appId = generateApplicationId();

    const result = await prisma.$transaction(async (tx: any) => {
        const application = await tx.application.create({
            data: {
                applicationId: appId,
                jobId: payload.jobId,
                candidateId,
                fullName: payload.fullName,
                email: payload.email,
                phone: payload.phone,
                coverLetter: payload.coverLetter || null,
                linkedInUrl: payload.linkedInUrl || null,
            },
        });

        await tx.resume.create({
            data: {
                fileName: file.originalname,
                fileSize: file.size,
                mimeType: file.mimetype,
                url: resumeUrl,
                applicationId: application.id,
            },
        });

        return tx.application.findUnique({
            where: { id: application.id },
            include: { resume: true },
        });
    });

    return result;
};

const getApplicationsFromDB = async (userId: string, role: string) => {
    // Role is admin
    if (role === "admin") {
        return prisma.application.findMany({
            include: {
                job: true,
                resume: true,
            },
            orderBy: { createdAt: "desc" },
        });
    }

    // Role is recruiter
    if (role === "recruiter") {
        const recruiterProfile = await prisma.recruiterProfile.findUnique({
            where: { userId },
        });

        if (!recruiterProfile) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "Recruiter profile not found",
            );
        }

        return prisma.application.findMany({
            where: {
                job: {
                    recruiterId: recruiterProfile.id,
                },
            },
            include: {
                job: true,
                resume: true,
            },
            orderBy: { createdAt: "desc" },
        });
    }

    // Role is candidate
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const candidateProfile = await prisma.candidateProfile.findUnique({
        where: { userId },
    });

    // Return applications associated with candidate's profile ID OR applications
    const candidateApps = await prisma.application.findMany({
        where: {
            OR: [
                candidateProfile
                    ? { candidateId: candidateProfile.id }
                    : undefined,
                { email: user.email },
            ].filter(Boolean) as any,
        },
        include: {
            job: true,
            resume: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return candidateApps.map((app) => ({
        ...app,
        status: "pending",
    }));
};

const updateApplicationStatusInDB = async (
    applicationId: string,
    status: string,
    userId: string,
    role: string,
) => {
    const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { job: true },
    });

    if (!application) {
        throw new AppError(httpStatus.NOT_FOUND, "Application not found");
    }

    if (role !== "admin") {
        const recruiterProfile = await prisma.recruiterProfile.findUnique({
            where: { userId },
        });

        if (
            !recruiterProfile ||
            application.job.recruiterId !== recruiterProfile.id
        ) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not authorized to update status for this application",
            );
        }
    }

    let statusToSave = status;
    if (status === "shortlisted") {
        statusToSave = "rejected";
    }

    const result = await prisma.application.update({
        where: { id: applicationId },
        data: { status: statusToSave },
        include: { resume: true, job: true },
    });

    return result;
};

export const ApplicationService = {
    applyJobInDB,
    getApplicationsFromDB,
    updateApplicationStatusInDB,
};
