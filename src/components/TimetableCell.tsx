import type { DayInfo, ClassData, Subject } from "../types";

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
  const subject = subjects.find((s) => s.name === data?.subject);
  const cellStyle = subject
    ? {
        backgroundColor: subject.color.bg,
        color: subject.color.text,
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
          <div className="cell-subject">{data.subject}</div>
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
          <div className="plus-horizontal" />
          <div className="plus-vertical" />
        </>
      )}
    </td>
  );
}
