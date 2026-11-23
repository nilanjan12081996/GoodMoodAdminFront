import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BiSolidUser, BiSolidContact, AiFillSetting, AiOutlineLogout } from "../assets/icons/index";

import UserOne from '../assets/imagesource/user/user-01.png';
import { useDispatch } from 'react-redux';
import { logout } from '../Reducer/AuthSlice';
import { Base64 } from 'js-base64';
import { viewProfile } from '../Reducer/ProfileSlice';
import { useSelector } from 'react-redux';

const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const { profileDetail, role } = useSelector((state: any) => state.profile);

  const trigger = useRef<any>(null);
  const dropdown = useRef<any>(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdown.current) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  const dispatch = useDispatch()
  const handleLogout = () => {
    dispatch(logout())
    navigate("/");
  };
  // const userName = localStorage.getItem('adminType')
  // const decodedUserName = Base64.decode(userName)
  // const parseUserName = JSON.parse(decodedUserName)

  useEffect(() => {
    dispatch(viewProfile() as any)
  }, [dispatch]);


  return (
    <div className="relative z-50">
      <Link
        ref={trigger}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4"
        to="#"
      >
        <span className="hidden text-right lg:block">
          <span className="block text-xs font-medium text-black">
            {profileDetail ? `${profileDetail.firstName} ${profileDetail.lastName}` : 'User Name'}
          </span>
          <span className="block text-xs text-gray-400">
            {role || 'Admin'}
          </span>
        </span>

        <span className="h-10 w-10 rounded-full overflow-hidden border border-gray-200">
          <img
            src={profileDetail?.avatar ? profileDetail?.avatar : UserOne}
            alt="User"
            className="h-full w-full object-cover"
          />
        </span>

        <svg
          className={`hidden fill-current sm:block ${dropdownOpen ? 'rotate-180' : ''
            }`}
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.410765 0.910734C0.736202 0.585297 1.26384 0.585297 1.58928 0.910734L6.00002 5.32148L10.4108 0.910734C10.7362 0.585297 11.2638 0.585297 11.5893 0.910734C11.9147 1.23617 11.9147 1.76381 11.5893 2.08924L6.58928 7.08924C6.26384 7.41468 5.7362 7.41468 5.41077 7.08924L0.410765 2.08924C0.0853277 1.76381 0.0853277 1.23617 0.410765 0.910734Z"
            fill=""
          />
        </svg>
      </Link>

      {/* <!-- Dropdown Start --> */}
      <div
        ref={dropdown}
        onFocus={() => setDropdownOpen(true)}
        onBlur={() => setDropdownOpen(false)}
        className={`absolute right-0 mt-3 flex w-56 flex-col rounded-xl border border-gray-100 bg-white shadow-2xl z-[9999] py-1.5 transition-all ${
          dropdownOpen === true ? 'block' : 'hidden'
        }`}
      >
        <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
          <p className="text-xs font-semibold text-gray-900 truncate">
            {profileDetail ? `${profileDetail.firstName} ${profileDetail.lastName}` : 'Administrator'}
          </p>
          <p className="text-[11px] text-gray-400 capitalize">
            {role || 'System SuperAdmin'}
          </p>
        </div>

        <ul className="flex flex-col py-1 border-b border-gray-100">
          <li>
            <Link
              to="/profile"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#0B8843] hover:bg-emerald-50/60 transition-colors"
            >
              <BiSolidUser className="text-lg text-gray-400" />
              My Profile
            </Link>
          </li>
        </ul>
        <div className="pt-1">
          <button
            onClick={() => {
              setDropdownOpen(false);
              handleLogout();
            }}
            className="flex items-center gap-2.5 w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <AiOutlineLogout className="text-lg text-red-500" />
            Log Out
          </button>
        </div>
      </div>
      {/* <!-- Dropdown End --> */}
    </div>
  );
};

export default DropdownUser;
