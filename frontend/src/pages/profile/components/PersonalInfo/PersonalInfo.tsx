import { ModalPersonalInfo } from "./ModalPersonalInfo";
import { UserDocument } from "../../../../types/UserType";
import { getAuth } from "firebase/auth";

const PersonalInfo = ({ currentUser }: { currentUser: UserDocument | null }) => {
  if (currentUser === null) return;

  const auth = getAuth();
  console.log(auth.currentUser);
  return (
    <div className="h-full">
      <div className="flex justify-end">
        {currentUser && <ModalPersonalInfo key={currentUser?.userUID} currentUser={currentUser} />}
      </div>
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 text-gray-900">Applicant Information</h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Personal details and application.</p>
      </div>
      <div className="mt-6 border-t border-gray-100">
        <dl className="divide-y divide-gray-100">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-primary">Profile image</dt>
            <dd className="mt-1 text-sm leading-6 text-secondary sm:col-span-2 sm:mt-0">
              <div className="avatar">
                <div className="w-24 rounded">
                  <img src={currentUser?.imageURL} />
                </div>
              </div>
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-primary">First name</dt>
            <dd className="mt-1 text-sm leading-6 text-secondary sm:col-span-2 sm:mt-0">{currentUser?.firstName}</dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-primary">Last name</dt>
            <dd className="mt-1 text-sm leading-6 text-secondary sm:col-span-2 sm:mt-0">{currentUser?.lastName}</dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-primary">Email address</dt>
            <dd className="mt-1 text-sm leading-6 text-secondary sm:col-span-2 sm:mt-0">{currentUser?.email}</dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-primary">Birth of date</dt>
            <dd className="mt-1 text-sm leading-6 text-secondary sm:col-span-2 sm:mt-0">
              {currentUser?.birthday?.toDate()?.toDateString()}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-primary">Total likes/dislikes</dt>
            <dd className="mt-1 text-sm leading-6 text-secondary sm:col-span-2 sm:mt-0"></dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default PersonalInfo;
