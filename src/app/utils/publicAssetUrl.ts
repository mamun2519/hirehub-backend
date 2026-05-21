const getBaseUrl = () => {
    return (
        process.env.BACKEND_URL ||
        process.env.SERVER_URL ||
        process.env.APP_URL ||
        ("http://localhost:" + (process.env.PORT || 5000))
    );
};

export const normalizeFilePathToUrl = (
    filePath?: string | null,
    baseUrl: string = getBaseUrl(),
) => {
    if (!filePath) return filePath;

    if (/^https?:\/\//i.test(filePath)) {
        return filePath;
    }

    const normalizedPath = filePath.startsWith("/")
        ? filePath
        : "/" + filePath;

    return new URL(normalizedPath, baseUrl).toString();
};
