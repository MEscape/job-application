"use client";

import React from 'react';

import {Background, StatusBar} from "@/features/shared/components";
import {useTime} from "@/features/shared/hooks";

import { LoginForm, OSBootAnimation, LockScreen } from "@/features/auth/components";
import {useAuth, useLoginForm, useViewManager, useCredentials, ViewType} from "@/features/auth/hooks";

const LoginSystem = () => {
    const { formattedTime, formattedDate } = useTime();
    const { credentials, updateCredential, resetCredentials, isValid } = useCredentials();
    const { authStatus, error, authenticate, resetAuth } = useAuth();
    const { currentView, handleUnlock, handleBack } = useViewManager(resetCredentials);

    const {
        showPassword,
        handleSubmit,
        handleKeyDown,
        handleTogglePassword
    } = useLoginForm({
        credentials,
        isValid,
        authenticate,
        resetCredentials,
        resetAuth,
    });

    const isLoading = currentView === 'loading' as ViewType;

    return (
        <Background>
            <StatusBar time={formattedTime} />

            <LockScreen
                formattedTime={formattedTime}
                formattedDate={formattedDate}
                onUnlock={handleUnlock}
                isVisible={currentView === 'lock'}
            />

            <LoginForm
                onSubmit={handleSubmit}
                onBack={handleBack}
                credentials={credentials}
                onCredentialChange={updateCredential}
                onKeyDown={handleKeyDown}
                showPassword={showPassword}
                onTogglePassword={handleTogglePassword}
                isLoading={authStatus === 'loading'}
                error={error}
                isVisible={currentView === 'login'}
            />

            <OSBootAnimation isVisible={isLoading} />
        </Background>
    );
};

export default LoginSystem;