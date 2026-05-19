import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";
import prisma from "../../shared/prisma";
import config from "../../config";
import AppError from "../../errors/AppError";
import ROLES from "../../constants/roles";

const loginUser = async (payload: any) => {
    const { email, password } = payload;

    // 1. Check if user exists
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new AppError(404, "User does not exist with this email!");
    }

    // 2. Check if password matches
    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
        throw new AppError(
            400,
            "Invalid credentials! Password does not match.",
        );
    }

    // 3. Create tokens
    const jwtPayload = {
        id: user.id,
        email: user.email,
        role: ROLES.ADMIN,
    };

    const accessToken = jwt.sign(
        jwtPayload,
        config.jwt.access_secret as Secret,
        { expiresIn: config.jwt.access_expires_in } as any,
    );

    const refreshToken = jwt.sign(
        jwtPayload,
        config.jwt.refresh_secret as Secret,
        { expiresIn: config.jwt.refresh_expires_in } as any,
    );

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
        },
    };
};

const registerUser = async (payload: any) => {
    // Hash password
    const hashedPassword = await bcrypt.hash(
        payload.password,
        config.bcrypt_salt_rounds,
    );

    // Save to DB
    const result = await prisma.user.create({
        data: {
            email: payload.email,
            password: hashedPassword,
        },
        select: {
            id: true,
            email: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return result;
};

const refreshToken = async (token: string) => {
    let decoded;
    try {
        decoded = jwt.verify(token, config.jwt.refresh_secret as Secret) as any;
    } catch (err) {
        throw new AppError(401, "Unauthorized refresh token!");
    }

    const { email } = decoded;

    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new AppError(404, "User not found!");
    }

    // Create new access token
    const jwtPayload = {
        id: user.id,
        email: user.email,
        role: "USER",
    };

    const accessToken = jwt.sign(
        jwtPayload,
        config.jwt.access_secret as Secret,
        { expiresIn: config.jwt.access_expires_in } as any,
    );

    return {
        accessToken,
    };
};

export const AuthService = {
    loginUser,
    registerUser,
    refreshToken,
};
