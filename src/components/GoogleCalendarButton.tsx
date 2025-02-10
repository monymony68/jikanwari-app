import { useState } from "react";
import type { ClassData } from "../types";

interface Props {
  cellData: { [key: string]: ClassData };
}

// Google APIの型定義
interface GoogleEvent {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
}

interface GAPIClient {
  client: {
    init: (config: {
      apiKey: string;
      discoveryDocs: string[];
    }) => Promise<void>;
    getToken: () => string | null;
    calendar: {
      events: {
        insert: (params: {
          calendarId: string;
          resource: GoogleEvent;
        }) => Promise<{ result: GoogleEvent }>;
      };
    };
  };
  load: (api: string, callback: () => void) => void;
}

interface GoogleIdentityServices {
  accounts: {
    oauth2: {
      initTokenClient: (config: {
        client_id: string;
        scope: string;
        callback: (response: { error?: string }) => void;
      }) => {
        requestAccessToken: (options?: { prompt: string }) => void;
      };
    };
  };
}

declare global {
  interface Window {
    gapi: GAPIClient;
    google: GoogleIdentityServices;
  }
}

export default function GoogleCalendarButton({ cellData }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const createEvents = async () => {
    setIsLoading(true);
    try {
      console.log("Starting calendar sync...");

      // GAPIのロード
      await new Promise<void>((resolve) => {
        window.gapi.load("client", resolve);
      });
      console.log("GAPI loaded");

      // クライアントの初期化
      await window.gapi.client.init({
        apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
        ],
      });
      console.log("Client initialized");

      // GoogleIdentityServicesの初期化
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: "https://www.googleapis.com/auth/calendar.events",
        callback: async (response) => {
          if (response.error !== undefined) {
            throw new Error(response.error);
          }

          try {
            // イベントの作成
            for (const [key, data] of Object.entries(cellData)) {
              const [dateStr, period] = key.split("-");
              const [month, day] = dateStr.split("/");
              const year = new Date().getFullYear();
              const startHour = 8 + Number(period);

              const event: GoogleEvent = {
                summary: data.subject,
                description: `内容: ${data.content}\n場所: ${data.location}\n必要物: ${data.materials}\n宿題: ${data.homework}`,
                start: {
                  dateTime: new Date(
                    year,
                    Number(month) - 1,
                    Number(day),
                    startHour
                  ).toISOString(),
                  timeZone: "Asia/Tokyo",
                },
                end: {
                  dateTime: new Date(
                    year,
                    Number(month) - 1,
                    Number(day),
                    startHour + 1
                  ).toISOString(),
                  timeZone: "Asia/Tokyo",
                },
              };

              console.log("Creating event:", event);
              const response = await window.gapi.client.calendar.events.insert({
                calendarId: "primary",
                resource: event,
              });
              console.log("Event created:", response);
            }

            alert("Googleカレンダーに登録しました！");
          } catch (error) {
            console.error("Error creating events:", error);
            throw error;
          }
          setIsLoading(false);
        },
      });

      // トークンリクエストの実行
      if (!window.gapi.client.getToken()) {
        tokenClient.requestAccessToken();
      } else {
        tokenClient.requestAccessToken({ prompt: "" });
      }
    } catch (error) {
      console.error("Detailed error:", error);
      alert(
        `カレンダーへの登録に失敗しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`
      );
      setIsLoading(false);
    }
  };

  return (
    <button onClick={createEvents} disabled={isLoading} className="menu-button">
      {isLoading ? "処理中..." : "Googleカレンダーに登録"}
    </button>
  );
}
