import prisma from "../../src/app/shared/prisma";
import { faker } from "@faker-js/faker";

const employmentTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Internship",
    "Temporary",
    "Freelance",
];

const experienceLevels = [
    "Entry level",
    "Junior",
    "Mid level",
    "Senior",
    "Lead",
    "Manager",
];

const remoteInfos = ["Remote", "Hybrid", "On-site"];

const skillPool = [
    "TypeScript",
    "JavaScript",
    "React",
    "Next.js",
    "Node.js",
    "Express.js",
    "NestJS",
    "Prisma",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "Docker",
    "Kubernetes",
    "AWS",
    "Tailwind CSS",
    "GraphQL",
    "REST APIs",
    "CI/CD",
    "Git",
    "Figma",
    "Testing Library",
    "Jest",
    "Playwright",
];

const jobTitles = [
    "Frontend Engineer",
    "Backend Engineer",
    "Full Stack Engineer",
    "Product Designer",
    "DevOps Engineer",
    "QA Engineer",
    "Software Engineer",
    "Technical Lead",
    "Mobile Engineer",
    "Data Engineer",
];

const getRandomSkills = () =>
    faker.helpers.arrayElements(skillPool, {
        min: 4,
        max: 8,
    });

const buildJobTitle = () => faker.helpers.arrayElement(jobTitles);

export const jobSeeder = async () => {
    const recruiters = await prisma.recruiterProfile.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            },
        },
        orderBy: {
            createdAt: "asc",
        },
    });

    if (recruiters.length === 0) {
        console.log("⚠️  No recruiter profiles found. Skipping job seeding.");
        return;
    }

    await prisma.job.deleteMany({});

    const jobsPerRecruiter = 3;
    console.log(
        `🌱 Generating ${jobsPerRecruiter} fake jobs for each of ${recruiters.length} recruiters...`,
    );

    let totalJobs = 0;

    for (const recruiter of recruiters) {
        for (let i = 0; i < jobsPerRecruiter; i++) {
            const title = buildJobTitle();
            const experienceLevel = faker.helpers.arrayElement(experienceLevels);
            const employmentType = faker.helpers.arrayElement(employmentTypes);
            const remoteInfo = faker.helpers.arrayElement(remoteInfos);
            const location =
                remoteInfo === "Remote"
                    ? "Remote"
                    : `${faker.location.city()}, ${faker.location.country()}`;
            const requiredSkills = getRandomSkills();
            const vacancyCount = faker.number.int({ min: 1, max: 5 });
            const salaryFloor = faker.number.int({ min: 40000, max: 120000 });
            const salaryCeiling = salaryFloor + faker.number.int({ min: 15000, max: 70000 });
            const deadline = faker.date.soon({ days: 45 });

            const job = await prisma.job.create({
                data: {
                    title,
                    description:
                        faker.company.catchPhrase() +
                        ". " +
                        faker.lorem.paragraph(2),
                    salaryRange: `$${salaryFloor.toLocaleString()} - $${salaryCeiling.toLocaleString()}`,
                    location,
                    employmentType,
                    experienceLevel,
                    requiredSkills,
                    vacancyCount,
                    applicationDeadline: deadline,
                    remoteInfo,
                    recruiterId: recruiter.id,
                },
            });

            totalJobs += 1;
            console.log(
                `   - Job seeded for ${recruiter.companyName}: ${job.title}`,
            );
        }
    }

    console.log(`✅ Seeded ${totalJobs} fake jobs successfully.`);
};
