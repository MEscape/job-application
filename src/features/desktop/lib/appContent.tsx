import React from "react";
import { AppType } from "@/features/desktop/constants/dock";
import {
    CameraApp,
    MailApp,
    MusicApp,
    NotesApp,
    PhotosApp,
    TerminalApp,
    CalculatorApp,
    SettingsApp
} from "@/features/desktop/components/static";
import { Finder } from "@/features/desktop/components/finder/Finder";
import { Browser } from "@/features/desktop/components/browser";

export const getAppContent = (
    appType: AppType["type"]
): React.ReactNode => {

    switch (appType) {
        case "documents":
            return <Finder />;

        case "terminal":
            return <TerminalApp />;

        case "calculator":
            return <CalculatorApp />;

        case "settings":
            return <SettingsApp />;

        case "mail":
            return <MailApp />;

        case "camera":
            return <CameraApp />;

        case "music":
            return <MusicApp />;

        case "notes":
            return <NotesApp />;

        case "browser":
            return <Browser initialUrl="/portfolio" />;

        case "photos":
            return <PhotosApp />;
    }
};
