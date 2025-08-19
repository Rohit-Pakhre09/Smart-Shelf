import { useState, useEffect } from "react";
import { createContext } from "react";

export const AppContext = createContext();

const AppProvider = ({ children }) => {
  // Theme Context.
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

  // Sidebar Open State.
  const [open, setOpen] = useState(() => {
    const saved = localStorage.getItem("LMS-Sidebar");
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Local Storage of Sidebar.
  useEffect(() => {
    localStorage.setItem("LMS-Sidebar", JSON.stringify(open));
  }, [open]);

  return (
    <AppContext.Provider value={{ lightTheme, toggleTheme, open, setOpen }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
