import React, { useEffect, useState } from "react";
import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import api from "../../store/Api";
import { showToast } from "../../utils/Toaster";
import {
  IoShieldCheckmarkOutline,
  IoConstructOutline,
  IoArrowBack,
  IoPhonePortraitOutline,
  IoSaveOutline,
  IoRefreshOutline,
  IoPersonOutline,
  IoMedkitOutline,
  IoSearchOutline,
  IoAddOutline,
  IoTrashOutline,
  IoCloseOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";

const MaintenanceToggleSwitch = ({ checked, onChange, disabled }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={Boolean(checked)}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex items-center shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      style={{
        width: "50px",
        height: "26px",
        backgroundColor: checked ? "#f59e0b" : "#e5e7eb",
        border: checked ? "1px solid #d97706" : "1px solid #d1d5db",
        padding: "2px",
        borderRadius: "9999px",
        position: "relative",
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: "20px",
          height: "20px",
          backgroundColor: "#ffffff",
          borderRadius: "9999px",
          position: "absolute",
          top: "2px",
          left: checked ? "26px" : "3px",
          transition: "left 0.2s ease-in-out",
          boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
        }}
      />
    </button>
  );
};

const CUSTOMER_PRESETS = [
  {
    label: "Under Development (2 Days)",
    text: "Good Mood is currently under active development. We will be back online in 2 days with exciting new features!",
  },
  {
    label: "Scheduled Maintenance",
    text: "Good Mood is currently under scheduled maintenance. Please check back shortly.",
  },
  {
    label: "Server Optimization",
    text: "We are currently performing server and performance optimization. Service will resume shortly.",
  },
  {
    label: "App Upgrade",
    text: "A major update is currently in progress. We will be back shortly with a smoother experience!",
  },
];

const DOCTOR_PRESETS = [
  {
    label: "Under Development (2 Days)",
    text: "Doctor Portal is currently under development. We will be back online in 2 days with improved clinical tools!",
  },
  {
    label: "Scheduled Maintenance",
    text: "Doctor Portal is currently under scheduled maintenance. Please check back shortly.",
  },
  {
    label: "Consultation System Upgrade",
    text: "We are currently upgrading our consultation and appointment servers. Normal services will resume shortly.",
  },
  {
    label: "System Optimization",
    text: "Doctor services are undergoing routine maintenance. Thank you for your patience, we'll be back online shortly.",
  },
];

