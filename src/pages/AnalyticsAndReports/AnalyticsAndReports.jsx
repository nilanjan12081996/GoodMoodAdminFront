import React, { useState, useRef, useEffect } from "react";
import {
  FiUsers,
  FiEye,
  FiHeadphones,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
  FiAlertCircle,
  FiRefreshCw,
  FiPlusCircle,
  FiUserPlus,
  FiSend,
  FiBarChart2,
  FiX,
  FiCheck,
} from "react-icons/fi";

// ==========================================
// MOCK DATA (Replace with Redux / API later)
// ==========================================

const kpiStats = [
  {
    id: 1,
    title: "Total Users",
    value: "24,568",
    change: "+12.5%",
    isPositive: true,
    icon: FiUsers,
    bgColor: "bg-indigo-50 text-indigo-600",
  },
  {
    id: 2,
    title: "Active Users",
    value: "8,432",
    change: "+15.3%",
    isPositive: true,
    icon: FiUsers,
    bgColor: "bg-emerald-50 text-emerald-600",
  },
  {
    id: 3,
    title: "Support Requests",
    value: "342",
    change: "-4.2%",
    isPositive: false,
    icon: FiHeadphones,
    bgColor: "bg-rose-50 text-rose-600",
  },
  {
    id: 4,
    title: "Content Views",
    value: "56,789",
    change: "+18.7%",
    isPositive: true,
    icon: FiEye,
    bgColor: "bg-amber-50 text-amber-600",
  },
  {
    id: 5,
    title: "Counselor Sessions",
    value: "1,248",
    change: "+10.1%",
    isPositive: true,
    icon: FiUsers,
    bgColor: "bg-blue-50 text-blue-600",
  },
];

const importantAlerts = [
  {
    id: 1,
    title: "High Risk Reports",
    description: "12 new high-risk reports need immediate attention.",
    time: "10 mins ago",
    type: "danger",
    icon: FiAlertTriangle,
  },
  {
    id: 2,
    title: "Counselor Availability",
    description: "3 counselors are unavailable today.",
    time: "1 hour ago",
    type: "warning",
    icon: FiAlertCircle,
  },
  {
    id: 3,
    title: "System Update",
    description: "Scheduled maintenance on May 25, 2:00 AM - 4:00 AM.",
    time: "3 hours ago",
    type: "info",
    icon: FiRefreshCw,
  },
];

const recentSupportRequests = [
  {
    id: 1,
    initials: "SL",
    message: "Feeling anxious and overwhelmed",
    user: "Sarah Lee",
    category: "Counseling",
    priority: "High Priority",
    priorityClass: "bg-rose-100 text-rose-600",
    time: "10 mins ago",
    avatarBg: "bg-purple-100 text-purple-700",
  },
  {
    id: 2,
    initials: "JM",
    message: "Need help with stress management",
    user: "James Miller",
    category: "Counseling",
    priority: "Medium Priority",
    priorityClass: "bg-amber-100 text-amber-700",
    time: "25 mins ago",
    avatarBg: "bg-blue-100 text-blue-700",
  },
  {
    id: 3,
    initials: "AK",
    message: "Feeling lonely and need to talk",
    user: "Anna Kim",
    category: "Emotional Support",
    priority: "Low Priority",
    priorityClass: "bg-emerald-100 text-emerald-700",
    time: "1 hour ago",
    avatarBg: "bg-emerald-100 text-emerald-700",
  },
  {
    id: 4,
    initials: "RP",
    message: "Crisis support required",
    user: "Robert Parker",
    category: "Crisis Support",
    priority: "High Priority",
    priorityClass: "bg-rose-100 text-rose-600",
    time: "2 hours ago",
    avatarBg: "bg-rose-100 text-rose-700",
  },
];

