import React from 'react';
import { Link } from 'react-router-dom';
import DropdownUser from '../../components/DropdownUser';
import { IoMdArrowBack, IoMdArrowForward } from 'react-icons/io';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg0: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-transparent mb-2 shrink-0">
      <div className="flex items-center gap-3">
        {/* Toggle Button */}
        <button
          aria-controls="sidebar"
          onClick={(e) => {
            e.stopPropagation();
            setSidebarOpen(!sidebarOpen);
          }}
          className="rounded-lg bg-[#52B69A] hover:bg-[#0B8843] p-1.5 text-white shadow-sm transition-all flex items-center justify-center shrink-0 cursor-pointer"
          title={sidebarOpen ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {sidebarOpen ? (
            <IoMdArrowForward className="text-xl" />
          ) : (
            <IoMdArrowBack className="text-xl" />
          )}
        </button>

        {/* Dashboard Title & Subtitle */}
        <Link className="block" to="/">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">Dashboard</h1>
          <p className="text-xs text-gray-500 font-normal">Welcome to Good Mood Admin Dashboard</p>
        </Link>
      </div>

      {/* User Dropdown */}
      <div className="flex items-center gap-3">
        <DropdownUser />
      </div>
    </div>
  );
};

export default Header;
