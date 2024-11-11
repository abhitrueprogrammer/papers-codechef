"use server";
import { ErrorResponse, PaperResponse } from "@/interface";
import axios, { AxiosResponse } from "axios";

const fetchPaper = async (id: string): Promise<PaperResponse> => {
    try {
      const response: AxiosResponse<PaperResponse> = await axios.get(
        `/api/paper-by-id/${id}`,
      );
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorResponse = err.response as AxiosResponse<ErrorResponse>;

    //     if (errorResponse?.status === 400 || errorResponse?.status === 404) {
    //       router.push("/");
    //     } else {
    //       setError(errorResponse?.data?.message ?? "Failed to fetch paper");
    //     }
    //   } else {
    //     setError("An unknown error occurred");
      }
    }
  };