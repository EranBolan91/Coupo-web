import { saveUserVote } from "../../database/databaseCalls";
import { UserAuth } from "../../auth/AuthProvider";
import { Coupon } from "../../types/Types";
import { FaThumbsDown } from "react-icons/fa";
import { FaThumbsUp } from "react-icons/fa";
import styled from "styled-components";
import toast from "react-hot-toast";
import Avatar from "../main/components/Avatar";

interface Props {
  coupon: Coupon;
  innerRef?: React.Ref<HTMLParagraphElement>;
}

interface StyledDivProps {
  $left?: number;
  $right?: number;
}

const Circle = styled.div<StyledDivProps>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: ${(props) =>
    props.$left !== undefined ? `-${props.$left}px` : "unset"};
  right: ${(props) =>
    props.$right !== undefined ? `-${props.$right}px` : "unset"};
`;

const colorCard = (discount: string) => {
  const discountNumber = parseInt(discount);
  if (discountNumber > 0 && discountNumber <= 25) {
    return "level0from level0to";
  } else if (discountNumber > 25 && discountNumber <= 50) {
    return "level1from level1to";
  } else if (discountNumber > 50 && discountNumber <= 75) {
    return "level2from level2to";
  } else if (discountNumber > 75 && discountNumber <= 100) {
    return "level3from level3to";
  }
};

const colorSideTitle = (discount: string) => {
  const discountNumber = parseInt(discount);
  if (discountNumber > 0 && discountNumber <= 25) {
    return "level0to";
  } else if (discountNumber > 25 && discountNumber <= 50) {
    return "level1to";
  } else if (discountNumber > 50 && discountNumber <= 75) {
    return "level2to";
  } else if (discountNumber > 75 && discountNumber <= 100) {
    return "level3to";
  }
};

const CouponCard = ({ coupon, innerRef }: Props) => {
  const { user }: any = UserAuth();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(coupon.code);
    toast.success("Code copied to clipboard");
  };

  const handleCouponVote = (vote: boolean) => {
    if (!user) {
      toast.error("You must be logged in to vote");
      return;
    } else {
      toast.promise(saveUserVote({ ...coupon }, user.uid, vote), {
        loading: ``,
        success: ``,
        error: "",
      });
    }
  };

  return (
    <div
      ref={innerRef}
      className={`card card-side w-80 sm:w-full md:w-9/12 text-primary bg-base-100 shadow-xl m-2 bg-gradient-to-r ${colorCard(
        coupon.discount
      )}  min-w-min`}
    >
      <div
        className={`hidden md:flex justify-center items-center p-4 ${colorCard(
          coupon.discount
        )}`}
        style={{
          borderBottomLeftRadius: "18px",
          borderTopLeftRadius: "18px",
        }}
      >
        <span
          className="text-2xl tracking-wide font-semibold text-primary-500 rotate-180 ml-2"
          style={{ writingMode: "vertical-rl" }}
        >
          DISCOUNT
        </span>
      </div>
      <div className="card-body">
        <div className="flex flex-col-reverse items-center md:flex-row md:justify-between">
          <span
            style={{ textShadow: " 3px 1px 2px pink" }}
            className="card-title text-4xl text-left md:text-center"
          >
            {coupon.discount}% - {coupon.name}
          </span>
          <Avatar imgUrl={coupon.imgUrl} />
        </div>
        <p className="font-semibold text-current text-center md:text-left">
          {coupon.description}
        </p>
        <div className="card-actions justify-center md:justify-between items-end">
          <div className="flex flex-col">
            <span
              onClick={handleCopyCode}
              className="text-3xl font-bold italic cursor-pointer text-center md:text-left"
            >
              {coupon.code}
            </span>
            <div className="badge badge-neutral">
              Expired: {coupon?.expiry?.toString()}
            </div>
          </div>
          <div className="flex font-bold justify-evenly w-28">
            <div className="flex flex-col text-red-600 text-lg items-center cursor-pointer mr-1">
              <span onClick={() => handleCouponVote(false)}>
                <FaThumbsDown />
              </span>
              <span>{coupon.dislikes}</span>
            </div>
            <div className="flex flex-col text-green-600 text-lg items-center cursor-pointer">
              <span onClick={() => handleCouponVote(true)}>
                <FaThumbsUp />
              </span>
              <span>{coupon.likes}</span>
            </div>
          </div>
        </div>
      </div>
      <Circle $left={25} className="bg-background" />
      <Circle $right={25} className="bg-background" />
    </div>
  );
};

export default CouponCard;
