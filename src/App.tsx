import { useState, useMemo, useEffect, useCallback } from "react";
//↓componentsフォルダ内の各コンポーネントをインポート
import CalendarComponent from "./components/Calendar";
import ClassForm from "./components/ClassForm";
import HamburgerMenu from "./components/HamburgerMenu";
import SettingsMenu from "./components/SettingsMenu";
import PCTimetable from "./components/PCTimetable";
import MobileTimetable from "./components/MobileTimetable";
import { DEFAULT_SUBJECTS } from "./constants";
import type { DayInfo, ClassData, CellData, Settings } from "./types";
//↓アイコンライブラリ「lucide-react」でカレンダーアイコン、矢印アイコンをインポート
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

// ローカルストレージのキーを定数として定義
const STORAGE_KEYS = {
  SETTINGS: "timetable_settings",
  CELL_DATA: "timetable_cell_data",
  CURRENT_WEEK: "timetable_current_week",
  SELECTED_DATE: "timetable_selected_date",
} as const;

export default function App() {
  // モバイルデバイスかどうかの状態を管理
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 991.98);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 991.98);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 状態の初期化をローカルストレージから行う
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    // ページ更新時は常に当日の日付を使用
    return new Date();
  });

  // 曜日情報の生成
  const isSameDay = useCallback((date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }, []);

  const getDaysOfWeek = useCallback(
    (startDate: Date): DayInfo[] => {
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
    },
    [isSameDay]
  );

  const weekDays = useMemo(
    () => getDaysOfWeek(currentWeekStart),
    [currentWeekStart, getDaysOfWeek]
  );

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

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setActiveMobileDate(date);
    setCurrentWeekStart(date);
    setIsCalendarOpen(false);
  }, []);

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

  const [activeMobileDate, setActiveMobileDate] = useState(() => selectedDate);

  const handleMobileDaySelect = useCallback((date: Date) => {
    setActiveMobileDate(date);
    setSelectedDate(date); // 選択された日付も更新
    setCurrentWeekStart(date); // 週の開始日も更新
  }, []);

  useEffect(() => {
    setActiveMobileDate(selectedDate);
  }, [selectedDate]);

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
            activeDate={activeMobileDate}
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
            cellData={cellData} // 追加
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

        {/* 時間割テーブル */}
        <div className="content">
          <div className="timetable-container">
            <div className="content">
              {isMobile ? (
                <MobileTimetable
                  weekDays={weekDays}
                  cellData={cellData}
                  subjects={settings.subjects}
                  onCellClick={handleCellClick}
                  onPrevWeek={handlePrevWeek}
                  onNextWeek={handleNextWeek}
                  currentWeekStart={currentWeekStart}
                  selectedDate={selectedDate}
                  onDaySelect={handleMobileDaySelect}
                  periodTimes={settings.periodTimes}
                />
              ) : (
                <>
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

                  <PCTimetable
                    weekDays={weekDays}
                    cellData={cellData}
                    subjects={settings.subjects}
                    onCellClick={handleCellClick}
                    periodTimes={settings.periodTimes}
                  />
                </>
              )}
            </div>
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
        {/* GitHub リンク */}
        <a
          href="https://github.com/monymony68/jikanwari-app"
          target="_blank"
          rel="noopener noreferrer"
          className="github-link"
        >
          <svg
            height="32"
            aria-hidden="true"
            viewBox="0 0 16 16"
            version="1.1"
            width="32"
            className="github-icon"
          >
            <path
              fill="#000"
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
            ></path>
          </svg>
        </a>
      </div>
    </div>
  );
}
