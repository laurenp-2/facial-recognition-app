import React, { useRef } from "react";
import { Button } from "@mui/material";

/**
 * ImageInputButton — a button that prompts users to select an image file
 * @return {React.FC} – The rendered button component.
 */
const ImageInputButton: React.FC = () => {
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
          backgroundColor: "steelblue",
          color: "aliceblue",
          border: "1px solid steelblue",
          borderRadius: "8px",
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
