import { type ChangeEvent, useEffect } from "react";
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
  // メイン教科とサブ教科の分離
  const mainSubjects = subjects.filter((s) => !s.parentId);
  const selectedMainSubject = subjects.find((s) => s.name === formData.subject);
  const subSubjects = subjects.filter(
    (s) => s.parentId === selectedMainSubject?.id
  );

  // 教師の自動入力
  useEffect(() => {
    if (
      !formData.subSubject &&
      selectedMainSubject?.teacher &&
      !formData.teacher
    ) {
      // サブ教科が選択されていない場合のみ、メイン教科の教師名を自動入力
      onInputChange("teacher", selectedMainSubject.teacher);
    }
  }, [
    selectedMainSubject,
    formData.teacher,
    formData.subSubject,
    onInputChange,
  ]);

  const renderTeacherInput = () => {
    if (!formData.subject) return null;

    const selectedMainSubject = subjects.find(
      (s) => s.name === formData.subject
    );
    const selectedSubSubject = formData.subSubject
      ? subjects.find((s) => s.name === formData.subSubject)
      : null;

    // 教師が設定されていない場合は非表示
    if (
      (!selectedSubSubject && !selectedMainSubject?.teacher) ||
      (selectedSubSubject &&
        !selectedSubSubject.teacher &&
        !selectedSubSubject.useParentTeacher)
    ) {
      return null;
    }

    return (
      <div className="form-group">
        <label className="label">担当</label>
        <input
          className="input"
          value={formData.teacher}
          readOnly
          style={{ backgroundColor: "#f5f5f5" }}
        />
      </div>
    );
  };

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
          <div>
            <div>{selectedPeriod.day.date}</div>
            <div>&#40;{selectedPeriod.day.day}&#41;</div>
          </div>
          {selectedPeriod.period}時間目
        </div>

        <div className="subject-select-container">
          {/* メイン教科選択 */}
          <select
            className="subject-select"
            value={formData.subject}
            onChange={(e) => {
              onInputChange("subject", e.target.value);
              // 選択された教科の教師情報を取得
              const subject = subjects.find((s) => s.name === e.target.value);
              // 教師が設定されている場合はその値を、されていない場合は空文字をセット
              onInputChange("teacher", subject?.teacher || "");
              // サブ教科の選択をリセット
              onInputChange("subSubject", "");
            }}
            style={{
              backgroundColor: selectedMainSubject?.color.bg || "#FFF",
              color: formData.subject
                ? selectedMainSubject?.color.text || "#000"
                : "#444",
              border: selectedMainSubject ? "none" : "1px solid #ddd",
            }}
          >
            <option value="">教科を選択</option>
            {mainSubjects.map((subject) => (
              <option key={subject.id} value={subject.name}>
                {subject.name}
              </option>
            ))}
          </select>

          {/* サブ教科選択（メイン教科選択時のみ表示） */}
          {formData.subject && subSubjects.length > 0 && (
            <div className="sub-subject-wrapper">
              <div className="sub-subject-label">サブ教科</div>
              <div className="sub-subject-select-container">
                <select
                  className="sub-subject-select"
                  value={formData.subSubject || ""}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    onInputChange("subSubject", selectedValue);
                    const selectedSubSubject = subjects.find(
                      (s) => s.name === selectedValue
                    );
                    // selectedSubSubjectがundefinedの場合（選択解除時）はメイン教科の教師名を設定
                    // それ以外の場合（サブ教科選択時）は、そのサブ教科の教師名を設定（未設定なら空文字列）
                    const teacherName = !selectedValue
                      ? selectedMainSubject?.teacher ?? ""
                      : selectedSubSubject?.teacher ?? "";

                    onInputChange("teacher", teacherName);
                  }}
                  style={{
                    borderColor: selectedMainSubject?.color.bg || "#fff",
                    color: selectedMainSubject?.color.bg || "#000",
                  }}
                >
                  <option value="">選択してください</option>
                  {subSubjects.map((subject) => (
                    <option key={subject.id} value={subject.name}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="form-container">
          {renderTeacherInput()}
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
