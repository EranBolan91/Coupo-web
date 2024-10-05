import { getUserDetails } from "../../../database/databaseCalls";
import { CurrentUser } from "../../../types/Types";
import { useQuery } from "@tanstack/react-query";

const PersonalInfo = ({ userUID }: { userUID: string }) => {
  const { data: userDetails, isLoading } = useQuery<CurrentUser | null>({
    queryKey: ["PersonalInfo"],
    queryFn: () => getUserDetails(userUID),
    staleTime: Infinity,
  });

  return (
    <>
      {isLoading === false ? (
        <div className="h-full">
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
                <dt className="text-sm font-medium leading-6 text-gray-900">First name</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {userDetails?.firstName}
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Last name</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {userDetails?.lastName}
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Email address</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {userDetails?.email}
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Salary expectation</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  $120,000
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">About</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum
                  culpa consequat. Excepteur qui ipsum aliquip consequat sint. Sit id mollit nulla
                  mollit nostrud in ea officia proident. Irure nostrud pariatur mollit ad
                  adipisicing reprehenderit deserunt qui eu.
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
