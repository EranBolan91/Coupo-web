import Modal from "../../../components/Modal/Modal";
import { useEffect, useMemo } from "react";

interface Props {
  file: File;
  handleExpandImage: (imageFile: File | null) => void;
}

// Full-size preview of a brand image before upload.
const ModalImage = ({ file, handleExpandImage }: Props) => {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return (
    <Modal isOpen onClose={() => handleExpandImage(null)} title={file.name} size="lg">
      <img src={url} alt={`Preview of ${file.name}`} className="max-h-[60dvh] w-full rounded-box bg-white object-contain p-4" />
    </Modal>
  );
};

export default ModalImage;
