import { useState } from "react";

export type WeekBar = { label: string; fullLabel: string; count: number };

// Single-series bar chart: coupons added per week. Bars use text-accent (olive in light, lime in
// dark) so they keep contrast on both themes. Hover or focus a bar for its value; a table
// with the same numbers is there for screen readers.
const WeeklyChart = ({ weeks, title }: { weeks: WeekBar[]; title: string }) => {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...weeks.map((w) => w.count));
  const ticks = [max, Math.round(max / 2), 0].filter((v, i, all) => all.indexOf(v) === i);

  return (
    <figure>
      <figcaption className="sr-only">{title}</figcaption>
      <div className="relative grid grid-cols-[2rem_1fr] gap-x-3">
        {/* y axis */}
        <div className="relative h-48 text-right text-xs text-base-content/50" aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: `${100 - (t / max) * 100}%` }}>
              {t}
            </span>
          ))}
        </div>
        <div className="relative h-48" aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} className="absolute inset-x-0 border-t border-base-300" style={{ top: `${100 - (t / max) * 100}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end gap-[2px]">
            {weeks.map((week, i) => (
              <div
                key={week.label}
                className="group relative flex h-full flex-1 items-end justify-center"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              >
                <div
                  className={`w-full max-w-10 rounded-t-[4px] bg-accent transition-opacity ${active !== null && active !== i ? "opacity-40" : ""}`}
                  style={{ height: week.count ? `${(week.count / max) * 100}%` : "2px", opacity: week.count ? undefined : 0.35 }}
                />
                {active === i && (
                  <div className="pointer-events-none absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-btn border border-base-300 bg-base-100 px-3 py-1.5 text-xs shadow-lg">
                    <span className="block text-base-content/60">{week.fullLabel}</span>
                    <span className="font-bold">{week.count === 1 ? "1 coupon" : `${week.count} coupons`}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* x axis */}
        <div />
        <div className="mt-2 flex gap-[2px] text-[0.7rem] text-base-content/50" aria-hidden="true">
          {weeks.map((week, i) => (
            <span key={week.label} className="flex-1 truncate text-center">
              {i % 2 === weeks.length % 2 ? "" : week.label}
            </span>
          ))}
        </div>
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Week of</th>
            <th scope="col">Coupons added</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week.label}>
              <td>{week.fullLabel}</td>
              <td>{week.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
};

export default WeeklyChart;
