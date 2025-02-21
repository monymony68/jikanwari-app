/* PC用メイン画面 */
import type { DayInfo, ClassData, Subject, PeriodTime } from "../types";
import TimetableCell from "./TimetableCell";

type PCTimetableProps = {
  weekDays: DayInfo[];
  cellData: { [key: string]: ClassData };
  subjects: Subject[];
  onCellClick: (day: DayInfo, period: number) => void;
  periodTimes: PeriodTime[];
};

export default function PCTimetable({
  weekDays,
  cellData,
  subjects,
  onCellClick,
  periodTimes,
}: PCTimetableProps) {
  return (
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
          {periodTimes.map((time, index) => (
            <tr key={index + 1}>
              <td className="time-slot-container">
                <div className="period-number">{index + 1}</div>
                <div className="period-time">
                  {time.start}
                  <br />~<br />
                  {time.end}
                </div>
              </td>
              {weekDays.map((day) => (
                <TimetableCell
                  key={`${index + 1}-${day.day}`}
                  day={day}
                  period={index + 1}
                  data={cellData[`${day.date}-${index + 1}`]}
                  onClick={() => onCellClick(day, index + 1)}
                  subjects={subjects}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
