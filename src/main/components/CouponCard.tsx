type Coupon = {
  id: number;
  name: string;
  description: string;
  imgUrl: string;
  code: string;
  category: string;
  expiry: string;
  discount: string;
  createdAt: string;
  updatedAt: string;
};

const CouponCard = (props: Coupon) => {
  return (
    <div className="card w-1/3 md:w-1/2 lg:w-1/2 h-32 shadow grid grid-cols-12 my-2 container bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-md">
      <div className="col-span-2">
        {/* <div
          style={{ right: "1rem", top: "3rem", backgroundColor: "#242424" }}
          className="rounded-full bg-white w-8 h-8 relative"
        ></div> */}
        <img src={props.imgUrl}></img>
      </div>
      <div className="col-span-8 flex flex-col justify-center">
        <h1 className="text-sm md:text-lg lg:text-lg font-bold">
          {props.name}
        </h1>
        <p>{props.description}</p>
      </div>
      <div className="col-span-2 flex flex-col justify-center items-center ">
        {/* <div
          style={{ left: "7.2rem", backgroundColor: "#242424" }}
          className="rounded-full bg-white w-8 h-8 relative"
        ></div> */}
        <span className="text-xs md:text-md lg:text-lg">{props.code}</span>
        <button
          type="button"
          className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500"
        >
          Copy
        </button>
      </div>
    </div>
  );
};

export default CouponCard;
