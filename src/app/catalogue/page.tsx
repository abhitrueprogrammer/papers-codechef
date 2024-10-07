"use client";

import CatalogueContent from "@/components/CatalogueContent";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";

const Catalogue = () => {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div>Loading catalogue...</div>}>
        <CatalogueContent />
      </Suspense>
    </>
  );
};

export default Catalogue;
