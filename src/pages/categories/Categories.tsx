import { getCategories } from "../../database/databaseCalls";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const Categories = () => {
  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
    refetchOnWindowFocus: false,
  });

  return (
    <div className="flex flex-col md:p-10">
      <span className="md:text-4xl">Browse by Category</span>
      <div className="flex flex-col flex-wrap md:p-6 w-full md:h-60">
        {data?.map((category) => (
          <Link to={`${category}`}>
            <span className="my-2 cursor-pointer">{category}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;
