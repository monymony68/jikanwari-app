import React, { useState, useEffect } from "react";
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  Loader,
} from "lucide-react";
import { Settings } from "../types";

// 天気データのモック
const mockWeatherData = Array.from({ length: 5 }, (_, i) => ({
  date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
  weather: ["Clear", "Clouds", "Rain", "Clear", "Clouds"][i],
  description: ["晴れ", "曇り", "雨", "晴れ", "曇り"][i],
  tempMax: Math.floor(Math.random() * 10) + 20,
  tempMin: Math.floor(Math.random() * 10) + 10,
  rainProb: Math.floor(Math.random() * 100),
}));

type WeatherData = {
  date: string;
  weather: string;
  description: string;
  tempMax: number;
  tempMin: number;
  rainProb: number;
};

interface WeatherComponentProps {
  settings?: Settings;
}

const WeatherComponent: React.FC<WeatherComponentProps> = ({
  settings = {
    location: {
      prefecture: "",
      city: "",
    },
  },
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    if (!settings?.location?.prefecture || !settings?.location?.city) {
      setWeatherData(null);
      return;
    }

    const fetchWeatherData = async () => {
      setLoading(true);
      try {
        // 実際のアプリケーションではここで天気APIを呼び出す
        setTimeout(() => {
          setWeatherData(mockWeatherData);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError("天気データの取得に失敗しました");
        setLoading(false);
        console.error(err); // errorログを追加
      }
    };

    fetchWeatherData();
  }, [settings.location]);

  const handleDateChange = (index: number) => {
    // CSS変数を更新してアニメーションの位置を制御
    const tabsElement = document.querySelector(".date-tabs");
    if (tabsElement) {
      (tabsElement as HTMLElement).style.setProperty(
        "--active-index",
        index.toString()
      );
    }
    setSelectedDateIndex(index);
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case "Clear":
        return <Sun className="weather-icon weather-icon-clear" />;
      case "Clouds":
        return <Cloud className="weather-icon weather-icon-clouds" />;
      case "Rain":
        return <CloudRain className="weather-icon weather-icon-rain" />;
      case "Snow":
        return <CloudSnow className="weather-icon weather-icon-snow" />;
      case "Thunderstorm":
        return <CloudLightning className="weather-icon weather-icon-thunder" />;
      case "Drizzle":
        return <CloudDrizzle className="weather-icon weather-icon-drizzle" />;
      default:
        return <Cloud className="weather-icon weather-icon-default" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDay = new Intl.DateTimeFormat("ja-JP", {
      weekday: "short",
    }).format(date);
    return `${month}/${day} (${weekDay})`;
  };

  if (error) {
    return (
      <div className="weather-container">
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-wrapper">
      <div className="weather-header">
        <div className="weather-title-container">
          <p className="weather-title">天気予報</p>
        </div>
        <button
          className="toggle-button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "折りたたむ" : "展開する"}
        >
          <div
            className={`toggle-line ${isExpanded ? "minus" : "plus-vertical"}`}
          />
          <div className="toggle-line plus-horizontal" />
        </button>
      </div>

      <div className={`weather-content ${isExpanded ? "expanded" : ""}`}>
        {loading ? (
          <div className="loading">
            <Loader className="loading-icon" />
          </div>
        ) : weatherData ? (
          <>
            {/* PC表示 */}
            <div className="weather-display-pc">
              <div className="weather-grid">
                {weatherData.slice(0, 5).map((day, index) => (
                  <div key={index} className="weather-info">
                    <div className="date-label">{formatDate(day.date)}</div>
                    <div className="weather-icon-container">
                      {getWeatherIcon(day.weather)}
                    </div>
                    <div className="weather-description">{day.description}</div>
                    <div className="temperature">
                      <span className="temp-max">{day.tempMax}°</span>
                      <span className="temp-separator">/</span>
                      <span className="temp-min">{day.tempMin}°</span>
                    </div>
                    <div className="rain-probability">
                      降水確率 {day.rainProb}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* スマホ表示 */}
            <div className="weather-display-mobile">
              <div className="date-tabs">
                {weatherData.slice(0, 5).map((day, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateChange(index)}
                    className={`date-tab ${
                      selectedDateIndex === index ? "active" : ""
                    }`}
                  >
                    {formatDate(day.date)}
                  </button>
                ))}
              </div>

              {weatherData[selectedDateIndex] && (
                <div className="weather-info-mobile">
                  <div className="weather-icon-container">
                    {getWeatherIcon(weatherData[selectedDateIndex].weather)}
                  </div>
                  <div className="weather-description">
                    {weatherData[selectedDateIndex].description}
                  </div>
                  <div className="temperature">
                    <span className="temp-max">
                      {weatherData[selectedDateIndex].tempMax}°
                    </span>
                    <span className="temp-separator">/</span>
                    <span className="temp-min">
                      {weatherData[selectedDateIndex].tempMin}°
                    </span>
                  </div>
                  <div className="rain-probability">
                    降水確率 {weatherData[selectedDateIndex].rainProb}%
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="no-data">
            <p>設定画面で地域を選択してください</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherComponent;
