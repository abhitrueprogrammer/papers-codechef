// "use server";
import { ErrorResponse, PaperResponse } from "@/interface";
import axios, { AxiosResponse } from "axios";

export const fetchPaperID = async (
  id: string,
) => {
  try {
    if(!process.env.SERVER_URL)
    {
      throw "error env not set (server url)"
    }
    const response: AxiosResponse<PaperResponse> = await axios.get(
      `${process.env.SERVER_URL}/api/paper-by-id/${id}`,
    );
    return response.data;
  } catch (err: unknown) {
    throw err;
  
  }
};
