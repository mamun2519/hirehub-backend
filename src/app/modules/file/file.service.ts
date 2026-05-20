import { deleteFileFromDisk } from "../../utils/fileUpload";

const getFileUrl = (file: Express.Multer.File): string => {
    const dest = file.destination.replace(/\\/g, "/");
    const normalizedDest = dest.startsWith("/") ? dest : "/" + dest;
    return `${normalizedDest}/${file.filename}`;
};

const uploadFile = async (file: Express.Multer.File) => {
    const filePath = getFileUrl(file);
    return {
        url: filePath,
    };
};

const replaceFile = async (file: Express.Multer.File, oldFilePath: string) => {
    // Delete the old file if it exists
    if (oldFilePath) {
        deleteFileFromDisk(oldFilePath);
    }

    // Return the new file path
    const filePath = getFileUrl(file);
    return {
        url: filePath,
    };
};

const removeFile = async (filePath: string) => {
    const result = deleteFileFromDisk(filePath);
    return result;
};

export const FileService = {
    uploadFile,
    replaceFile,
    removeFile,
};
