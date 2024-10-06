"use client";

import CatalogueContent from "@/components/CatalogueContent";
import { Suspense } from "react";

const Catalogue = () => {
  return (
    <Suspense fallback={<div>Loading catalogue...</div>}>
      <CatalogueContent />
    </Suspense>
  );
};

export default Catalogue;