const AppMaintenance = () => {
  const navigate = useNavigate();

  // Customer App State
  const [customerMaintenance, setCustomerMaintenance] = useState(false);
  const [customerMessage, setCustomerMessage] = useState(
    "Good Mood is currently under scheduled maintenance. Please check back shortly."
  );
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);

  // Doctor App State
  const [doctorMaintenance, setDoctorMaintenance] = useState(false);
  const [doctorMessage, setDoctorMessage] = useState(
    "Doctor Portal is currently under scheduled maintenance. Please check back shortly."
  );
  const [loadingDoctor, setLoadingDoctor] = useState(false);
  const [savingDoctor, setSavingDoctor] = useState(false);

  // Tester Management State (Both Customer App & Doctor App)
  const [testers, setTesters] = useState([]);
  const [loadingTesters, setLoadingTesters] = useState(false);
  const [testerTab, setTesterTab] = useState("all"); // 'all' | 'customer' | 'doctor'
  const [addType, setAddType] = useState("customer"); // 'customer' | 'doctor'
  const [addIdentifier, setAddIdentifier] = useState("");
  const [addingTester, setAddingTester] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const fetchTesters = async () => {
    setLoadingTesters(true);
    try {
      const res = await api.get('/goodmood/users/testers?type=all');
      if (res?.data?.status) {
        setTesters(res.data.testers || []);
      }
    } catch (e) {
      console.error("Failed to fetch testers:", e);
    } finally {
      setLoadingTesters(false);
    }
  };

  const handleAddTester = async (e) => {
    if (e) e.preventDefault();
    if (!addIdentifier.trim()) {
      showToast("Please enter a mobile number or email", "warning");
      return;
    }
    setAddingTester(true);
    try {
      const res = await api.post('/goodmood/users/testers/add', {
        identifier: addIdentifier.trim(),
        type: addType,
      });
      if (res?.data?.status) {
        showToast(res.data.message || "Tester added successfully!", "success");
        setAddIdentifier("");
        fetchTesters();
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || "Failed to add tester. Please verify mobile or email.";
      showToast(errMsg, "error");
    } finally {
      setAddingTester(false);
    }
  };

  const handleToggleTester = async (tester) => {
    setTogglingId(`${tester.type}-${tester.id}`);
    try {
      const res = await api.post('/goodmood/users/testers/toggle', {
        id: tester.id,
        type: tester.type,
        isTester: !tester.isTester,
      });
      if (res?.data?.status) {
        showToast(
          !tester.isTester
            ? `${tester.name || 'Account'} granted tester access`
            : `${tester.name || 'Account'} tester access removed`,
          "success"
        );
        fetchTesters();
        if (searchQuery.trim().length >= 2) {
          handleSearch(searchQuery);
        }
      }
    } catch (err) {
      showToast("Failed to update tester status", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.get(`/goodmood/users/testers/search?query=${encodeURIComponent(query.trim())}&type=all`);
      if (res?.data?.status) {
        setSearchResults(res.data.results || []);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchMaintenanceStates = async () => {
    try {
      const resCustomer = await api.get('/goodmood/users/maintenance-status');
      if (resCustomer?.data?.status) {
        setCustomerMaintenance(Boolean(resCustomer.data.maintenance));
        if (resCustomer.data.message) {
          setCustomerMessage(resCustomer.data.message);
        }
      }
    } catch (e) {
      console.error("Failed to fetch customer maintenance state:", e);
    }

    try {
      const resDoctor = await api.get('/goodmood/users/doctor-maintenance-status');
      if (resDoctor?.data?.status) {
        setDoctorMaintenance(Boolean(resDoctor.data.maintenance));
        if (resDoctor.data.message) {
          setDoctorMessage(resDoctor.data.message);
        }
      }
    } catch (e) {
      console.error("Failed to fetch doctor maintenance state:", e);
    }
  };

  useEffect(() => {
    fetchMaintenanceStates();
    fetchTesters();
  }, []);

  // Customer Toggle Switch
  const handleToggleCustomerMaintenance = async () => {
    const nextVal = !customerMaintenance;
    setLoadingCustomer(true);
    try {
      const res = await api.post('/goodmood/users/maintenance-toggle', {
        enabled: nextVal,
        message: customerMessage.trim(),
      });
      if (res?.data?.status) {
        setCustomerMaintenance(Boolean(res.data.maintenance));
        showToast(
          nextVal
            ? "Customer App maintenance mode is now ACTIVE"
            : "Customer App maintenance mode turned OFF (LIVE)",
          "success"
        );
      }
    } catch (e) {
      showToast("Failed to update Customer app maintenance mode", "error");
    } finally {
      setLoadingCustomer(false);
    }
  };

  // Customer Save Message Only
  const handleSaveCustomerMessage = async () => {
    if (!customerMessage.trim()) {
      showToast("Please enter a maintenance message", "warning");
      return;
    }
    setSavingCustomer(true);
    try {
      const res = await api.post('/goodmood/users/maintenance-toggle', {
        enabled: customerMaintenance,
        message: customerMessage.trim(),
      });
      if (res?.data?.status) {
        showToast("Customer App maintenance notice updated successfully", "success");
      }
    } catch (e) {
      showToast("Failed to save maintenance message", "error");
    } finally {
      setSavingCustomer(false);
    }
  };

  // Doctor Toggle Switch
  const handleToggleDoctorMaintenance = async () => {
    const nextVal = !doctorMaintenance;
    setLoadingDoctor(true);
    try {
      const res = await api.post('/goodmood/users/doctor-maintenance-toggle', {
        enabled: nextVal,
        message: doctorMessage.trim(),
      });
      if (res?.data?.status) {
        setDoctorMaintenance(Boolean(res.data.maintenance));
        showToast(
          nextVal
            ? "Doctor App maintenance mode is now ACTIVE"
            : "Doctor App maintenance mode turned OFF (LIVE)",
          "success"
        );
      }
    } catch (e) {
      showToast("Failed to update Doctor app maintenance mode", "error");
    } finally {
      setLoadingDoctor(false);
    }
  };

  // Doctor Save Message Only
  const handleSaveDoctorMessage = async () => {
    if (!doctorMessage.trim()) {
      showToast("Please enter a maintenance message", "warning");
      return;
    }
    setSavingDoctor(true);
    try {
      const res = await api.post('/goodmood/users/doctor-maintenance-toggle', {
        enabled: doctorMaintenance,
        message: doctorMessage.trim(),
      });
      if (res?.data?.status) {
        showToast("Doctor App maintenance notice updated successfully", "success");
      }
    } catch (e) {
      showToast("Failed to save maintenance message", "error");
    } finally {
      setSavingDoctor(false);
    }
  };

  return (
    <div className="wrapper_area my-0 mx-auto p-4 sm:p-6 lg:p-8 rounded-2xl bg-white max-w-7xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <IoConstructOutline className="text-[#52B69A] text-2xl" />
            App Maintenance Modes
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Safely control public accessibility and set dynamic maintenance messages shown in the mobile apps.
          </p>
        </div>
        <Button
          color="gray"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-100"
        >
          <IoArrowBack className="text-base" /> Back
        </Button>
      </div>

      {/* Control Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* ================= CUSTOMER APP CARD ================= */}
        <div
          className={`p-6 rounded-2xl border transition-all ${
            customerMaintenance
              ? "bg-amber-50/40 border-amber-300 shadow-sm"
              : "bg-gray-50/60 border-gray-200"
          } flex flex-col justify-between`}
        >
          <div>
            {/* Card Header & Toggle */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-200/80 mb-5">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  customerMaintenance ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-[#0B8843]"
                }`}>
                  <IoPhonePortraitOutline className="text-xl" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Customer Mobile App</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 ${
                        customerMaintenance
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${customerMaintenance ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                      {customerMaintenance ? "MAINTENANCE (Blocked)" : "LIVE (Normal)"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className={`text-xs font-bold ${customerMaintenance ? "text-amber-600" : "text-gray-400"}`}>
                  {customerMaintenance ? "ON" : "OFF"}
                </span>
                <MaintenanceToggleSwitch
                  checked={customerMaintenance}
                  onChange={handleToggleCustomerMaintenance}
                  disabled={loadingCustomer}
                />
              </div>
            </div>

            {/* Dynamic Notice Editor */}
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-800">
                  Dynamic Maintenance Message:
                </label>
                <span className="text-[11px] text-gray-400">
                  {customerMessage.length} characters
                </span>
              </div>

              {/* Presets */}
              <div className="mb-2.5">
                <p className="text-[11px] font-semibold text-gray-500 mb-1.5">Quick Presets / Templates:</p>
                <div className="flex flex-wrap gap-1.5">
                  {CUSTOMER_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCustomerMessage(preset.text)}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-gray-100 hover:bg-[#52B69A]/15 hover:text-[#0B8843] hover:border-[#52B69A] border border-gray-200 text-gray-700 font-medium transition-all cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
                rows={3}
                placeholder="Enter custom maintenance notice for customers..."
                className="w-full text-xs text-gray-800 p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#52B69A] focus:border-[#52B69A] resize-none outline-none leading-relaxed transition-all"
              />

              {/* Action Button */}
              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100">
                <span className="text-[11px] text-gray-500 italic">
                  Changes will show in real-time in the mobile app.
                </span>
                <button
                  type="button"
                  onClick={handleSaveCustomerMessage}
                  disabled={savingCustomer}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#52B69A] hover:bg-[#0B8843] px-3.5 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingCustomer ? (
                    <>
                      <IoRefreshOutline className="text-sm animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <IoSaveOutline className="text-sm" /> Save Notice
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= DOCTOR APP CARD ================= */}
        <div
          className={`p-6 rounded-2xl border transition-all ${
            doctorMaintenance
              ? "bg-amber-50/40 border-amber-300 shadow-sm"
              : "bg-gray-50/60 border-gray-200"
          } flex flex-col justify-between`}
        >
          <div>
            {/* Card Header & Toggle */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-200/80 mb-5">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  doctorMaintenance ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-[#0B8843]"
                }`}>
                  <IoShieldCheckmarkOutline className="text-xl" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Doctor Mobile App</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 ${
                        doctorMaintenance
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${doctorMaintenance ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                      {doctorMaintenance ? "MAINTENANCE (Blocked)" : "LIVE (Normal)"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className={`text-xs font-bold ${doctorMaintenance ? "text-amber-600" : "text-gray-400"}`}>
                  {doctorMaintenance ? "ON" : "OFF"}
                </span>
                <MaintenanceToggleSwitch
                  checked={doctorMaintenance}
                  onChange={handleToggleDoctorMaintenance}
                  disabled={loadingDoctor}
                />
              </div>
            </div>

            {/* Dynamic Notice Editor */}
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-800">
                  Dynamic Maintenance Message:
                </label>
                <span className="text-[11px] text-gray-400">
                  {doctorMessage.length} characters
                </span>
              </div>

              {/* Presets */}
              <div className="mb-2.5">
                <p className="text-[11px] font-semibold text-gray-500 mb-1.5">Quick Presets / Templates:</p>
                <div className="flex flex-wrap gap-1.5">
                  {DOCTOR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setDoctorMessage(preset.text)}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-gray-100 hover:bg-[#52B69A]/15 hover:text-[#0B8843] hover:border-[#52B69A] border border-gray-200 text-gray-700 font-medium transition-all cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={doctorMessage}
                onChange={(e) => setDoctorMessage(e.target.value)}
                rows={3}
                placeholder="Enter custom maintenance notice for doctors..."
                className="w-full text-xs text-gray-800 p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#52B69A] focus:border-[#52B69A] resize-none outline-none leading-relaxed transition-all"
              />

              {/* Action Button */}
              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100">
                <span className="text-[11px] text-gray-500 italic">
                  Changes will show in real-time in the doctor app.
                </span>
                <button
                  type="button"
                  onClick={handleSaveDoctorMessage}
                  disabled={savingDoctor}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#52B69A] hover:bg-[#0B8843] px-3.5 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingDoctor ? (
                    <>
                      <IoRefreshOutline className="text-sm animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <IoSaveOutline className="text-sm" /> Save Notice
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tester Accounts Management (Both Customer App & Doctor App) */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200/80 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-emerald-50/40 to-teal-50/20">
          <div>
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <IoShieldCheckmarkOutline className="text-emerald-600 text-xl" />
              Tester Accounts (Maintenance Bypass)
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Mark accounts as <strong>Tester</strong> so developers, testers, and app review teams can log in and test even when Maintenance Mode is ON.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchTesters}
            disabled={loadingTesters}
            className="self-start md:self-auto inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            <IoRefreshOutline className={`text-sm ${loadingTesters ? "animate-spin" : ""}`} />
            Refresh Testers
          </button>
        </div>

        {/* Quick Add Tester Form & Search */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Quick Add by Mobile / Email */}
            <form onSubmit={handleAddTester} className="lg:col-span-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative shrink-0">
                <select
                  value={addType}
                  onChange={(e) => setAddType(e.target.value)}
                  className="w-full sm:w-auto text-xs font-semibold bg-white border border-gray-300 text-gray-700 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#52B69A] focus:border-[#52B69A] outline-none cursor-pointer"
                >
                  <option value="customer">Customer App User</option>
                  <option value="doctor">Doctor App Doctor</option>
                </select>
              </div>
              <input
                type="text"
                value={addIdentifier}
                onChange={(e) => setAddIdentifier(e.target.value)}
                placeholder="Enter mobile number or email..."
                className="grow text-xs text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#52B69A] focus:border-[#52B69A] outline-none"
              />
              <button
                type="submit"
                disabled={addingTester}
                className="shrink-0 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#52B69A] hover:bg-[#0B8843] px-4 py-2.5 rounded-lg transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                {addingTester ? (
                  <>
                    <IoRefreshOutline className="text-sm animate-spin" /> Adding...
                  </>
                ) : (
                  <>
                    <IoAddOutline className="text-base" /> Add as Tester
                  </>
                )}
              </button>
            </form>

            {/* Search Any Account */}
            <div className="lg:col-span-5 relative">
              <div className="relative">
                <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Find user/doctor by name, phone, email..."
                  className="w-full text-xs text-gray-800 bg-white border border-gray-300 rounded-lg pl-8 pr-8 py-2 focus:ring-2 focus:ring-[#52B69A] focus:border-[#52B69A] outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <IoCloseOutline className="text-base" />
                  </button>
                )}
              </div>

              {/* Instant Search Results Dropdown */}
              {searchQuery.trim().length >= 2 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-30 max-h-60 overflow-y-auto p-2">
                  {isSearching ? (
                    <div className="p-3 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                      <IoRefreshOutline className="animate-spin text-sm" /> Searching accounts...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-3 text-center text-xs text-gray-500">
                      No registered user or doctor matched "{searchQuery}"
                    </div>
                  ) : (
                    searchResults.map((acc) => (
                      <div
                        key={`${acc.type}-${acc.id}`}
                        className="p-2.5 hover:bg-gray-50 rounded-lg flex items-center justify-between gap-3 border-b border-gray-50 last:border-0"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                            acc.type === "doctor" ? "bg-teal-600" : "bg-[#52B69A]"
                          }`}>
                            {acc.name?.charAt(0)?.toUpperCase() || (acc.type === "doctor" ? "D" : "U")}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">
                              {acc.name || "Unnamed"}
                              <span className={`ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                acc.type === "doctor" ? "bg-teal-100 text-teal-800" : "bg-emerald-100 text-emerald-800"
                              }`}>
                                {acc.type === "doctor" ? "Doctor" : "Customer"}
                              </span>
                            </p>
                            <p className="text-[11px] text-gray-500 truncate">{acc.mobile} • {acc.email || "No email"}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleTester(acc)}
                          disabled={togglingId === `${acc.type}-${acc.id}`}
                          className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                            acc.isTester
                              ? "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
                              : "bg-[#52B69A] text-white hover:bg-[#0B8843]"
                          }`}
                        >
                          {togglingId === `${acc.type}-${acc.id}` ? (
                            "Updating..."
                          ) : acc.isTester ? (
                            "Remove Tester"
                          ) : (
                            "+ Mark as Tester"
                          )}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter Tabs & Count */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTesterTab("all")}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                testerTab === "all"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Testers ({testers.length})
            </button>
            <button
              type="button"
              onClick={() => setTesterTab("customer")}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                testerTab === "customer"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Customer App ({testers.filter((t) => t.type === "customer").length})
            </button>
            <button
              type="button"
              onClick={() => setTesterTab("doctor")}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                testerTab === "doctor"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Doctor App ({testers.filter((t) => t.type === "doctor").length})
            </button>
          </div>
          <span className="text-[11px] text-gray-500 hidden sm:inline">
            Active bypass authorized accounts
          </span>
        </div>

        {/* Testers List Table */}
        <div className="overflow-x-auto">
          {loadingTesters ? (
            <div className="p-8 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
              <IoRefreshOutline className="animate-spin text-base" /> Loading tester accounts...
            </div>
          ) : testers.filter((t) => (testerTab === "all" ? true : t.type === testerTab)).length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600">
                <IoShieldCheckmarkOutline className="text-2xl" />
              </div>
              <p className="text-sm font-bold text-gray-700">No tester accounts added yet</p>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                Enter a registered mobile number or email above and click "+ Add as Tester" so that user or doctor can test during maintenance mode.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3 px-5">User / Doctor</th>
                  <th className="py-3 px-5">Mobile Number</th>
                  <th className="py-3 px-5">App Platform</th>
                  <th className="py-3 px-5">Bypass Access</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {testers
                  .filter((t) => (testerTab === "all" ? true : t.type === testerTab))
                  .map((tester) => (
                    <tr key={`${tester.type}-${tester.id}`} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                            tester.type === "doctor" ? "bg-teal-600" : "bg-[#52B69A]"
                          }`}>
                            {tester.name?.charAt(0)?.toUpperCase() || (tester.type === "doctor" ? "D" : "U")}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{tester.name || "Unnamed"}</div>
                            <div className="text-[11px] text-gray-500">{tester.email || "No email"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-5 font-mono text-gray-800">
                        {tester.mobile || "—"}
                      </td>
                      <td className="py-3 px-5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          tester.type === "doctor"
                            ? "bg-teal-50 text-teal-700 border border-teal-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}>
                          {tester.type === "doctor" ? (
                            <>
                              <IoMedkitOutline className="text-xs" /> Doctor Mobile App
                            </>
                          ) : (
                            <>
                              <IoPhonePortraitOutline className="text-xs" /> Customer Mobile App
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                          <IoCheckmarkCircleOutline className="text-xs" /> Bypass Enabled
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleTester(tester)}
                          disabled={togglingId === `${tester.type}-${tester.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                        >
                          <IoTrashOutline className="text-sm" />
                          {togglingId === `${tester.type}-${tester.id}` ? "Removing..." : "Remove Tester"}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppMaintenance;
