"use client"

import { useEffect, useState } from "react";
import { createFinderStore, FinderActions, FinderState } from "../stores/finderStore";

const finderStore = createFinderStore();

export const useFinderStore = () => {
  const [state, setState] = useState<FinderState & FinderActions>(() => ({
    ...finderStore.getState(),
    ...finderStore,
  }));

  useEffect(() => {
    const unsubscribe = finderStore.subscribe(setState);
    return () => {
      unsubscribe();
    };
  }, []);

  return state;
};