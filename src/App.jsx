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

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();

useEffect(() => {
  const setAppHeight = () => {
    document.documentElement.style.setProperty(
      '--app-height',
      `${window.innerHeight}px`
    );
  };

  setAppHeight();
  window.addEventListener('resize', setAppHeight);

  return () => window.removeEventListener('resize', setAppHeight);
}, []);

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

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    subscribeNotification();
  }, []);

  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}

export default App;
