import { type ChangeEvent } from "react";
import type { ClassData, DayInfo, Subject } from "../types";

type ClassFormProps = {
  selectedPeriod: {
    day: DayInfo;
    period: number;
  };
  formData: ClassData;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  onInputChange: (field: keyof ClassData, value: string) => void;
  subjects: Subject[];
};

export default function ClassForm({
  selectedPeriod,
  formData,
  onClose,
  onSave,
  onDelete,
  onInputChange,
  subjects,
}: ClassFormProps) {
  const selectedSubject = subjects.find((s) => s.name === formData.subject);

  //テキストエリアのレンダリング関数を追加
  const renderTextArea = (field: keyof ClassData, label: string) => {
    const handleTextAreaInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
      const target = e.target;
      target.style.height = "auto";
      target.style.height = `${target.scrollHeight}px`;
    };

    return (
      <div className="form-group">
        <label className="label">{label}</label>
        <textarea
          className="textarea"
          value={formData[field]}
          onChange={(e) => {
            onInputChange(field, e.target.value);
            handleTextAreaInput(e);
          }}
          onInput={handleTextAreaInput}
        />
      </div>
    );
  };

  return (
    <div className="dialog">
      <div className="dialog-content">
        <button className="close-button" onClick={onClose}>
          <div className="close-button-line1" />
          <div className="close-button-line2" />
        </button>

        <div className="dialog-header">
          {selectedPeriod.day.date}（{selectedPeriod.day.day}）{" "}
          {selectedPeriod.period}時間目
        </div>

        <select
          className="subject-select"
          value={formData.subject}
          style={{
            backgroundColor: selectedSubject?.color.bg || "#FFF",
            color: selectedSubject?.color.text || "#000",
          }}
          onChange={(e) => onInputChange("subject", e.target.value)}
        >
          <option value="">教科を選択</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.name}>
              {subject.name}
            </option>
          ))}
        </select>

        <div className="form-container">
          <div className="form-group">
            <label className="label">担当</label>
            <input
              className="input"
              value={formData.teacher}
              onChange={(e) => onInputChange("teacher", e.target.value)}
            />
          </div>

          {renderTextArea("content", "内容")}
          {renderTextArea("location", "場所")}
          {renderTextArea("materials", "必要物")}
          {renderTextArea("homework", "宿題")}
        </div>

        <div className="button-container">
          <button className="delete-button" onClick={onDelete}>
            消去
          </button>
          <button className="save-button" onClick={onSave}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
