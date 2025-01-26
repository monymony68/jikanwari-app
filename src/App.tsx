import { useState, useMemo, useEffect } from "react";
//↓componentsフォルダ内の各コンポーネントをインポート
import CalendarComponent from "./components/Calendar";
import TimetableCell from "./components/TimetableCell";
import ClassForm from "./components/ClassForm";
import HamburgerMenu from "./components/HamburgerMenu";
import SettingsMenu from "./components/SettingsMenu";
import { TIME_SLOTS, DEFAULT_SUBJECTS } from "./constants";
import type { DayInfo, ClassData, CellData, Settings } from "./types";
//↓アイコンライブラリ「lucide-react」でカレンダーアイコン、矢印アイコンをインポート
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
//↓cssファイルをインポート
import "./styles/index.css";

// ローカルストレージのキーを定数として定義
const STORAGE_KEYS = {
  SETTINGS: "timetable_settings",
  CELL_DATA: "timetable_cell_data",
  CURRENT_WEEK: "timetable_current_week",
  SELECTED_DATE: "timetable_selected_date",
} as const;

export default function App() {
  // 状態の初期化をローカルストレージから行う
  // 状態の初期化をローカルストレージから行う
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const savedWeek = localStorage.getItem(STORAGE_KEYS.CURRENT_WEEK);
    return savedWeek ? new Date(savedWeek) : new Date();
  });

  const [selectedDate, setSelectedDate] = useState(() => {
    const savedDate = localStorage.getItem(STORAGE_KEYS.SELECTED_DATE);
    return savedDate ? new Date(savedDate) : new Date();
  });

  const [cellData, setCellData] = useState<CellData>(() => {
    const savedCellData = localStorage.getItem(STORAGE_KEYS.CELL_DATA);
    return savedCellData ? JSON.parse(savedCellData) : {};
  });
  // デフォルトの科目で初期設定を作成
  const [settings, setSettings] = useState<Settings>(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return savedSettings
      ? JSON.parse(savedSettings)
      : {
          schoolInfo: {
            schoolName: "福井高校",
            department: "普通科",
            className: "1年1組",
          },
          subjects: DEFAULT_SUBJECTS,
        };
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<{
    day: DayInfo;
    period: number;
  } | null>(null);
  const [formData, setFormData] = useState<ClassData>({
    subject: "",
    teacher: "",
    content: "",
    location: "",
    materials: "",
    homework: "",
  });

  // データが変更されたときにローカルストレージに保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CELL_DATA, JSON.stringify(cellData));
  }, [cellData]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.CURRENT_WEEK,
      currentWeekStart.toISOString()
    );
  }, [currentWeekStart]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.SELECTED_DATE,
      selectedDate.toISOString()
    );
  }, [selectedDate]);

  // 曜日情報の生成
  const getDaysOfWeek = (startDate: Date): DayInfo[] => {
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    const today = new Date();
    const monday = new Date(startDate);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);

      return {
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        day: days[date.getDay()],
        isToday: isSameDay(date, today),
      };
    });
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const weekDays = useMemo(
    () => getDaysOfWeek(currentWeekStart),
    [currentWeekStart]
  );

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentWeekStart(date);
    setIsCalendarOpen(false);
  };

  const handleCellClick = (day: DayInfo, period: number) => {
    const cellKey = `${day.date}-${period}`;
    setSelectedPeriod({ day, period });
    setFormData(
      cellData[cellKey] ?? {
        subject: "",
        teacher: "",
        content: "",
        location: "",
        materials: "",
        homework: "",
      }
    );
    setIsDialogOpen(true);
  };

  // データが変更されたときにローカルストレージに保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CELL_DATA, JSON.stringify(cellData));
  }, [cellData]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.CURRENT_WEEK,
      currentWeekStart.toISOString()
    );
  }, [currentWeekStart]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.SELECTED_DATE,
      selectedDate.toISOString()
    );
  }, [selectedDate]);

  const handleInputChange = (field: keyof ClassData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (selectedPeriod) {
      const cellKey = `${selectedPeriod.day.date}-${selectedPeriod.period}`;
      setCellData((prev) => ({
        ...prev,
        [cellKey]: formData,
      }));
      setIsDialogOpen(false);
    }
  };

  const handleDelete = () => {
    if (selectedPeriod) {
      const cellKey = `${selectedPeriod.day.date}-${selectedPeriod.period}`;
      setCellData((prev) => {
        const newData = { ...prev };
        delete newData[cellKey];
        return newData;
      });
      setIsDialogOpen(false);
    }
  };

  const handleSettingsSave = (newSettings: Settings) => {
    setSettings(newSettings);
    setIsSettingsOpen(false);
    // 設定が変更された後の時間割データを更新
    updateTimetableWithNewSettings(newSettings);
  };

  // 設定変更後の時間割更新処理
  const updateTimetableWithNewSettings = (newSettings: Settings) => {
    const updatedCellData: CellData = {};

    for (const key in cellData) {
      const cell = cellData[key];
      if (!newSettings.subjects.some((s) => s.name === cell.subject)) {
        continue;
      }
      updatedCellData[key] = cell;
    }

    setCellData(updatedCellData);
  };

  const handlePrevWeek = () => {
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  return (
    <div className="wrapper">
      <div className="container">
        {/* カレンダーアイコン */}
        <div
          className="calendar-icon"
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
        >
          <Calendar />
        </div>

        {/* カレンダーコンポーネント */}
        {isCalendarOpen && (
          <CalendarComponent
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onClose={() => setIsCalendarOpen(false)}
          />
        )}

        {/* ハンバーガーメニュー */}
        <div className="hamburger" onClick={() => setIsMenuOpen(true)}>
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </div>

        {/* ハンバーガーメニューポップアップ */}
        {isMenuOpen && (
          <HamburgerMenu
            onClose={() => setIsMenuOpen(false)}
            onSettingsClick={() => {
              setIsMenuOpen(false);
              setIsSettingsOpen(true);
            }}
          />
        )}

        {/* 設定画面 */}
        {isSettingsOpen && (
          <SettingsMenu
            settings={settings}
            onSave={handleSettingsSave}
            onClose={() => setIsSettingsOpen(false)}
            onBack={() => {
              setIsSettingsOpen(false);
              setIsMenuOpen(true);
            }}
          />
        )}

        {/* タイトル */}
        <div className="title">
          <h1 className="title-text">
            {settings.schoolInfo.schoolName} {settings.schoolInfo.department}
            <br />
            {settings.schoolInfo.className} 時間割
          </h1>
        </div>

        {/* 週移動ボタン */}
        <button
          className="week-button prev-week-button"
          onClick={handlePrevWeek}
        >
          <ChevronLeft size={24} />
          <span className="week-button-text">前の週</span>
        </button>

        <button
          className="week-button next-week-button"
          onClick={handleNextWeek}
        >
          <ChevronRight size={24} />
          <span className="week-button-text">次の週</span>
        </button>

        {/* 時間割テーブル */}
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
                        onClick={() => handleCellClick(day, slot.period)}
                        subjects={settings.subjects}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 授業情報入力フォーム */}
        {isDialogOpen && selectedPeriod && (
          <ClassForm
            selectedPeriod={selectedPeriod}
            formData={formData}
            onClose={() => setIsDialogOpen(false)}
            onSave={handleSave}
            onDelete={handleDelete}
            onInputChange={handleInputChange}
            subjects={settings.subjects}
          />
        )}
      </div>
    </div>
  );
}
