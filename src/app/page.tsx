"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { CldUploadWidget } from "next-cloudinary";
import { type CloudinaryUploadWidgetProps } from "@/interface";
import { useRouter } from "next/navigation";

const Upload: React.FC = () => {
  const router = useRouter();
  const [subject, setSubject] = useState<string>("dcnjddc");
  const [slot, setSlot] = useState<string>("dcscddc");
  const [year, setYear] = useState<string>("ccdd");
  const [exam, setExam] = useState<string>("cat1");
  const [tag, setTag] = useState<string>();
  const [urls, setUrls] = useState<string[]>();
  const [isPdf, setIsPdf] = useState<boolean>(false);

  useEffect(() => {
    async function makeTage() {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token not found in localStorage.");
        router.push("/papersadminlogin");
      }
      const timestamp = Date.now();
      setTag(`papers-${timestamp}`);
      console.log("Tag:", tag);
    }
    void makeTage();
  }, []);

  async function completeUpload() {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found in localStorage.");
      return;
    }
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const body = {
      urls: urls,
      subject: subject,
      slot: slot,
      year: year,
      exam: exam,
      isPdf: isPdf,
    };
    try {
      const response = await axios.post("/api/admin", body, { headers });
      console.log("Upload successful:", response.data);
    } catch (error) {
      console.error("Error uploading PDF:", error);
    }
  }

  if (!tag) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Upload Images</h1>
      <CldUploadWidget
        uploadPreset="papers-unsigned"
        options={{
          sources: ["camera", "local"],
          multiple: false,
          cropping: true,
          singleUploadAutoClose: false,
          maxFiles: 5,
          tags: [tag],
        }}
        onSuccess={(results: CloudinaryUploadWidgetProps) => {
          //@ts-expect-error: ts being an ass
          setUrls((prevUrls) => [...(prevUrls ?? []), results.info?.url]);
        }}
        onClose={(result) => console.log(result)}
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
      <div>
        <label>Is PDF:</label>
        <input
          type="checkbox"
          checked={isPdf}
          onChange={(e) => setIsPdf(e.target.checked)}
        />
      </div>
      <button onClick={completeUpload}>Complete Upload</button>
      <button onClick={() => console.log(tag)}>tag</button>
    </div>
  );
};

export default Upload;
