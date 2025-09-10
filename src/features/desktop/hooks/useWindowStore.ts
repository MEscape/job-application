"use client"

import {useEffect, useState} from "react";
import {createWindowStore, WindowActions, WindowStore} from "@/features/desktop/stores/windowStore";

const windowStore = createWindowStore();

export const useWindowStore = () => {
    const [state, setState] = useState<WindowStore & WindowActions>(() => ({
        ...windowStore.getState(),
        ...windowStore,
    }));

    useEffect(() => {
        const unsubscribe = windowStore.subscribe(setState);
        return () => {
            unsubscribe();
        };
    }, []);

    return state;
};
