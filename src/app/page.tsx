"use client";
import React, { useCallback, useState } from "react";
import { PDFDocument } from "pdf-lib";
import axios from "axios";
import { CldUploadWidget } from "next-cloudinary";
import { CloudinaryUploadResult } from "@/interface";


let tag = "";

const Upload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [subject, setSubject] = useState<string>("");
  const [slot, setSlot] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [exam, setExam] = useState<string>("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const generateTimestampTag = () => {
    const timestamp = Date.now();
    tag = `papers-${timestamp}`;
  };

  async function completeUpload(results: CloudinaryUploadResult) {
    console.log("Upload successful:", results.tags[0]);
    const body = {
      tags: results.tags[0],
    }
    try {
      const response = await axios.post("/api/papers", body);
      console.log("Upload successful:", response.data);
    } catch (error) {
      console.error("Error uploading PDF:", error);
    }
  }

  return (
    <div>
      <h1>Upload Images</h1>
      <CldUploadWidget
        uploadPreset="papers-unsigned"
        options={{
          sources: ["camera", "local"],
          multiple: true,
          maxFiles: 5,
          tags: [tag],
          
        }}
        
        onSuccess={(results) => {
          void completeUpload(results.info as CloudinaryUploadResult);
        }}
        onClose={(result) => console.log(result)}
        onOpen={() => generateTimestampTag()}
      >
        {({ open }) => {
          return (
            <button
              className="mb-4 rounded bg-indigo-500 px-4 py-2 text-white"
              onClick={() => open()}
            >
              Upload Files
            </button>
          );
        }}
      </CldUploadWidget>
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
    </div>
  );
};

export default Upload;
