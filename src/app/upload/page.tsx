"use client";
import React, { useRef, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { handleAPIError } from "../../util/error";
import { useRouter } from "next/navigation";
import { type ApiError } from "next/dist/server/api-utils";
import { Button } from "@/components/ui/button";
import { CldUploadWidget } from "next-cloudinary";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PostPDFToCloudinary } from "@/interface";
import { courses, slots, years } from "@/components/select_options";
import SearchBar from "@/components/searchbarSubjectList";
const Page = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [slot, setSlot] = useState("");
  const [subject, setSubject] = useState("");
  const [exam, setExam] = useState("");
  const [year, setYear] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSubjectCommandOpen, setIsSubjectCommandOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handlePrint = async () => {
    const maxFileSize = 5 * 1024 * 1024;
    const allowedFileTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];
    const files = fileInputRef.current?.files as FileList | null;

    if (!slot) {
      toast.error("Slot is required");
      return;
    }
    if (!subject) {
      toast.error("Subject is required");
      return;
    }
    if (!exam) {
      toast.error("Exam is required");
      return;
    }
    if (!year) {
      toast.error("Year is required");
      return;
    }
    if (!files || files.length === 0) {
      toast.error("No files selected");
      return;
    } else if (files.length > 5) {
      toast.error("More than 5 files selected");
      return;
    }
    //file have same extension
    if (!Array.from(files).every((file) => file.type == files[0]?.type))
      toast.error(`All files MUST be of same type`);
    for (const file of files) {
      if (file.size > maxFileSize) {
        toast.error(`File ${file.name} is more than 5MB`);
        return;
      }

      if (!allowedFileTypes.includes(file.type)) {
        toast.error(
          `File type of ${file.name} is not allowed. Only PDFs and images are accepted.`,
        );
        return;
      }
    }

    let isPdf = false;
    if (files[0]?.type === "application/pdf") {
      isPdf = true;
      if (files.length > 1) {
        toast.error(`PDFs should be uploaded seperately`);
        return;
      }
    }
    const Arrfiles = Array.from(files);
    const formData = new FormData();
    Arrfiles.forEach((file) => {
      formData.append("files", file);
    });

    // const body = {
    //   subject: subject,
    //   slot: slot,
    //   year: year,
    //   exam: exam,
    //   isPdf: isPdf,
    // };
    formData.append("subject", subject);
    formData.append("slot", slot);
    formData.append("year", year);
    formData.append("exam", exam);
    formData.append("isPdf", String(isPdf));
    void toast.promise(
      (async () => {
        try {
          const response = await axios.post<PostPDFToCloudinary>(
            "/api/upload",
            formData,
          );
        } catch (error: unknown) {
          throw handleAPIError(error);
        }
      })(),
      {
        loading: "Uploading papers...",
        success: "papers uploaded",
        error: (err: ApiError) => err.message,
      },
    );
  };

  const handleSubjectSelect = (value: string) => {
    setSubject(value);
    setInputValue(value);
    setIsSubjectCommandOpen(false);
  };

  return (
    <div className="flex h-screen flex-col justify-between">
      <div>
        <Navbar />
      </div>
      <div className="2xl:my-15 flex flex-col items-center">
        <fieldset className="mb-4 w-[350px] rounded-lg border-2 border-gray-300 p-4 pr-8">
          <legend className="text-lg font-bold">Select paper parameters</legend>

          <div className="flex w-full flex-col 2xl:gap-y-4">
            {/* Slot Selection */}
            <div>
              <label>Slot:</label>
              <Select value={slot} onValueChange={setSlot}>
                <SelectTrigger className="m-2 rounded-md border p-2">
                  <SelectValue placeholder="Select slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Slots</SelectLabel>
                    {slots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Exam Selection */}
            <div>
              <label>Exam:</label>
              <Select value={exam} onValueChange={setExam}>
                <SelectTrigger className="m-2 rounded-md border p-2">
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Exams</SelectLabel>
                    <SelectItem value="CAT-1">CAT-1</SelectItem>
                    <SelectItem value="CAT-2">CAT-2</SelectItem>
                    <SelectItem value="FAT">FAT</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Subject Selection */}
            <div>
              <label>Subject:</label>
              {/* setSubject */}
              <SearchBar setSubject={setSubject}></SearchBar>
              {/* <Command className="rounded-lg border shadow-md md:min-w-[450px]">
                <CommandInput
                  value={inputValue}
                  onChangeCapture={(e) =>
                    setInputValue((e.target as HTMLInputElement).value)
                  }
                  placeholder="Type a subject or search..."
                /> */}
              {/* <CommandList className="h-[100px]">
                  <CommandEmpty>No results found.</CommandEmpty>

                  <CommandGroup heading="Subjects">
                    {courses.map((course) => (
                      <CommandItem
                        key={course}
                        onSelect={() => handleSubjectSelect(course)}
                      >
                        <span>{course}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command> */}
            </div>

            {/* Year Selection */}
            <div>
              <label>Year:</label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="m-2 rounded-md border p-2">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Years</SelectLabel>
                    {years.map((year)=>
                    {
                      return (<SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>)

                    }
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="m-4 flex items-center">
              <Input
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
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-md px-4 py-2 transition"
                >
                  Choose files
                </Button>
                <div
                  className={`ml-2 mt-1 text-xs ${files.length === 0 ? "text-red-500" : ""}`}
                >
                  {files.length} files selected
                </div>
              </div>
            </div>
          </div>
        </fieldset>
        <Button
          onClick={handlePrint}
          disabled={isUploading}
          className={`w-fit rounded-md px-4 py-3 ${isUploading ? "bg-gray-300" : ""}`}
        >
          {isUploading ? "Uploading..." : "Upload Papers"}
        </Button>
      </div>
      <div className="">
        <Footer />
      </div>
    </div>
  );
};

export default Page;
