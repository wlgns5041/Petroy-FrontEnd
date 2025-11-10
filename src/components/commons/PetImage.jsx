import React from "react";
import defaultPet from "../../assets/images/DefaultProfile.png";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const PetImage = ({ src, alt = "반려동물 이미지", className = "" }) => {
  const getImageSrc = (url) => {
    if (!url) return defaultPet;
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    return `${API_BASE_URL}${url}`;
  };

  return (
    <img
      src={getImageSrc(src)}
      alt={alt}
      className={className}
      onError={(e) => (e.target.src = defaultPet)} 
    />
  );
};

export default PetImage;