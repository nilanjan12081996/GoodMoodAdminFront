import { Label } from "flowbite-react"
import { useEffect } from "react"
import { useSelector } from "react-redux"

const Otp=({register,errors,otpValue,setValue})=>{
    const{loading}=useSelector((state)=>state?.auth)
    useEffect(()=>{
      setValue("otp",otpValue)
    },[otpValue])
    return(
        <>
                                <div className="mb-6">
                                <Label className="text-[15px] text-[#6C6B6B] font-normal pb-2 block">
                                  Enter Your OTP
                                </Label>
                                <input
                                  type="text"
                                  id="email"
                                  className="bg-white border border-[#dfdfdf] text-[#888888] text-sm rounded-lg focus:ring-[#f1d9ff] focus:border-[#f1d9ff] block w-full py-3 px-3"
                                  placeholder="Enter Your OTP"
                                  {...register("otp", { required: true })}
                                />
                                {errors.otp && (
                                  <small className="text-red-500">
                                   OTP is required
                                  </small>
                                )}
                              </div>

                              <button
                                type="submit"
                                className="text-white bg-[#52B69A] font-Manrope font-extrabold text-[23px] mb-2 hover:bg-black focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-0 text-xl w-full px-5 py-3 text-center"
                            >
                    {loading ? "Wait..." : "Verify OTP"}
                  </button>
        </>
    )
}
export default Otp