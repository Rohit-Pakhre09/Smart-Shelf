import { useState } from "react";
import { createContext } from "react";

export const ThemeContext = createContext();

const AppProvider = ({ children }) => {
  const [lightTheme, setLightTheme] = useState(() => {
    const saved = localStorage.getItem("LMS-Theme");
    return saved ? saved === "light" : false;
  });

  // Theme Toggling
  const toggleTheme = () => {
    setLightTheme((theme) => {
      const newTheme = !theme;
      localStorage.setItem("LMS-Theme", newTheme ? "light" : "dark");
      return newTheme;
    });
  };
  return (
    <ThemeContext.Provider value={{ lightTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default AppProvider;
