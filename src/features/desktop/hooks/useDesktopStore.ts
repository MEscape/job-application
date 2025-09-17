"use client"

import { useEffect, useState } from "react";
import { createDesktopStore, DesktopActions, DesktopState } from "../stores/desktopStore";

const desktopStore = createDesktopStore();

export const useDesktopStore = () => {
  const [state, setState] = useState<DesktopState & DesktopActions>(() => ({
    ...desktopStore.getState(),
    ...desktopStore,
  }));

  useEffect(() => {
    const unsubscribe = desktopStore.subscribe(setState);
    return () => {
      unsubscribe();
    };
  }, []);

  return state;
};