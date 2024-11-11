"use client";
import { useState, useEffect } from "react";
import axios, { type AxiosResponse } from "axios";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Download, Eye, Maximize } from "lucide-react";
import { useRouter } from "next/navigation";
import { Worker } from "@react-pdf-viewer/core";
import { Viewer } from "@react-pdf-viewer/core";
import {
  zoomPlugin,
  ZoomInIcon,
  ZoomOutIcon,
  type RenderZoomOutProps,
  type RenderZoomInProps,
  type RenderCurrentScaleProps,
} from "@react-pdf-viewer/zoom";
import { getFilePlugin } from "@react-pdf-viewer/get-file";

import {
  fullScreenPlugin,
  type RenderEnterFullScreenProps,
} from "@react-pdf-viewer/full-screen";

import "@react-pdf-viewer/full-screen/lib/styles/index.css";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import Loader from "@/components/ui/loader";
import Link from "next/link";
import { PaperResponse } from "@/interface";
import { fetchPaperID } from "@/app/actions/get-papers-by-id";

interface ErrorResponse {
  message: string;
}

interface Params {
  params: { id: string };
}

export default function PaperPage({ params }: Params) {
  const [paper, setPaper] = useState<PaperResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const getFilePluginInstance = getFilePlugin();
  const zoomPluginInstance = zoomPlugin();
  const { CurrentScale, ZoomIn, ZoomOut } = zoomPluginInstance;
  const fullScreenPluginInstance = fullScreenPlugin();
  const EnterFullScreen = fullScreenPluginInstance.EnterFullScreen.bind(
    fullScreenPluginInstance,
  );

  useEffect(() => {pag
      try {
        const response = await fetchPaperID(params.id)
        // const response: AxiosResponse<PaperResponse> = await axios.get(
        //   `/api/paper-by-id/${params.id}`,
        // );
        if(response)
        {
          setPaper(response);
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const errorResponse = err.response as AxiosResponse<ErrorResponse>;
          if (errorResponse?.status === 400 || errorResponse?.status === 404) {
            router.push("/");
          } else {
            setError(errorResponse?.data?.message ?? "Failed to fetch paper");
          }
        } else {
          throw(err)
          // setError("An unknown error occurred");
        }
      }
    };

    if (params.id) {
      void fetchPaper();
    }
  }, [params.id, router]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!paper) {
    return <Loader prop="h-screen w-screen" />;
  }

  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center justify-center">
        <h1 className="jost mb-4 text-center text-2xl font-semibold md:mb-10 md:text-3xl">
          {paper.subject} {paper.exam} {paper.slot} {paper.year}
        </h1>
        <div className="flex w-[95%] items-center justify-between bg-gray-900 px-4 py-4 md:w-[80%]">
          <div className="flex gap-x-4">
            <ZoomOut>
              {(props: RenderZoomOutProps) => (
                <button onClick={props.onClick}>
                  <ZoomOutIcon />
                </button>
              )}
            </ZoomOut>
            <CurrentScale>
              {(props: RenderCurrentScaleProps) => (
                <>{`${Math.round(props.scale * 100)}%`}</>
              )}
            </CurrentScale>
            <ZoomIn>
              {(props: RenderZoomInProps) => (
                <button onClick={props.onClick}>
                  <ZoomInIcon />
                </button>
              )}
            </ZoomIn>
          </div>
          <div className="hidden gap-x-4 md:flex md:items-center">
            <getFilePluginInstance.Download>
              {(props) => (
                <button className="" onClick={props.onClick}>
                  <Download />
                </button>
              )}
            </getFilePluginInstance.Download>
            <EnterFullScreen>
              {(props: RenderEnterFullScreenProps) => (
                <button onClick={() => props.onClick()}>
                  <Maximize />
                </button>
              )}
            </EnterFullScreen>
          </div>
          <Link className="flex md:hidden" href={paper.finalUrl}>
            <Download />
          </Link>
        </div>

        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
          <div className="border-1 w-[95%] overflow-x-hidden md:w-[80%]">
            <Viewer
              fileUrl={paper.finalUrl}
              plugins={[
                zoomPluginInstance,
                getFilePluginInstance,
                fullScreenPluginInstance,
              ]}
            />
          </div>
        </Worker>
      </div>
      <Footer />
    </div>
  );
}
