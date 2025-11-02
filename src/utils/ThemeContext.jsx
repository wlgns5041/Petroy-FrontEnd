import React, { createContext, useState, useEffect, useContext } from "react";

// 컨텍스트 생성
const ThemeContext = createContext();

// Provider 컴포넌트
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // localStorage 저장된 테마 유지
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 훅으로 쉽게 사용
export const useTheme = () => useContext(ThemeContext);