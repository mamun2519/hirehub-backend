import prisma from "../../src/app/shared/prisma";
import bcrypt from "bcryptjs";
import { recruiterEmail } from "../seed";
import { faker } from "@faker-js/faker";

export const recruiterSeeder = async () => {
    const hashedPassword = await bcrypt.hash("123456789", 10);

    // 1. Seed Primary Recruiter User and Recruiter Profile
    const primaryRecruiter = await prisma.user.upsert({
        where: { email: recruiterEmail },
        update: {},
        create: {
            email: recruiterEmail,
            password: hashedPassword,
            role: "recruiter",
            recruiterProfile: {
                create: {
                    name: "TechCorp Solutions",
                    website: "https://techcorp.example.com",
                    description:
                        "A leading global software engineering and IT consulting firm.",
                    location: "San Francisco, CA",
                    logo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=200&h=200&q=80",
                },
            },
        },
    });
    console.log(
        `✅ Primary recruiter user and profile seeded: ${primaryRecruiter.email}`,
    );

    // 2. Seed Fake Recruiter Users and Profiles using Faker
    const totalFakeRecruiters = 15;

    console.log(`🌱 Generating ${totalFakeRecruiters} fake recruiters...`);

    for (let i = 0; i < totalFakeRecruiters; i++) {
        const companyName = faker.company.name();
        const domain =
            companyName.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com";
        const email = `hr@${domain}`;
        const website = `https://www.${domain}`;
        const description =
            faker.company.catchPhrase() + ". " + faker.lorem.paragraph(2);
        const location = `${faker.location.city()}, ${faker.location.country()}`;

        // Random image for company logo
        const logoNumber = faker.number.int({ min: 1, max: 1000 });
        const logo = `https://picsum.photos/id/${logoNumber}/200/200`;

        const recruiter = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                password: hashedPassword,
                role: "recruiter",
                recruiterProfile: {
                    create: {
                        name: companyName,
                        website,
                        description,
                        location,
                        logo,
                    },
                },
            },
        });
        console.log(`   - Fake recruiter seeded: ${recruiter.email}`);
    }
};
