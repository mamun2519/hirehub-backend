import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "public/uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const sanitizeDir = (dir: any): string => {
    if (typeof dir !== "string") return "";
    return dir.replace(/\.\./g, "").replace(/[\\/]/g, "").trim();
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const rawDir = req.body?.dir || req.query?.dir || "";
        const sanitizedSubDir = sanitizeDir(rawDir);

        const targetDir = sanitizedSubDir
            ? path.join("public/uploads", sanitizedSubDir)
            : "public/uploads";

        const fullTargetDir = path.join(process.cwd(), targetDir);
        if (!fs.existsSync(fullTargetDir)) {
            fs.mkdirSync(fullTargetDir, { recursive: true });
        }

        cb(null, targetDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname +
                "-" +
                uniqueSuffix +
                path.extname(file.originalname),
        );
    },
});

export const upload = multer({ storage: storage });

/**
 * Removes a file from disk
 * @param filePath the public URL path, e.g., '/public/uploads/file-123.jpg'
 */
export const deleteFileFromDisk = (filePath: string): boolean => {
    if (!filePath) return false;

    const relativePath = filePath.startsWith("/")
        ? filePath.substring(1)
        : filePath;
    const fullPath = path.join(process.cwd(), relativePath);

    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
    }
    return false;
};
