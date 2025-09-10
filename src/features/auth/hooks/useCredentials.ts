import React, { useState, useCallback } from 'react';

export interface Credentials {
    accessCode: string;
    password: string;
}

export const useCredentials = (initialCredentials: Credentials = { accessCode: '', password: '' }) => {
    const [credentials, setCredentials] = useState<Credentials>(initialCredentials);

    const updateCredential = useCallback((field: keyof Credentials) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setCredentials(prev => ({ ...prev, [field]: e.target.value }));
            },
        []);

    const resetCredentials = useCallback(() => {
        setCredentials({ accessCode: '', password: '' });
    }, []);

    const isValid = credentials.accessCode.trim() && credentials.password.trim();

    return {
        credentials,
        updateCredential,
        resetCredentials,
        isValid
    };
};