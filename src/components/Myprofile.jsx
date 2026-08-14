import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiAlertCircle,
  FiCalendar,
} from "react-icons/fi";
import { viewProfile } from "../Reducer/ProfileSlice";
import UserOne from "../assets/imagesource/user/user-01.png";

const Profile = () => {
  const dispatch = useDispatch();
  const { profileDetail, role, loading, error } = useSelector(
    (state) => state?.profile || {}
  );

  // Active Tab: "profile"
  const [activeTab, setActiveTab] = useState("profile");

  // Fetch Profile on Mount
  useEffect(() => {
    dispatch(viewProfile());
  }, [dispatch]);

  // Extract User Details with Fallbacks
  const userData = profileDetail || {};
  const fullName =
    `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
    "User Profile";

  return (
    <div className="min-h-screen bg-emerald-50/60 p-3 sm:p-5 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-5">
        
        {/* ================= HEADER CARD ================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100/80 overflow-hidden">
          {/* Banner */}
          <div className="h-28 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600"></div>
          
          {/* Header Content */}
          <div className="px-5 pb-5 pt-2 relative flex flex-col sm:flex-row items-center sm:items-end justify-between gap-3">
            
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              {/* Avatar */}
              <div className="relative -mt-14 shrink-0">
                <img
                  src={userData.avatar || UserOne}
                  alt={fullName}
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-md bg-white"
                />
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
              </div>

              {/* User Identity */}
              <div className="pb-1">
                <h1 className="text-xl font-bold text-gray-900">{fullName}</h1>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  @{userData.username || "username"}
                </p>
              </div>
            </div>

            {/* Role Badge */}
            {role && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-1">
                <FiShield className="w-3.5 h-3.5" />
                <span>{role}</span>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-t border-gray-100 px-5 gap-6">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                activeTab === "profile"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FiUser className="w-4 h-4" />
              Profile Details
            </button>
          </div>
        </div>

        {/* ================= TAB 1: PROFILE DETAILS ================= */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-100/80 p-5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Personal Information
                </h2>
                <p className="text-xs text-gray-500">
                  Your account credentials and details.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-10 text-center text-sm text-gray-500">
                Loading profile data...
              </div>
            ) : error ? (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2">
                <FiAlertCircle />{" "}
                {typeof error === "string" ? error : "Failed to load profile."}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    First Name
                  </label>
                  <div className="p-2.5 bg-gray-50/80 rounded-xl border border-gray-200 text-gray-900 font-medium text-xs sm:text-sm">
                    {userData.firstName || "N/A"}
                  </div>
                </div>

                {/* Last Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Last Name
                  </label>
                  <div className="p-2.5 bg-gray-50/80 rounded-xl border border-gray-200 text-gray-900 font-medium text-xs sm:text-sm">
                    {userData.lastName || "N/A"}
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Username
                  </label>
                  <div className="p-2.5 bg-gray-50/80 rounded-xl border border-gray-200 text-gray-900 font-medium text-xs sm:text-sm flex items-center gap-2">
                    <FiUser className="text-gray-400 shrink-0" />
                    {userData.username || "N/A"}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="p-2.5 bg-gray-50/80 rounded-xl border border-gray-200 text-gray-900 font-medium text-xs sm:text-sm flex items-center gap-2">
                    <FiMail className="text-gray-400 shrink-0" />
                    {userData.email || "N/A"}
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Mobile Number
                  </label>
                  <div className="p-2.5 bg-gray-50/80 rounded-xl border border-gray-200 text-gray-900 font-medium text-xs sm:text-sm flex items-center gap-2">
                    <FiPhone className="text-gray-400 shrink-0" />
                    {userData.mobile || "Not Provided"}
                  </div>
                </div>

                {/* Joined Date */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Member Since
                  </label>
                  <div className="p-2.5 bg-gray-50/80 rounded-xl border border-gray-200 text-gray-900 font-medium text-xs sm:text-sm flex items-center gap-2">
                    <FiCalendar className="text-gray-400 shrink-0" />
                    {userData.createdAt
                      ? new Date(userData.createdAt).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;