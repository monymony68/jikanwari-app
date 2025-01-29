import { useState, useEffect, useRef } from "react";
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
  currentWeekStart: Date;
};

export default function MobileTimetable({
  weekDays,
  cellData,
  subjects,
  onCellClick,
  onPrevWeek,
  onNextWeek,
  currentWeekStart,
}: MobileTimetableProps) {
  // 前回選択していた曜日のインデックスを保持するref
  const previousDayIndex = useRef(0);
  // 初期レンダリングかどうかを判定するref
  const isInitialRender = useRef(true);

  // 初期表示時は今日の日付を選択、それ以外は前回の曜日インデックスを使用
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = weekDays.find((day) => day.isToday);
    return today || weekDays[0];
  });

  // 週が変わったときの処理
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    // 前回選択していた曜日と同じインデックスの日を選択
    setSelectedDay(weekDays[previousDayIndex.current]);
  }, [weekDays, currentWeekStart]);

  // 選択された曜日が変更されたときにインデックスを保存
  useEffect(() => {
    const currentIndex = weekDays.findIndex(
      (day) => day.date === selectedDay.date
    );
    if (currentIndex !== -1) {
      previousDayIndex.current = currentIndex;
    }
  }, [selectedDay, weekDays]);

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

          // 背景色に基づいてスタイルを決定
          const hasCustomBg = subject && subject.color.bg !== "#FFF";
          const timeStyle = {
            color: hasCustomBg ? "#FFF" : "#666",
          };
          const slotHeaderStyle = {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
            borderBottom: `1px solid ${hasCustomBg ? "#FFF" : "#cccccc"}`,
            paddingBottom: "0.4em",
          };

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
              <div className="slot-header" style={slotHeaderStyle}>
                <div className="period">{slot.period}時間目</div>
                <div className="time" style={timeStyle}>
                  {slot.time}
                </div>
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
