"use client";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument } from "pdf-lib";
import axios from "axios";

const Upload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [subject, setSubject] = useState<string>("");
  const [slot, setSlot] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [exam, setExam] = useState<string>("");

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

    const formData = new FormData();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    console.log(blob);
    formData.append("file", blob);
    formData.append("subject", "prob");
    formData.append("slot", "g1+tg1");
    formData.append("year", "2024");
    formData.append("exam", "fat");

    try {
      const response = await axios.post("/api/papers", formData, {
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
      <div>
        <label>Subject:</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>
      <div>
        <label>Slot:</label>
        <input
          type="text"
          value={slot}
          onChange={(e) => setSlot(e.target.value)}
        />
      </div>
      <div>
        <label>Year:</label>
        <input
          type="text"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
      </div>
      <div>
        <label>Exam:</label>
        <input
          type="text"
          value={exam}
          onChange={(e) => setExam(e.target.value)}
        />
      </div>
      <button onClick={generatePdf}>Generate PDF</button>
    </div>
  );
};

export default Upload;
