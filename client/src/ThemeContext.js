import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

const ThemeCtx = createContext({ theme: "dark", toggle: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("loksetu-theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("loksetu-theme", theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === "dark" ? "light" : "dark"));

  const muiTheme = useMemo(() => createTheme({
    palette: {
      mode: theme,
      primary: { main: '#8B5CF6' },
      background: {
        default: theme === 'dark' ? '#060608' : '#FAFBFC',
        paper: theme === 'dark' ? '#121218' : '#FFFFFF',
      },
    },
    typography: { fontFamily: 'var(--font-primary)' },
  }), [theme]);

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);
