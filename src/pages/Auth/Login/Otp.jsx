import { useEffect } from "react";
import { useSelector } from "react-redux";
import { KeyRound, ArrowLeft, Loader2 } from "lucide-react";

const Otp = ({ register, errors, otpValue, setValue, onBack }) => {
  const { loading } = useSelector((state) => state?.auth);

  useEffect(() => {
    if (otpValue) {
      setValue("otp", otpValue);
    }
  }, [otpValue, setValue]);

  return (
    <div className="space-y-4">
      <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-800 leading-relaxed text-center">
        We have generated an OTP for your session verification. Please enter it below to proceed.
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1.5">
          Enter Your OTP
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <KeyRound size={18} />
          </div>
          <input
            type="text"
            id="otp"
            className="w-full pl-10 pr-3.5 py-3 bg-gray-50/90 hover:bg-white focus:bg-white border border-gray-200 rounded-xl text-sm font-semibold tracking-wider text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B8843]/20 focus:border-[#0B8843] transition-all text-center"
            placeholder="Enter OTP"
            {...register("otp", { required: "OTP is required" })}
          />
        </div>
        {errors.otp && (
          <p className="text-xs text-red-500 mt-1 font-medium text-center">
            {errors.otp.message}
          </p>
        )}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 bg-[#0B8843] hover:bg-[#086a34] text-white font-semibold text-sm md:text-base rounded-xl shadow-md hover:shadow-lg hover:shadow-emerald-900/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Verifying OTP...</span>
            </>
          ) : (
            <span>Verify & Continue</span>
          )}
        </button>
      </div>

      {onBack && (
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Sign In
          </button>
        </div>
      )}
    </div>
  );
};

export default Otp;
