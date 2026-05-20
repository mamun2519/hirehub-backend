import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ProfileService } from "./profile.service";
import AppError from "../../errors/AppError";

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            "You are not authenticated!",
        );
    }

    const { id: userId, role } = req.user;
    const result = await ProfileService.getProfileFromDB(userId, role);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Profile fetched successfully!",
        data: result || null,
    });
});

const updateCandidateProfile = catchAsync(
    async (req: Request, res: Response) => {
        if (!req.user) {
            throw new AppError(
                httpStatus.UNAUTHORIZED,
                "You are not authenticated!",
            );
        }

        const { id: userId } = req.user;
        const result = await ProfileService.createOrUpdateCandidateProfileInDB(
            userId,
            req.body,
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Candidate profile updated successfully!",
            data: result,
        });
    },
);

const updateRecruiterProfile = catchAsync(
    async (req: Request, res: Response) => {
        if (!req.user) {
            throw new AppError(
                httpStatus.UNAUTHORIZED,
                "You are not authenticated!",
            );
        }

        const { id: userId } = req.user;
        const result = await ProfileService.createOrUpdateRecruiterProfileInDB(
            userId,
            req.body,
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Recruiter profile updated successfully!",
            data: result,
        });
    },
);

const updatePersonalInfo = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            "You are not authenticated!",
        );
    }

    const { id: userId, role } = req.user;
    const result = await ProfileService.updatePersonalInfoInDB(
        userId,
        role,
        req.body,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Personal info updated successfully!",
        data: result,
    });
});

const updateSecurityInfo = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            "You are not authenticated!",
        );
    }

    const { id: userId } = req.user;
    const result = await ProfileService.updateSecurityInfoInDB(
        userId,
        req.body,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password updated successfully!",
        data: result,
    });
});

export const ProfileController = {
    getMyProfile,
    updateCandidateProfile,
    updateRecruiterProfile,
    updatePersonalInfo,
    updateSecurityInfo,
};
