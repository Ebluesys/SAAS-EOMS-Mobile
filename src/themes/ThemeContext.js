import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { applyTheme, getThemeColors, themeModes } from './ThemePath';

const THEME_STORAGE_KEY = 'app_theme_mode';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(themeModes.light);

  useEffect(() => {
    let mounted = true;

    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (mounted && storedTheme && storedTheme !== themeMode) {
          setThemeMode(storedTheme);
        }
      } catch {
        return;
      }
    };

    loadTheme();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    applyTheme(themeMode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, themeMode).catch(() => {});
  }, [themeMode]);

  const value = useMemo(() => {
    const isDarkMode = themeMode === themeModes.dark;
    return {
      themeMode,
      isDarkMode,
      colors: getThemeColors(themeMode),
      setThemeMode,
      toggleTheme: () => {
        setThemeMode(currentMode =>
          currentMode === themeModes.dark ? themeModes.light : themeModes.dark,
        );
      },
    };
  }, [themeMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }

  return context;
};
