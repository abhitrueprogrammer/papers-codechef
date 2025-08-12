// export interface CloudinaryUploadResult {
//   id: string;
//   batchId: string;
//   asset_id: string;
//   public_id: string;
//   version: number;
//   version_id?: string;
//   signature: string;
//   width: number;
//   height: number;
//   format: string;
//   access_mode: string;
//   bytes: number;
//   created_at: string;
//   etag: string;
//   folder: string;
//   original_filename: string;
//   path: string;
//   placeholder: boolean;
//   resource_type: string;
//   secure_url: string;
//   tags: string[];
//   thumbnail_url: string;
//   type: string;
//   url: string;

import { mongo } from "mongoose";

export interface CloudinaryUploadResult {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  access_mode: string;
}

export interface IUpcomingSlot {
  slot: string;
}

export interface IUpcomingSubject {
  subject: string;
  slots: string[];
}

export interface CloudinaryUploadWidgetProps {
  info: CloudinaryUploadResult;
  event?: string;
}

export interface PostRequestBody {
  tags: string;
}

export interface PaperResponse {
  final_url: string;
  subject: string;
  year: string;
  slot: string;
  exam: string;
}

export interface IAdminPaper {
  public_id_cloudinary: string;
  final_url: string;
  thumbnail_url: string;
  subject: string | null;
  slot: string | null;
  year: string | null;
  exam: "CAT-1" | "CAT-2" | "FAT" | "Model" | null;
  semester:
    | "Fall Semester"
    | "Winter Semester"
    | "Summer Semester"
    | "Weekend Semester"
    | null;
  cloudinary_index: number;
  campus:
    | "Vellore"
    | "Chennai"
    | "Andhra Pradesh"
    | "Bhopal"
    | "Bangalore"
    | "Mauritius"
    | null;
  answer_key_included?: boolean | null;
  is_selected?: boolean;
}

export interface ICourses {
  name: string;
}

export interface IAdminUpload {
  form_data: FormData;
  files: File[];
  public_ids: Array<string>;
  subject: string;
  slot: string;
  year: string;
  exam: "CAT-1" | "CAT-2" | "FAT";
  is_pdf: boolean;
}

export interface APIResponse {
  message: string;
  status: number;
}

export interface ConverttoPDFResponse {
  url: string;
  secure_url: string;
  asset_id: string;
  public_id: string;
  version: number;
}

export interface LoginResponse {
  token: string;
}

export interface ErrorResponse {
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface DecryptedLoginResponse {
  token: string;
  user: {
    email: string;
    id: string;
  };
}

export interface IUpcomingPaper extends mongo.Document {
  subject: string;
  slots: string[];
}

export interface IPaper {
  _id: string;
  exam: "CAT-1" | "CAT-2" | "FAT" | "Model CAT-1" | "Model CAT-2" | "Model FAT";
  final_url: string;
  thumbnail_url: string;
  semester:
    | "Fall Semester"
    | "Winter Semester"
    | "Summer Semester"
    | "Weekend Semester";
  campus:
    | "Vellore"
    | "Chennai"
    | "Andhra Pradesh"
    | "Bhopal"
    | "Bangalore"
    | "Mauritius"
  slot: string;
  subject: string;
  year: string;
  answer_key_included?: boolean;
}

export type ExamDetail = {
  subject: string;
  slot: string;
  "course-code": string;
  exam: string;
  semester:
    | "Fall Semester"
    | "Winter Semester"
    | "Summer Semester"
    | "Weekend Semester";
  year: string;
  answer_key_included: boolean | undefined;
};

export interface Filters {
  papers: IPaper[];
  unique_exams: string[];
  unique_slots: string[];
  unique_years: string[];
  unique_campuses: string[];
  unique_semesters: string[];
}

export interface StoredSubjects {
  subjects: string[];
}

export interface TransformedPaper {
  subject: string;
  slots: string[];
}
