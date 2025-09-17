import { FinderItem } from "../../constants/finder";
import { SortBy, SortOrder } from "./FileSystemService";

export interface GetItemsOptions {
    sortBy?: SortBy
    sortOrder?: SortOrder
}

export class FileSystemAPI {
    private static baseUrl = '/api/filesystem'

    static async getItems(path: string, options: GetItemsOptions = {}): Promise<FinderItem[]> {
        const { sortBy = 'name', sortOrder = 'asc' } = options
        const searchParams = new URLSearchParams({
            sortBy,
            sortOrder
        })
        
        const url = `${this.baseUrl}${path === '/' ? '' : path}?${searchParams.toString()}`
        const response = await fetch(url)

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to fetch items')
        }

        const data = await response.json()

        // Convert API response to FinderItem format
        return data.items.map((item: any): FinderItem => ({
            id: item.id,
            name: item.name,
            type: item.type.toLowerCase(), // Convert ENUM to lowercase
            size: item.size,
            dateModified: new Date(item.dateModified),
            dateCreated: new Date(item.dateCreated),
            path: item.path,
            parentPath: item.parentPath,
            extension: item.extension,
        }))
    }

    static async uploadFile(file: File, uploadPath: string, customFileName: string): Promise<FinderItem> {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('path', uploadPath)
        formData.append('customName', customFileName || file.name)

        const response = await fetch(`${this.baseUrl}/upload`, {
            method: 'POST',
            body: formData
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to upload file')
        }

        const data = await response.json()
                const item = data.file
        return {
            id: item.id,
            name: item.name,
            type: item.type.toLowerCase(), // Convert ENUM to lowercase
            size: item.size,
            dateModified: new Date(item.dateModified),
            dateCreated: new Date(item.dateCreated),
            path: item.path,
            parentPath: item.parentPath,
            extension: item.extension,
        }
    }
}