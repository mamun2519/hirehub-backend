import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../errors/AppError';
import { FileService } from './file.service';

const uploadFile = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Please upload a file');
  }

  const result = await FileService.uploadFile(req.file);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'File uploaded successfully!',
    data: result,
  });
});

const replaceFile = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Please upload a file');
  }

  const { oldFilePath } = req.body;
  if (!oldFilePath) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Please provide the old file path to replace');
  }

  const result = await FileService.replaceFile(req.file, oldFilePath);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'File replaced successfully!',
    data: result,
  });
});

const removeFile = catchAsync(async (req: Request, res: Response) => {
  const { filePath } = req.body;
  if (!filePath) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Please provide the file path to remove');
  }

  const result = await FileService.removeFile(filePath);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'File not found or already deleted');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'File removed successfully!',
    data: null,
  });
});

export const FileController = {
  uploadFile,
  replaceFile,
  removeFile,
};
