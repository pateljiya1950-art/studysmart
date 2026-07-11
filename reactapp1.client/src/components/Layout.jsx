import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./Layout.css";

export default function Layout({ navItems = [] }) {
  return (
    <div className="app-layout">
      <Sidebar navItems={navItems} />
      <div className="layout-content-wrapper">
        <main className="layout-main">
          <div className="layout-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
