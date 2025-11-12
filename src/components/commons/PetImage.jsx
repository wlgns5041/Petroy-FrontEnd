import React from "react";
import { useTheme } from "../../utils/ThemeContext";
import defaultPet from "../../assets/icons/pet-default.png";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const PetImage = ({ src, alt = "반려동물 이미지", className = "" }) => {
  const { isDarkMode } = useTheme();

  const getImageSrc = (url) => {
    if (!url || url === "null" || url === "") return defaultPet;
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    return `${API_BASE_URL}${url}`;
  };

  const imageSrc = getImageSrc(src);
  const isDefault = imageSrc === defaultPet;

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      style={{
        filter: isDarkMode && isDefault ? "brightness(0) invert(1)" : "none",
        transition: "filter 0.3s ease",
      }}
      onError={(e) => (e.target.src = defaultPet)}
    />
  );
};

export default PetImage;