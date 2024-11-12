// "use server";
import { ErrorResponse, PaperResponse } from "@/interface";
import axios, { AxiosResponse } from "axios";

export const fetchPaperID = async (
  id: string,
) => {
  try {
    const response: AxiosResponse<PaperResponse> = await axios.get(
      `http://localhost:3000/api/paper-by-id/${id}`,
    );
    return response.data;
  } catch (err: unknown) {
    throw err;
  
  }
};
