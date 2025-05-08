import { useState, useRef, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  onChange: (file: File | null) => void;
  previewUrl?: string | null;
  className?: string;
}

export function ImageUpload({ onChange, previewUrl, className = "" }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set the preview URL, but only if it's not a blob URL
  useEffect(() => {
    if (previewUrl) {
      if (previewUrl.startsWith('blob:')) {
        console.log("ImageUpload: Not using blob URL for preview:", previewUrl);
      } else {
        console.log("ImageUpload: Setting preview URL:", previewUrl);
        setPreview(previewUrl);
      }
    } else {
      setPreview(null);
    }
  }, [previewUrl]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      // Create a preview URL
      const url = URL.createObjectURL(file);
      setPreview(url);

      // Call the onChange handler
      onChange(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onChange(null);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    // Trigger the file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`border-2 border-dashed border-gray-300 rounded-lg p-4 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-auto max-h-64 object-contain rounded-md"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={handleButtonClick}
          className="flex flex-col items-center justify-center py-8 cursor-pointer"
        >
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 mb-1">Click to upload an image</p>
          <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
        </div>
      )}

      {!preview && (
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          className="w-full mt-2"
        >
          Select Image
        </Button>
      )}
    </div>
  );
}
