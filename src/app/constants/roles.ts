const ROLES = {
    ADMIN: "admin",
    CANDIDATE: "candidate",
    RECRUITER: "recruiter",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export default ROLES;
