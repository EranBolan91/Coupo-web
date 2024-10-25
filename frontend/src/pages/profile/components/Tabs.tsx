import { useState } from "react";

const selectedTabStyle = "border-solid border-2 border-gray-600 border-b-0";

interface TabContentProps {
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: TabContentProps[];
}

const Tabs = ({ tabs }: TabsProps) => {
  const [selectedTab, setSelectedTab] = useState<number>(0);

  return (
    <div className="flex-grow">
      <div className="flex-wrap mt-2 pl-2">
        {tabs.map((tab: TabContentProps, index: number) => (
          <button
            key={index}
            className={`bg-inherit rounded-none ${selectedTab === index ? selectedTabStyle : ""}`}
            onClick={() => setSelectedTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="h-full">
        {tabs.map((tab, index) => (
          <div
            key={index}
            className={`h-full bg-base-100 border-base-300 rounded-box p-6 ${
              selectedTab === index ? "" : "hidden"
            }`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
