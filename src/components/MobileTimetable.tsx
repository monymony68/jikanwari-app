/* モバイル用メイン画面 */
import { useState, useEffect, useRef, useCallback } from "react";
import type { DayInfo, ClassData, Subject } from "../types";
import { TIME_SLOTS } from "../constants";

type MobileTimetableProps = {
  weekDays: DayInfo[];
  cellData: { [key: string]: ClassData };
  subjects: Subject[];
  onCellClick: (day: DayInfo, period: number) => void;
};

export default function MobileTimetable({
  weekDays,
  cellData,
  subjects,
  onCellClick,
}: MobileTimetableProps) {
  const [selectedDay, setSelectedDay] = useState<DayInfo>(
    // 今日の日付があれば、それを初期選択。なければ最初の週の最初の日
    weekDays.find((day) => day.isToday) || weekDays[0]
  );
  const todayTabRef = useRef<HTMLButtonElement>(null);
  const dayTabsRef = useRef<HTMLDivElement>(null);
  const [todayOffset, setTodayOffset] = useState<number>(0);

  // 位置計算の関数を切り出し
  const calculateTodayOffset = useCallback(() => {
    const todayTab = todayTabRef.current;
    const dayTabsContainer = dayTabsRef.current;

    if (todayTab && dayTabsContainer) {
      const tabRect = todayTab.getBoundingClientRect();
      const containerRect = dayTabsContainer.getBoundingClientRect();
      const offset = tabRect.left - containerRect.left + tabRect.width / 2;
      setTodayOffset(offset);
    }
  }, []);

  // 週が変わったときに、今日の日付を再選択
  useEffect(() => {
    const todayDay = weekDays.find((day) => day.isToday);
    if (todayDay) {
      setSelectedDay(todayDay);
    }
  }, [weekDays]);

  // TODAYボタンの位置を計算
  useEffect(() => {
    calculateTodayOffset();

    // リサイズイベントリスナーを追加
    window.addEventListener("resize", calculateTodayOffset);

    // クリーンアップ
    return () => {
      window.removeEventListener("resize", calculateTodayOffset);
    };
  }, [calculateTodayOffset, selectedDay, weekDays]);

  return (
    <div className="mobile-content">
      <div className="day-tabs" ref={dayTabsRef}>
        {todayOffset > 0 && (
          <div
            className="today-marker"
            style={{
              position: "absolute",
              left: `${todayOffset}px`,
              top: "-16px",
              transform: "translateX(-50%)",
              backgroundColor: "#FB8F55",
              color: "#fff",
              fontSize: "0.7rem",
              padding: "1px 4px",
              borderRadius: "4px",
              zIndex: 1,
              border: "1.5px #fff solid",
            }}
          >
            TODAY
          </div>
        )}
        {weekDays.map((day) => (
          <button
            ref={day.isToday ? todayTabRef : null}
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
                backgroundColor: subject ? subject.color.bg : "#fff",
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
