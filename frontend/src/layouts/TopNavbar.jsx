import { Menu, Bell, ChevronDown } from "lucide-react";

const TopNavbar = ({ role, setSidebarOpen }) => {
  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch (error) {
    user = {};
  }

  const userName =
    user?.name ||
    user?.fullName ||
    user?.username ||
    user?.firstName ||
    "User";

  const displayRole =
    user?.role ||
    role ||
    "User";

  const firstLetter =
    userName !== "User"
      ? userName.trim().charAt(0).toUpperCase()
      : "U";

  return (
    <header className="hrms-navbar">

      {/* LEFT SIDE */}
      <div className="navbar-left">

        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div className="navbar-page-info">
          <h4>HR Management System</h4>
          <span>Manage your workplace efficiently</span>
        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="navbar-right">

        <button
          type="button"
          className="notification-btn"
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span className="notification-dot"></span>
        </button>

        <div className="navbar-user">

          <div className="user-avatar">
            {firstLetter}
          </div>

          <div className="user-details">
            <strong>{userName}</strong>
            <span>{displayRole}</span>
          </div>

          <ChevronDown
            className="user-chevron"
            size={16}
          />

        </div>

      </div>

    </header>
  );
};

export default TopNavbar;