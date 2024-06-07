"use client";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

interface DisplayPdfProps {
  namespace: string;
}

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const DisplayPdf = ({ namespace }: DisplayPdfProps) => {
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState<null | number>(null);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [scale, setScale] = useState(1);

  const supabase = createClient();
  const { data } = supabase.storage.from("pdf").getPublicUrl(namespace);

  if (!data || !data.publicUrl) {
    return <div>No PDF found</div>;
  }

  const gotoNextPage = () => {
    if (currentPageNumber === totalPages) {
      return;
    }
    setCurrentPageNumber((pageNumber) => pageNumber + 1);
  };

  const gotoPreviousPage = () => {
    if (currentPageNumber === 1) {
      return;
    }
    setCurrentPageNumber((pageNumber) => pageNumber - 1);
  };

  return (
    <div>
      <div className="flex items-center justify-center gap-2 md:gap-4">
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            disabled={currentPageNumber === 1}
            onClick={gotoPreviousPage}
          >
            Previous
          </Button>
          <Input
            value={currentPageNumber ?? 1}
            type="number"
            onChange={(e) =>
              setCurrentPageNumber(Number(e.target.value ?? "1"))
            }
          />
          <Button
            variant="outline"
            disabled={currentPageNumber === totalPages}
            onClick={gotoNextPage}
          >
            Next
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {scale * 100}%
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setScale(1)}>
              100%
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setScale(1.2)}>
              120%
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setScale(1.5)}>
              150%
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setScale(1.6)}>
              160%
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Document
        file={data.publicUrl}
        loading={<div>Loading...{loadingProgress}%</div>}
        onLoadSuccess={(pdf) => setTotalPages(pdf.numPages)}
        onLoadProgress={({ loaded, total }) => {
          const progress = (loaded / total) * 100;
          setLoadingProgress(progress);
        }}
      >
        <Page
          pageNumber={currentPageNumber ?? 1}
          className="max-w-fit mx-auto"
          canvasBackground="#000000"
          scale={scale}
        />
      </Document>
    </div>
  );
};

export default DisplayPdf;
