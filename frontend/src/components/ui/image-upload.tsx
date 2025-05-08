import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onUpload,
}) => {
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      
      // Call the onUpload callback with the file
      onUpload(file);
      
      // If we have a current value, we can keep it for the form
      // The actual file will be sent separately
      if (!value) {
        onChange(objectUrl);
      }
    }
  };

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onChange("");
    setPreview(null);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept="image/*"
        className="hidden"
      />
      
      {preview ? (
        <div className="relative w-full max-w-xl">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-auto rounded-md object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className="w-full h-64 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
        >
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">
            Click to upload an image, or drag and drop
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PNG, JPG, GIF up to 10MB
          </p>
        </div>
      )}
      
      {!preview && (
        <Button type="button" onClick={handleClick} variant="outline">
          Select Image
        </Button>
      )}
    </div>
  );
};
