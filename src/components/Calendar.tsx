import { useState, useEffect, useCallback } from "react";

type CalendarProps = {
  selectedDate: Date;
  activeDate: Date;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
};

export default function Calendar({
  selectedDate,
  activeDate,
  onDateSelect,
  onClose,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date(activeDate));
  const [selectedSubMonth, setSelectedSubMonth] = useState(() =>
    activeDate.getMonth()
  );

  const isSameDate = useCallback((date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }, []);

  useEffect(() => {
    const newDate = new Date(activeDate);
    setCurrentMonth(newDate);
    setSelectedSubMonth(newDate.getMonth());
  }, [activeDate]);

  const calculateValidRange = useCallback((baseDate: Date) => {
    const baseYear = baseDate.getFullYear();
    const baseMonth = baseDate.getMonth();

    return baseMonth >= 3 && baseMonth <= 11
      ? {
          startYear: baseYear,
          startMonth: 3,
          endYear: baseYear + 1,
          endMonth: 2,
        }
      : {
          startYear: baseYear - 1,
          startMonth: 3,
          endYear: baseYear,
          endMonth: 2,
        };
  }, []);

  // validRangeの定義を前に移動
  const validRange = calculateValidRange(selectedDate);

  const isValidMonth = useCallback(
    (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      return (
        (year === validRange.startYear && month >= validRange.startMonth) ||
        (year === validRange.endYear && month <= validRange.endMonth) ||
        (year > validRange.startYear && year < validRange.endYear)
      );
    },
    [
      validRange.startYear,
      validRange.startMonth,
      validRange.endYear,
      validRange.endMonth,
    ]
  );

  // 月を変更する共通ハンドラー
  const handleMonthChange = useCallback(
    (newDate: Date) => {
      if (isValidMonth(newDate)) {
        setCurrentMonth(newDate);
        // currentMonthの変更と同時にselectedSubMonthも更新
        setSelectedSubMonth(newDate.getMonth());
      }
    },
    [isValidMonth]
  );

  // 前月ボタンのハンドラー
  const handlePrevMonth = useCallback(() => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() - 1);
    handleMonthChange(newMonth);
  }, [currentMonth, handleMonthChange]);

  // 次月ボタンのハンドラー
  const handleNextMonth = useCallback(() => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + 1);
    handleMonthChange(newMonth);
  }, [currentMonth, handleMonthChange]);

  const handleSubMonthSelect = useCallback(
    (year: number, month: number) => {
      const newDate = new Date(year, month, 1);
      handleMonthChange(newDate);
    },
    [handleMonthChange]
  );

  const isCurrentSubMonth = (month: number) => {
    const today = new Date();
    return today.getMonth() === month;
  };

  const today = new Date();
  const formattedToday = `${today.getFullYear()}/${String(
    today.getMonth() + 1
  ).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;

  const generateCalendarDays = useCallback(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    return Array.from({ length: 42 }, (_, i) => {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);

      return {
        date: day,
        isCurrentMonth: day.getMonth() === month,
        isSelected: isSameDate(day, activeDate),
        isToday: isSameDate(day, new Date()),
      };
    });
  }, [currentMonth, activeDate, isSameDate]);

  const getValidMonthsByYear = () => {
    const monthsByYear: { [key: number]: number[] } = {};
    let currentYear = validRange.startYear;
    let currentMonth = validRange.startMonth;

    while (
      currentYear < validRange.endYear ||
      (currentYear === validRange.endYear &&
        currentMonth <= validRange.endMonth)
    ) {
      if (!monthsByYear[currentYear]) {
        monthsByYear[currentYear] = [];
      }
      monthsByYear[currentYear].push(currentMonth);

      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
    }

    return monthsByYear;
  };

  const validMonthsByYear = getValidMonthsByYear();
  const calendarDays = generateCalendarDays();

  return (
    <div className="calendar-popup">
      <div className="calendar-outer">
        <div className="today-date">{formattedToday}</div>

        <div className="calendar-subtitle-container">
          {Object.entries(validMonthsByYear).map(([year, months]) => (
            <div key={year} className="calendar-subtitle-year">
              <div className="calendar-subtitle-year-label">{year}年</div>
              <div className="calendar-subtitle-months">
                {months.map((month) => (
                  <div
                    key={month}
                    className={`calendar-subtitle-month ${
                      selectedSubMonth === month ? "selected" : ""
                    } ${isCurrentSubMonth(month) ? "current-month" : ""}`}
                    onClick={() => handleSubMonthSelect(Number(year), month)}
                  >
                    {month + 1}月
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={handlePrevMonth}>&lt;</button>
            <div className="calendar-month">
              {currentMonth.getFullYear()} /{" "}
              {String(currentMonth.getMonth() + 1).padStart(2, "0")}
            </div>
            <button onClick={handleNextMonth}>&gt;</button>
            <button className="close-button" onClick={onClose}>
              <div className="close-button-line1" />
              <div className="close-button-line2" />
            </button>
          </div>

          <div className="calendar-weekdays">
            {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
              <div key={day} className="calendar-weekday">
                {day}
              </div>
            ))}
          </div>

          <div className="calendar-grid">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`calendar-day
                  ${!day.isCurrentMonth ? "calendar-day-other-month" : ""}
                  ${day.isSelected ? "calendar-day-selected" : ""}
                  ${day.isToday ? "calendar-day-today" : ""}`}
                onClick={() => day.isCurrentMonth && onDateSelect(day.date)}
              >
                {day.date.getDate()}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
