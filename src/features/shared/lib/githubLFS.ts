import { writeFile, readFile, unlink, mkdir, access } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';

/**
 * GitHub LFS Helper Library
 * 
 * This library provides functions to handle file storage using GitHub LFS.
 * Files are stored locally in the uploads directory and tracked by Git LFS
 * for version control and remote storage.
 * 
 * Benefits:
 * - Completely free (no payment required)
 * - 1GB free storage + 1GB free bandwidth per month
 * - Automatic version control integration
 * - No external dependencies or API keys needed
 */

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

/**
 * Ensures the uploads directory exists
 */
async function ensureUploadsDir(): Promise<void> {
  try {
    await access(UPLOADS_DIR, constants.F_OK);
  } catch {
    await mkdir(UPLOADS_DIR, { recursive: true });
  }
}

/**
 * Generates a safe filename by removing/replacing unsafe characters
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Generates a unique filename to prevent conflicts
 */
function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(originalFilename);
  const name = path.basename(originalFilename, ext);
  const sanitizedName = sanitizeFilename(name);
  
  return `${timestamp}_${random}_${sanitizedName}${ext}`;
}

/**
 * Gets the file path for a given filename
 */
function getFilePath(filename: string): string {
  return path.join(UPLOADS_DIR, filename);
}

/**
 * Uploads a file to the local storage (tracked by Git LFS)
 * 
 * @param file - The file to upload (File object or Buffer)
 * @param originalFilename - The original filename
 * @returns Promise<string> - The stored filename
 */
export async function uploadFileToLFS(
  file: File | Buffer,
  originalFilename: string
): Promise<string> {
  try {
    await ensureUploadsDir();
    
    const uniqueFilename = generateUniqueFilename(originalFilename);
    const filePath = getFilePath(uniqueFilename);
    
    let buffer: Buffer;
    
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      buffer = file;
    }
    
    await writeFile(filePath, buffer);
    
    console.log(`File uploaded to LFS: ${uniqueFilename}`);
    return uniqueFilename;
  } catch (error) {
    console.error('Error uploading file to LFS:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Downloads a file from local storage
 * 
 * @param filename - The filename to download
 * @returns Promise<Buffer> - The file content as a buffer
 */
export async function downloadFileFromLFS(filename: string): Promise<Buffer> {
  try {
    const filePath = getFilePath(filename);
    const buffer = await readFile(filePath);
    
    console.log(`File downloaded from LFS: ${filename}`);
    return buffer;
  } catch (error) {
    console.error('Error downloading file from LFS:', error);
    throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'File not found'}`);
  }
}

/**
 * Deletes a file from local storage
 * 
 * @param filename - The filename to delete
 * @returns Promise<void>
 */
export async function deleteFileFromLFS(filename: string): Promise<void> {
  try {
    const filePath = getFilePath(filename);
    await unlink(filePath);
    
    console.log(`File deleted from LFS: ${filename}`);
  } catch (error) {
    console.error('Error deleting file from LFS:', error);
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'File not found'}`);
  }
}

/**
 * Checks if a file exists in local storage
 * 
 * @param filename - The filename to check
 * @returns Promise<boolean> - Whether the file exists
 */
export async function fileExistsInLFS(filename: string): Promise<boolean> {
  try {
    const filePath = getFilePath(filename);
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the public URL for a file (for development/local access)
 * In production, this would be served through your web server
 * 
 * @param filename - The filename
 * @returns string - The public URL
 */
export function getFileURL(filename: string): string {
  // In development, files are served from the uploads directory
  // In production, you would configure your web server to serve these files
  return `/api/files/serve/${filename}`;
}

/**
 * Gets file information
 * 
 * @param filename - The filename
 * @returns Promise<{size: number, exists: boolean}> - File information
 */
export async function getFileInfo(filename: string): Promise<{size: number, exists: boolean}> {
  try {
    const filePath = getFilePath(filename);
    const stats = await import('fs').then(fs => fs.promises.stat(filePath));
    
    return {
      size: stats.size,
      exists: true
    };
  } catch {
    return {
      size: 0,
      exists: false
    };
  }
}

/**
 * Configuration check - always returns true since no external config is needed
 */
export function isLFSConfigured(): boolean {
  return true; // No external configuration needed for local storage
}

export default {
  uploadFileToLFS,
  downloadFileFromLFS,
  deleteFileFromLFS,
  fileExistsInLFS,
  getFileURL,
  getFileInfo,
  isLFSConfigured
};