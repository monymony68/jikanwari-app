import { useState } from "react";
import type { Settings, Subject, SchoolInfo, PeriodTime } from "../types";
import { DEFAULT_SUBJECTS } from "../constants";

type DeletedSubject = Subject & { deletedAt: number };

interface SettingsMenuProps {
  settings: Settings;
  onSave: (newSettings: Settings) => void;
  onClose: () => void;
  onBack: () => void;
}

export default function SettingsMenu({
  settings,
  onSave,
  onClose,
  onBack,
}: SettingsMenuProps) {
  const [localSettings, setLocalSettings] = useState<Settings>({
    ...settings,
    subjects: settings.subjects.map((subject, index) => ({
      ...subject,
      order: index,
    })),
    periodTimes: settings.periodTimes || [
      { start: "08:50", end: "09:40" },
      { start: "09:50", end: "10:40" },
      { start: "10:50", end: "11:40" },
      { start: "11:50", end: "12:40" },
      { start: "13:30", end: "14:20" },
      { start: "14:30", end: "15:20" },
    ],
  });

  const [draggedItem, setDraggedItem] = useState<{
    id: string;
    type: "main" | "sub";
    parentId?: string;
  } | null>(null);

  const [deletedSubjects, setDeletedSubjects] = useState<DeletedSubject[]>(
    () => {
      const saved = localStorage.getItem("deleted_subjects");
      return saved ? JSON.parse(saved) : [];
    }
  );

  // 学校情報の更新
  const handleSchoolInfoChange = (field: keyof SchoolInfo, value: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      schoolInfo: {
        ...prev.schoolInfo,
        [field]: value,
      },
    }));
  };

  // メイン教科の追加
  const handleAddSubject = () => {
    // 既存メイン教科の最大order値を取得（新しい教科を最後尾にするため）
    const maxOrder = Math.max(
      ...localSettings.subjects
        .filter((s) => !s.parentId)
        .map((s) => s.order ?? -1),
      -1
    );
    // 新しい教科オブジェクトを作成
    const newSubject: Subject = {
      id: crypto.randomUUID(), //ユニークIDを生成
      name: "",
      color: { bg: "#CCCCCC", text: "#FFF" },
      order: maxOrder + 1, //新しい教科を最後尾に追加
    };
    // 設定に新しいメイン教科を追加
    setLocalSettings((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
    }));
  };

  // サブ教科の追加
  const handleAddSubSubject = (parentId: string) => {
    //親教科を検索（サブ教科に親教科の色情報を継承させ、親教科との関連付けを明確にするため）
    const parentSubject = localSettings.subjects.find((s) => s.id === parentId);

    //既存のサブ教科をフィルタリングし昇順に並び替え
    const subSubjects = localSettings.subjects
      .filter((s) => s.parentId === parentId) //指定された親IDを持つサブ教科のみを抽出
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)); //order値で昇順にソート

    //新しいサブ教科オブジェクトを作成
    const newSubject: Subject = {
      id: crypto.randomUUID(),
      name: "",
      color: {
        bg: parentSubject?.color.bg ?? "#CCCCCC",
        text: parentSubject?.color.text ?? "#FFF",
      },
      parentId,
      order:
        subSubjects.length > 0
          ? Math.max(...subSubjects.map((s) => s.order ?? 0)) + 1
          : 0,
    };

    //設定に新しいサブ教科を追加
    setLocalSettings((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
    }));
  };

  // 教科の更新
  const handleSubjectUpdate = (id: string, updates: Partial<Subject>) => {
    setLocalSettings((prev) => ({
      ...prev,
      subjects: prev.subjects.map((subject) =>
        subject.id === id ? { ...subject, ...updates } : subject
      ),
    }));
  };

  // 教科の削除
  const handleDeleteSubject = (id: string) => {
    setLocalSettings((prev) => {
      const subjectToDelete = prev.subjects.find((s) => s.id === id);
      if (!subjectToDelete) return prev;

      setDeletedSubjects((prevDeleted) => {
        const timestamp = Date.now();
        const newDeletedSubject = { ...subjectToDelete, deletedAt: timestamp };
        const newDeletedSubSubjects = !subjectToDelete.parentId
          ? prev.subjects
              .filter((s) => s.parentId === id)
              .map((s) => ({ ...s, deletedAt: timestamp }))
          : [];

        // 重複を防ぐため、同じ名前の教科は上書き
        const filteredDeleted = prevDeleted.filter(
          (d) =>
            d.name !== subjectToDelete.name &&
            !newDeletedSubSubjects.some((s) => s.name === d.name)
        );

        const newDeleted = [
          ...filteredDeleted,
          newDeletedSubject,
          ...newDeletedSubSubjects,
        ];
        localStorage.setItem("deleted_subjects", JSON.stringify(newDeleted));
        return newDeleted;
      });

      return {
        ...prev,
        subjects: prev.subjects.filter(
          (subject) => subject.id !== id && subject.parentId !== id
        ),
      };
    });
  };

  // 教科色をデフォルトに戻す
  const handleResetColors = () => {
    setLocalSettings((prev) => ({
      ...prev,
      subjects: prev.subjects.map((subject) => {
        const defaultSubject = DEFAULT_SUBJECTS.find(
          (s) => s.name === subject.name
        );
        return defaultSubject
          ? { ...subject, color: defaultSubject.color }
          : subject;
      }),
    }));
  };

  // 復活機能を追加
  const handleRestoreSubjects = () => {
    if (deletedSubjects.length === 0) {
      alert("復活できる教科がありません");
      return;
    }

    // メイン教科とサブ教科を分類
    const mainSubjects = [
      ...new Set(deletedSubjects.filter((s) => !s.parentId)),
    ];
    const subSubjects = [...new Set(deletedSubjects.filter((s) => s.parentId))];

    const confirmMessage = [
      `メイン教科: ${mainSubjects.length}個`,
      subSubjects.length ? `サブ教科: ${subSubjects.length}個` : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (confirm(`以下の教科を復活させますか？\n${confirmMessage}`)) {
      setLocalSettings((prev) => {
        // メイン教科を先に復活させ、新しいIDを記録
        const idMap = new Map();
        const restoredMainSubjects = mainSubjects.map((subject) => {
          const newId = crypto.randomUUID();
          idMap.set(subject.id, newId);
          return {
            ...subject,
            id: newId,
            order: prev.subjects.length + 1,
          };
        });

        // サブ教科の親IDを新しいIDに更新
        const restoredSubSubjects = subSubjects.map((subject) => ({
          ...subject,
          id: crypto.randomUUID(),
          parentId: idMap.get(subject.parentId),
          order: prev.subjects.length + 2,
        }));

        return {
          ...prev,
          subjects: [
            ...prev.subjects,
            ...restoredMainSubjects,
            ...restoredSubSubjects,
          ],
        };
      });
      setDeletedSubjects([]);
      localStorage.removeItem("deleted_subjects");
    }
  };

  // 教科のリセット機能
  const handleReset = () => {
    if (confirm("教科をリセットしますか？")) {
      setLocalSettings((prev) => ({
        ...prev,
        subjects: DEFAULT_SUBJECTS.map((s, index) => ({
          ...s,
          order: index,
        })),
      }));
      setDeletedSubjects([]);
      localStorage.removeItem("deleted_subjects");
    }
  };

  // ドラッグ開始
  const handleDragStart = (
    e: React.DragEvent,
    id: string,
    type: "main" | "sub",
    parentId?: string
  ) => {
    // サブ教科の場合は必ず親IDを指定
    if (type === "sub" && !parentId) {
      e.preventDefault();
      return;
    }

    // イベント伝播を防止
    e.stopPropagation();

    // カスタムデータを設定
    const dragData = JSON.stringify({
      id,
      type,
      parentId: type === "sub" ? parentId : undefined,
    });
    e.dataTransfer?.setData("text/plain", dragData);

    // ステート更新
    setDraggedItem({ id, type, parentId });
  };

  // ドラッグオーバー時の処理
  const handleDragOver = (
    e: React.DragEvent,
    type: "main" | "sub",
    parentId?: string
  ) => {
    // サブ教科の場合、同じ親のアイテムにのみドラッグを許可
    const dragData = JSON.parse(e.dataTransfer?.getData("text/plain") || "{}");

    if (type === "sub" && dragData.type === "sub") {
      if (dragData.parentId !== parentId) {
        e.preventDefault();
        return;
      }
    }

    e.preventDefault();
  };

  // ドロップ時の処理
  const handleDrop = (
    e: React.DragEvent,
    targetId: string,
    targetType: "main" | "sub",
    targetParentId?: string
  ) => {
    e.preventDefault();

    // ドラッグデータを安全に取得
    const dragData = JSON.parse(e.dataTransfer?.getData("text/plain") || "{}");
    const {
      id: draggedId,
      type: draggedType,
      parentId: draggedParentId,
    } = dragData;

    // 同じIDへのドロップは無視
    if (draggedId === targetId) {
      setDraggedItem(null);
      return;
    }

    // メイン教科の並び替え
    if (draggedType === "main" && targetType === "main") {
      setLocalSettings((prev) => {
        const subjects = [...prev.subjects].filter((s) => !s.parentId);

        const draggedIndex = subjects.findIndex((s) => s.id === draggedId);
        const targetIndex = subjects.findIndex((s) => s.id === targetId);

        // 要素を移動
        const [removed] = subjects.splice(draggedIndex, 1);
        subjects.splice(targetIndex, 0, removed);

        // 順序を更新
        return {
          ...prev,
          subjects: [
            ...subjects.map((s, index) => ({
              ...s,
              order: index,
            })),
            ...prev.subjects.filter((s) => s.parentId),
          ],
        };
      });
    }

    // サブ教科の並び替え
    if (
      draggedType === "sub" &&
      targetType === "sub" &&
      draggedParentId === targetParentId
    ) {
      setLocalSettings((prev) => {
        // 対象の親を持つサブ教科のみをフィルタリング
        const subSubjects = prev.subjects.filter(
          (s) => s.parentId === draggedParentId
        );

        const draggedIndex = subSubjects.findIndex((s) => s.id === draggedId);
        const targetIndex = subSubjects.findIndex((s) => s.id === targetId);

        // 要素を移動
        const [removed] = subSubjects.splice(draggedIndex, 1);
        subSubjects.splice(targetIndex, 0, removed);

        // 順序を更新
        const updatedSubSubjects = subSubjects.map((s, index) => ({
          ...s,
          order: index,
          parentId: draggedParentId,
        }));

        // 他のサブジェクトと結合
        return {
          ...prev,
          subjects: [
            ...prev.subjects.filter(
              (s) => !s.parentId || s.parentId !== draggedParentId
            ),
            ...updatedSubSubjects,
          ],
        };
      });
    }

    // ドラッグ状態をリセット
    setDraggedItem(null);
  };

  // 時限の時刻を更新する関数
  const handlePeriodTimeChange = (
    index: number,
    field: keyof PeriodTime,
    value: string
  ) => {
    setLocalSettings((prev) => ({
      ...prev,
      periodTimes: prev.periodTimes.map((time, i) =>
        i === index ? { ...time, [field]: value } : time
      ),
    }));
  };

  return (
    <div className="settings-popup">
      <div className="settings-outer">
        <button className="close-button" onClick={onClose}>
          <div className="close-button-line1" />
          <div className="close-button-line2" />
        </button>

        <div className="settings-header">設定</div>

        <div className="settings-content">
          {/* 学校情報の設定 */}
          <section className="settings-section">
            <h3 className="settings-section-title">学校情報</h3>
            <div className="form-group">
              <label>学校名</label>
              <input
                type="text"
                value={localSettings.schoolInfo.schoolName}
                onChange={(e) =>
                  handleSchoolInfoChange("schoolName", e.target.value)
                }
                className="settings-input"
              />
            </div>
            <div className="form-group">
              <label>科名</label>
              <input
                type="text"
                value={localSettings.schoolInfo.department}
                onChange={(e) =>
                  handleSchoolInfoChange("department", e.target.value)
                }
                className="settings-input"
              />
            </div>
            <div className="form-group">
              <label>クラス</label>
              <input
                type="text"
                value={localSettings.schoolInfo.className}
                onChange={(e) =>
                  handleSchoolInfoChange("className", e.target.value)
                }
                className="settings-input"
              />
            </div>
          </section>

          {/* 時限設定セクションを追加 */}
          <section className="settings-section">
            <h3 className="settings-section-title">時間設定</h3>
            <div className="period-times-list">
              {localSettings.periodTimes.map((period, index) => (
                <div key={index} className="period-time-item">
                  <span className="period-time-number">{index + 1}時限目</span>
                  <div className="time-inputs">
                    <div className="time-input-group">
                      <input
                        type="time"
                        value={period.start}
                        onChange={(e) =>
                          handlePeriodTimeChange(index, "start", e.target.value)
                        }
                        className="time-input"
                      />
                    </div>
                    <span>～</span>
                    <div className="time-input-group">
                      <input
                        type="time"
                        value={period.end}
                        onChange={(e) =>
                          handlePeriodTimeChange(index, "end", e.target.value)
                        }
                        className="time-input"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 教科の設定 */}
          <section className="settings-section">
            <h3 className="settings-section-title">教科設定</h3>
            <div className="settings-section-header">
              <button
                onClick={handleRestoreSubjects}
                className="reset-colors-button"
              >
                削除した教科を復活
              </button>
              <button onClick={handleReset} className="reset-colors-button">
                教科をリセット
              </button>
              <button
                onClick={handleResetColors}
                className="reset-colors-button"
              >
                色をデフォルトに戻す
              </button>
            </div>
            <div className="subjects-list">
              {localSettings.subjects
                .filter((subject) => !subject.parentId)
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((subject) => (
                  <div
                    key={subject.id}
                    className={`subject-item ${
                      draggedItem?.id === subject.id ? "dragging" : ""
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, subject.id, "main")}
                    onDragOver={(e) => handleDragOver(e, "main")}
                    onDrop={(e) => handleDrop(e, subject.id, "main")}
                  >
                    <div className="subject-header">
                      <div>
                        <input
                          type="text"
                          value={subject.name}
                          placeholder="教科名を入力"
                          onChange={(e) =>
                            handleSubjectUpdate(subject.id, {
                              name: e.target.value,
                            })
                          }
                          className="subject-name-input"
                        />
                        <div className="color-inputs">
                          <div className="color-input-group">
                            <label>背景色</label>
                            <input
                              type="color"
                              value={subject.color.bg}
                              onChange={(e) =>
                                handleSubjectUpdate(subject.id, {
                                  color: {
                                    ...subject.color,
                                    bg: e.target.value,
                                  },
                                })
                              }
                              className="color-picker"
                            />
                          </div>
                          <div className="color-input-group">
                            <label>文字色</label>
                            <input
                              type="color"
                              value={subject.color.text}
                              onChange={(e) =>
                                handleSubjectUpdate(subject.id, {
                                  color: {
                                    ...subject.color,
                                    text: e.target.value,
                                  },
                                })
                              }
                              className="color-picker"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteSubject(subject.id)}
                          className="delete-button"
                        >
                          削除
                        </button>
                      </div>
                      <input
                        type="text"
                        value={subject.teacher || ""}
                        placeholder="担当教師"
                        onChange={(e) =>
                          handleSubjectUpdate(subject.id, {
                            teacher: e.target.value,
                          })
                        }
                        className="teacher-input"
                      />
                    </div>

                    {/* サブ教科のリスト */}
                    <div className="sub-subjects">
                      {localSettings.subjects
                        .filter((sub) => sub.parentId === subject.id)
                        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                        .map((subSubject) => (
                          <div
                            key={subSubject.id}
                            className={`sub-subject-item ${
                              draggedItem?.id === subSubject.id
                                ? "dragging"
                                : ""
                            }`}
                            draggable
                            onDragStart={(e) =>
                              handleDragStart(
                                e,
                                subSubject.id,
                                "sub",
                                subject.id
                              )
                            }
                            onDragOver={(e) =>
                              handleDragOver(e, "sub", subject.id)
                            }
                            onDrop={(e) =>
                              handleDrop(e, subSubject.id, "sub", subject.id)
                            }
                          >
                            <div>
                              <input
                                type="text"
                                value={subSubject.name}
                                placeholder="サブ教科名を入力"
                                onChange={(e) =>
                                  handleSubjectUpdate(subSubject.id, {
                                    name: e.target.value,
                                  })
                                }
                                className="subject-name-input"
                              />
                              <button
                                onClick={() =>
                                  handleDeleteSubject(subSubject.id)
                                }
                                className="delete-button"
                              >
                                削除
                              </button>
                            </div>
                            <div className="teacher-input-container">
                              <input
                                type="text"
                                value={
                                  subSubject.useParentTeacher
                                    ? subject.teacher || ""
                                    : subSubject.teacher || ""
                                }
                                placeholder="担当教師"
                                onChange={(e) =>
                                  handleSubjectUpdate(subSubject.id, {
                                    teacher: e.target.value,
                                  })
                                }
                                className="teacher-input"
                                disabled={subSubject.useParentTeacher}
                                style={{
                                  backgroundColor: subSubject.useParentTeacher
                                    ? "#f5f5f5"
                                    : "#FFF",
                                }}
                              />
                              <div className="checkbox-container">
                                <input
                                  type="checkbox"
                                  id={`useParentTeacher-${subSubject.id}`}
                                  checked={subSubject.useParentTeacher}
                                  onChange={(e) => {
                                    handleSubjectUpdate(subSubject.id, {
                                      useParentTeacher: e.target.checked,
                                      teacher: e.target.checked
                                        ? subject.teacher
                                        : "",
                                    });
                                  }}
                                  className="checkbox-input"
                                />
                                <label
                                  htmlFor={`useParentTeacher-${subSubject.id}`}
                                  className="checkbox-label"
                                >
                                  メイン教科と同一
                                </label>
                              </div>
                            </div>
                          </div>
                        ))}
                      <button
                        onClick={() => handleAddSubSubject(subject.id)}
                        className="add-sub-button"
                      >
                        サブ教科を追加
                      </button>
                    </div>
                  </div>
                ))}
            </div>
            <button onClick={handleAddSubject} className="add-button">
              新しい教科を追加
            </button>
          </section>
        </div>

        <div className="button-container">
          <button className="back-button" onClick={onBack}>
            戻る
          </button>
          <button className="save-button" onClick={() => onSave(localSettings)}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
