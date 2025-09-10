import { FileSystemUtils } from "@/features/desktop/utils/FileSystemUtils"
import { FileType } from "@/generated/prisma"
import {prisma} from "@/features/shared/lib";

async function createFileSystemItem(
    name: string,
    type: FileType,
    parentPath: string | null,
    size?: number,
    daysAgo: number = 0,
) {
    const path = parentPath ? FileSystemUtils.joinPath(parentPath, name) : `/${name}`
    const extension = FileSystemUtils.getExtension(name)

    const now = new Date()
    const dateModified = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    const dateCreated = new Date(dateModified.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000)

    return prisma.fileSystemItem.create({
        data: {
            name,
            type,
            path,
            parentPath,
            size,
            extension,
            dateCreated,
            dateModified,
        }
    })
}

async function seedFileSystem() {
    console.log('🌱 Seeding filesystem...')

    try {
        // Clear existing data
        await prisma.fileSystemItem.deleteMany()
        console.log('🧹 Cleared existing filesystem data')

        // Create root folders
        const rootFolders = [
            { name: 'Documents', daysAgo: 0 },
            { name: 'Desktop', daysAgo: 1 },
            { name: 'Downloads', daysAgo: 2 },
            { name: 'Pictures', daysAgo: 3 },
            { name: 'Music', daysAgo: 4 },
            { name: 'Movies', daysAgo: 5 },
            { name: 'Applications', daysAgo: 10 },
            { name: 'Library', daysAgo: 15 }
        ]

        for (const folder of rootFolders) {
            await createFileSystemItem(folder.name, FileType.FOLDER, null, undefined, folder.daysAgo)
        }
        console.log('📁 Created root folders')

        // Documents folder content
        await createFileSystemItem('Project Proposal.pdf', FileType.DOCUMENT, '/Documents', 2400000, 0)
        await createFileSystemItem('Budget 2024.xlsx', FileType.DOCUMENT, '/Documents', 1200000, 5)
        await createFileSystemItem('Contract Draft.docx', FileType.DOCUMENT, '/Documents', 890000, 8)
        await createFileSystemItem('Research Notes.txt', FileType.TEXT, '/Documents', 45000, 12)
        await createFileSystemItem('Meeting Notes', FileType.FOLDER, '/Documents', undefined, 1)
        await createFileSystemItem('Design Assets', FileType.FOLDER, '/Documents', undefined, 3)
        await createFileSystemItem('Archive', FileType.FOLDER, '/Documents', undefined, 30)

        // Meeting Notes subfolder
        await createFileSystemItem('Q4 Planning.md', FileType.TEXT, '/Documents/Meeting Notes', 15000, 1)
        await createFileSystemItem('Client Feedback.txt', FileType.TEXT, '/Documents/Meeting Notes', 8500, 2)
        await createFileSystemItem('Team Standup.md', FileType.TEXT, '/Documents/Meeting Notes', 12000, 3)

        // Design Assets subfolder
        await createFileSystemItem('Logo.svg', FileType.IMAGE, '/Documents/Design Assets', 45000, 2)
        await createFileSystemItem('Mockup.psd', FileType.IMAGE, '/Documents/Design Assets', 15000000, 4)
        await createFileSystemItem('Icons.sketch', FileType.IMAGE, '/Documents/Design Assets', 2300000, 6)
        await createFileSystemItem('Exported', FileType.FOLDER, '/Documents/Design Assets', undefined, 1)

        // Exported subfolder
        await createFileSystemItem('logo-light.png', FileType.IMAGE, '/Documents/Design Assets/Exported', 125000, 1)
        await createFileSystemItem('logo-dark.png', FileType.IMAGE, '/Documents/Design Assets/Exported', 118000, 1)
        await createFileSystemItem('favicon.ico', FileType.IMAGE, '/Documents/Design Assets/Exported', 15000, 2)

        // Desktop content
        await createFileSystemItem('Screenshot 2024-01-15.png', FileType.IMAGE, '/Desktop', 890000, 0)
        await createFileSystemItem('Quick Notes.txt', FileType.TEXT, '/Desktop', 2500, 1)
        await createFileSystemItem('Temp', FileType.FOLDER, '/Desktop', undefined, 2)

        // Downloads content
        await createFileSystemItem('installer.dmg', FileType.OTHER, '/Downloads', 45000000, 0)
        await createFileSystemItem('document.pdf', FileType.DOCUMENT, '/Downloads', 1200000, 1)
        await createFileSystemItem('archive.zip', FileType.ARCHIVE, '/Downloads', 8900000, 3)
        await createFileSystemItem('presentation.pptx', FileType.DOCUMENT, '/Downloads', 5200000, 5)

        // Pictures content
        await createFileSystemItem('vacation-2023.jpg', FileType.IMAGE, '/Pictures', 2300000, 10)
        await createFileSystemItem('family-photo.png', FileType.IMAGE, '/Pictures', 1800000, 15)
        await createFileSystemItem('sunset.heic', FileType.IMAGE, '/Pictures', 3200000, 20)
        await createFileSystemItem('Screenshots', FileType.FOLDER, '/Pictures', undefined, 5)
        await createFileSystemItem('Camera Roll', FileType.FOLDER, '/Pictures', undefined, 30)

        // Screenshots subfolder
        await createFileSystemItem('Screen Shot 2024-01-15 at 10.30.45 AM.png', FileType.IMAGE, '/Pictures/Screenshots', 450000, 0)
        await createFileSystemItem('Screen Shot 2024-01-14 at 3.22.15 PM.png', FileType.IMAGE, '/Pictures/Screenshots', 380000, 1)
        await createFileSystemItem('Screen Shot 2024-01-13 at 9.15.30 AM.png', FileType.IMAGE, '/Pictures/Screenshots', 420000, 2)

        // Music content
        await createFileSystemItem('Bohemian Rhapsody.mp3', FileType.AUDIO, '/Music', 8900000, 100)
        await createFileSystemItem('Imagine.flac', FileType.AUDIO, '/Music', 15000000, 120)
        await createFileSystemItem('Playlists', FileType.FOLDER, '/Music', undefined, 50)
        await createFileSystemItem('Albums', FileType.FOLDER, '/Music', undefined, 60)

        // Movies content
        await createFileSystemItem('Home Video.mp4', FileType.VIDEO, '/Movies', 450000000, 30)
        await createFileSystemItem('Presentation Recording.mov', FileType.VIDEO, '/Movies', 120000000, 5)

        // Add some code files
        await createFileSystemItem('Projects', FileType.FOLDER, '/Documents', undefined, 5)
        await createFileSystemItem('app.tsx', FileType.CODE, '/Documents/Projects', 15000, 2)
        await createFileSystemItem('styles.css', FileType.CODE, '/Documents/Projects', 8000, 3)
        await createFileSystemItem('package.json', FileType.CODE, '/Documents/Projects', 2500, 1)

        // Add some hidden files
        await createFileSystemItem('.env', FileType.TEXT, '/Documents/Projects', 500, 1)
        await createFileSystemItem('.gitignore', FileType.TEXT, '/Documents/Projects', 1200, 5)

        console.log('✅ Filesystem seeded successfully!')

        // Print summary
        const totalItems = await prisma.fileSystemItem.count()
        const folderCount = await prisma.fileSystemItem.count({ where: { type: FileType.FOLDER } })
        const fileCount = totalItems - folderCount

        console.log(`📊 Created ${totalItems} items (${folderCount} folders, ${fileCount} files)`)

    } catch (error) {
        console.error('❌ Error seeding filesystem:', error)
        throw error
    }
}

async function main() {
    await seedFileSystem()
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })