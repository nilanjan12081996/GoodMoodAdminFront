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
  FiSettings,
  FiLock,
  FiCheckCircle,
  FiSave,
} from "react-icons/fi";
import {
  getProfile,
  updateProfileName,
  changePassword,
  clearMessages,
} from "../Reducer/MyprofileSlice";
import UserOne from "../assets/imagesource/user/user-01.png";

const Profile = () => {
  const dispatch = useDispatch();
  const { profileDetail, role, loading, passwordLoading, error, successMessage } =
    useSelector((state) => state?.profile || {});

  // Active Tab: "profile" or "settings"
  const [activeTab, setActiveTab] = useState("profile");

  // Form for Name Update
  const {
    register: registerName,
    handleSubmit: handleNameSubmit,
    reset: resetNameForm,
    formState: { errors: nameErrors, isSubmitting: isNameSubmitting },
  } = useForm();

  // Form for Password Change
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    watch,
    formState: { errors: passwordErrors },
  } = useForm();

  const newPasswordValue = watch("newPassword");

  // Fetch Profile on Mount
  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  // Reset Name Form when profileDetail updates
  useEffect(() => {
    if (profileDetail) {
      resetNameForm({
        firstName: profileDetail.firstName || "",
        lastName: profileDetail.lastName || "",
      });
    }
  }, [profileDetail, resetNameForm]);

  // Handle Tab Change & Clear Messages
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    dispatch(clearMessages());
  };

  // Submit Handlers
  const onUpdateNameSubmit = (data) => {
    dispatch(updateProfileName(data));
  };

  const onChangePasswordSubmit = (data) => {
    dispatch(
      changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
    ).then((res) => {
      if (!res.error) {
        resetPasswordForm();
      }
    });
  };

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
              onClick={() => handleTabChange("profile")}
              className={`flex items-center gap-2 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                activeTab === "profile"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FiUser className="w-4 h-4" />
              Profile Details
            </button>
            <button
              onClick={() => handleTabChange("settings")}
              className={`flex items-center gap-2 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                activeTab === "settings"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FiSettings className="w-4 h-4" />
              Account Settings
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            <FiCheckCircle className="shrink-0" />
            {successMessage}
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2">
            <FiAlertCircle className="shrink-0" />
            {typeof error === "string" ? error : error?.message || "An error occurred."}
          </div>
        )}

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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    First Name
                  </label>
                  <div className="p-2.5 bg-gray-50/80 rounded-xl border border-gray-200 text-gray-900 font-medium text-xs sm:text-sm">
                    {userData.firstName || "N/A"}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Last Name
                  </label>
                  <div className="p-2.5 bg-gray-50/80 rounded-xl border border-gray-200 text-gray-900 font-medium text-xs sm:text-sm">
                    {userData.lastName || "N/A"}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Username
                  </label>
                  <div className="p-2.5 bg-gray-50/80 rounded-xl border border-gray-200 text-gray-900 font-medium text-xs sm:text-sm flex items-center gap-2">
                    <FiUser className="text-gray-400 shrink-0" />
                    {userData.username || "N/A"}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="p-2.5 bg-gray-50/80 rounded-xl border border-gray-200 text-gray-900 font-medium text-xs sm:text-sm flex items-center gap-2">
                    <FiMail className="text-gray-400 shrink-0" />
                    {userData.email || "N/A"}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <div className="p-2.5 bg-gray-50/80 rounded-xl border border-gray-200 text-gray-900 font-medium text-xs sm:text-sm flex items-center gap-2">
                    <FiPhone className="text-gray-400 shrink-0" />
                    {userData.mobile || "Not Provided"}
                  </div>
                </div>

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

        {/* ================= TAB 2: ACCOUNT SETTINGS ================= */}
        {activeTab === "settings" && (
          <div className="space-y-5">
            {/* Update Profile Name Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100/80 p-5 space-y-4">
              <div className="pb-3 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">
                  Update Name
                </h2>
                <p className="text-xs text-gray-500">
                  Change your first and last name.
                </p>
              </div>

              <form onSubmit={handleNameSubmit(onUpdateNameSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      First Name
                    </label>
                    <input
                      type="text"
                      {...registerName("firstName", { required: "First name is required" })}
                      className="w-full p-2.5 bg-white rounded-xl border border-gray-200 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="First Name"
                    />
                    {nameErrors.firstName && (
                      <span className="text-red-500 text-[10px]">
                        {nameErrors.firstName.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      Last Name
                    </label>
                    <input
                      type="text"
                      {...registerName("lastName", { required: "Last name is required" })}
                      className="w-full p-2.5 bg-white rounded-xl border border-gray-200 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Last Name"
                    />
                    {nameErrors.lastName && (
                      <span className="text-red-500 text-[10px]">
                        {nameErrors.lastName.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isNameSubmitting}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    <FiSave className="w-4 h-4" />
                    {isNameSubmitting ? "Saving..." : "Save Name"}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100/80 p-5 space-y-4">
              <div className="pb-3 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">
                  Change Password
                </h2>
                <p className="text-xs text-gray-500">
                  Ensure your account is using a secure password.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit(onChangePasswordSubmit)} className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      Current Password
                    </label>
                    <input
                      type="password"
                      {...registerPassword("currentPassword", {
                        required: "Current password is required",
                      })}
                      className="w-full p-2.5 bg-white rounded-xl border border-gray-200 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="••••••••"
                    />
                    {passwordErrors.currentPassword && (
                      <span className="text-red-500 text-[10px]">
                        {passwordErrors.currentPassword.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      New Password
                    </label>
                    <input
                      type="password"
                      {...registerPassword("newPassword", {
                        required: "New password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      className="w-full p-2.5 bg-white rounded-xl border border-gray-200 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="••••••••"
                    />
                    {passwordErrors.newPassword && (
                      <span className="text-red-500 text-[10px]">
                        {passwordErrors.newPassword.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      {...registerPassword("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === newPasswordValue || "Passwords do not match",
                      })}
                      className="w-full p-2.5 bg-white rounded-xl border border-gray-200 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="••••••••"
                    />
                    {passwordErrors.confirmPassword && (
                      <span className="text-red-500 text-[10px]">
                        {passwordErrors.confirmPassword.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    <FiLock className="w-4 h-4" />
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;