"use client";

import { useRef, useState } from "react";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ImageRefShape, updateShape } from "@/redux/slice/shapes";
import { useAppDispatch } from "@/redux/store";

export const ImageRef = ({ shape }: { shape: ImageRefShape }) => {
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    setIsLoading(true);

    reader.onload = () => {
      const dataUrl = reader.result as string;
      dispatch(
        updateShape({
          id: shape.id,
          patch: { imageDataUrl: dataUrl, fileName: file.name },
        })
      );
      setIsLoading(false);
    };

    reader.onerror = () => {
      toast.error("Failed to load the image");
      setIsLoading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleOpenPicker = () => {
    inputRef.current?.click();
  };

  const handleClearImage = () => {
    dispatch(
      updateShape({
        id: shape.id,
        patch: { imageDataUrl: null, fileName: null },
      })
    );
  };

  return (
    <div
      className="absolute"
      style={{
        left: shape.x,
        top: shape.y,
        width: shape.w,
        height: shape.h,
      }}
    >
      <div
        className="
          relative h-full w-full overflow-hidden rounded-lg
          border border-dashed border-neutral-400/80 dark:border-white/25
          bg-white/70 dark:bg-white/5 shadow-sm
        "
      >
        <div
          className="
            absolute left-3 top-3 px-2 py-1 rounded-full text-[11px] font-medium
            bg-white/90 dark:bg-black/60 text-neutral-700 dark:text-white
            pointer-events-none
          "
        >
          Image ref
        </div>

        {shape.imageDataUrl ? (
          <>
            <img
              src={shape.imageDataUrl}
              alt={shape.fileName ?? "Reference image"}
              className="h-full w-full object-cover select-none"
              draggable={false}
            />

            <div className="absolute inset-x-0 bottom-3 flex items-center gap-2 px-3 pointer-events-auto">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 px-3 text-xs"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handleOpenPicker}
              >
                <Upload className="h-3.5 w-3.5 mr-1" />
                Replace
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-3 text-xs"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handleClearImage}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4">
            <div
              className="
                pointer-events-auto flex flex-col items-center justify-center gap-2
                rounded-md border border-neutral-300 dark:border-white/20
                bg-white/80 dark:bg-white/10 px-4 py-6 text-center
                text-neutral-700 dark:text-neutral-100
              "
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleOpenPicker}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 dark:bg-white/10">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div className="text-sm font-medium">Upload reference image</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Keep this box where you want the image in the wireframe.
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-black/60 text-sm text-neutral-700 dark:text-white">
            Loading image...
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};
