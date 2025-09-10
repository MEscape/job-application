import path from 'path'

export class FileSystemUtils {
    /**
     * Validates if a path is safe (no directory traversal)
     */
    static isValidPath(inputPath: string): boolean {
        const normalized = this.normalizePath(inputPath)

        // Check for directory traversal attempts
        if (normalized.includes('../') || normalized.includes('..\\')) {
            return false
        }

        // Check for invalid characters (adjust based on your needs)
        const invalidChars = /[<>:"|?*\x00-\x1f]/
        return !invalidChars.test(normalized);
    }

    /**
     * Extracts file extension from filename
     */
    static getExtension(filename: string): string | null {
        const ext = path.extname(filename).toLowerCase().slice(1)
        return ext || null
    }

    /**
     * Joins path segments safely
     */
    static joinPath(...segments: string[]): string {
        const joined = path.posix.join('/', ...segments)
        return this.normalizePath(joined)
    }

    /**
     * Normalizes path (removes double slashes, ensures leading slash)
     */
    static normalizePath(inputPath: string): string {
        if (!inputPath) return '/'

        // Remove multiple consecutive slashes
        let normalized = inputPath.replace(/\/+/g, '/')

        // Ensure it starts with a slash
        if (!normalized.startsWith('/')) {
            normalized = '/' + normalized
        }

        // Remove trailing slash unless it's the root
        if (normalized.length > 1 && normalized.endsWith('/')) {
            normalized = normalized.slice(0, -1)
        }

        return normalized
    }
}