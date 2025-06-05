import { useState } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import Widget from "./ui/Widget";


export default function CalendarWidget() {
  const [range, setRange] = useState<DateRange | undefined>();

  return (
    <Widget title="Calendrier" className="col-span-2 h-[430px] overflow-hidden">
      <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <DayPicker 
          mode="range"
          selected={range}
          onSelect={setRange}
          modifiersClassNames={{
            selected: "bg-blue-600 text-white rounded-full",
            range_middle: "bg-blue-100 dark:bg-blue-900",
            range_start: "bg-blue-600 text-white rounded-full",
            range_end: "bg-blue-600 text-white rounded-full",
            today: "font-bold",
          }}
          className="rdp-custom-calendar rounded-xl"
          styles={{
            caption: { color: "inherit" },
            head: { color: "inherit" },
            day: {
              padding: "0.5rem",
              fontSize: "0.875rem",
              borderRadius: "9999px", // full circle
              color: "inherit",
            },
          }}
        />
        {range?.from && !range.to && (
          <p className="text-xs mt-2 opacity-70">Jour sélectionné : {range.from.toLocaleDateString()}</p>
        )}
        {range?.from && range?.to && (
          <p className="text-xs mt-2 opacity-70">
            Période : {range.from.toLocaleDateString()} → {range.to.toLocaleDateString()}
          </p>
        )}
      </div>
    </Widget>
  );
}
