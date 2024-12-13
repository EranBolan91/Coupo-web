import { PhotoIcon } from "@heroicons/react/24/solid";
import ModalAddBrands from "./ModalAddBrands";
import { useState } from "react";
import { AnimatePresence } from "motion/react";

export const Brand = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [fileList, setFileList] = useState<FileList>();

  const handleOpenModal = () => setOpenModal(!openModal);
  const handleImageChange = (e: any) => {
    const target = e.target as HTMLInputElement; // Cast the target as an HTMLInputElement
    const files: FileList | null = target.files;

    if (files) {
      setFileList(files);
      handleOpenModal();
    }
  };

  return (
    <>
      <div className="grid grid-cols-12">
        <div className="h-screen col-span-12">
          <div className="flex flex-col justify-center items-center bg-white p-1 h-full">
            <div className="space-y-12 w-1/2 bg-white p-3">
              <div className="border-b border-gray-900/10 pb-12">
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="col-span-full">
                    <label
                      htmlFor="cover-photo"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Coupon Image
                    </label>
                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                      <div className="text-center">
                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                        <div className="mt-4 flex text-sm leading-6 text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                          >
                            <span>Upload a file</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              id="file-upload"
                              onChange={handleImageChange}
                              name="image"
                              multiple
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {openModal && (
        <AnimatePresence>
          <ModalAddBrands
            openModal={openModal}
            handleOpenModal={handleOpenModal}
            imagesFile={fileList}
          />
        </AnimatePresence>
      )}
    </>
  );
};

export default Brand;
