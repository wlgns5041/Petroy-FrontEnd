import React from "react";
import { useTheme } from "../../utils/ThemeContext";
import defaultProfilePic from "../../assets/icons/profile-default.png";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const ProfileImage = ({
  src,
  alt = "이미지",
  title,
  className = "",
  onClick,
  ...props
}) => {
  const { isDarkMode } = useTheme();

  const resolveSrc = (image) => {
    if (!image || image === "null" || image === "" || image === undefined) {
      return defaultProfilePic;
    }
    if (image.startsWith("http") || image.startsWith("data:")) return image;
    return `${API_BASE_URL}${image}`;
  };

  return (
    <img
      src={resolveSrc(src)}
      alt={alt}
      title={title}
      className={className}
      onClick={onClick}
      style={{
        filter: isDarkMode ? "brightness(0) invert(1)" : "none",
        transition: "filter 0.3s ease",
      }}
      onError={(e) => (e.target.src = defaultProfilePic)}
      {...props}
    />
  );
};

export default ProfileImage;