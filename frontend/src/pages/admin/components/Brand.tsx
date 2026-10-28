import { PiUploadSimpleBold } from "react-icons/pi";
import { AdminLayout } from "./AdminSidebar";
import ModalAddBrands from "./ModalAddBrands";
import React, { useState } from "react";

// Upload brand logos. Each file is stored as Brands/<name>.<ext>; the uploadImage Cloud Function creates the brand.
export const Brand = () => {
  const [fileList, setFileList] = useState<FileList>();
  const [dragging, setDragging] = useState(false);

  const pick = (files: FileList | null) => {
    if (files && files.length > 0) setFileList(files);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    pick(e.dataTransfer.files);
  };

  return (
    <AdminLayout title="Add brands" description="Upload logos for the brand list. You can rename each brand before uploading.">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-box border-2 border-dashed px-6 py-20 text-center transition-colors ${
          dragging ? "border-base-content bg-primary/20" : "border-base-300 bg-base-100 hover:border-base-content/40"
        }`}
      >
        <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-content">
          <PiUploadSimpleBold className="size-8" aria-hidden />
        </span>
        <span className="mt-5 font-display text-2xl font-extrabold tracking-tight">Drop logos here, or click to choose</span>
        <span className="mt-1 text-sm text-base-content/60">PNG, JPG or SVG. Images under 5 MB. Several at once is fine.</span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            pick(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      {fileList && <ModalAddBrands key={fileList.length + fileList[0]?.name} openModal imagesFile={fileList} handleOpenModal={() => setFileList(undefined)} />}
    </AdminLayout>
  );
};

export default Brand;
