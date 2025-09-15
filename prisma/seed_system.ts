import { FileSystemUtils } from "@/features/desktop/utils/FileSystemUtils"
import { FileType } from "@prisma/client"
import {prisma} from "@/features/shared/lib";

async function createSystemFolder(
    name: string,
    parentPath: string | null,
    uploadedBy: string,
    daysAgo: number = 0,
) {
    const path = parentPath ? FileSystemUtils.joinPath(parentPath, name) : `/${name}`

    const now = new Date()
    const dateModified = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    const dateCreated = new Date(dateModified.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Created within a week of modified

    return prisma.fileSystemItem.create({
        data: {
            name,
            type: FileType.FOLDER,
            path,
            parentPath,
            size: undefined, // Folders don't have size
            extension: null,
            dateCreated,
            dateModified,
            uploadedBy,
        }
    })
}

async function seedSystemFolders() {
    console.log('🗂️ Seeding system folders...')

    try {
        // Get the first user to use as uploader
        const user = await prisma.user.findFirst()
        if (!user) {
            throw new Error('No users found. Please seed users first.')
        }
        const uploadedBy = user.id
        
        // Clear existing system folders only (keep other files/folders if they exist)
        const systemFolderNames = ['Documents', 'Desktop', 'Downloads', 'Pictures', 'Music', 'Movies']
        for (const folderName of systemFolderNames) {
            await prisma.fileSystemItem.deleteMany({
                where: {
                    name: folderName,
                    parentPath: null,
                    type: FileType.FOLDER
                }
            })
        }
        console.log('🧹 Cleared existing system folders')

        // Create system folders with varied creation times
        const systemFolders = [
            { name: 'Documents', daysAgo: 0 },
            { name: 'Desktop', daysAgo: 1 },
            { name: 'Downloads', daysAgo: 2 },
            { name: 'Pictures', daysAgo: 3 },
            { name: 'Music', daysAgo: 4 },
            { name: 'Movies', daysAgo: 5 }
        ]

        const createdFolders = []
        for (const folder of systemFolders) {
            const createdFolder = await createSystemFolder(
                folder.name, 
                null, 
                uploadedBy, 
                folder.daysAgo
            )
            createdFolders.push(createdFolder)
            console.log(`📁 Created system folder: ${folder.name}`)
        }

        console.log('✅ System folders seeded successfully!')
        console.log(`📊 Created ${createdFolders.length} system folders`)

        return createdFolders

    } catch (error) {
        console.error('❌ Error seeding system folders:', error)
        throw error
    }
}

async function main() {
    await seedSystemFolders()
}

// Export the function for use in other scripts
export { seedSystemFolders }

// Run if this file is executed directly
if (require.main === module) {
    main()
        .catch((e) => {
            console.error(e)
            process.exit(1)
        })
        .finally(async () => {
            await prisma.$disconnect()
        })
}