type Props = {
  imgUrl: string;
};

const Avatar = (props: Props) => {
  return (
    <div className="avatar">
      <div className="w-24 rounded">
        <img style={{ objectFit: "contain" }} src={props.imgUrl} />
      </div>
    </div>
  );
};

export default Avatar;
