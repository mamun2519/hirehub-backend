import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";
import httpStatus from "http-status";
import prisma from "../../shared/prisma";
import config from "../../config";
import AppError from "../../errors/AppError";

// Pre-calculated dummy bcrypt hash to defend against timing attacks
const DUMMY_HASH =
    "$2b$12$L7R2Q6sP.4gH9cW.l5t8oOwP2xU4D6mGqH2nK9wZ4eQ7yR9sT2uI1";

const loginUser = async (payload: any) => {
    const { email, password } = payload;

    // 1. Check if user exists
    const user = await prisma.user.findUnique({
        where: { email },
    });

    // 2. Check password (always compare to prevent timing attacks)
    const isPasswordMatched = user
        ? await bcrypt.compare(password, user.password)
        : await bcrypt.compare(password, DUMMY_HASH);

    if (!user || !isPasswordMatched) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            "Invalid credentials! Please check your email and password.",
        );
    }

    // 3. Create tokens
    const jwtPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
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
            role: user.role,
            avatar: user.avatar,
            name: user.name,
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
            name: payload.name || "",
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
        role: user.role,
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
