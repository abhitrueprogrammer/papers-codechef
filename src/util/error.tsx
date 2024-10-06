import axios, { type AxiosError } from "axios";
import { ApiError } from "next/dist/server/api-utils";
import { toSentenceCase } from "./utils";

export function handleAPIError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const error = err as AxiosError;
    const response = error.response;
    const data = response?.data;
    if (data) {
      const msg = (data as { message: string })?.message;

      if (msg) {

        return new ApiError(response.status, toSentenceCase(msg));
      }
    }
  }
  return new ApiError(500, "Something went wrong");
}
