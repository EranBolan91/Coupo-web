import { getUserDetails } from "../../../../database/databaseCalls";
import { ModalPersonalInfo } from "./ModalPersonalInfo";
import { CurrentUser } from "../../../../types/Types";
import { useQuery } from "@tanstack/react-query";

const PersonalInfo = ({ userUID }: { userUID: string }) => {
  const { data: userDetails, isLoading } = useQuery<CurrentUser | null>({
    queryKey: ["PersonalInfo"],
    queryFn: () => getUserDetails(userUID),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return (
    <>
      {isLoading === false ? (
        <div className="h-full">
          <div className="flex justify-end">
            {userDetails && (
              <ModalPersonalInfo key={userDetails?.userUID} currentUser={userDetails} />
            )}
          </div>
          <div className="px-4 sm:px-0">
            <h3 className="text-base font-semibold leading-7 text-gray-900">
              Applicant Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
              Personal details and application.
            </p>
          </div>
          <div className="mt-6 border-t border-gray-100">
            <dl className="divide-y divide-gray-100">
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-primary">Profile image</dt>
                <dd className="mt-1 text-sm leading-6 text-secondary sm:col-span-2 sm:mt-0">
                  <div className="avatar">
                    <div className="w-24 rounded">
                      <img src={userDetails?.imageURL} />
                    </div>
                  </div>
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-primary">First name</dt>
                <dd className="mt-1 text-sm leading-6 text-secondary sm:col-span-2 sm:mt-0">
                  {userDetails?.firstName}
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-primary">Last name</dt>
                <dd className="mt-1 text-sm leading-6 text-secondary sm:col-span-2 sm:mt-0">
                  {userDetails?.lastName}
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-primary">Email address</dt>
                <dd className="mt-1 text-sm leading-6 text-secondary sm:col-span-2 sm:mt-0">
                  {userDetails?.email}
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-primary">Birth of Date</dt>
                <dd className="mt-1 text-sm leading-6 text-secondary sm:col-span-2 sm:mt-0">
                  {userDetails?.birthday?.toDate().toDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      ) : (
        <div className="flex h-full justify-center items-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}
    </>
  );
};

export default PersonalInfo;
