// 다크모드 전역 상태 관리 (localStorage + <html data-theme>)

import React, { createContext, useState, useEffect, useContext } from "react";

// 전역 테마 Context 생성
const ThemeContext = createContext();

// 앱 전체에 다크모드 상태 제공
export const ThemeProvider = ({ children }) => {
  // 초기값: localStorage의 테마 설정
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // 다크모드 상태 변경 시 HTML, localStorage 갱신
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

// 테마 상태를 손쉽게 가져오는 커스텀 훅
export const useTheme = () => useContext(ThemeContext);