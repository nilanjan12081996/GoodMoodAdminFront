import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { logo, smallLogo } from '../../assets/images/images';
import { MdCategory } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { dynamicSidebar } from '../../Reducer/SidebarSlice';
import { getAdminPermissions } from '../../Reducer/PermissionSlice';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { pathname } = location;
  const dispatch = useDispatch();

  const sidebar = useRef<any>(null);

  const { sidebarData } = useSelector((state: any) => state?.sidebars);
  const { userPermissions } = useSelector((state: any) => state?.permissions);
  const { unreadCounts } = useSelector((state: any) => state?.notifications || { unreadCounts: {} });

  const currentUserRole = sessionStorage.getItem("role");

  useEffect(() => {
    if (currentUserRole === "superadmin") {
      dispatch(dynamicSidebar() as any);
    } else {
      dispatch(getAdminPermissions() as any);
    }
  }, [currentUserRole, dispatch]);

  const displaySidebarData = currentUserRole === "superadmin" ? sidebarData?.data : userPermissions;

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const toggleMenu = (id: number) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const getNotificationCount = (name: string) => {
    if (!name || !unreadCounts) return 0;
    const normalizedName = name.trim();
    if (normalizedName === "Appointment") return unreadCounts.APPOINTMENT || 0;
    if (normalizedName === "User Registration") return unreadCounts.USER_REGISTRATION || 0;
    if (normalizedName === "Expert Registration") return unreadCounts.DOCTOR_REGISTRATION || 0;
    if (normalizedName === "Payment") return unreadCounts.PAYMENT || 0;
    return 0;
  };

  return (
    <aside
      ref={sidebar}
      className={`relative z-20 flex flex-col h-full rounded-2xl bg-white shadow-md duration-300 ease-in-out shrink-0 overflow-hidden ${
        sidebarOpen ? 'w-20' : 'w-64 lg:w-72'
      }`}
    >
      {/* <!-- SIDEBAR LOGO HEADER --> */}
      <div className="flex items-center justify-center px-4 py-4 border-b border-gray-100 shrink-0">
        <NavLink className="block text-center w-full" to="/manage-zone">
          {sidebarOpen ? (
            <img src={smallLogo} alt="smallLogo" className="h-8 w-auto mx-auto object-contain" />
          ) : (
            <img src={logo} alt="logo" className="h-9 w-auto mx-auto object-contain" />
          )}
        </NavLink>
      </div>

      {/* <!-- SCROLLABLE SIDEBAR MENU (Only inner list scrolls) --> */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-3 px-3">
        <nav>
          <ul className="flex flex-col gap-1.5">
            {displaySidebarData?.map((side: any) => {
              const isOpen = openMenuId === side.id;
              const hasSubmenu = side.subsidebar && side.subsidebar.length > 0;

              return (
                <li key={side.id} className="relative">
                  {/* Parent Menu Item */}
                  <button
                    type="button"
                    onClick={() => hasSubmenu && toggleMenu(side.id)}
                    className={`group relative flex w-full items-center rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 ${
                      sidebarOpen ? 'justify-center' : 'justify-between'
                    } ${
                      isOpen
                        ? 'bg-emerald-50 text-[#0B8843]'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    title={sidebarOpen ? side.sidebarName : undefined}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <MdCategory
                        className={`text-lg shrink-0 ${
                          isOpen ? 'text-[#0B8843]' : 'text-gray-500 group-hover:text-gray-700'
                        }`}
                      />
                      {!sidebarOpen && (
                        <span className="truncate tracking-wide">{side.sidebarName}</span>
                      )}
                    </div>

                    {/* Arrow Indicator */}
                    {!sidebarOpen && hasSubmenu && (
                      <span
                        className={`text-[10px] text-gray-400 transition-transform duration-200 shrink-0 ml-1.5 ${
                          isOpen ? 'rotate-180 text-[#0B8843]' : ''
                        }`}
                      >
                        ▼
                      </span>
                    )}
                  </button>

                  {/* Submenu List */}
                  {!sidebarOpen && hasSubmenu && isOpen && (
                    <ul className="ml-4 pl-3.5 my-1 border-l-2 border-emerald-100 flex flex-col gap-1">
                      {side.subsidebar.map((sub: any) => {
                        const notifCount = getNotificationCount(sub.subSidebarName);
                        return (
                          <li key={sub.id}>
                            <NavLink
                              to={`/${sub.subSidebarShortName}/${sub.id}`}
                              className={({ isActive }) =>
                                `flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors duration-150 ${
                                  isActive
                                    ? 'bg-[#52B69A] text-white font-semibold shadow-xs'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium'
                                }`
                              }
                            >
                              <span className="truncate">{sub.subSidebarName}</span>
                              {notifCount > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full flex items-center justify-center min-w-[18px]">
                                  {notifCount}
                                </span>
                              )}
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
