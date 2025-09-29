import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/icons/icon.png";
import "../styles/SplashScreen.css";

function SplashScreen() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => navigate("/"), 800);
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    visible && (
      <motion.div
        className="splash-container"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="splash-center">
          <div className="splash-logo-wrapper">
            <img src={logo} alt="Petory Logo" className="splash-logo" />
          </div>
          <h1 className="splash-title">PETORY</h1>
        </div>
        <p className="splash-subtitle">반려동물의 일상과 관리를 한 번에</p>
      </motion.div>
    )
  );
}

export default SplashScreen;
