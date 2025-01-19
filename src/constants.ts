import type { TimeSlot, Subject } from "./types";

/* 余裕があったら時間を変更できるようにする */
export const TIME_SLOTS: TimeSlot[] = [
  { period: 1, time: "8:40~9:30" },
  { period: 2, time: "9:40~10:30" },
  { period: 3, time: "10:40~11:30" },
  { period: 4, time: "11:40~12:30" },
  { period: 5, time: "13:20~14:10" },
  { period: 6, time: "14:20~15:10" },
  { period: 7, time: "15:20~16:10" },
];

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: "1", name: "国語", color: { bg: "#FF3232", text: "#FFFFFF" } },
  { id: "2", name: "数学", color: { bg: "#6AB5FF", text: "#FFFFFF" } },
  { id: "3", name: "理科", color: { bg: "#91D9A5", text: "#FFFFFF" } },
  { id: "4", name: "社会", color: { bg: "#FFAE00", text: "#FFFFFF" } },
  { id: "5", name: "英語", color: { bg: "#BD6BFF", text: "#FFFFFF" } },
  { id: "6", name: "体育", color: { bg: "#CCCCCC", text: "#FFFFFF" } },
  { id: "7", name: "音楽", color: { bg: "#CCCCCC", text: "#FFFFFF" } },
  { id: "8", name: "美術", color: { bg: "#CCCCCC", text: "#FFFFFF" } },
];
