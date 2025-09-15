import React, { useState, useCallback } from 'react';

export interface Credentials {
    accessCode: string;
    password: string;
}

export function useCredentials(initialCredentials: Credentials = { accessCode: '', password: '' }) {
    const [credentials, setCredentials] = useState<Credentials>(initialCredentials);

    const updateCredential = useCallback(function updateCredentialFn(field: keyof Credentials) {
        return function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
            setCredentials(function(prev) {
                const value = field === 'accessCode' ? e.target.value.toUpperCase() : e.target.value;
                return { ...prev, [field]: value };
            });
        }
    }, []);

    const resetCredentials = useCallback(function resetCredentialsFn() {
        setCredentials({ accessCode: '', password: '' });
    }, []);

    const isValid = !!(credentials.accessCode.trim() && credentials.password.trim());

    return {
        credentials,
        updateCredential,
        resetCredentials,
        isValid
    };
}
