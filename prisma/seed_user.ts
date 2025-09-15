import {prisma} from "@/features/shared/lib"
import { hashPassword } from '@/features/auth/lib'

interface UserSeedData {
    accessCode: string
    password: string
    email: string
    company: string
    name?: string
    location: string
    latitude: number
    longitude: number
    isAdmin?: boolean
}

async function createUser(userData: UserSeedData) {
    const hashedPassword = await hashPassword(userData.password)
    
    return prisma.user.create({
        data: {
            accessCode: userData.accessCode.toUpperCase(), // Ensure access code is uppercase
            password: hashedPassword,
            email: userData.email,
            company: userData.company,
            name: userData.name,
            location: userData.location,
            latitude: userData.latitude,
            longitude: userData.longitude,
            isActive: true,
            isAdmin: userData.isAdmin || false,
            lastLogin: null, // User hasn't logged in yet
        }
    })
}

async function seedUsers() {
    console.log('👤 Seeding admin user...')

    try {
        // Clear existing users
        await prisma.user.deleteMany()
        console.log('🧹 Cleared existing users')

        // Get admin user data from environment variables
        const adminAccessCode = process.env.ADMIN_ACCESS_CODE
        const adminPassword = process.env.ADMIN_PASSWORD
        const adminEmail = process.env.ADMIN_EMAIL
        const adminName = process.env.ADMIN_NAME
        const adminCompany = process.env.ADMIN_COMPANY || 'System Administrator'
        const adminLocation = process.env.ADMIN_LOCATION || 'Head Office'
        const adminLatitude = parseFloat(process.env.ADMIN_LATITUDE || '40.7128')
        const adminLongitude = parseFloat(process.env.ADMIN_LONGITUDE || '-74.0060')

        // Validate required environment variables
        if (!adminAccessCode || !adminPassword || !adminEmail) {
            throw new Error('Missing required admin environment variables: ADMIN_ACCESS_CODE, ADMIN_PASSWORD, ADMIN_EMAIL')
        }

        // Create admin user
        const adminUser = await createUser({
            accessCode: adminAccessCode,
            password: adminPassword,
            email: adminEmail,
            company: adminCompany,
            name: adminName,
            location: adminLocation,
            latitude: adminLatitude,
            longitude: adminLongitude,
            isAdmin: true
        })
        
        console.log(`👑 Created admin user: ${adminUser.email} (${adminUser.accessCode})`)

        console.log('✅ Admin user seeded successfully!')

        return adminUser

    } catch (error) {
        console.error('❌ Error seeding admin user:', error)
        throw error
    }
}

async function main() {
    await seedUsers()
}

// Export the function for use in other scripts
export { seedUsers }

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