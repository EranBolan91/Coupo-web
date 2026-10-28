import { useCurrentUser } from "../hooks/useCurrentUser";
import { removeUserCoupon } from "../database/databaseCalls";
import { useQueryClient } from "@tanstack/react-query";
import ModalDialog from "../components/Modal/Modal";
import { Coupon } from "../types/CouponType";
import toast from "react-hot-toast";

type Props = {
  coupon: Coupon;
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
};

// "Remove this coupon?" confirmation for the owner.
const Modal = ({ coupon, open, setOpen }: Props) => {
  const userDocument = useCurrentUser();
  const queryClient = useQueryClient();

  const handleRemoveCoupon = () => {
    setOpen(false);
    toast
      .promise(removeUserCoupon(userDocument?.userUID ?? "", coupon.id, coupon.type), {
        loading: `Removing ${coupon.code}...`,
        success: `${coupon.code} removed`,
        error: "Couldn't remove the coupon",
      })
      .then(() => {
        // Lists are cached forever (see main.tsx), so refresh the ones that may show this coupon.
        ["usercoupons", "expireCoupons", "latestCoupons", "coupons"].forEach((key) =>
          queryClient.invalidateQueries({ queryKey: [key] })
        );
      })
      .catch(() => {});
  };

  return (
    <ModalDialog
      isOpen={open}
      onClose={() => setOpen(false)}
      title={`Remove ${coupon.name}?`}
      description={
        <>
          The code <span className="font-mono font-bold text-base-content">{coupon.code}</span> will disappear from Coupo for
          everyone. This can't be undone.
        </>
      }
      footer={
        <>
          <button type="button" className="btn btn-ghost h-12 min-h-12" onClick={() => setOpen(false)}>
            Keep it
          </button>
          <button type="button" className="btn btn-error h-12 min-h-12" onClick={handleRemoveCoupon}>
            Remove coupon
          </button>
        </>
      }
    >
      {null}
    </ModalDialog>
  );
};

export default Modal;
