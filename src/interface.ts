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

export interface PostRequestBody {
  tags: string;
}

export interface IPaper{
  tag: string;
  subject: string;
  slot: string;
  year: string;
  exam: "cat1" | "cat2" | "fat";
}
