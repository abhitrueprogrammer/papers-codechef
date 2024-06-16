"use client";
import React, { useRef, useState } from "react";
import Camera from "../components/camera";
import JSZip from "jszip";
import axios from "axios";

const Page = () => {
  const [openCamera, setOpenCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleOpenCamera = () => {
    setOpenCamera((prev) => !prev);
  };

  const handlePrint = async () => {
    const files = fileInputRef.current?.files as FileList | null;
    if (files && files.length > 0) {
      const zip = new JSZip();
      for (const file of files) {
        zip.file(file.name, file);
      }
      const content = await zip.generateAsync({ type: "blob" });

      // Convert Blob to ArrayBuffer
      const arrayBuffer = await new Response(content).arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Create FormData and append the zip file
      const formData = new FormData();
      formData.append("zipFile", new Blob([uint8Array]), "files.zip");

      // Send FormData to the server
      try {
        const response = await axios.post("/api/mail", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log(response.data);
      } catch (error) {
        console.error("Error sending zip file:", error);
      }
    } else {
      console.log("No files selected");
    }
  };

  return (
    <div>
      <input type="file" multiple ref={fileInputRef} />
      {openCamera && <Camera />}
      <button onClick={toggleOpenCamera} className="bg-black/10 px-4 py-3">
        {openCamera ? "Close Camera" : "Open Camera"}
      </button>
      <button onClick={handlePrint} className="bg-black/10 px-4 py-3">
        Send Zip File
      </button>
    </div>
  );
};

export default Page;
