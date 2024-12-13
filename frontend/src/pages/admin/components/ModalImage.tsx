interface Props {
  file: File;
  handleExpandImage: (imageFile: File | null) => void;
}

const ModalImage = ({ file, handleExpandImage }: Props) => {
  console.log("insideeee");
  return (
    <>
      <dialog id="my_modal_2" className="modal z-auto" onClose={() => handleExpandImage(null)}>
        <div className="modal-box">
          <div className="avatar">
            <div className="w-full h-full">
              <img src={URL.createObjectURL(file)} />
              <h1>HAALLLOOO</h1>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => handleExpandImage(null)}>close</button>
        </form>
      </dialog>
    </>
  );
};

export default ModalImage;
