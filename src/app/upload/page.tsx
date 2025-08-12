"use client";
import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { handleAPIError } from "../../util/error";
import { Button } from "@/components/ui/button";

import { type APIResponse } from "@/interface";
import Dropzone from "react-dropzone";
import { Upload } from "lucide-react";

const Page = () => {
  const [campus, setCampus] = useState("Vellore");
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [, setResetSearch] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isGlobalDragging, setIsGlobalDragging] = useState(false);

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsGlobalDragging(true);
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (
        !e.relatedTarget ||
        (e.currentTarget !== e.relatedTarget &&
          !(e.currentTarget as Element)?.contains(e.relatedTarget as Node))
      ) {
        setIsGlobalDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsGlobalDragging(false);
    };

    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragenter", handleDragEnter);
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("drop", handleDrop);
    };
  }, []);

  function fileCheckAndSelect<T extends File>(acceptedFiles: T[]) {
    const maxFileSize = 5 * 1024 * 1024;
    const allowedFileTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    const toastId = toast.loading("uploading your files");
    if (!acceptedFiles || acceptedFiles.length === 0) {
      toast.error("No files selected", {
        id: toastId,
      });
      return;
    }

    if (acceptedFiles.length > 5) {
      toast.error("More than 5 files selected", {
        id: toastId,
      });
      return;
    }

    const invalidFiles = acceptedFiles.filter(
      (file) =>
        file.size > maxFileSize || !allowedFileTypes.includes(file.type),
    );
    if (invalidFiles.length > 0) {
      toast.error(
        `Some files are invalid. Ensure each file is below 5MB and of an allowed type (PDF, JPEG, PNG, GIF).`,
        {
          id: toastId,
        },
      );
      return;
    }

    const isPdf = acceptedFiles.reduce(
      (reducer, file) => file.type === "application/pdf" || reducer,
      false,
    );
    if (isPdf && acceptedFiles.length > 1) {
      toast.error("PDFs must be uploaded separately", {
        id: toastId,
      });
      return;
    }

    const orderedFiles = acceptedFiles.sort((a, b) => {
      return a.lastModified - b.lastModified;
    });
    setFiles(orderedFiles);
    toast.success(`${orderedFiles.length} files selected!`, {
      id: toastId,
    });
  }

  const handlePrint = async () => {
    if (!campus) {
      setCampus("Vellore");
    }

    const isPdf = files.length === 1 && files[0]?.type === "application/pdf";

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    formData.append("campus", campus);
    formData.append("isPdf", String(isPdf));

    setIsUploading(true);

    try {
      await toast.promise(
        async () => {
          try {
            await axios.post<APIResponse>("/api/upload", formData);
            return { message: "Papers uploaded successfully!" };
          } catch (error) {
            if (error instanceof AxiosError && error.response?.data) {
              const errorData = error.response.data as APIResponse;
              const errorMessage =
                errorData.message || "Failed to upload papers";
              throw new Error(errorMessage);
            }
            throw new Error("Failed to upload papers");
          }
        },
        {
          loading: "Uploading papers...",
          success: "Papers uploaded successfully!",
          error: (error: Error) => {
            return error.message;
          },
        },
      );

      setFiles([]);
      setResetSearch(true);
      setTimeout(() => setResetSearch(false), 100);
    } catch (error) {
      handleAPIError(error);
    } finally {
      setIsUploading(false);
    }
  };

  const isCurrentlyDragging = isDragging || isGlobalDragging;

  return (
    <div className="flex h-[calc(100vh-85px)] flex-col justify-center px-6 font-play">
      <div className="2xl:my-15 flex flex-col items-center">
        <fieldset className="mb-4 w-full max-w-md rounded-lg border-2 border-gray-300 p-4 pr-8">
          <div className="flex w-full flex-col 2xl:gap-y-4">
            {/* File Dropzone */}
            <div>
              <Dropzone
                onDrop={fileCheckAndSelect}
                onDragEnter={() => setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
                onDropAccepted={() => {
                  setIsDragging(false);
                  setIsGlobalDragging(false);
                }}
                onDropRejected={() => {
                  setIsDragging(false);
                  setIsGlobalDragging(false);
                }}
              >
                {({ getRootProps, getInputProps }) => (
                  <section
                    {...getRootProps()}
                    className={`my-2 -mr-2 cursor-pointer rounded-2xl border-2 ${
                      isCurrentlyDragging
                        ? "border-solid border-[#6D28D9] bg-purple-50 dark:bg-[#130E1F]"
                        : "border-dashed border-gray-300"
                    } p-8 text-center transition-all duration-200`}
                  >
                    <input {...getInputProps()} />
                    {isCurrentlyDragging ? (
                      <div className="flex flex-col items-center">
                        <p className="text-lg font-medium text-[#6D28D9]">
                          Drop files here
                        </p>
                        <Upload className="mt-2 h-10 w-10 animate-bounce text-[#6D28D9]" />
                      </div>
                    ) : (
                      <p>
                        Drag &apos;n&apos; drop some files here, or{" "}
                        <span className="text-[#6D28D9]">click</span> to select
                        files
                      </p>
                    )}
                    <div
                      className={`mt-2 text-xs ${
                        files?.length === 0 ? "text-red-500" : "text-gray-600"
                      }`}
                    >
                      {files?.length || 0} files selected
                    </div>
                  </section>
                )}
              </Dropzone>
              <label className="mx-2 -mr-2 block text-center text-xs font-medium text-gray-700">
                Only Images and PDF are allowed
                <sup className="text-red-500">*</sup>
              </label>
            </div>
          </div>
        </fieldset>
        <Button
          onClick={handlePrint}
          disabled={isUploading || files.length === 0}
          className={`w-fit rounded-md px-4 py-3 text-base ${
            isUploading || files.length === 0 ? "opacity-60" : ""
          }`}
        >
          {isUploading ? "Uploading..." : "Upload Papers"}
        </Button>
      </div>
    </div>
  );
};

export default Page;
