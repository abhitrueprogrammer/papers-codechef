"use client";
import React, { useState, useRef } from "react";
import { Camera, type CameraType } from "react-camera-pro";
import Image from "next/image";

const Component = () => {
  const camera = useRef<CameraType>(null);
  const [showCamera, setShowCamera] = useState(true);
  const [photo, setPhoto] = useState("");

  const takePhoto = () => {
    try {
      const photo = camera.current!.takePhoto();
      console.log(photo);
      setPhoto(photo as string);
      setShowCamera(false);
    } catch {
      console.log("Wait for the camera to load");
    }
  };
  const switchCamera = () => {
    try {
      if (camera.current) {
        camera.current.switchCamera();
      }
    } catch {
      console.log("Something went wrong");
    }
  };

  return (
    <div>
      {showCamera && (
        <Camera
          ref={camera}
          errorMessages={{
            noCameraAccessible: undefined,
            permissionDenied: undefined,
            switchCamera: undefined,
            canvas: undefined,
          }}
        />
      )}

      {showCamera && (
        <div className="absolute bottom-0 left-0 flex w-[100vw] flex-row items-center justify-between bg-black/30 px-10 py-5">
          <button className="h-[60px] w-[60px]" />
          <button
            onClick={takePhoto}
            className="bottom-10 z-50 h-[60px] w-[60px] rounded-full border-[3.5px] border-[#ED4A57] bg-white"
          />
          <div
            onClick={switchCamera}
            className="bottom-10 z-50  h-[60px] w-[60px]  items-center justify-between"
          >
            {/* <Image
              src={flip as HTMLImageElement}
              alt="flip"
              className="h-full w-full p-3 "
            /> */}
            flip
          </div>
        </div>
      )}
      {photo && (
        <Image
          src={photo}
          alt="flip"
          className="h-full w-full p-3 "
          width={100}
          height={100}
        />
      )}
    </div>
  );
};

export default Component;
