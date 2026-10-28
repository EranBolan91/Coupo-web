import { PiMagnifyingGlassPlusBold, PiXBold } from "react-icons/pi";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { uploadMultipleImages } from "../../../logic/logic";
import Modal from "../../../components/Modal/Modal";
import { useEffect, useMemo, useState } from "react";
import ModalImage from "./ModalImage";
import toast from "react-hot-toast";

interface Props {
  openModal: boolean;
  handleOpenModal: () => void;
  imagesFile: FileList | undefined;
}

const baseName = (fileName: string) => fileName.replace(/\.[^.]+$/, "");

// Review brand images before upload: rename (the name becomes the brand name), remove, preview.
const ModalAddBrands = ({ openModal, imagesFile, handleOpenModal }: Props) => {
  const [expandImage, setExpandImage] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>(() => Array.from(imagesFile ?? []));
  const [names, setNames] = useState<Record<string, string>>(() =>
    Object.fromEntries(Array.from(imagesFile ?? []).map((file) => [file.name, baseName(file.name)]))
  );
  const reduceMotion = useReducedMotion();

  const urls = useMemo(() => Object.fromEntries(files.map((file) => [file.name, URL.createObjectURL(file)])), [files]);
  useEffect(() => () => Object.values(urls).forEach((url) => URL.revokeObjectURL(url)), [urls]);

  const remove = (file: File) => setFiles((prev) => prev.filter((f) => f.name !== file.name));

  const upload = () => {
    // Upload exactly the files still in the list, named "<brand>.<original extension>".
    const transfer = new DataTransfer();
    files.forEach((file) => transfer.items.add(file));
    const fileNames = Object.fromEntries(
      files.map((file) => [file.name, `${(names[file.name] || baseName(file.name)).trim()}${file.name.match(/\.[^.]+$/)?.[0] ?? ""}`])
    );
    toast.promise(uploadMultipleImages(transfer.files, fileNames), {
      loading: "Uploading brands...",
      error: "Couldn't upload the images",
      success: `${files.length} brand${files.length === 1 ? "" : "s"} uploading. They'll appear in a few seconds.`,
    });
    handleOpenModal();
  };

  return (
    <>
      <Modal
        isOpen={openModal}
        onClose={handleOpenModal}
        title="Review brands"
        description="Each file name becomes the brand name. Fix any that look wrong."
        size="lg"
        footer={
          <>
            <button type="button" className="btn btn-ghost h-12 min-h-12" onClick={handleOpenModal}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary h-12 min-h-12" onClick={upload} disabled={files.length === 0}>
              Upload {files.length} brand{files.length === 1 ? "" : "s"}
            </button>
          </>
        }
      >
        {files.length === 0 ? (
          <p className="text-base-content/70">Nothing left to upload.</p>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {files.map((file) => (
                <motion.li
                  key={file.name}
                  layout={!reduceMotion}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-3 rounded-box bg-base-200 p-2 pr-3"
                >
                  <button
                    type="button"
                    className="group relative size-14 shrink-0 overflow-hidden rounded-xl bg-white"
                    onClick={() => setExpandImage(file)}
                    aria-label={`Preview ${file.name}`}
                  >
                    <img src={urls[file.name]} alt="" className="size-full object-contain p-1" />
                    <span className="absolute inset-0 flex items-center justify-center bg-neutral/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <PiMagnifyingGlassPlusBold className="size-5 text-neutral-content" aria-hidden />
                    </span>
                  </button>
                  <label className="min-w-0 flex-1">
                    <span className="sr-only">Brand name for {file.name}</span>
                    <input
                      type="text"
                      value={names[file.name] ?? ""}
                      onChange={(e) => setNames((prev) => ({ ...prev, [file.name]: e.target.value }))}
                      className="input input-bordered h-11 w-full bg-base-100 font-semibold"
                    />
                  </label>
                  <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={() => remove(file)} aria-label={`Remove ${file.name}`}>
                    <PiXBold className="size-4" aria-hidden />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </Modal>
      {expandImage && <ModalImage file={expandImage} handleExpandImage={setExpandImage} />}
    </>
  );
};

export default ModalAddBrands;
