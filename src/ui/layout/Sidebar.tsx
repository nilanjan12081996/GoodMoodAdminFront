import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
// import Logo from '../images/logo/logo.svg';
// import SidebarLinkGroup from './SidebarLinkGroup';
import SidebarLinkGroup from "../layout/SidebarLinkGroup";
import { logo, smallLogo } from '../../assets/images/images';

import { AiFillSetting, AiFillTag, AiFillTags, AiOutlineDashboard, AiOutlineLogout, AiOutlineNotification, AiOutlineUser, BiLineChart, BiLineChartDown, BsPersonWorkspace, BsViewStacked, FiHome, MdManageAccounts, MdOutlineShoppingCartCheckout, MdSpaceDashboard, MdViewStream, PiClipboardTextBold, RiCoupon2Fill, RiCouponLine, RxDashboard, TfiMenuAlt } from "../../assets/icons/index";
import { FaCircle, FaFirstOrderAlt } from 'react-icons/fa';
import { MdSportsKabaddi, MdFamilyRestroom, MdSchool, MdAdminPanelSettings, MdOutlineSubscriptions, MdSubscriptions, MdTopic, MdPayment, MdClass, MdCategory } from 'react-icons/md';
import userRoles from '../../pages/utils/userRoles';
import { SiLevelsdotfyi } from "react-icons/si";
import { RiSoundModuleFill } from 'react-icons/ri';
import { GiFireZone } from "react-icons/gi";
import { CiShoppingTag } from 'react-icons/ci';
import { useDispatch } from 'react-redux';
import { dynamicSidebar } from '../../Reducer/SidebarSlice';
import { getAdminPermissions } from '../../Reducer/PermissionSlice';
import { useSelector } from 'react-redux';
interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
  );
  const { sidebarData } = useSelector((state: any) => state?.sidebars)
  const { userPermissions } = useSelector((state: any) => state?.permissions)
  const dispatch = useDispatch()



  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  const onHoverOpenSidebar = () => {
    setSidebarOpen(false);
  }
  //   const onHoverCloseSidebar = () => {
  //   setSidebarOpen(true);
  // }
  useEffect(() => {
    setSidebarOpen(true);
  }, [])

  const currentUserRole = sessionStorage.getItem("role")
  console.log("userRole", currentUserRole);
  useEffect(() => {
    if (currentUserRole === "superadmin") {
      dispatch(dynamicSidebar() as any)
    } else {
      dispatch(getAdminPermissions() as any)
    }
  }, [currentUserRole, dispatch])
  
  const displaySidebarData = currentUserRole === "superadmin" ? sidebarData?.data : userPermissions;
  console.log("displaySidebarData", displaySidebarData);

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const toggleMenu = (id: number) => {
    setOpenMenuId(prev => (prev === id ? null : id));
  };

  return (
    <aside
      ref={sidebar}
      style={{ zIndex: 1 }}
      className={`left-0 top-[50px] z-9999 flex w-72 rounded-3xl flex-col overflow-y-hidden bg-white duration-300 ease-linear absolute h-full lg:h-full min-h-[700px] shadow-xl ${sidebarOpen ? '-translate-x-full lg:static lg:w-24 lg:translate-x-0 ' : 'lg:translate-x-0 lg:static'
        }`}
      onMouseEnter={onHoverOpenSidebar}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex items-center justify-between gap-2 px-4 py-5 lg:py-[23px]">
        <NavLink className="text-center w-full" to="/manage-zone">

          {sidebarOpen ?
            <>
              <div className="text-center mb-8">
                <img src={smallLogo} alt="smallLogo" className="inline-block w-6/12" />
              </div>
            </>
            :
            <>
              <div className="text-center mb-8">
                <img src={logo} alt="logo" className="inline-block w-7/12" />
              </div>
            </>
          }

          {/* &nbsp; */}
        </NavLink>
      </div>
      {/* <!-- SIDEBAR HEADER --> */}

      <div className="sidebar_menu no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear overscroll-none">
        {/* <!-- Sidebar Menu --> */}
        <nav className="mt-0 pb-4 px-4 lg:px-0">
          {/* <!-- Menu Group --> */}
          <div>

            {/* <ul className="mb-6 flex flex-col gap-1.5">

              {
                sidebarData?.data?.map((side)=>{
                  return(
                    <>
                    <li>
                <NavLink
                  to=""
                  className={`group relative flex items-center gap-2 rounded-sm px-4 py-2 ${sidebarOpen ? 'justify-center' : 'justify-start'} font-normal text-sm text-gray-600 duration-300 ease-in-out hover:bg-graydark mb-2 ${pathname.includes('manage-category') &&
                    'bg-graydark dark:bg-meta-4'
                    }`}
                >
                  {sidebarOpen ?
                    <>
                      <MdCategory className='text-xl' />
                    </>
                    :
                    <>
                      <MdCategory className='text-xl' />
                      {side?.sidebarName}
                    </>
                  }
                </NavLink>
              </li>
                    </>
                  )
                })
              }

            </ul> */}
            <ul className="mb-6 flex flex-col gap-1.5">
              {displaySidebarData?.map((side: any) => {
                const isOpen = openMenuId === side.id;
                const hasSubmenu = side.subsidebar?.length > 0;

                return (
                  <li key={side.id}>
                    {/* Parent menu */}
                    <button
                      type="button"
                      onClick={() => hasSubmenu && toggleMenu(side.id)}
                      className={`group relative flex w-full items-center gap-2 rounded-sm px-4 py-2
                      ${sidebarOpen ? 'justify-center' : 'justify-between'}
                      font-normal text-sm text-gray-600 duration-300 ease-in-out
                      hover:bg-gray-100 mb-1`}
                    >
                      <div className="flex items-center gap-2">
                        <MdCategory className="text-xl" />
                        {!sidebarOpen && <span>{side.sidebarName}</span>}
                      </div>

                      {/* Dropdown arrow */}
                      {!sidebarOpen && hasSubmenu && (
                        <span
                          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                            }`}
                        >
                          ▼
                        </span>
                      )}
                    </button>

                    {/* Submenu */}
                    {!sidebarOpen && hasSubmenu && isOpen && (
                      <ul className="ml-8 mt-1 flex flex-col gap-1">
                        {side.subsidebar.map((sub) => (
                          <li key={sub.id}>
                            <NavLink
                              to={`/${sub.subSidebarShortName}/${sub.id}`}
                              className={({ isActive }) =>
                                `block rounded px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 ${isActive ? 'bg-gray-200 font-medium' : ''
                                }`
                              }
                            >
                              {sub.subSidebarName}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

        </nav>
        {/* <!-- Sidebar Menu --> */}
      </div>
    </aside>
  );
};

export default Sidebar;
