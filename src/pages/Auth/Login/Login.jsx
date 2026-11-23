import { useNavigate } from "react-router-dom";
import { logo } from "../../../assets/images/images";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { login, loginAdmin, verifyOtp } from "../../../Reducer/AuthSlice";
import { getAdminPermissions } from "../../../Reducer/PermissionSlice";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";

import AfterLoginModal from "./AfterLoginModal";
import Otp from "./Otp";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [id, setId] = useState();
  const [otpValue, setOtpValue] = useState();

  const { loadingLogin } = useSelector((state) => state?.auth);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: "superadmin",
    },
  });

  useEffect(() => {
    const savedUsername = Cookies.get("usernameOrEmail");
    const savedPassword = Cookies.get("password");

    if (savedUsername && savedPassword) {
      setValue("usernameOrEmail", savedUsername);
      setValue("password", savedPassword);
    }
  }, [setValue]);

  const onSubmit = (data) => {
    setErrorMessage("");

    // STEP 1: LOGIN
    if (!id) {
      if (data?.role === "superadmin") {
        dispatch(login(data)).then((res) => {
          if (res?.payload?.statusCode === 200) {
            setId(res?.payload?.data?.id); // show OTP screen
            setOtpValue(res?.payload?.data?.otp);
          } else if (res?.payload?.response?.data?.status_code === 400) {
            setErrorMessage(res?.payload?.response?.data?.message || "Login failed");
          } else if (res?.payload?.status === 422) {
            setErrorMessage(
              res?.payload?.response?.data?.data?.[0]?.message ||
                res?.payload?.response?.data?.message ||
                "Validation error"
            );
          } else {
            setErrorMessage(
              res?.payload?.message ||
                res?.payload?.response?.data?.message ||
                "Invalid credentials. Please try again."
            );
          }
        });
      } else if (data?.role === "admin") {
        const payload = {
          username: data.usernameOrEmail,
          password: data.password,
        };
        dispatch(loginAdmin(payload)).then((res) => {
          if (res?.payload?.statusCode === 200) {
            dispatch(getAdminPermissions()).then((permRes) => {
              const sidebars = permRes?.payload?.data;
              if (sidebars && sidebars.length > 0) {
                const firstSidebar = sidebars[0];
                if (firstSidebar.subsidebar && firstSidebar.subsidebar.length > 0) {
                  const firstSub = firstSidebar.subsidebar[0];
                  navigate(`/${firstSub.subSidebarShortName}/${firstSub.id}`);
                } else {
                  navigate("/MoodMeters/1");
                }
              } else {
                navigate("/MoodMeters/1");
              }
            });
          } else {
            setErrorMessage(
              res?.payload?.message ||
                res?.payload?.response?.data?.message ||
                "Invalid username or password"
            );
          }
        });
      }
    }
    // STEP 2: VERIFY OTP
    else {
      const payload = {
        id: id,
        otp: data.otp,
      };

      dispatch(verifyOtp(payload)).then((res) => {
        if (res?.payload?.statusCode === 200) {
          navigate("/MoodMeters/1");
        } else {
          setErrorMessage(
            res?.payload?.response?.data?.message ||
              res?.payload?.message ||
              "Invalid OTP. Please check and try again."
          );
        }
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f2fbf5] via-[#f8fafc] to-[#eef9f2] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Decorative ambient background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-200/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-200/35 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Login Card */}
      <div className="relative w-full max-w-[450px] bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_20px_60px_-15px_rgba(11,136,67,0.12)] border border-gray-100 p-8 sm:p-10 transition-all z-10">
        
        {/* Brand Logo */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-100/60 mb-3 shadow-xs">
            <img src={logo} alt="Good Mood Logo" className="h-12 w-auto object-contain" />
          </div>
          <h1 className="text-2xl sm:text-[25px] font-bold text-gray-900 tracking-tight">
            Sign In to Your Account
          </h1>
          <p className="text-xs sm:text-[13px] text-gray-500 mt-1">
            Welcome back! Enter your credentials to access the admin portal.
          </p>
        </div>

        {/* Error Alert Message */}
        {errorMessage && errorMessage.trim() && (
          <div className="mb-5 p-3.5 bg-red-50/90 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2.5 shadow-xs animate-in fade-in">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {id ? (
            <Otp
              register={register}
              errors={errors}
              otpValue={otpValue}
              setValue={setValue}
              onBack={() => {
                setId(null);
                setErrorMessage("");
              }}
            />
          ) : (
            <>
              {/* User Name Field */}
              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1.5">
                  Your User Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    id="username"
                    className="w-full pl-10 pr-3.5 py-3 bg-gray-50/90 hover:bg-white focus:bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B8843]/20 focus:border-[#0B8843] transition-all"
                    placeholder="Enter Your User Name"
                    {...register("usernameOrEmail", { required: "User Name is required" })}
                  />
                </div>
                {errors.usernameOrEmail && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    {errors.usernameOrEmail.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1.5">
                  Your Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="w-full pl-10 pr-11 py-3 bg-gray-50/90 hover:bg-white focus:bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B8843]/20 focus:border-[#0B8843] transition-all"
                    placeholder="Password"
                    {...register("password", { required: "Password is required" })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Select Role */}
              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1.5">
                  Select Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <ShieldCheck size={18} />
                  </div>
                  <select
                    className="w-full pl-10 pr-10 py-3 bg-gray-50/90 hover:bg-white focus:bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B8843]/20 focus:border-[#0B8843] transition-all cursor-pointer"
                    {...register("role", { required: "Role is required" })}
                  >
                    <option value="superadmin">Super Admin</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {errors.role && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    {errors.role.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loadingLogin}
                  className="w-full py-3.5 px-4 bg-[#0B8843] hover:bg-[#086a34] text-white font-semibold text-sm md:text-base rounded-xl shadow-md hover:shadow-lg hover:shadow-emerald-900/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loadingLogin ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <span>Log In</span>
                  )}
                </button>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 rounded text-[#0B8843] border-gray-300 focus:ring-[#0B8843] focus:ring-offset-0 cursor-pointer accent-[#0B8843]"
                    {...register("rememberMe")}
                  />
                  <span>Remember me!</span>
                </label>
              </div>
            </>
          )}
        </form>
      </div>

      {/* Subtle Copyright Footer */}
      <p className="text-center text-xs text-gray-400 mt-6 relative z-10">
        © {new Date().getFullYear()} Good Mood Solutions. All rights reserved.
      </p>

      {openModal && (
        <AfterLoginModal openModal={openModal} setOpenModal={setOpenModal} />
      )}
    </div>
  );
};

export default Login;
