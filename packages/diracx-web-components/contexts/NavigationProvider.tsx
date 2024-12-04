import React from "react";

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
  return (
    <NavigationContext.Provider value={{ getPath, setPath, getSearchParams }}>
      {children}
    </NavigationContext.Provider>
  );
};
