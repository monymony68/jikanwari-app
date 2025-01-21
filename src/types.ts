export interface TimeSlot {
  period: number; // 時限
  time: string; // 時間帯
}

export interface DayInfo {
  date: string; // 日付
  day: string; // 曜日
  isToday: boolean; // 今日かどうか
}

export interface ClassData {
  subject: string; // 教科
  subSubject?: string; // サブ教科
  teacher: string; // 担当教師
  content: string; // 授業内容
  location: string; // 場所
  materials: string; // 必要物
  homework: string; // 宿題
}

export interface CellData {
  [key: string]: ClassData;
}

// 学校情報の型
export interface SchoolInfo {
  schoolName: string; // 学校名
  department: string; // 学部
  className: string; // クラス名
}

// 教科の型
export interface Subject {
  id: string;
  name: string; // 教科名
  color: {
    bg: string; // 背景色
    text: string; // 文字色
  };
  teacher?: string; // 担当教師
  parentId?: string; // サブ教科の親教科のID
  order?: number; // 教科の並び順
  useParentTeacher?: boolean; // 追加：メイン教科と同一の教師を使用するかどうかのフラグ
}

// 設定の型
export interface Settings {
  schoolInfo: SchoolInfo;
  subjects: Subject[];
}

export type SubjectColors = {
  [key: string]: {
    bg: string;
    text: string;
  };
};
