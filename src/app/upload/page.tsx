"use client";
import React, { useRef, useState } from "react";
import Camera from "../components/camera";
import JSZip from "jszip";
import axios from "axios";

const Page = () => {
  const [openCamera, setOpenCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [slot, setSlot] = useState("");
  const [subject, setSubject] = useState("");
  const [exam, setExam] = useState("");
  const [year, setYear] = useState("");

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

      const arrayBuffer = await new Response(content).arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const formData = new FormData();
      formData.append("zipFile", new Blob([uint8Array]), "files.zip");
      formData.append("slot", slot);
      formData.append("subject", subject);
      formData.append("exam", exam);
      formData.append("year", year);

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
      <input type="file" accept="image/*,.pdf" multiple ref={fileInputRef} />
      {openCamera && <Camera />}
      <button onClick={toggleOpenCamera} className="bg-black/10 px-4 py-3">
        {openCamera ? "Close Camera" : "Open Camera"}
      </button>
      <div>
        <label>
          Slot:
          <input
            type="text"
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            className="border p-2 m-2"
          />
        </label>
        <label>
          Subject:
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border p-2 m-2"
          />
        </label>
        <label>
          Exam:
          <input
            type="text"
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            className="border p-2 m-2"
          />
        </label>
        <label>
          Year:
          <input
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border p-2 m-2"
          />
        </label>
      </div>
      <button onClick={handlePrint} className="bg-black/10 px-4 py-3">
        Send Zip File
      </button>
    </div>
  );
};

export default Page;
