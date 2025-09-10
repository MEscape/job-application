import React, {useCallback, useState} from "react";
import type { Credentials } from './useCredentials';

interface UseLoginFormProps {
    credentials: Credentials;
    isValid: boolean;
    authenticate: (credentials: Credentials) => Promise<boolean>;
    resetCredentials: () => void;
    resetAuth: () => void;
}

export function useLoginForm(props: UseLoginFormProps) {
    const { credentials, isValid, authenticate, resetCredentials, resetAuth } = props;
    const [showPassword, setShowPassword] = useState(false);

    // Function to send actions to parent
    const sendActionToParent = useCallback((action: string, data?: any) => {
        console.log('Sending action to parent:', action, data);
        window.parent.postMessage({
            type: 'ACTION',
            payload: {
                action,
                data
            }
        }, window.location.origin);
    }, []);

    const handleSubmit = useCallback(async function handleSubmitFn(e?: React.FormEvent) {
        e?.preventDefault();
        if (!isValid) return;

        resetAuth();

        const success = await authenticate(credentials);
        if (success) {
            resetCredentials();
            setShowPassword(false);

            sendActionToParent('START_ANIMATION', 'zooming-to-monitor');
        }
    }, [isValid, resetAuth, authenticate, credentials, resetCredentials, sendActionToParent]);

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter' && isValid) {
            handleSubmit();
        }
    }

    function handleTogglePassword() {
        setShowPassword(prev => !prev);
    }

    return {
        showPassword,
        handleSubmit,
        handleKeyDown,
        handleTogglePassword,
    };
}