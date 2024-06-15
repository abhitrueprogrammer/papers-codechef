"use client";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument } from "pdf-lib";
import axios from "axios";

const Upload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const generatePdf = async () => {
    const pdfDoc = await PDFDocument.create();
    const pagePromises = files.map(async (file) => {
      const imageBytes = await file.arrayBuffer();
      const imageType = file.type;
      let image;
      if (imageType === "image/jpeg" || imageType === "image/jpg") {
        image = await pdfDoc.embedJpg(imageBytes);
      } else if (imageType === "image/png") {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
        throw new Error("Unsupported file type");
      }
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
    });

    await Promise.all(pagePromises);

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });

    const formData = new FormData();
    formData.append("file", blob, "images.pdf");

    try {
      const response = await axios.post("/api/upload-pdf", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload successful:", response.data);
    } catch (error) {
      console.error("Error uploading PDF:", error);
    }
  };

  return (
    <div>
      <h1>Upload Images</h1>
      <div
        {...getRootProps({ className: "dropzone" })}
        style={{ border: "2px dashed #000", padding: "20px" }}
      >
        <input {...getInputProps()} />
        <p>Drag and drop some files here, or click to select files</p>
      </div>
      <ul>
        {files.map((file, index) => (
          <li key={index}>{file.name}</li>
        ))}
      </ul>
      <button onClick={generatePdf}>Generate PDF</button>
    </div>
  );
};

export default Upload;
