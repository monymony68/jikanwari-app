import { useState, useEffect } from "react";
import type { DayInfo, ClassData, Subject } from "../types";
import { TIME_SLOTS } from "../constants";
import { ChevronLeft, ChevronRight } from "lucide-react";

type MobileTimetableProps = {
  weekDays: DayInfo[];
  cellData: { [key: string]: ClassData };
  subjects: Subject[];
  onCellClick: (day: DayInfo, period: number) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
};

export default function MobileTimetable({
  weekDays,
  cellData,
  subjects,
  onCellClick,
  onPrevWeek,
  onNextWeek,
}: MobileTimetableProps) {
  const [selectedDay, setSelectedDay] = useState<DayInfo>(
    weekDays.find((day) => day.isToday) || weekDays[0]
  );

  // 週が変わったときに、今日の日付を再選択
  useEffect(() => {
    const todayDay = weekDays.find((day) => day.isToday);
    if (todayDay) {
      setSelectedDay(todayDay);
    }
  }, [weekDays]);

  return (
    <div className="mobile-content">
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.3em",
          }}
        >
          <button className="week-mobile-button" onClick={onPrevWeek}>
            <ChevronLeft size={24} />
            <br />
            前の週
          </button>
          <button className="week-mobile-button" onClick={onNextWeek}>
            <ChevronRight size={24} />
            <br />
            次の週
          </button>
        </div>

        <div className="day-tabs">
          {weekDays.map((day) => (
            <button
              key={day.day}
              onClick={() => setSelectedDay(day)}
              className={`day-tab
              ${selectedDay.day === day.day ? "active" : ""}
              ${day.isToday ? "today" : ""}`}
            >
              {day.date}
              <br />({day.day})
            </button>
          ))}
        </div>
      </div>

      <div className="time-slots">
        {TIME_SLOTS.map((slot) => {
          const cellKey = `${selectedDay.date}-${slot.period}`;
          const data = cellData[cellKey];
          const subject = data
            ? subjects.find((s) => s.name === data.subject)
            : null;

          return (
            <div
              key={slot.period}
              className="time-slot-card"
              onClick={() => onCellClick(selectedDay, slot.period)}
              style={{
                backgroundColor: subject ? subject.color.bg : "#FFF",
                color: subject ? subject.color.text : "#000",
              }}
            >
              <div className="slot-header">
                <div className="period">{slot.period}時限</div>
                <div className="time">{slot.time}</div>
              </div>
              {data ? (
                <div className="slot-content">
                  <div className="subject">
                    {data.subSubject || data.subject}
                  </div>
                  {data.content && (
                    <div className="detail">内容: {data.content}</div>
                  )}
                  {data.location && (
                    <div className="detail">場所: {data.location}</div>
                  )}
                  {data.materials && (
                    <div className="detail">必要物: {data.materials}</div>
                  )}
                  {data.homework && (
                    <div className="detail">宿題: {data.homework}</div>
                  )}
                </div>
              ) : (
                <div className="empty-slot">
                  <div>+</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
