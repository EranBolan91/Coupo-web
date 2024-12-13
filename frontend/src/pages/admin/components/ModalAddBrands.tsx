import { uploadMultipleImages } from "../../../logic/logic";
import { IoCloseSharp } from "react-icons/io5";
import ModalImage from "./ModalImage";
import { useState } from "react";

interface Props {
  openModal: boolean;
  handleOpenModal: () => void;
  imagesFile: FileList | undefined;
}

const ModalAddBrands = ({ openModal, imagesFile, handleOpenModal }: Props) => {
  const [expandImage, setExpandImage] = useState<File | null>(null);
  const [images, setImages] = useState<FileList | undefined>(imagesFile);
  const [fileNames, setFileNames] = useState<Record<string, string>>(() => {
    if (imagesFile !== undefined) {
      return Array.from(imagesFile).reduce((acc, file) => {
        acc[file.name] = file.name; // Default value is the file's original name
        return acc;
      }, {} as Record<string, string>); // Return the reduced object
    } else {
      return {}; // Always return a valid object
    }
  });

  const handleExpandImage = (imageFile: File | null) => setExpandImage(imageFile);

  const arrayToFileList = (files: File[]): FileList => {
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    return dataTransfer.files;
  };

  const removeImageFromImages = (image: File) => {
    if (images !== undefined) {
      const filteredImages = Array.from(images).filter((img) => img.name !== image.name);
      const newFileList = arrayToFileList(filteredImages);
      setImages(newFileList);
    }
  };

  const uploadImages = async () => {
    console.log(fileNames);
    if (imagesFile !== undefined) {
      uploadMultipleImages(imagesFile, fileNames);
    }
  };

  const handleNameChange = (fileName: string, newName: string) => {
    setFileNames((prev) => ({
      ...prev,
      [fileName]: newName,
    }));
  };

  return (
    <>
      <dialog id={`modal-${1}`} className="modal" open={openModal}>
        <div className="modal-box">
          <div className="flex justify-end">
            <IoCloseSharp
              className="cursor-pointer hover:text-secondary"
              onClick={handleOpenModal}
            />
          </div>
          <div className="modal-box w-full">
            <h3 className="font-bold text-lg">Upload Image Brands</h3>
            <div className="flex flex-col">
              {images?.length === 0 ? <span>Nothing to upload</span> : null}
              {images &&
                Array.from(images).map((file, index) => (
                  <div key={file.name} className="flex rounded bg-cyan-950 p-2 my-1 items-center">
                    <button
                      className="btn btn-circle btn-sm btn-outline"
                      onClick={() => removeImageFromImages(file)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <input
                      type="text"
                      value={fileNames[file.name]}
                      className="input input-ghost input-sm w-full max-w-xs"
                      name={file.name}
                      onChange={(e) => handleNameChange(file.name, e.target.value)}
                    />
                    <div className="avatar">
                      <div className="w-9">
                        <img
                          src={URL.createObjectURL(file)}
                          className="cursor-pointer"
                          onClick={() => handleExpandImage(file)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <form method="dialog" className="modal-backdrop flex justify-end mt-2">
            <button className="btn btn-outline" onClick={handleOpenModal}>
              CLOSE
            </button>
            <button className="btn btn-active ml-2" onClick={uploadImages}>
              UPLOAD
            </button>
          </form>
        </div>
      </dialog>
      {expandImage && <ModalImage file={expandImage} handleExpandImage={handleExpandImage} />}
    </>
  );
};

export default ModalAddBrands;
