import { Link, useNavigate } from "react-router-dom";
import { logo } from "../../../assets/images/images";
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { login, loginAdmin, verifyOtp } from "../../../Reducer/AuthSlice";
import { getAdminPermissions } from "../../../Reducer/PermissionSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";

import AfterLoginModal from "./AfterLoginModal";
import { Checkbox, Label, Select } from "flowbite-react";
import { useSelector } from "react-redux";
import Otp from "./Otp";

const Login = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState(" ");
  const [openModal, setOpenModal] = useState(false);
  const [id, setId] = useState();
  const [otpValue, setOtpValue] = useState();

  const { loadingLogin } = useSelector((state) => state?.auth);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const savedUsername = Cookies.get("usernameOrEmail");
    const savedPassword = Cookies.get("password");

    if (savedUsername && savedPassword) {
      setValue("usernameOrEmail", savedUsername);
      setValue("password", savedPassword);
    }
  }, [setValue]);

  const onSubmit = (data) => {
    console.log("form data:", data);

    // STEP 1: LOGIN
    if (!id) {
      if (data?.role === "superadmin") {
        dispatch(login(data)).then((res) => {
          if (res?.payload?.statusCode === 200) {
            setId(res?.payload?.data?.id); // show OTP screen
            setOtpValue(res?.payload?.data?.otp);
          } else if (res?.payload?.response?.data?.status_code === 400) {
            setErrorMessage(res?.payload?.response?.data?.message);
          } else if (res?.payload?.status === 422) {
            setErrorMessage(
              res?.payload?.response?.data?.data?.[0]?.message ||
                res?.payload?.response?.data?.message
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
            dispatch(getAdminPermissions()).then((res) => {
              const sidebars = res?.payload?.data;
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
              res?.payload?.message || "Invalid username or password"
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
        console.log("res", res);

        if (res?.payload?.statusCode === 200) {
          navigate("/MoodMeters/1");
        } else {
          setErrorMessage(
            res?.payload?.response?.data?.message || "Invalid OTP"
          );
        }
      });
    }
  };

  return (
    // CHANGED: Replaced wrapper layout to center content horizontally & vertically on a full-height pure white page
    <div className="min-h-screen w-full bg-white flex justify-center items-center p-4">
      
      {/* CHANGED: Removed the 'w-6/12' split wrappers and centered form inside a responsive max-w-md container */}
      <div className="w-full max-w-md mx-auto">
        
        {/* Logo Header */}
        <div className="text-center mb-8">
          <img src={logo} alt="logo" className="inline-block w-6/12" />
        </div>
        
        {/* CHANGED: Reduced padding-bottom for tighter vertical alignment */}
        <h1 className="text-center font-medium text-[25px] leading-[35px] text-black pb-8">
          Sign In to Your Account
        </h1>

        <div className="login_area">
          {errorMessage && (
            <h6 className="text-[#ff1a03] text-center mb-4">
              {errorMessage}
            </h6>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {id ? (
              <Otp
                register={register}
                errors={errors}
                otpValue={otpValue}
                setValue={setValue}
              />
            ) : (
              <>
                <div className="mb-6">
                  <Label className="text-[15px] text-[#6C6B6B] font-normal pb-2 block">
                    Your User Name
                  </Label>
                  <input
                    type="text"
                    id="email"
                    className="bg-white border border-[#dfdfdf] text-[#888888] text-sm rounded-lg focus:ring-[#f1d9ff] focus:border-[#f1d9ff] block w-full py-3 px-3"
                    placeholder="Enter Your User Name"
                    {...register("usernameOrEmail", { required: true })}
                  />
                  {errors.usernameOrEmail && (
                    <small className="text-red-500">
                      User Name is required
                    </small>
                  )}
                </div>

                <div className="mb-6">
                  <Label className="text-[15px] text-[#6C6B6B] font-normal pb-2 block">
                    Your Password
                  </Label>
                  <input
                    placeholder="Password"
                    type="password"
                    id="password"
                    className="bg-white border border-[#dfdfdf] text-[#888888] text-sm rounded-lg focus:ring-[#f1d9ff] focus:border-[#f1d9ff] block w-full py-3 px-3"
                    {...register("password", { required: true })}
                  />
                  {errors.password && (
                    <small className="text-red-500">
                      Password is required
                    </small>
                  )}
                </div>

                <div className="mb-6">
                  <Label className="text-[15px] text-[#6C6B6B] font-normal pb-2 block">
                    Select Role
                  </Label>
                  <Select {...register("role", { required: true })}>
                    <option value="superadmin">Super Admin</option>
                    <option value="admin">Admin</option>
                  </Select>
                  {errors.role && (
                    <small className="text-red-500">
                      Role is required
                    </small>
                  )}
                </div>

                {/* CHANGED: Added 'rounded-lg' for better button edge styling */}
                <button
                  type="submit"
                  className="text-white bg-[#52B69A] font-Manrope font-extrabold text-[23px] mb-2 hover:bg-black focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-xl w-full px-5 py-3 text-center"
                >
                  {loadingLogin ? "Wait..." : "Log In"}
                </button>

                <div className="flex justify-between mb-2">
                  <div className="flex items-center">
                    <div className="flex items-center gap-1">
                      <Checkbox id="remember" {...register("rememberMe")} />
                      <Label
                        htmlFor="remember"
                        className="text-[#615D5D] font-normal text-sm"
                      >
                        Remember me!
                      </Label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </form>
        </div>
      </div>

      {/* CHANGED: Removed the right-side 6/12 div column containing LoginImg */}

      {openModal && (
        <AfterLoginModal openModal={openModal} setOpenModal={setOpenModal} />
      )}
    </div>
  );
};

export default Login;

// import { Link, useNavigate } from "react-router-dom";
// import { LoginImg, logo } from "../../../assets/images/images";
// import { FcGoogle } from "react-icons/fc";
// import { useDispatch } from "react-redux";
// import { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { login, loginAdmin, verifyOtp } from "../../../Reducer/AuthSlice";
// import { getAdminPermissions } from "../../../Reducer/PermissionSlice";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import Cookies from "js-cookie";

// import AfterLoginModal from "./AfterLoginModal";
// import { Checkbox, Label, Select } from "flowbite-react";
// import { useSelector } from "react-redux";
// import Otp from "./Otp";

// const Login = () => {
//   const navigate = useNavigate();

//   const dispatch = useDispatch();
//   const [errorMessage, setErrorMessage] = useState(" ");
//   const [openModal, setOpenModal] = useState(false);
//   const [id,setId]=useState()
//   const[otpValue,setOtpValue]=useState()

//   const { loadingLogin } = useSelector((state) => state?.auth);

//   const {
//     register,
//     handleSubmit,
//     watch,
//     setValue,
//     formState: { errors },
//   } = useForm();

  

//   useEffect(() => {
//     const savedUsername = Cookies.get("usernameOrEmail");
//     const savedPassword = Cookies.get("password");

//     if (savedUsername && savedPassword) {
//       setValue("usernameOrEmail", savedUsername);
//       setValue("password", savedPassword);
//     }
//   }, [setValue]);

 
//   const onSubmit = (data) => {
//   console.log("form data:", data);

//   // STEP 1: LOGIN
//   if (!id) {
//     if (data?.role === "superadmin") {
//       dispatch(login(data)).then((res) => {
//         if (res?.payload?.statusCode === 200) {
//           setId(res?.payload?.data?.id); // show OTP screen
//           setOtpValue(res?.payload?.data?.otp)
//         } else if (res?.payload?.response?.data?.status_code === 400) {
//           setErrorMessage(res?.payload?.response?.data?.message);
//         } else if (res?.payload?.status === 422) {
//           setErrorMessage(
//             res?.payload?.response?.data?.data?.[0]?.message ||
//               res?.payload?.response?.data?.message
//           );
//         }
//       });
//     } else if (data?.role === "admin") {
//       const payload = {
//         username: data.usernameOrEmail,
//         password: data.password,
//       };
//       dispatch(loginAdmin(payload)).then((res) => {
//         if (res?.payload?.statusCode === 200) {
        
//           dispatch(getAdminPermissions()).then((res) => {
//             const sidebars = res?.payload?.data;
//             if (sidebars && sidebars.length > 0) {
//               const firstSidebar = sidebars[0];
//               if (firstSidebar.subsidebar && firstSidebar.subsidebar.length > 0) {
//                 const firstSub = firstSidebar.subsidebar[0];
//                 navigate(`/${firstSub.subSidebarShortName}/${firstSub.id}`);
//               } else {
//                 // If there's no sub-sidebar, you might want to handle it differently
//                 // For now, redirect to a default or show an error
//                 navigate("/MoodMeters/1");
//               }
//             } else {
//               navigate("/MoodMeters/1");
//             }
//           });
//         } else {
//           setErrorMessage(
//             res?.payload?.message || "Invalid username or password"
//           );
//         }
//       });
//     }
//   }

//   // STEP 2: VERIFY OTP
//   else {
//     const payload = {
//       id: id,
//       otp: data.otp,
//     };

//     dispatch(verifyOtp(payload)).then((res) => {
//       console.log("res",res);
      
//       if (res?.payload?.statusCode === 200) {
//         // success action
//         //setOpenModal(true);
//         // OR
//          navigate("/MoodMeters/1");
//       } else {
//         setErrorMessage(
//           res?.payload?.response?.data?.message || "Invalid OTP"
//         );
//       }
//     });
//   }
// };

  
  
//   return (
//     <div className="my-0 lg:my-0 mx-4 lg:mx-0 flex justify-center items-center wrapper_bg_area">
//       <div className="w-full my-0 mx-auto">
//         <div className="flex h-screen">
//           <div className="w-6/12 flex justify-center items-center">
//             <div className="w-7/12">
//               <div className="text-center mb-10">
//                 <img src={logo} alt="logo" className="inline-block w-7/12" />
//               </div>
//               <h1 className="text-center font-medium text-[25px] leading-[45px] text-black pb-12">
//                 Sign In to Your Account
//               </h1>
//               <div className="login_area">
//                 {errorMessage && (
//                   <h6 className="text-[#ff1a03] text-center mb-4">
//                     {errorMessage}
//                   </h6>
//                 )}

//                 <form onSubmit={handleSubmit(onSubmit)}>
//                   {
//                     id?(
//                       <Otp
//                       register={register}
//                       errors={errors}
//                       otpValue={otpValue}
//                       setValue={setValue}
//                       />
//                     ):(
//                         <>
//                            <div className="mb-6">
//                     <Label className="text-[15px] text-[#6C6B6B] font-normal pb-2 block">
//                       Your User Name
//                     </Label>
//                     <input
//                       type="text"
//                       id="email"
//                       className="bg-white border border-[#dfdfdf] text-[#888888] text-sm rounded-lg focus:ring-[#f1d9ff] focus:border-[#f1d9ff] block w-full py-3 px-3"
//                       placeholder="Enter Your User Name"
//                       {...register("usernameOrEmail", { required: true })}
//                     />
//                     {errors.usernameOrEmail && (
//                       <small className="text-red-500">
//                         User Name is required
//                       </small>
//                     )}
//                   </div>
//                   <div className="mb-6">
                   
//                     <Label className="text-[15px] text-[#6C6B6B] font-normal pb-2 block">
//                       Your Password
//                     </Label>
//                     <input
//                       placeholder="Password"
//                       type="password"
//                       id="password"
//                       className="bg-white border border-[#dfdfdf] text-[#888888] text-sm rounded-lg focus:ring-[#f1d9ff] focus:border-[#f1d9ff] block w-full py-3 px-3"
//                       {...register("password", { required: true })}
//                     />
//                     {errors.password && (
//                       <small className="text-red-500">
//                         Password is required
//                       </small>
//                     )}
//                   </div>

//                     <div className="mb-6">
                   
//                     <Label className="text-[15px] text-[#6C6B6B] font-normal pb-2 block">
//                       Select Role
//                     </Label>
                   
//                    <Select {...register("role",{required:true})}>
//                     <option value="superadmin">Super Admin</option>
//                     <option value="admin">Admin</option>
//                    </Select>
//                     {errors.role && (
//                       <small className="text-red-500">
//                         Role is required
//                       </small>
//                     )}
//                   </div>

//                   <button
//                     type="submit"
//                     className="text-white bg-[#52B69A] font-Manrope font-extrabold text-[23px] mb-2 hover:bg-black focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-0 text-xl w-full px-5 py-3 text-center"
//                   >
//                     {loadingLogin ? "Wait..." : "Log In"}
//                   </button>
//                   <div className="flex justify-between mb-2">
//                     <div className="flex items-center">
//                       <div className="flex items-center gap-1">
//                         <Checkbox id="remember" {...register("rememberMe")} />
//                         <Label
//                           htmlFor="remember"
//                           className="text-[#615D5D] font-normal text-sm"
//                         >
//                           Remember me!
//                         </Label>
//                       </div>
//                     </div>
//                     {/* <div className="hidden md:block">
//                       <Link
//                         className="text-[#3e57da] text-sm font-normal hover:text-black"
//                         to="/forgot-password"
//                       >
//                         Forgot Password?
//                       </Link>
//                     </div> */}
//                   </div>
//                         </>
//                     )
//                   }
               
//                 </form>
//                 {/* <div className="break_area relative">
//                   <p className="text-[#BABABA] text-[22px] uppercase bg-white px-4 relative z-10 text-center w-[100px] mx-auto">
//                     Or
//                   </p>
//                 </div> */}
//                 {/* <div className="break_area relative pt-2 pb-2">
//                   <p className="text-[#525252] text-sm leading-[22px] px-4 relative z-10 text-center w-[160px] mx-auto bg-white">
//                     Or Continue With
//                   </p>
//                 </div> */}
//                 {/* <div className="flex justify-center items-center mt-4">
//                   <div className="flex justify-center items-center border border-[#747474] px-4 py-2 rounded-md">
//                     <FcGoogle className="text-2xl mr-1.5" />
//                     <p className="text-black text-base">Google</p>
//                   </div>
//                 </div> */}

//                 {/* <div className="text-center mt-10">
//                   <p className="text-[#615D5D] text-sm">
//                     Don’t have an account?{" "}
//                     <Link
//                       to="/register"
//                       className="text-[#000000] hover:text-[#615D5D]"
//                     >
//                       Sign Up
//                     </Link>
//                   </p>
//                 </div> */}
//               </div>
//             </div>
//           </div>
//           <div
//             className="w-6/12 bg-cover"
//             style={{ backgroundImage: `url("${LoginImg}")` }}
//           >
//             &nbsp;
//           </div>
//         </div>
//       </div>
//       {openModal && (
//         <AfterLoginModal openModal={openModal} setOpenModal={setOpenModal} />
//       )}
//     </div>
//   );
// };

// export default Login;
