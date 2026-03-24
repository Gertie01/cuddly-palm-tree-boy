"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { Upload as UploadIcon, Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  onImageSelect: (imageData: string) => void;
  currentImage: string | null;
  onError?: (error: string) => void;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
}

export function ImageUpload({ onImageSelect, currentImage, onError }: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentImage) {
      setSelectedFile(null);
    }
  }, [currentImage]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections) => {
      if (fileRejections?.length > 0) {
        const errorMessage = fileRejections[0].errors[0]?.message;
        onError?.(errorMessage || "File rejected");
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      setSelectedFile(file);
      setIsLoading(true);

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          const result = event.target.result as string;
          onImageSelect(result);
        }
        setIsLoading(false);
      };
      reader.onerror = () => {
        onError?.("Error reading file. Please try again.");
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"]
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false
  });

  const handleRemove = () => {
    setSelectedFile(null);
    onImageSelect("");
  };

  return (
    <div className="w-full">
      {!currentImage ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input {...getInputProps()} />
          <ImageIcon className="mx-auto mb-4" size={32} />
          <p className="text-gray-700 font-medium mb-2">
            Drop your image here or click to browse
          </p>
          <p className="text-sm text-gray-500">
            Maximum file size: 10MB
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <UploadIcon size={20} className="text-gray-600" />
              <div>
                <p className="font-semibold">
                  {selectedFile?.name || "Current Image"}
                </p>
                {selectedFile && (
                  <p className="text-sm text-gray-500">
                    {formatFileSize(selectedFile?.size ?? 0)}
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={handleRemove}
              variant="ghost"
              size="sm"
              disabled={isLoading}
            >
              <X size={20} />
            </Button>
          </div>

          {selectedFile && (
            <div className="relative w-full h-48 mb-4">
              <Image
                src={currentImage}
                alt="Selected image"
                fill
                className="object-contain"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
