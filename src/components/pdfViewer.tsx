"use client";

import { Download, Eye, Maximize } from "lucide-react";
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
import Link from "next/link";



interface Params {
  params: { id: string };
}

interface PdfViewerProps {
  url: string;
}
export default function PdfViewer({ url }: PdfViewerProps) {
  const getFilePluginInstance = getFilePlugin();
  const zoomPluginInstance = zoomPlugin();
  const { CurrentScale, ZoomIn, ZoomOut } = zoomPluginInstance;
  const fullScreenPluginInstance = fullScreenPlugin();
  const EnterFullScreen = fullScreenPluginInstance.EnterFullScreen.bind(
    fullScreenPluginInstance,
  );

  return (
    <div >
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
        <Link className="flex md:hidden" href={url}>
          <Download />
        </Link>
      </div>

      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <div className="border-1 w-[95%] overflow-x-hidden md:w-[80%]">
          <Viewer
            fileUrl={url}
            plugins={[
              zoomPluginInstance,
              getFilePluginInstance,
              fullScreenPluginInstance,
            ]}
          />
        </div>
      </Worker>
    </div>
  );
}
