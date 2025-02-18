import type { Settings } from "../types";
import { useState } from "react";
import LocationSettings from "./LocationSettings";

interface HamburgerMenuProps {
  onClose: () => void;
  onSettingsClick: () => void;
  settings: Settings;
  onSettingsSave: (newSettings: Settings) => void;
}

export default function HamburgerMenu({
  onClose,
  onSettingsClick,
  settings,
  onSettingsSave,
}: HamburgerMenuProps) {
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  // LocationSettings表示時はHamburgerMenuを非表示
  if (isLocationOpen) {
    return (
      <LocationSettings
        settings={settings}
        onSettingsSave={onSettingsSave}
        onClose={() => setIsLocationOpen(false)}
      />
    );
  }

  return (
    <div className="hamburger-popup">
      <div className="hamburger-outer">
        <button className="close-button" onClick={onClose}>
          <div className="close-button-line1" />
          <div className="close-button-line2" />
        </button>

        <div className="hamburger-header">メニュー</div>

        <div className="hamburger-content">
          <ul className="menu-list">
            <li className="menu-item">
              <button className="menu-button" onClick={onSettingsClick}>
                設定
              </button>
            </li>
            <li className="menu-item">
              <button
                className="menu-button"
                onClick={() => setIsLocationOpen(true)}
              >
                地域情報
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
