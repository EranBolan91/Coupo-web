import { saveUserVote } from "../../../database/databaseCalls";
import { UserAuth } from "../../../auth/AuthProvider";
import { Coupon } from "../../../types/Types";
import { FaThumbsDown } from "react-icons/fa";
import { FaThumbsUp } from "react-icons/fa";
import styled from "styled-components";
import toast from "react-hot-toast";
import Avatar from "./Avatar";

interface StyledDivProps {
  $left?: number;
  $right?: number;
}

const Circle = styled.div<StyledDivProps>`
  background: #242424;
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

const CouponCard = (props: Coupon) => {
  const { user }: any = UserAuth();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(props.code);
    toast.success("Code copied to clipboard");
  };

  const handleCouponVote = (vote: boolean) => {
    if (!user) {
      toast.error("You must be logged in to vote");
      return;
    } else {
      toast.promise(saveUserVote({ ...props }, user.uid, vote), {
        loading: ``,
        success: ``,
        error: "",
      });
    }
  };

  return (
    <div
      style={{ width: "32rem" }}
      className="card card-side bg-base-100 shadow-xl m-2 bg-gradient-to-r from-cyan-500 to-blue-500 min-w-min"
    >
      <div
        className="flex justify-center items-center p-4 bg-blue-500"
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
        <div className="flex justify-between">
          <span
            style={{ textShadow: " 3px 1px 2px pink" }}
            className="card-title text-4xl"
          >
            {props.discount}% - {props.name}
          </span>
          <Avatar imgUrl={props.imgUrl} />
        </div>
        <p className="font-semibold text-current">{props.description}</p>
        <div className="card-actions justify-between items-end">
          <div className="flex flex-col">
            <span
              onClick={handleCopyCode}
              className="text-3xl font-bold italic cursor-pointer"
            >
              {props.code}
            </span>
            <div className="badge badge-neutral">
              Expired: {props.expiry.toString()}
            </div>
          </div>
          <div className="flex font-bold justify-evenly w-28">
            <div className="flex flex-col text-red-600 text-lg items-center cursor-pointer mr-1">
              <span onClick={() => handleCouponVote(false)}>
                <FaThumbsDown />
              </span>
              <span>{props.dislikes}</span>
            </div>
            <div className="flex flex-col text-green-600 text-lg items-center cursor-pointer">
              <span onClick={() => handleCouponVote(true)}>
                <FaThumbsUp />
              </span>
              <span>{props.likes}</span>
            </div>
          </div>
        </div>
      </div>
      <Circle $left={25} />
      <Circle $right={25} />
    </div>
  );
};

export default CouponCard;
