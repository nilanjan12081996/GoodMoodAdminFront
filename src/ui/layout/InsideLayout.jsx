import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "../layout/Header";
import Sidebar from "../layout/Sidebar";
import { useSelector, useDispatch } from "react-redux";
import { fetchUnreadCounts } from "../../Reducer/NotificationSlice";

const InsideLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = sessionStorage.getItem("good_mood_admin_token");
  const parseToken = token ? JSON.parse(token)?.token : null;

  useEffect(() => {
    if (!parseToken) {
      navigate("/");
    }
  }, [parseToken, navigate]);

  useEffect(() => {
    if (parseToken) {
      dispatch(fetchUnreadCounts());
      const interval = setInterval(() => {
        dispatch(fetchUnreadCounts());
      }, 15000); // Poll every 15 seconds
      return () => clearInterval(interval);
    }
  }, [dispatch, parseToken]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f3f2f7] p-3 gap-3">
      {/* ===== Fixed Left Sidebar (Does not scroll with page) ===== */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* ===== Right Content Area (Header + Scrollable Main Content) ===== */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content: Only this right area scrolls */}
        <main className="flex-1 overflow-y-auto pr-1 pb-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InsideLayout;
