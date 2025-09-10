export class FileSystemError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 500
    ) {
        super(message)
        this.name = 'FileSystemError'
    }
}

export class FileNotFoundError extends FileSystemError {
    constructor(path: string) {
        super(`File or directory not found: ${path}`, 'FILE_NOT_FOUND', 404)
    }
}

export class InvalidPathError extends FileSystemError {
    constructor(path: string) {
        super(`Invalid path: ${path}`, 'INVALID_PATH', 400)
    }
}

export class InvalidFileTypeError extends FileSystemError {
    constructor(fileType: string) {
        super(`Invalid file type: ${fileType}. Only PDF files are allowed.`, 'INVALID_FILE_TYPE', 400)
    }
}

export class DirectoryNotFoundError extends FileSystemError {
    constructor(path: string) {
        super(`Directory not found: ${path}`, 'DIRECTORY_NOT_FOUND', 404)
    }
}