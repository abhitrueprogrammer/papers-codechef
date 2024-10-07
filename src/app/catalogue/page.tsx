"use client";

import CatalogueContent from "@/components/CatalogueContent";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { RiLoader2Fill } from "react-icons/ri";
import Loader from "@/components/ui/loader";
const Catalogue = () => {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <Loader />
        }
      >
        <CatalogueContent />
      </Suspense>
    </>
  );
};

export default Catalogue;
