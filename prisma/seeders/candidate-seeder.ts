import prisma from "../../src/app/shared/prisma";
import bcrypt from "bcryptjs";
import { candidateEmail } from "../seed";
import { faker } from "@faker-js/faker";

export const candidateSeeder = async () => {
    const hashedPassword = await bcrypt.hash("123456789", 10);

    // 1. Seed the Primary Candidate User and Candidate Profile
    const primaryCandidate = await prisma.user.upsert({
        where: { email: candidateEmail },
        update: {},
        create: {
            email: candidateEmail,
            password: hashedPassword,
            role: "candidate",
            candidateProfile: {
                create: {
                    fullName: "John Doe",
                    email: candidateEmail,
                    phoneNumber: "+1-555-0199",
                    skills: [
                        "TypeScript",
                        "Node.js",
                        "React",
                        "Prisma",
                        "PostgreSQL",
                    ],
                    experience:
                        "3 years of experience as a full stack software engineer at StartupInc.",
                    education:
                        "Bachelor of Science in Computer Science, State University",
                    resume: "https://hirehub-resumes.s3.amazonaws.com/john_doe_resume.pdf",
                    githubLink: "https://github.com/johndoe",
                    linkedInLink: "https://linkedin.com/in/johndoe",
                },
            },
        },
    });
    console.log(
        `✅ Primary candidate user and profile seeded: ${primaryCandidate.email}`,
    );

    // 2. Seed Fake Candidate Users and Profiles using Faker
    const totalFakeCandidates = 10;
    const availableSkills = [
        "JavaScript",
        "TypeScript",
        "Python",
        "Go",
        "Rust",
        "Java",
        "C++",
        "React",
        "Next.js",
        "Vue.js",
        "Angular",
        "Node.js",
        "Express.js",
        "Django",
        "FastAPI",
        "Spring Boot",
        "Prisma",
        "Sequelize",
        "Mongoose",
        "PostgreSQL",
        "MySQL",
        "MongoDB",
        "Redis",
        "Docker",
        "Kubernetes",
        "AWS",
        "Google Cloud",
        "CI/CD",
        "Git",
        "HTML5",
        "CSS3",
        "Tailwind CSS",
    ];

    console.log(`🌱 Generating ${totalFakeCandidates} fake candidates...`);

    for (let i = 0; i < totalFakeCandidates; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const fullName = `${firstName} ${lastName}`;
        const email = faker.internet
            .email({ firstName, lastName })
            .toLowerCase();

        // Choose 3 to 7 random skills
        const randomSkills = faker.helpers.arrayElements(availableSkills, {
            min: 3,
            max: 7,
        });
        const experienceYears = faker.number.int({ min: 1, max: 12 });
        const jobTitle = faker.person.jobTitle();
        const company = faker.company.name();
        const experience = `${experienceYears} years of experience working as a ${jobTitle} at ${company}.`;

        const degree = faker.helpers.arrayElement([
            "Bachelor of Science in Computer Science",
            "Bachelor of Engineering in Software Engineering",
            "Master of Science in Information Technology",
            "Bachelor of Business Administration",
            "Self-taught / Boot camp graduate",
        ]);
        const university = faker.company.name() + " University";
        const education = `${degree}, ${university}`;

        const username = faker.internet.username({ firstName, lastName });
        const githubLink = `https://github.com/${username}`;
        const linkedInLink = `https://linkedin.com/in/${username}`;
        const resume = `https://hirehub-resumes.s3.amazonaws.com/${username}_resume.pdf`;

        const candidate = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                password: hashedPassword,
                role: "candidate",
                candidateProfile: {
                    create: {
                        fullName,
                        email,
                        phoneNumber: faker.phone.number({
                            style: "international",
                        }),
                        skills: randomSkills,
                        experience,
                        education,
                        resume,
                        githubLink,
                        linkedInLink,
                    },
                },
            },
        });
        console.log(`   - Fake candidate seeded: ${candidate.email}`);
    }
};