const topContent = [
  {
    id: 1,
    title: "Managing Anxiety in Daily Life",
    type: "Article",
    category: "Mental Wellness",
    views: "12.5K",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    title: "Understanding Depression",
    type: "Video",
    category: "Education",
    views: "9.8K",
    image:
      "https://images.unsplash.com/photo-1499209974431-9dac3ada00d7?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    title: "Mindfulness Meditation Guide",
    type: "Audio",
    category: "Mindfulness",
    views: "8.3K",
    image:
      "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: 4,
    title: "Self Care Tips for Better Mental Health",
    type: "Article",
    category: "Self Care",
    views: "7.6K",
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=120&auto=format&fit=crop&q=80",
  },
];

const activeCounselors = [
  {
    id: 1,
    name: "Dr. Emily Carter",
    role: "Clinical Psychologist",
    status: "Online",
    statusColor: "bg-emerald-500",
    statusText: "text-emerald-600",
    avatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    name: "Dr. Michael Brown",
    role: "Counselor",
    status: "In Session",
    statusColor: "bg-amber-500",
    statusText: "text-amber-600",
    avatar:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    name: "Sarah Johnson",
    role: "Therapist",
    status: "Online",
    statusColor: "bg-emerald-500",
    statusText: "text-emerald-600",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: 4,
    name: "Dr. David Wilson",
    role: "Psychiatrist",
    status: "Offline",
    statusColor: "bg-gray-400",
    statusText: "text-gray-500",
    avatar:
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&auto=format&fit=crop&q=80",
  },
];

