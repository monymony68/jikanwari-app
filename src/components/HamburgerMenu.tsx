import type { ClassData } from "../types";
/*import GoogleCalendarButton from "./GoogleCalendarButton";*/

interface HamburgerMenuProps {
  onClose: () => void;
  onSettingsClick: () => void;
  cellData: { [key: string]: ClassData };
}

export default function HamburgerMenu({
  onClose,
  onSettingsClick /* , cellData */,
}: HamburgerMenuProps) {
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
            {/*<li className="menu-item">
              <GoogleCalendarButton cellData={cellData} />
            </li>:*/}
            {/* 余裕があったら実装する
            <li className="menu-item">
              <button className="menu-button">時間割のエクスポート</button>
            </li>
            <li className="menu-item">
              <button className="menu-button">データの初期化</button>
            </li>
						*/}
          </ul>
        </div>
      </div>
    </div>
  );
}
