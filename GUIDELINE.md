# 🚀 HireHub Server Developer Guideline

Welcome to the **HireHub** backend developer guideline! This document is designed for beginners to understand the **Modular Pattern** architecture used in this codebase, and how to scale it by adding new database models, migrations, routes, services, and controllers.

---

## 📂 Codebase Folder Structure

In a **Modular Architecture**, we organize code by **features/modules** (e.g., `user`, `auth`, `job`) rather than by technical layers (e.g., putting all controllers in one folder and all services in another). This makes the application highly maintainable, scalable, and clean.

```text
hirehub-server/
├── prisma/
│   ├── migrations/             # Database migration history
│   └── schema.prisma           # Prisma database schemas (Prisma 7 format)
├── src/
│   ├── app/
│   │   ├── config/
│   │   │   └── index.ts        # Centralized configuration (env variables)
│   │   ├── errors/
│   │   │   └── AppError.ts     # Custom operational error handler
│   │   ├── middlewares/
│   │   │   ├── auth.ts              # Authorization & Authentication guard
│   │   │   ├── globalErrorHandler.ts # Catches all application errors
│   │   │   └── validateRequest.ts   # Request body validator using Zod
│   │   ├── modules/
│   │   │   ├── auth/           # Authentication Module (login, tokens)
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.route.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.validation.ts
│   │   │   └── user/           # User Module (registration, profiles)
│   │   │       ├── user.controller.ts
│   │   │       ├── user.route.ts
│   │   │       ├── user.service.ts
│   │   │       └── user.validation.ts
│   │   ├── routes/
│   │   │   └── index.ts        # Centralized router combining all modules
│   │   ├── shared/
│   │   │   └── prisma.ts       # Singleton Prisma 7 Client with PG Pool
│   │   ├── types/
│   │   │   └── index.d.ts      # Global TypeScript definitions (Request.user)
│   │   └── utils/
│   │       ├── catchAsync.ts   # Wraps async controllers to catch errors
│   │       └── sendResponse.ts # Enforces uniform JSON response format
│   ├── app.ts                  # Main Express Application setup
│   └── server.ts               # Main Server entry point (starts listener)
├── .env                        # Local environment variables
├── prisma.config.ts            # Prisma 7 configuration file
└── tsconfig.json               # TypeScript compiler config
```

---

## 🛠️ Step-by-Step Guide: How to Add a New Module (e.g. `Job`)

Follow these simple steps when you want to add a new entity/feature to HireHub.

### 📝 Step 1: Define the Database Model

Open `prisma/schema.prisma` and add your new model at the bottom.

```prisma
// prisma/schema.prisma

model Job {
  id          String   @id @default(uuid())
  title       String
  description String
  companyName String
  location    String
  salary      String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("jobs") // Map model name to 'jobs' table in PostgreSQL
}
```

### 🗄️ Step 2: Run the Migration

Prisma 7 uses the `prisma.config.ts` file to retrieve your database connection URL. Run the command to create the table in PostgreSQL and automatically generate your updated TypeScript client:

```bash
npx prisma migrate dev --name create_jobs_table
```

---

### 📂 Step 3: Create the Module Folder Structure

Create a new directory named `job` under `src/app/modules/`:

```text
src/app/modules/job/
├── job.validation.ts
├── job.service.ts
├── job.controller.ts
└── job.route.ts
```

---

### 🛡️ Step 4: Define Request Validation Schema (`job.validation.ts`)

We use **Zod** to validate incoming requests _before_ reaching the controller to ensure bad data never hits our database.

```typescript
// src/app/modules/job/job.validation.ts
import { z } from "zod";

const createJobValidationSchema = z.object({
    body: z.object({
        title: z.string({ message: "Job title is required" }),
        description: z.string({ message: "Job description is required" }),
        companyName: z.string({ message: "Company name is required" }),
        location: z.string({ message: "Location is required" }),
        salary: z.string().optional(),
    }),
});

export const JobValidation = {
    createJobValidationSchema,
};
```

---

### ⚙️ Step 5: Create the Business Logic layer (`job.service.ts`)

The Service layer communicates with Prisma to perform operations inside PostgreSQL.

