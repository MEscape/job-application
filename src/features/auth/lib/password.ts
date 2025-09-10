import bcrypt from "bcryptjs"

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
    if (!password || password.length < 5 || password.length > 64) {
        throw new Error("Invalid password length")
    }
    return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
}