export function generateAccessCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

export function generatePassword(): string {
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*'

    let password = ''

    // Ensure at least one character from each category
    password += upperCase.charAt(Math.floor(Math.random() * upperCase.length))
    password += lowerCase.charAt(Math.floor(Math.random() * lowerCase.length))
    password += numbers.charAt(Math.floor(Math.random() * numbers.length))
    password += symbols.charAt(Math.floor(Math.random() * symbols.length))

    // Fill the rest randomly (total length 12)
    const allChars = upperCase + lowerCase + numbers + symbols
    for (let i = 4; i < 12; i++) {
        password += allChars.charAt(Math.floor(Math.random() * allChars.length))
    }

    // Shuffle the password to randomize positions
    return password.split('').sort(() => Math.random() - 0.5).join('')
}