```typescript
// src/app/modules/job/job.service.ts
import prisma from "../../shared/prisma";

const createJobIntoDB = async (payload: any) => {
    const result = await prisma.job.create({
        data: payload,
    });
    return result;
};

const getAllJobsFromDB = async () => {
    const result = await prisma.job.findMany();
    return result;
};

export const JobService = {
    createJobIntoDB,
    getAllJobsFromDB,
};
```

---

### 🎮 Step 6: Create the Controller layer (`job.controller.ts`)

The Controller handles the Express Request and Response, calls the Service, and formats the return message.

```typescript
// src/app/modules/job/job.controller.ts
import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { JobService } from "./job.service";

const createJob = catchAsync(async (req: Request, res: Response) => {
    const result = await JobService.createJobIntoDB(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Job post created successfully!",
        data: result,
    });
});

const getAllJobs = catchAsync(async (req: Request, res: Response) => {
    const result = await JobService.getAllJobsFromDB();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Jobs fetched successfully!",
        data: result,
    });
});

export const JobController = {
    createJob,
    getAllJobs,
};
```

---

### 🛣️ Step 7: Create the Module Router (`job.route.ts`)

Binds your endpoints to controllers and applies validations or auth middlewares.

```typescript
// src/app/modules/job/job.route.ts
import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { JobValidation } from "./job.validation";
import { JobController } from "./job.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

// Allow public to fetch all jobs, but restrict job posting to authenticated users
router.get("/", JobController.getAllJobs);

router.post(
    "/create-job",
    auth(), // Secure with JWT authentication
    validateRequest(JobValidation.createJobValidationSchema), // Validate format
    JobController.createJob,
);

export const JobRoutes = router;
```

---

### 🔗 Step 8: Register the new routes globally (`src/app/routes/index.ts`)

To make these endpoints active, simply add them to the `moduleRoutes` array inside your centralized router:

```typescript
// src/app/routes/index.ts
import express from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { JobRoutes } from "../modules/job/job.route"; // 👈 1. Import new routes

const router = express.Router();

const moduleRoutes = [
    {
        path: "/users",
        route: UserRoutes,
    },
    {
        path: "/auth",
        route: AuthRoutes,
    },
    {
        path: "/jobs",
        route: JobRoutes, // 👈 2. Add path and router here
    },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
```

You are done! Your new endpoints are now active:

- `GET http://localhost:5000/api/v1/jobs` (Public)
- `POST http://localhost:5000/api/v1/jobs/create-job` (Requires Authorization Bearer Token)

---

## 💎 Core Built-in Helpers Explained

### 1. `catchAsync` Utility

Instead of repeating `try {} catch (error) { next(error) }` in every single controller, wrap the controller with `catchAsync`. It automatically forwards any error to the `globalErrorHandler`.

```typescript
const myController = catchAsync(async (req, res) => {
    // Directly write async logic without try-catch blocks!
});
```

### 2. `sendResponse` Utility

Ensures every success response from the server uses the exact same format:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Human readable message here",
  "data": { ... }
}
```

### 3. `AppError` Custom Error Class

Used to throw expected (operational) HTTP errors with custom status codes:

```typescript
throw new AppError(httpStatus.NOT_FOUND, "This user profile does not exist!");
```

### 4. `auth` Middleware Guard

Secures any route by checking for a Bearer token in the `Authorization` header.

- Use `auth()` to secure a route.
- In the future, you can pass roles `auth('ADMIN', 'RECRUITER')` to limit access further.
- Once authorized, you can access current user info via `req.user` (e.g., `req.user.email`).

---

## ⚡ Essential Commands Cheat Sheet

| Command                                          | Purpose                                                     |
| :----------------------------------------------- | :---------------------------------------------------------- |
| `npm run dev`                                    | Runs the server locally with auto-reload.                   |
| `npx prisma generate`                            | Regenerates the Prisma Client types.                        |
| `npx prisma migrate dev --name <migration_name>` | Generates and applies a database migration.                 |
| `npx prisma studio`                              | Starts a browser GUI to view and edit your database tables. |
| `npx tsc --noEmit`                               | Checks the entire codebase for TypeScript compiler errors.  |
| `npx prisma db seed`                             | Seeds all default user accounts and profiles.               |
| `npx prisma db seed -- --name=<seeder_name>`     | Seeds only one specific role data set.                      |
