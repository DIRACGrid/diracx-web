"use client";

import React, { useMemo } from "react";

export interface NavigationContextType {
  getPath: () => string;
  setPath: (path: string) => void;
  getSearchParams: () => URLSearchParams;
}

export const NavigationContext = React.createContext<NavigationContextType>({
  getPath: () => "",
  setPath: () => {},
  getSearchParams: () => new URLSearchParams(),
});

interface NavigationProviderProps {
  children: React.ReactNode;
  getPath: () => string;
  setPath: (path: string) => void;
  getSearchParams: () => URLSearchParams;
}

export const NavigationProvider = ({
  children,
  getPath,
  setPath,
  getSearchParams,
}: NavigationProviderProps) => {
  const contextValue = useMemo(
    () => ({ getPath, setPath, getSearchParams }),
    [getPath, setPath, getSearchParams],
  );

  return <NavigationContext value={contextValue}>{children}</NavigationContext>;
};
