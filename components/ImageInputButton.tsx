import React, { useRef } from "react";
import { Button } from "@mui/material";

interface ImageInputButtonProps {
  onImageSelected: (image: HTMLImageElement) => void;
}

/**
 * ImageInputButton — a button that prompts users to select an image file
 * @return {React.FC} – The rendered button component.
 */
const ImageInputButton: React.FC<ImageInputButtonProps> = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Process the selected files
      console.log(files);
    }
  };

  return (
    <>
      <Button
        onClick={handleButtonClick}
        style={{
          backgroundImage:
            "url(https://media.istockphoto.com/id/1370962549/vector/violet-purple-pink-and-navy-blue-defocused-blurred-motion-gradient-abstract-background-vector.jpg?s=612x612&w=0&k=20&c=A6ArKVzCqEArn9ORyAYm78kbKyI47t2U2QWuHnwUkVg=)",
          backgroundPosition: "left",
          color: "#ffe8fe",
          border: "1px solid #a82c72",
          borderRadius: "8px",
        }}
        sx={{ fontFamily: "var(--inter)", textTransform: "none" }}
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
