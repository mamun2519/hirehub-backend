import express from 'express';
import auth from '../../middlewares/auth';
import ROLES from '../../constants/roles';
import { upload } from '../../utils/fileUpload';
import { FileController } from './file.controller';

const router = express.Router();

// Upload a single file
router.post(
  '/upload',
  auth(ROLES.CANDIDATE, ROLES.RECRUITER, ROLES.ADMIN),
  upload.single('file'),
  FileController.uploadFile
);

// Replace a file (deletes old one and uploads new one)
router.put(
  '/replace',
  auth(ROLES.CANDIDATE, ROLES.RECRUITER, ROLES.ADMIN),
  upload.single('file'),
  FileController.replaceFile
);

// Remove a file
router.delete(
  '/remove',
  auth(ROLES.CANDIDATE, ROLES.RECRUITER, ROLES.ADMIN),
  FileController.removeFile
);

export const FileRoutes = router;
