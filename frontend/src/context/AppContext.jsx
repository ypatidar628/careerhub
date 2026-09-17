import { createContext, useContext, useEffect, useState } from "react";
const AppContext = createContext();
export const AppProvider = ({ children }) => {
  const [dark, setDark] = useState(
    localStorage.getItem("careerhub_dark") === "true",
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("careerhub_dark", dark);
  }, [dark]);
  return (
    <AppContext.Provider value={{ dark, setDark }}>
      {children}
    </AppContext.Provider>
  );
};
export const useApp = () => useContext(AppContext);
