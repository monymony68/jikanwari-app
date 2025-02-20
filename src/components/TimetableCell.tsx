import { Plus } from "lucide-react";
import type { DayInfo, ClassData, Subject } from "../types";
import { DEFAULT_SUBJECTS } from "../constants";

type TimetableCellProps = {
  day: DayInfo;
  period: number;
  data?: ClassData;
  onClick: () => void;
  subjects: Subject[];
};

export default function TimetableCell({
  day,
  data,
  onClick,
  subjects,
}: TimetableCellProps) {
  // subjectsが空の場合はDEFAULT_SUBJECTSを使用
  const availableSubjects = subjects.length > 0 ? subjects : DEFAULT_SUBJECTS;

  // 教科から色情報を取得
  let cellColor = null;
  if (data?.subject) {
    // まずサブ教科を確認
    if (data.subSubject) {
      const subSubject = availableSubjects.find(
        (s) => s.name === data.subSubject
      );
      if (subSubject) {
        cellColor = subSubject.color;
      }
    }

    // サブ教科の色が見つからない場合はメイン教科の色を使用
    if (!cellColor) {
      const mainSubject = availableSubjects.find(
        (s) => s.name === data.subject
      );
      if (mainSubject) {
        cellColor = mainSubject.color;
      }
    }
  }

  // セルのスタイルを設定
  const cellStyle = cellColor
    ? {
        backgroundColor: cellColor.bg,
        color: cellColor.text,
        border: "none",
      }
    : {};

  return (
    <td
      className={`cell ${data ? "filled" : ""} ${day.isToday ? "today" : ""}`}
      style={cellStyle}
      onClick={onClick}
    >
      {data ? (
        <div className="cell-content">
          <div className="cell-subject">{data.subSubject || data.subject}</div>
          {data.content && (
            <div className="cell-detail">内容: {data.content}</div>
          )}
          {data.location && (
            <div className="cell-detail">場所: {data.location}</div>
          )}
          {data.materials && (
            <div className="cell-detail">必要物: {data.materials}</div>
          )}
          {data.homework && (
            <div className="cell-detail">宿題: {data.homework}</div>
          )}
        </div>
      ) : (
        <>
          <Plus className="plus-icon" />
        </>
      )}
    </td>
  );
}