// ==========================================
// DATE HELPER UTILITIES (BULLETPROOF FIX)
// ==========================================

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Safely converts Date, String, or Timestamp to standard Local midnight Date
const toLocalDate = (dateInput) => {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const formatDate = (dateInput) => {
  const d = toLocalDate(dateInput);
  if (!d) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const isSameDay = (d1Input, d2Input) => {
  const d1 = toLocalDate(d1Input);
  const d2 = toLocalDate(d2Input);
  if (!d1 || !d2) return false;
  return d1.getTime() === d2.getTime();
};

const isDateBetween = (dateInput, startInput, endInput) => {
  const d = toLocalDate(dateInput);
  const s = toLocalDate(startInput);
  const e = toLocalDate(endInput);
  if (!d || !s || !e) return false;
  return d.getTime() > s.getTime() && d.getTime() < e.getTime();
};

// ==========================================
// DATE RANGE PICKER MODAL / POPOVER COMPONENT
// ==========================================
const DateRangePickerModal = ({ isOpen, onClose, onApply, initialRange }) => {
  const [startDate, setStartDate] = useState(toLocalDate(initialRange.start));
  const [endDate, setEndDate] = useState(toLocalDate(initialRange.end));
  const [viewDate, setViewDate] = useState(() => {
    const s = toLocalDate(initialRange.start);
    return s ? new Date(s.getFullYear(), s.getMonth(), 1) : new Date();
  });
  const [activePreset, setActivePreset] = useState("Custom");
  const modalRef = useRef(null);

  // Sync state whenever modal opens or initialRange changes
  useEffect(() => {
    if (isOpen) {
      const s = toLocalDate(initialRange.start);
      const e = toLocalDate(initialRange.end);
      setStartDate(s);
      setEndDate(e);
      if (s) {
        setViewDate(new Date(s.getFullYear(), s.getMonth(), 1));
      }
    }
  }, [isOpen, initialRange]);

  // Click outside listener with minor delay to prevent immediate close on trigger click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDayClick = (dayDate) => {
    setActivePreset("Custom");
    if (!startDate || (startDate && endDate)) {
      setStartDate(dayDate);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (dayDate.getTime() < startDate.getTime()) {
        setStartDate(dayDate);
        setEndDate(null);
      } else {
        setEndDate(dayDate);
      }
    }
  };

  // Quick Preset Handlers
  const handlePresetClick = (preset) => {
    setActivePreset(preset);
    const today = toLocalDate(new Date());

    let start = new Date(today);
    let end = new Date(today);

    if (preset === "Today") {
      // Already set to today
    } else if (preset === "Yesterday") {
      start.setDate(today.getDate() - 1);
      end.setDate(today.getDate() - 1);
    } else if (preset === "Last 7 Days") {
      start.setDate(today.getDate() - 6);
    } else if (preset === "Last 30 Days") {
      start.setDate(today.getDate() - 29);
    } else if (preset === "This Month") {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (preset === "Last Month") {
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0);
    }

    setStartDate(start);
    setEndDate(end);

    // Jump calendar view to preset start date's month
    if (start) {
      setViewDate(new Date(start.getFullYear(), start.getMonth(), 1));
    }
  };

  // Generate Calendar Days Grid
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays = [];
  // Empty slots before 1st of month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(currentYear, currentMonth, day));
  }

  const handleApply = () => {
    if (startDate && endDate) {
      onApply(startDate, endDate);
      onClose();
    } else if (startDate) {
      onApply(startDate, startDate);
      onClose();
    }
  };

  return (
    <div
      ref={modalRef}
      className="absolute right-0 top-12 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 sm:p-5 w-[320px] sm:w-[540px] transition-all animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
          <FiCalendar className="text-indigo-600" /> Select Date Range
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <FiX className="text-base" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 py-4">
        {/* Presets Sidebar */}
        <div className="sm:col-span-4 border-b sm:border-b-0 sm:border-r border-slate-100 pr-0 sm:pr-3 space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Quick Select
          </p>
          {[
            "Today",
            "Yesterday",
            "Last 7 Days",
            "Last 30 Days",
            "This Month",
            "Last Month",
          ].map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetClick(preset)}
              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                activePreset === preset
                  ? "bg-indigo-50 text-indigo-600 font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Calendar Picker Grid */}
        <div className="sm:col-span-8 space-y-3">
          {/* Calendar Header */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-800">
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
              >
                <FiChevronLeft />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
            {calendarDays.map((dateItem, idx) => {
              if (!dateItem) {
                return <div key={`empty-${idx}`} />;
              }

              const isStart = isSameDay(dateItem, startDate);
              const isEnd = isSameDay(dateItem, endDate);
              const isInRange = isDateBetween(dateItem, startDate, endDate);

              let dayClasses =
                "h-8 w-full flex items-center justify-center font-medium transition-colors cursor-pointer text-slate-700 select-none ";

              if (isStart && isEnd) {
                dayClasses += "bg-indigo-600 text-white rounded-lg shadow-xs font-bold";
              } else if (isStart) {
                dayClasses +=
                  "bg-indigo-600 text-white rounded-l-lg shadow-xs font-bold";
              } else if (isEnd) {
                dayClasses +=
                  "bg-indigo-600 text-white rounded-r-lg shadow-xs font-bold";
              } else if (isInRange) {
                dayClasses += "bg-indigo-50 text-indigo-700 font-semibold";
              } else {
                dayClasses += "hover:bg-slate-100 rounded-lg";
              }

              return (
                <div
                  key={dateItem.toISOString()}
                  onClick={() => handleDayClick(dateItem)}
                  className={dayClasses}
                >
                  {dateItem.getDate()}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer / Selected Date Summary */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          <span className="font-semibold text-slate-800">
            {startDate ? formatDate(startDate) : "Start Date"}
          </span>
          {" — "}
          <span className="font-semibold text-slate-800">
            {endDate ? formatDate(endDate) : "End Date"}
          </span>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!startDate}
            className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <FiCheck /> Apply
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MAIN ANALYTICS DASHBOARD PAGE
// ==========================================
const AnalyticsAndReports = () => {
  // Initial Date State Range (May 20, 2025 - May 26, 2025)
  const [dateRange, setDateRange] = useState({
    start: new Date(2025, 4, 20),
    end: new Date(2025, 4, 26),
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleApplyDateRange = (start, end) => {
    setDateRange({ start, end });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-3 sm:p-5 lg:p-6 space-y-6 text-slate-800 w-full">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            Welcome back, Admin! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Here's what's happening with your platform today.
          </p>
        </div>

        {/* Date Filter Button & Popover Container */}
        <div className="relative w-full sm:w-auto">
          <div
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className="flex items-center justify-between sm:justify-start gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs text-xs sm:text-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-50 transition-all select-none hover:border-slate-300"
          >
            <div className="flex items-center gap-2">
              <FiCalendar className="text-indigo-600 shrink-0 text-base" />
              <span>
                {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
              </span>
            </div>
            <FiChevronDown
              className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                isDatePickerOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* Interactive Date Range Picker Popup */}
          <DateRangePickerModal
            isOpen={isDatePickerOpen}
            onClose={() => setIsDatePickerOpen(false)}
            onApply={handleApplyDateRange}
            initialRange={dateRange}
          />
        </div>
      </div>

      {/* 2. Top KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {kpiStats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={stat.id}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between gap-2 transition-shadow hover:shadow-md"
            >
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-medium text-slate-500 truncate">
                  {stat.title}
                </p>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {stat.value}
                </h3>
                <div className="flex items-center gap-1 text-[11px] font-medium flex-wrap">
                  {stat.isPositive ? (
                    <span className="text-emerald-600 flex items-center gap-0.5">
                      <FiTrendingUp className="shrink-0" /> {stat.change}
                    </span>
                  ) : (
                    <span className="text-rose-600 flex items-center gap-0.5">
                      <FiTrendingDown className="shrink-0" /> {stat.change}
                    </span>
                  )}
                  <span className="text-slate-400">vs last week</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl shrink-0 ${stat.bgColor}`}>
                <IconComponent className="text-lg sm:text-xl" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Middle Section: Overview Analytics, Support Requests, Important Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
        {/* Overview Analytics (Line Chart) */}
        <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold text-slate-900 text-sm sm:text-base">
              Overview Analytics
            </h2>
            <button className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg font-medium hover:bg-slate-200">
              This Week <FiChevronDown />
            </button>
          </div>

          {/* Chart Legends */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
              Users
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
              Content Views
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0"></span>
              Support Requests
            </div>
          </div>

          {/* Line Chart */}
          <div className="w-full overflow-x-auto pt-2">
            <div className="min-w-[280px] h-48 sm:h-52 w-full">
              <svg
                viewBox="0 0 500 150"
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                {/* Grid Lines */}
                <line x1="30" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="30" y1="50" x2="480" y2="50" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="30" y1="80" x2="480" y2="80" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="30" y1="110" x2="480" y2="110" stroke="#f1f5f9" strokeDasharray="3 3" />

                {/* Y Axis Labels */}
                <text x="0" y="25" fill="#94a3b8" fontSize="10">8K</text>
                <text x="0" y="55" fill="#94a3b8" fontSize="10">6K</text>
                <text x="0" y="85" fill="#94a3b8" fontSize="10">4K</text>
                <text x="0" y="115" fill="#94a3b8" fontSize="10">2K</text>
                <text x="5" y="140" fill="#94a3b8" fontSize="10">0</text>

                {/* Lines */}
                <path d="M 40,85 Q 110,70 180,55 T 320,65 T 470,70" fill="none" stroke="#3b82f6" strokeWidth="2.5" />
                <path d="M 40,110 Q 110,95 180,75 T 320,105 T 470,90" fill="none" stroke="#10b981" strokeWidth="2.5" />
                <path d="M 40,130 Q 110,125 180,120 T 320,128 T 470,122" fill="none" stroke="#a855f7" strokeWidth="2.5" />

                {/* X Axis Labels */}
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
                  <text key={day} x={40 + idx * 70} y="145" fill="#94a3b8" fontSize="10" textAnchor="middle">
                    {day}
                  </text>
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Support Requests (Donut Chart) */}
        <div className="lg:col-span-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm sm:text-base">
              Support Requests
            </h2>
            <button className="text-xs text-blue-600 font-medium hover:underline">
              View All
            </button>
          </div>

          <div className="flex flex-col items-center gap-4 pt-1">
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-indigo-500" strokeWidth="4" strokeDasharray="41.5, 100" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-emerald-500" strokeWidth="4" strokeDasharray="28.1, 100" strokeDashoffset="-41.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-amber-500" strokeWidth="4" strokeDasharray="17.0, 100" strokeDashoffset="-69.6" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-purple-500" strokeWidth="4" strokeDasharray="13.4, 100" strokeDashoffset="-86.6" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-bold text-slate-900">342</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total</span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-medium w-full">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0"></span>
                  <span className="text-slate-600 truncate">Counseling</span>
                </div>
                <span className="text-slate-400 text-[11px] font-semibold shrink-0">142 (41.5%)</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="text-slate-600 truncate">Information</span>
                </div>
                <span className="text-slate-400 text-[11px] font-semibold shrink-0">96 (28.1%)</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                  <span className="text-slate-600 truncate">Crisis Support</span>
                </div>
                <span className="text-slate-400 text-[11px] font-semibold shrink-0">58 (17.0%)</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0"></span>
                  <span className="text-slate-600 truncate">Technical</span>
                </div>
                <span className="text-slate-400 text-[11px] font-semibold shrink-0">46 (13.4%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Important Alerts */}
        <div className="lg:col-span-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm sm:text-base">
              Important Alerts
            </h2>
            <button className="text-xs text-blue-600 font-medium hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {importantAlerts.map((alert) => {
              const IconComp = alert.icon;
              return (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      alert.type === "danger"
                        ? "bg-rose-100 text-rose-600"
                        : alert.type === "warning"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    <IconComp className="text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold text-slate-800 truncate">
                        {alert.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {alert.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                      {alert.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid: 4 Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
        {/* Recent Support Requests */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-xs sm:text-sm">
              Recent Support Requests
            </h2>
            <button className="text-xs text-blue-600 font-medium hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {recentSupportRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-start justify-between gap-2 pb-2 border-b border-slate-50 last:border-b-0 last:pb-0"
              >
                <div className="flex items-start gap-2 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-full ${req.avatarBg} flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5`}
                  >
                    {req.initials}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-medium text-slate-800 truncate">
                      "{req.message}"
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {req.user} • {req.category}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block text-[9px] px-1.5 py-0.5 rounded-full font-medium ${req.priorityClass}`}
                  >
                    {req.priority}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {req.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Content */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-xs sm:text-sm">
              Top Performing Content
            </h2>
            <button className="text-xs text-blue-600 font-medium hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {topContent.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2.5 pb-2 border-b border-slate-50 last:border-b-0 last:pb-0"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-9 h-9 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium text-slate-800 truncate">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {item.type} • {item.category}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium shrink-0">
                  <FiEye className="text-slate-400" />
                  <span>{item.views}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Counselors */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-xs sm:text-sm">
              Active Counselors
            </h2>
            <button className="text-xs text-blue-600 font-medium hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {activeCounselors.map((counselor) => (
              <div
                key={counselor.id}
                className="flex items-center gap-2.5 pb-2 border-b border-slate-50 last:border-b-0 last:pb-0"
              >
                <div className="relative shrink-0">
                  <img
                    src={counselor.avatar}
                    alt={counselor.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-white ${counselor.statusColor}`}
                  ></span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium text-slate-800 truncate">
                    {counselor.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">
                    {counselor.role}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-medium shrink-0 ${counselor.statusText}`}
                >
                  {counselor.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4 flex flex-col justify-between">
          <h2 className="font-bold text-slate-900 text-xs sm:text-sm">
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 gap-2.5 my-auto">
            <button className="flex flex-col items-center justify-center p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors space-y-1 text-center">
              <FiPlusCircle className="text-lg" />
              <span className="text-[11px] font-medium">Add Content</span>
            </button>

            <button className="flex flex-col items-center justify-center p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors space-y-1 text-center">
              <FiUserPlus className="text-lg" />
              <span className="text-[11px] font-medium">Add Counselor</span>
            </button>

            <button className="flex flex-col items-center justify-center p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors space-y-1 text-center">
              <FiSend className="text-lg" />
              <span className="text-[11px] font-medium">Notification</span>
            </button>

            <button className="flex flex-col items-center justify-center p-3 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl transition-colors space-y-1 text-center">
              <FiBarChart2 className="text-lg" />
              <span className="text-[11px] font-medium">View Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsAndReports;