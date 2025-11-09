import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "dark" | "light";
type TextSize = "normal" | "large" | "xlarge";

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  textSize: TextSize;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  accessibility: AccessibilitySettings;
  updateAccessibility: (settings: Partial<AccessibilitySettings>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("hazard-scout-theme");
    return (saved as Theme) || "dark";
  });

  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem("hazard-scout-accessibility");
    return saved ? JSON.parse(saved) : {
      reducedMotion: false,
      highContrast: false,
      textSize: "normal"
    };
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    
    // Apply accessibility settings
    if (accessibility.reducedMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }
    
    if (accessibility.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
    
    // Apply text size
    root.classList.remove("text-normal", "text-large", "text-xlarge");
    root.classList.add(`text-${accessibility.textSize}`);
    
    localStorage.setItem("hazard-scout-theme", theme);
    localStorage.setItem("hazard-scout-accessibility", JSON.stringify(accessibility));
  }, [theme, accessibility]);

  const toggleTheme = () => {
    setThemeState(prev => prev === "dark" ? "light" : "dark");
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const updateAccessibility = (settings: Partial<AccessibilitySettings>) => {
    setAccessibility(prev => ({ ...prev, ...settings }));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, accessibility, updateAccessibility }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
