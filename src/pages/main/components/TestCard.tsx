import { FaThumbsDown } from "react-icons/fa";
import { FaThumbsUp } from "react-icons/fa";
import Avatar from "../../../components/Avatar";
import styled from "styled-components";

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

const TestCard = () => {
  return (
    <div className="card card-side bg-base-100 shadow-xl m-2 bg-gradient-to-r from-cyan-500 to-blue-500">
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
            50% - ASOS
          </span>
          <Avatar imgURL={""} />
        </div>
        <p className="font-semibold text-current">
          shirts and pants shirts and pants shirts and pants shirts and pants
        </p>
        <div className="card-actions justify-between items-end">
          <div className="flex flex-col">
            <span className="text-3xl font-bold italic cursor-pointer">
              today50
            </span>
            <div className="badge badge-neutral">Expired: 20/10/2023</div>
          </div>
          <div className="flex font-bold">
            <div className="flex flex-col text-red-600 text-lg items-center cursor-pointer mr-1">
              <span>
                <FaThumbsDown />
              </span>
              <span>1000</span>
            </div>
            <div className="flex flex-col text-green-600 text-lg items-center cursor-pointer">
              <span>
                <FaThumbsUp />
              </span>
              <span>1000</span>
            </div>
          </div>
        </div>
      </div>
      <Circle $left={25} />
      <Circle $right={25} />
    </div>
  );
};

export default TestCard;
