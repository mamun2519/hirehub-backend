import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ProfileValidation } from "./profile.validation";
import { ProfileController } from "./profile.controller";
import ROLES from "../../constants/roles";

const router = express.Router();

// Get logged-in user's profile
router.get(
    "/",
    auth(ROLES.CANDIDATE, ROLES.RECRUITER, ROLES.ADMIN),
    ProfileController.getMyProfile,
);

// Create or update recruiter profile
router.put(
    "/recruiter",
    auth(ROLES.RECRUITER),
    validateRequest(ProfileValidation.createOrUpdateRecruiterProfileSchema),
    ProfileController.updateRecruiterProfile,
);

// Create or update candidate profile
router.put(
    "/candidate",
    auth(ROLES.CANDIDATE),
    validateRequest(ProfileValidation.createOrUpdateCandidateProfileSchema),
    ProfileController.updateCandidateProfile,
);

// Update personal info
router.put(
    "/personal-info",
    auth(ROLES.CANDIDATE, ROLES.RECRUITER, ROLES.ADMIN),
    ProfileController.updatePersonalInfo,
);

// Update security info
router.put(
    "/security",
    auth(ROLES.CANDIDATE, ROLES.RECRUITER, ROLES.ADMIN),
    validateRequest(ProfileValidation.updateSecuritySchema),
    ProfileController.updateSecurityInfo,
);

export const ProfileRoutes = router;
