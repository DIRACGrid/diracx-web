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

export const NavigationProvider = ({
  children,
  getPath,
  setPath,
  getSearchParams,
}: {
  children: React.ReactNode;
  getPath: () => string;
  setPath: (path: string) => void;
  getSearchParams: () => URLSearchParams;
}) => {
  return (
    <NavigationContext.Provider value={{ getPath, setPath, getSearchParams }}>
      {children}
    </NavigationContext.Provider>
  );
};
