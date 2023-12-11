type Props = {
  imgURL: string;
};

const Avatar = (props: Props) => {
  return (
    <div className="flex -space-x-2 overflow-hidden h-11 w-11 justify-center items-center">
      <img
        className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
        src={props.imgURL}
        alt=""
      />
    </div>
  );
};

export default Avatar;
