export interface CloudinaryUploadResult {
  id: string;
  batchId: string;
  asset_id: string;
  public_id: string;
  version: number;
  version_id?: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  access_mode: string;
  bytes: number;
  created_at: string;
  etag: string;
  folder: string;
  original_filename: string;
  path: string;
  placeholder: boolean;
  resource_type: string;
  secure_url: string;
  tags: string[];
  thumbnail_url: string;
  type: string;
  url: string;
}

export interface CloudinaryUploadWidgetProps {
  info: CloudinaryUploadResult;
  event?: string;
}

export interface PostRequestBody {
  tags: string;
}

export interface IPaper{
  finalUrl: string;
  thumbnailUrl: string;
  subject: string;
  slot: string;
  year: string;
  exam: "cat1" | "cat2" | "fat";
}
export interface IAdminUpload{
  urls: Array<string>;
  publicIds: Array<string>;
  subject: string;
  slot: string;
  year: string;
  exam: "cat1" | "cat2" | "fat";
  isPdf: boolean;
}

export interface ConverttoPDFResponse {
    url: string;
    secure_url: string;
    asset_id: string;
    public_id: string;
    version: number;
}

export interface LoginResponse {
  res: string;
}

export interface ErrorResponse {
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface DecryptedLoginResponse{
  token: string;
  user:{
    email: string;
    id: string;
  }
}

export interface Paper {
  _id: string;
  exam: string;
  finalUrl: string;
  thumbnailUrl: string;
  slot: string;
  subject: string;
  year: string;
}

export interface Filters {
  paper: Paper;
  uniqueExams: string[];
  uniqueSlots: string[];
  uniqueYears: string[];
}