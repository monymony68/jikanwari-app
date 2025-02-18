import { useState, useEffect } from "react";
import prefectureData from "../prefectureData";
import type { Prefecture, City, Settings } from "../types";

interface LocationSettingsProps {
  settings: Settings;
  onSettingsSave: (newSettings: Settings) => void;
  onClose: () => void;
}

export default function LocationSettings({
  settings,
  onSettingsSave,
  onClose,
}: LocationSettingsProps) {
  const [prefectures] = useState<Prefecture[]>(prefectureData);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedLocation, setSelectedLocation] = useState({
    prefecture: settings.location.prefecture,
    city: settings.location.city,
  });

  useEffect(() => {
    if (!selectedLocation.prefecture) {
      setCities([]);
      return;
    }

    const selectedPref = prefectures.find(
      (pref) => pref.prefCode === selectedLocation.prefecture
    );
    if (selectedPref) {
      setCities(selectedPref.cities);
    } else {
      setCities([]);
    }
  }, [selectedLocation.prefecture, prefectures]);

  const handleLocationSave = () => {
    const newSettings = {
      ...settings,
      location: selectedLocation,
    };
    localStorage.setItem("settings", JSON.stringify(newSettings));
    onSettingsSave(newSettings);
    onClose();
  };

  return (
    <div className="hamburger-popup">
      <div className="hamburger-outer">
        <button className="close-button" onClick={onClose}>
          <div className="close-button-line1" />
          <div className="close-button-line2" />
        </button>

        <div className="hamburger-header">地域情報設定</div>

        <div className="hamburger-content">
          <div className="location-form">
            <div className="select-group">
              <p>都道府県</p>
              <select
                value={selectedLocation.prefecture}
                onChange={(e) =>
                  setSelectedLocation({
                    prefecture: e.target.value,
                    city: "",
                  })
                }
                className="location-select"
              >
                <option value="">都道府県を選択</option>
                {prefectures.map((pref) => (
                  <option key={pref.prefCode} value={pref.prefCode}>
                    {pref.prefName}
                  </option>
                ))}
              </select>
            </div>

            <div className="select-group">
              <p>市区町村</p>
              <select
                value={selectedLocation.city}
                onChange={(e) =>
                  setSelectedLocation((prev) => ({
                    ...prev,
                    city: e.target.value,
                  }))
                }
                disabled={!selectedLocation.prefecture}
                className="location-select"
              >
                <option value="">市区町村を選択</option>
                {cities.map((city) => (
                  <option key={city.cityCode} value={city.cityCode}>
                    {city.cityName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="button-container">
          <button className="back-button" onClick={onClose}>
            戻る
          </button>
          <button
            className="save-button"
            onClick={handleLocationSave}
            disabled={!selectedLocation.prefecture || !selectedLocation.city}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
