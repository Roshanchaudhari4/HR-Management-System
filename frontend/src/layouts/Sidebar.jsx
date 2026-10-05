import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  LogOut,
  UserRoundCheck,
  ClipboardList,
  UserCircle,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({
  role,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const { logout } = useAuth();

  const menuByRole = {
    Admin: [
      {
        title: "Dashboard",
        path: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Employees",
        path: "/admin/employees",
        icon: Users,
      },
      {
        title: "Attendance",
        path: "/admin/attendance",
        icon: CalendarCheck,
      },
      {
        title: "Leave Management",
        path: "/admin/leaves",
        icon: CalendarDays,
      },
    ],

    Manager: [
      {
        title: "Dashboard",
        path: "/manager/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "My Team",
        path: "/manager/team",
        icon: Users,
      },
      {
        title: "Attendance",
        path: "/manager/attendance",
        icon: CalendarCheck,
      },
      {
        title: "Leave Requests",
        path: "/manager/leaves",
        icon: CalendarDays,
      },
    ],

    Employee: [
      {
        title: "Dashboard",
        path: "/employee/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "My Attendance",
        path: "/employee/attendance",
        icon: CalendarCheck,
      },
      {
        title: "My Leaves",
        path: "/employee/leaves",
        icon: CalendarDays,
      },
    ],
  };

  const menuItems = menuByRole[role] || [];

  const handleLogout = () => {
    logout();
  };

  return (
    <aside
      className={`hrms-sidebar ${
        sidebarOpen ? "open" : ""
      }`}
    >
      <div className="sidebar-header">
        <div className="brand-section">
          <div className="brand-logo">
            HR
          </div>

          <div>
            <h5>HRMS</h5>
            <span>Management System</span>
          </div>
        </div>

        <button
          className="sidebar-close-btn"
          onClick={() =>
            setSidebarOpen(false)
          }
        >
          <X size={21} />
        </button>
      </div>

      <div className="sidebar-role">
        <div className="role-icon">
          {role === "Admin" && (
            <UserRoundCheck size={18} />
          )}

          {role === "Manager" && (
            <ClipboardList size={18} />
          )}

          {role === "Employee" && (
            <UserCircle size={18} />
          )}
        </div>

        <div>
          <small>Logged in as</small>
          <strong>{role}</strong>
        </div>
      </div>

      <div className="sidebar-menu-title">
        MAIN MENU
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() =>
                setSidebarOpen(false)
              }
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              <Icon
                size={19}
                strokeWidth={2}
              />

              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <button
          type="button"
          className="sidebar-link logout-btn"
          onClick={handleLogout}
        >
          <LogOut size={19} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;