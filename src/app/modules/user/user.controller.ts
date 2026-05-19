import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserService } from "./user.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.getAllUsersFromDB(req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Users fetched successfully!",
        data: result,
    });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await UserService.getSingleUserFromDB(id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User fetched successfully!",
        data: result,
    });
});

const createAnUser = catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.createAnUserToDB(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User created successfully!",
        data: result,
    });
});

export const UserController = {
    getAllUsers,
    getSingleUser,
    createAnUser,
};
