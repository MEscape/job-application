import { signIn } from "next-auth/react";
import type { Credentials } from './useCredentials';
import { useState } from "react";

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';

export function useAuth() {
    const [authStatus, setAuthStatus] = useState<AuthStatus>('idle');
    const [error, setError] = useState('');

    async function authenticate(credentials: Credentials) {
        if (!credentials.accessCode.trim() || !credentials.password.trim()) {
            setError('Please fill in all fields');
            return false;
        }

        setAuthStatus('loading');
        setError('');

        try {
            const result = await signIn('credentials', {
                accessCode: credentials.accessCode.trim(),
                password: credentials.password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid credentials');
                setAuthStatus('error');
                return false;
            } else if (result?.ok) {
                setAuthStatus('authenticated');
                return true;
            }

            setAuthStatus('error');
            return false;
        } catch {
            setError('Login failed');
            setAuthStatus('error');
            return false;
        }
    }

    function resetAuth() {
        setAuthStatus('idle');
        setError('');
    }

    return {
        authStatus,
        error,
        authenticate,
        resetAuth
    };
}
