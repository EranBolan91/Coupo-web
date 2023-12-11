import toast from "react-hot-toast";
import { Coupon } from "../../types/Types";
import styled from "styled-components";

interface StyledDivProps {
  left?: boolean;
  right?: boolean;
}

const CouponWraper = styled.div`
  background: linear-gradient(135deg, #7158fe, #9d4de6);
  color: #fff;
  text-align: center;
  padding: 25px 70px;
  border-radius: 15px;
  box-shadow: 0 10px 10px 0 rgba(0, 0, 0, 0.15);
  position: relative;
  margin-bottom: 20px;
  width: 95%;
`;

const Circle = styled.div<StyledDivProps>`
  background: #242424;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: ${(props) => (props.left ? "-25px" : "unset")};
  right: ${(props) => (props.right ? "-25px" : "unset")};
`;

const CouponCard = (props: Coupon) => {
  const date = new Date(props.expiry).toLocaleDateString();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(props.code);
    toast.success(`Copied ${props.code} to clipboard`);
  };
  return (
    <CouponWraper>
      <div className="text-center rounded-2xl">
        <img
          style={{ maxWidth: "none", height: "70px" }}
          className="m-auto"
          height={100}
          width={100}
          src={props.imgUrl}
        />
        <h3 className="text-2xl font-normal my-3 text-4xl">
          {props.description}
        </h3>
        <div className="flex items-center w-fit m-auto my-3">
          <span
            style={{ borderRight: "0px" }}
            className="border-dashed border border-neutral-50 py-3 px-5"
          >
            {props.code}
          </span>
          <span
            style={{ color: "#7158fe" }}
            className="border-solid border cursor-pointer py-3 px-5 bg-white"
            onClick={handleCopyCode}
          >
            Copy
          </span>
        </div>
        <span className="my-2 font-bold">{props.discount}% off</span>
        <p className="text-base mt-2"> Expires on {date}</p>
        <Circle left />
        <Circle right />
      </div>
    </CouponWraper>
  );
};

export default CouponCard;
