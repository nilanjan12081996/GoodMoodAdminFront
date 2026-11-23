import React, { useCallback, useEffect } from "react";

import { Checkbox, Pagination, Table, ToggleSwitch } from "flowbite-react";
import { useState } from "react";
import { visaIcon } from "../../assets/images/images";
import { CiSearch } from "react-icons/ci";
import { useDispatch } from "react-redux";
import {
  loginToUser,
  searchUser,
  userList,
  userStatus,
} from "../../Reducer/TransactionSlice";
import { useSelector } from "react-redux";
import { formatDate } from "../../utils/FormatData";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Base64 } from "js-base64";
import debounce from "lodash.debounce";
import AddUserModal from "./AddUserModal";
import api from "../../store/Api";

const Transaction = () => {
  // const [switch1, setSwitch1] = useState(false);
  const dispatch = useDispatch();
  const nevigate = useNavigate();
  const [totalPage, setTotalPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [openAddNewProjectModal, setOpenAddNewProjectModal] = useState(false);
  const [maintenanceActive, setMaintenanceActive] = useState(false);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [testerLoadingId, setTesterLoadingId] = useState(null);
  const { userListData, userStatusData, userSearchData } = useSelector(
    (state) => state?.transaction
  );
  console.log("userList", userListData);
  console.log("userStatusData", userStatusData);
  const [searchInput, setSearchInput] = useState("");

  const fetchMaintenanceStatus = async () => {
    try {
      const res = await api.get('/goodmood/users/maintenance-status');
      if (res?.data?.status) {
        setMaintenanceActive(res.data.maintenance);
      }
    } catch (e) {
      console.log('Error fetching maintenance status', e);
    }
  };

  const handleToggleMaintenance = async () => {
    setMaintenanceLoading(true);
    try {
      const res = await api.post('/goodmood/users/maintenance-toggle', {
        enabled: !maintenanceActive
      });
      if (res?.data?.status) {
        setMaintenanceActive(res.data.maintenance);
        toast.success(res.data.message);
      }
    } catch (e) {
      toast.error('Failed to update maintenance mode');
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const handleToggleTester = async (userId, currentIsTester) => {
    setTesterLoadingId(userId);
    try {
      const res = await api.post(`/goodmood/users/toggle-tester/${userId}`, {
        isTester: !currentIsTester
      });
      if (res?.data?.status) {
        toast.success(res.data.message);
        dispatch(
          userList({
            page: currentPage,
            limit: 10,
          })
        );
      }
    } catch (e) {
      toast.error('Failed to update tester status');
    } finally {
      setTesterLoadingId(null);
    }
  };

  useEffect(() => {
    fetchMaintenanceStatus();
  }, []);
  useEffect(() => {
    dispatch(
      userList({
        page: currentPage,
        limit: 10,
      })
    ).then((res) => {
      console.log("res", res);
      const total = res?.payload?.total_page;
      setTotalPage(Number.isInteger(total) && total > 0 ? total : 1);
    });
  }, [currentPage, limit]);
  const onPageChange = (page) => {
    setCurrentPage(page);
  };
  console.log("userSearchData");

  const handleToggle = (userid) => {
    console.log("userid", userid);
    dispatch(userStatus({ id: userid })).then((res) => {
      console.log("res", res);
      if (res?.payload?.status_code === 200) {
        toast.success(res?.payload?.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          progress: undefined,
          theme: "light",
        });
        dispatch(
          userList({
            page: currentPage,
            limit: 10,
          })
        );
      } else {
        toast.error(res?.payload?.response?.data?.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          progress: undefined,
          theme: "dark",
        });
      }
    });
  };

  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query.trim()) {
        dispatch(searchUser({ content: query })).then((res) => {
          // if (res?.payload?.status_code === 200) {
          //   toast.success("Search results loaded", { position: "top-right" });
          // } else {
          //   toast.error("Failed to fetch search results", {
          //     position: "top-right",
          //   });
          // }
        });
      }
    }, 500),
    [dispatch]
  );

  // const handleInputChange = (e) => {
  //   const value = e.target.value;
  //   setSearchInput(value);
  //   debouncedSearch(value);
  // };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    if (value.trim() === "") {
      // Fetch all users if search input is cleared
      dispatch(userList());
    } else {
      // Call debounced search for other input
      debouncedSearch(value);
    }
  };
  const handleAddUser = () => {
    setOpenAddNewProjectModal(true);
  };
  const handleWallet = (id) => {
    nevigate(`/user-wallet/${id}`);
  };
  const handleVideo = (id) => {
    nevigate(`/user-video/${id}`);
  };
  const handleTransaction = (id) => {
    nevigate(`/user-transaction/${id}`);
  };
  return (
    <div>
      <ToastContainer />
      <div className="wrapper_area my-0 mx-auto p-6 rounded-xl bg-white">
        <div className="h-full lg:h-screen">
          {/* Customer App Maintenance Mode Control Card */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl mb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`inline-block w-3 h-3 rounded-full ${maintenanceActive ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                <h3 className="font-bold text-gray-800 text-base">Customer App Maintenance Mode</h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${maintenanceActive ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {maintenanceActive ? 'ACTIVE (Public Blocked)' : 'NORMAL (Public Allowed)'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {maintenanceActive 
                  ? 'General users see the Maintenance screen. Only users marked as Tester can log in and test the app.' 
                  : 'All users can freely access the Good Mood app.'}
              </p>
            </div>
            <button
              onClick={handleToggleMaintenance}
              disabled={maintenanceLoading}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                maintenanceActive 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' 
                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
              }`}
            >
              {maintenanceLoading ? 'Updating...' : (maintenanceActive ? 'Turn OFF Maintenance' : 'Turn ON Maintenance')}
            </button>
          </div>

          <div className="flex justify-between mb-4">
            <div className="w-full max-w-sm min-w-[200px]">
              {/* <div className="relative">
                <input
                  className="w-full bg-[#F9EFFF] placeholder:text-black text-black text-[15px] border border-[#AB54DB] rounded-md pl-3 pr-28 py-2.5 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                  placeholder="Search..."
                  value={searchInput}
                  onChange={handleInputChange}
                />
                <button
                  className="absolute top-1 right-1 flex items-center rounded py-1 px-2.5 border border-transparent text-center text-2xl text-black transition-all focus:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                  type="button"
                >
                  <CiSearch />
                </button>
              </div> */}
            </div>
            {/* <div>
              <button
                onClick={() => handleAddUser()}
                className="bg-[#AB54DB] hover:bg-black px-6 py-2 text-white text-base font-semibold flex justify-center items-center rounded-md"
              >
                Add User
              </button>
            </div> */}
          </div>
          <div className="overflow-x-auto  max-h-[800px]">
            <Table hoverable>
              <Table.Head>
                {/* <Table.HeadCell className="bg-[#F9EFFF]">
                  Order ID
                </Table.HeadCell> */}
                <Table.HeadCell className="bg-[#f3f2f7] rounded-tl-lg">
                  Full Name
                </Table.HeadCell>
                <Table.HeadCell className="bg-[#f3f2f7]">
                  Email ID
                </Table.HeadCell>
                <Table.HeadCell className="bg-[#f3f2f7]">Mobile</Table.HeadCell>
                <Table.HeadCell className="bg-[#f3f2f7]">Tester Account</Table.HeadCell>
                <Table.HeadCell className="bg-[#f3f2f7]">Status</Table.HeadCell>
                <Table.HeadCell className="bg-[#f3f2f7]">Wallet</Table.HeadCell>
                <Table.HeadCell className="bg-[#f3f2f7]">
                  Transaction
                </Table.HeadCell>
                <Table.HeadCell className="bg-[#f3f2f7] rounded-tr-lg">
                  Videos
                </Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y ">
                {userListData?.data?.map((userData) => (
                  <Table.Row
                    key={userData?.id}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800 border-b border-[#DFDFDF]"
                  >
                    <Table.Cell>
                      {userData?.first_name} {userData?.last_name}
                    </Table.Cell>
                    <Table.Cell>{userData?.email}</Table.Cell>
                    <Table.Cell>{userData?.phone}</Table.Cell>
                    <Table.Cell>
                      <button
                        onClick={() => handleToggleTester(userData?.id, userData?.is_tester === 1 || userData?.is_tester === true)}
                        disabled={testerLoadingId === userData?.id}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          userData?.is_tester === 1 || userData?.is_tester === true
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${userData?.is_tester === 1 || userData?.is_tester === true ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                        {userData?.is_tester === 1 || userData?.is_tester === true ? 'Tester User' : 'Normal User'}
                      </button>
                    </Table.Cell>
                    <Table.Cell>
                      <ToggleSwitch
                        checked={userData?.is_active === 1}
                        label=""
                        onChange={() => handleToggle(userData?.id)}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <button
                        onClick={() => handleWallet(userData?.id)}
                        className="bg-[#52b69a]  p-2 rounded-lg text-white"
                      >
                        View Details
                      </button>
                    </Table.Cell>
                    <Table.Cell>
                      <button
                        onClick={() => handleTransaction(userData?.id)}
                        className="bg-[#52b69a]  p-2 rounded-lg text-white"
                      >
                        View Details
                      </button>
                    </Table.Cell>
                    <Table.Cell>
                      <button
                        onClick={() => handleVideo(userData?.id)}
                        className="bg-[#52b69a]  p-2 rounded-lg text-white"
                      >
                        View Details
                      </button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
          {userListData?.total_page > 1 && (
            <div className="flex justify-center items-center mt-4 pagination_sec">
              <Pagination
                layout="pagination"
                currentPage={currentPage}
                totalPages={totalPage}
                onPageChange={onPageChange}
                previousLabel=""
                nextLabel=""
                showIcons
              />
            </div>
          )}
        </div>
      </div>
      {openAddNewProjectModal && (
        <AddUserModal
          openAddNewProjectModal={openAddNewProjectModal}
          setOpenAddNewProjectModal={setOpenAddNewProjectModal}
        />
      )}
    </div>
  );
};

export default Transaction;
