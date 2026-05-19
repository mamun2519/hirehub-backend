import prisma from "../../src/app/shared/prisma";
import bcrypt from "bcryptjs";
import { adminEmail } from "../seed";

export const adminSeeder = async () => {
    const hashedPassword = await bcrypt.hash("123456789", 10);

    // 1. Seed Admin User
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password: hashedPassword,
            role: "admin",
        },
    });
    console.log(`✅ Admin user seeded: ${admin.email}`);
};
