import "./App.css";
import { useEffect, useState } from "react";
import Routing from "./routes/Routing";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { subscribeNotification } from "./services/NotificationService.jsx";
import SplashScreen from "./pages/SplashScreen.jsx";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ThemeProvider } from "./utils/ThemeContext.jsx";

/* 🔽 추가 */
import { LoadingProvider, useLoading } from "./utils/LoadingContext";
import { setLoadingHandler } from "./utils/loadingHandler";
import GlobalLoading from "./components/commons/GlobalLoading";

/* ===============================
   Axios ↔ Loading Context 연결용
================================ */
const LoadingBridge = () => {
  const loading = useLoading();

  useEffect(() => {
    setLoadingHandler({
      show: loading.show,
      hide: loading.hide,
    });
  }, [loading]);

  return null;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();

  /* 📱 모바일 viewport height 대응 */
  useEffect(() => {
    const setAppHeight = () => {
      document.documentElement.style.setProperty(
        "--app-height",
        `${window.innerHeight}px`
      );
    };

    setAppHeight();
    window.addEventListener("resize", setAppHeight);

    return () => window.removeEventListener("resize", setAppHeight);
  }, []);

  /* 🚀 스플래시 처리 */
  useEffect(() => {
    if (location.pathname === "/") {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowSplash(false);
    }
  }, [location.pathname]);

  /* 🔔 SSE 알림 구독 */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    subscribeNotification();
  }, []);

  return (
    <ThemeProvider>
      <LoadingProvider>
        {/* Axios 인터셉터 → Loading Context 연결 */}
        <LoadingBridge />

        {/* 🌍 전역 로딩 UI */}
        <GlobalLoading />

        <div className="App">
          <AnimatePresence mode="wait">
            {showSplash && location.pathname === "/" ? (
              <motion.div
                key="splash"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0 }}
              >
                <SplashScreen />
              </motion.div>
            ) : (
              <motion.div
                key="routing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Routing />

                {/* 🌐 전역 토스트 */}
                <ToastContainer
                  containerId="global-toasts"
                  position="top-right"
                  newestOnTop
                  closeOnClick={false}
                  pauseOnHover
                  draggable
                  className="toast-portal"
                  toastClassName="toast-card"
                  bodyClassName="toast-body"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </LoadingProvider>
    </ThemeProvider>
  );
}

export default App;
