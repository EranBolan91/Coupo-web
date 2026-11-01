import { Combobox, Transition } from "@headlessui/react";
import { PiCaretUpDownBold, PiCheckBold } from "react-icons/pi";
import React, { Fragment, useMemo, useRef, useState } from "react";
import { filterOptions } from "../../logic/filterOptions";

interface Props<T> {
  id: string;
  options: T[];
  value: T | null;
  onChange: (option: T) => void;
  // Text shown and searched for an option.
  getLabel: (option: T) => string;
  // Optional picture before the label (e.g. a brand logo).
  renderIcon?: (option: T, size: "sm" | "md") => React.ReactNode;
  placeholder?: string;
  invalid?: boolean;
  loading?: boolean;
  labelClassName?: string;
}

// Dropdown you can type into to filter the list, then pick one option (Headless UI Combobox, keyboard accessible).
const SearchSelect = <T,>({
  id,
  options,
  value,
  onChange,
  getLabel,
  renderIcon,
  placeholder = "Type to search",
  invalid,
  loading,
  labelClassName = "",
}: Props<T>) => {
  const [query, setQuery] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const filtered = useMemo(() => filterOptions(options, query, getLabel), [options, query, getLabel]);

  return (
    <Combobox value={value} onChange={(option: T) => option && onChange(option)}>
      {({ open }) => (
        <div className="relative">
          <div
            className={`input input-bordered flex h-12 w-full items-center gap-3 bg-base-100 pr-0 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-base-content/20 ${
              invalid ? "input-error" : ""
            }`}
          >
            {value && !query && renderIcon?.(value, "sm")}
            <Combobox.Input
              id={id}
              autoComplete="off"
              spellCheck={false}
              placeholder={value ? undefined : placeholder}
              aria-invalid={invalid}
              // text-base keeps iOS from zooming in when the field gets focus.
              className={`h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-base font-semibold shadow-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none placeholder:font-normal placeholder:text-base-content/50 ${labelClassName}`}
              displayValue={(option: T | null) => (option ? getLabel(option) : "")}
              onChange={(e) => setQuery(e.target.value)}
              // Open the list on tap/click too, not only when typing.
              onClick={() => !open && buttonRef.current?.click()}
            />
            <Combobox.Button
              ref={buttonRef}
              className="flex h-full shrink-0 items-center px-4 text-base-content/50"
              aria-label="Show options"
            >
              <PiCaretUpDownBold className="size-4" aria-hidden />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery("")}
          >
            <Combobox.Options className="absolute z-20 mt-2 max-h-72 w-full overflow-auto overscroll-contain rounded-box border border-base-300 bg-base-100 p-1.5 shadow-xl focus:outline-none">
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-base-content/60">
                  {loading ? "Loading..." : options.length === 0 ? "Nothing to choose yet" : `No match for "${query.trim()}"`}
                </li>
              ) : (
                filtered.map((option) => (
                  <Combobox.Option
                    key={getLabel(option)}
                    value={option}
                    className={({ active }) =>
                      `flex min-h-11 cursor-pointer items-center gap-3 rounded-btn px-3 py-2 ${active ? "bg-base-200" : ""}`
                    }
                  >
                    {({ selected }) => (
                      <>
                        {renderIcon?.(option, "md")}
                        <span className={`flex-1 truncate ${labelClassName} ${selected ? "font-bold" : ""}`}>{getLabel(option)}</span>
                        {selected && <PiCheckBold className="size-4 text-accent" aria-hidden />}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      )}
    </Combobox>
  );
};

export default SearchSelect;
