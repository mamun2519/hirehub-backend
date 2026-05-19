import express from "express";
import { UserController } from "./user.controller";
import auth from "../../middlewares/auth";
import ROLES from "../../constants/roles";

const router = express.Router();

// Protected routes
router.get("/", auth(ROLES.ADMIN), UserController.getAllUsers);
router.get("/:id", auth(ROLES.ADMIN), UserController.getSingleUser);
router.post("/create", auth(ROLES.ADMIN), UserController.createAnUser);

export const UserRoutes = router;
