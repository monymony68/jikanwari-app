/* PC用メイン画面 */
import type { DayInfo, ClassData, Subject } from "../types";
import { TIME_SLOTS } from "../constants";
import TimetableCell from "./TimetableCell";

type PCTimetableProps = {
  weekDays: DayInfo[];
  cellData: { [key: string]: ClassData };
  subjects: Subject[];
  onCellClick: (day: DayInfo, period: number) => void;
};

export default function PCTimetable({
  weekDays,
  cellData,
  subjects,
  onCellClick,
}: PCTimetableProps) {
  return (
    <div className="content">
      <div className="timetable-container">
        <table className="timetable">
          <thead>
            <tr>
              <th />
              {weekDays.map((day) => (
                <th
                  key={day.day}
                  className={`day-header ${day.isToday ? "today" : ""}`}
                >
                  {day.date}
                  <br />({day.day})
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((slot) => (
              <tr key={slot.period}>
                <td className="time-slot-container">
                  <div className="period-number">{slot.period}</div>
                  <div className="period-time">
                    {slot.time.split("~")[0]}
                    <br />~<br />
                    {slot.time.split("~")[1]}
                  </div>
                </td>
                {weekDays.map((day) => (
                  <TimetableCell
                    key={`${slot.period}-${day.day}`}
                    day={day}
                    period={slot.period}
                    data={cellData[`${day.date}-${slot.period}`]}
                    onClick={() => onCellClick(day, slot.period)}
                    subjects={subjects}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
