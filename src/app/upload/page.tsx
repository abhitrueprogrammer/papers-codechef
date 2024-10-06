"use client";
import React, { useRef, useState } from "react";
import Camera from "@/components/camera";
import JSZip from "jszip";
import axios from "axios";
import { slots, courses } from "./select_options";
import toast, { Toaster } from "react-hot-toast";
import { handleAPIError } from "../../util/error";
import { useRouter } from "next/navigation";
import { type ApiError } from "next/dist/server/api-utils";

const Page = () => {
  const router = useRouter();
  const [openCamera, setOpenCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [slot, setSlot] = useState("");
  const [subject, setSubject] = useState("");
  const [exam, setExam] = useState("");
  const [year, setYear] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const toggleOpenCamera = () => {
    setOpenCamera((prev) => !prev);
  };

  const handlePrint = async () => {
    //file validation
    const maxFileSize = 5 * 1024 * 1024;
    const files = fileInputRef.current?.files as FileList | null;
    if (!files || files.length == 0) {
      toast.error("No files selected");
      return;
    } else if (files.length > 5) {
      toast.error("More than 5 files selected");
      return;
    }
    for (const file of files) {
      if (file.size > maxFileSize) {
        toast.error(`File ${file.name} is more than 5MB`);
        return;
      }
    }
    const zip = new JSZip();
    const formData = new FormData();

    for (const file of files) {
      zip.file(file.name, file);
      const content = await zip.generateAsync({ type: "blob" });

      const arrayBuffer = await new Response(content).arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      formData.append("zipFile", new Blob([uint8Array]), "files.zip");
      formData.append("slot", slot);
      formData.append("subject", subject);
      formData.append("exam", exam);
      formData.append("year", year);
    }
    try {
      const result = await toast.promise(
        (async () => {
          try {
            const response = await axios.post<{ message: string }>(
              "/api/mail",
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              },
            );
            return response.data;
          } catch (error) {
            handleAPIError(error);
          }
        })(),
        {
          loading: "Sending zip",
          success: "zip successfully sent",
          error: (err: ApiError) => err.message,
        },
      );
      if (result?.message === "Email sent successfully!") {
        setTimeout(() => {
          router.push("/");
        }, 1500);
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="m-5 flex flex-col items-center">
      {/* {openCamera && <Camera />} */}

      <fieldset className="mb-4 rounded-lg border-2 border-gray-300 p-4">
        <legend className="text-lg font-bold text-gray-700">
          {" "}
          Select paper parameters
        </legend>
        <div>
          <div>
            <label>
              Slot:
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                className="m-2 rounded-md border p-2"
              >
                {slots.map((slot) => {
                  return (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  );
                })}
              </select>
            </label>
          </div>
          <div>
            <label>
              Exam:
              <select
                value={exam}
                onChange={(e) => setExam(e.target.value)}
                className="m-2 rounded-md border p-2"
              >
                <option value="cat1">Cat 1</option>
                <option value="cat2">Cat 2</option>
                <option value="fat">Fat</option>
              </select>
            </label>
          </div>

          <div>
            <label>
              Subject:
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="m-2 rounded-md border p-2"
              >
                {courses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label>
              Year:
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="m-2 rounded-md border p-2"
              >
                {(() => {
                  const options = [];
                  for (
                    let i = 2011;
                    i <= Number(new Date().getFullYear());
                    i++
                  ) {
                    options.push(
                      <option key={i} value={i}>
                        {i}
                      </option>,
                    );
                  }
                  return options;
                })()}
              </select>
            </label>
          </div>
          <div className="m-4 flex items-center">
            <input
              required
              type="file"
              accept="image/*,.pdf"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                const filesArray = Array.from(e.target.files ?? []);
                setFiles(filesArray);
              }}
            />
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()} // Trigger file input on button click
                className="rounded-md bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
              >
                Choose files
              </button>
              <div
                className={`ml-2 mt-1  text-xs ${files.length === 0 ? "text-red-500" : "text-black"}`}
              >
                {files.length} files selected
              </div>
            </div>
            {/* <button onClick={toggleOpenCamera} className="bg-black/10 px-4 py-3">
            {openCamera ? "Close Camera" : "Open Camera"}
          </button> */}
          </div>
        </div>
      </fieldset>
      <button
        onClick={handlePrint}
        className="w-fit rounded-md bg-black/10 px-4  py-3 text-lg font-bold"
      >
        Send Zip File
      </button>
    </div>
  );
};

export default Page;
