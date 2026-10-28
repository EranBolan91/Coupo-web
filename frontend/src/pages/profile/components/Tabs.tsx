import { motion, useReducedMotion } from "motion/react";
import React, { useId, useState } from "react";

interface TabContentProps {
  label: string;
  count?: number;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: TabContentProps[];
}

// Pill tabs with a sliding lime indicator. Keyboard: arrow keys move between tabs.
const Tabs = ({ tabs }: TabsProps) => {
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const reduceMotion = useReducedMotion();
  const id = useId();

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = (selectedTab + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
    setSelectedTab(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Profile sections"
        onKeyDown={onKeyDown}
        className="hide-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:inline-flex sm:rounded-btn sm:bg-base-100 sm:p-1.5"
      >
        {tabs.map((tab, index) => {
          const active = selectedTab === index;
          return (
            <button
              key={tab.label}
              id={`${id}-tab-${index}`}
              role="tab"
              type="button"
              aria-selected={active}
              aria-controls={`${id}-panel-${index}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setSelectedTab(index)}
              className={`relative flex h-11 shrink-0 items-center gap-2 rounded-btn px-5 text-sm font-bold transition-colors ${
                active ? "text-primary-content" : "text-base-content/70 hover:text-base-content"
              }`}
            >
              {active && (
                <motion.span
                  layoutId={reduceMotion ? undefined : `${id}-indicator`}
                  className="absolute inset-0 rounded-btn bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <span className="relative">{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`relative rounded-badge px-2 py-0.5 text-xs ${
                    active ? "bg-primary-content/15" : "bg-base-200"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.label}
          id={`${id}-panel-${index}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${index}`}
          hidden={selectedTab !== index}
          className="mt-8"
        >
          {selectedTab === index && tab.content}
        </div>
      ))}
    </div>
  );
};

export default Tabs;
