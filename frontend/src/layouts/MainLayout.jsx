import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import "./layout.css";

const MainLayout = ({ role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="hrms-layout">
      <Sidebar
        role={role}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="hrms-main">
        <TopNavbar
          role={role}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="hrms-content">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;