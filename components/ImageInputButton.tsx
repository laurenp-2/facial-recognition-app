import React, { useRef } from "react";
import { Button } from "@mui/material";

interface ImageInputButtonProps {
  onImageSelected: (image: HTMLImageElement) => void;
}
/**
 *  ImageInputButton — a button that prompts users to select an image file
 *  @return {React.FC} – The rendered button component.
 */
const ImageInputButton: React.FC<ImageInputButtonProps> = ({
  onImageSelected,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const img = new Image();
      img.onload = () => {
        onImageSelected(img);
      };
      img.src = URL.createObjectURL(file);
    }
  };

  return (
    <>
      <Button
        onClick={handleButtonClick}
        sx={{
          background: "linear-gradient(135deg, #ff6ec7 0%, #c44cff 100%)",
          color: "#ffffff",
          border: "none",
          borderRadius: "12px",
          padding: "0.75rem 1.5rem",
          fontSize: "0.95rem",
          fontWeight: "600",
          textTransform: "none",
          boxShadow: "0 4px 20px rgba(255, 110, 199, 0.3)",
          transition: "all 0.3s ease",
          minWidth: "140px",
          "&:hover": {
            background: "linear-gradient(135deg, #c44cff 0%, #7c3aed 100%)",
            boxShadow: "0 6px 30px rgba(255, 110, 199, 0.4)",
            transform: "translateY(-2px)",
          },
        }}
      >
        Upload Image
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        accept="image/png, image/jpeg"
      />
    </>
  );
};

export default ImageInputButton;
