import { AgGridReact } from "ag-grid-react";
import { Button } from "flowbite-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import {
  fetchBannerById,
  fetchBanners,
  toggleBannerStatus,
  deleteBanner,
} from "../../Reducer/BannerSlice";

import AddBannerModal from "./AddBannerModal";
import UpdateBannerModal from "./UpdateBannerModal";
import { isPackageBanner } from "./packageConstants";

const resolveImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const rawBase = import.meta.env.VITE_API_BASE_URL || "https://newadminapigoodmood.goodmood.solutions/api/";
  const baseUrl = rawBase.replace("/api/", "").replace(/\/$/, "");
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

const ManageBanner = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { bannerList, currentBanner } = useSelector((state) => state?.banner || {});

  const [activeTab, setActiveTab] = useState("normal"); // "normal" | "package"
  const [openAddBannerModal, setOpenAddBannerModal] = useState(false);
  const [openUpdateBannerModal, setOpenUpdateBannerModal] = useState(false);
  const [selectedBannerId, setSelectedBannerId] = useState(null);

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  const normalBanners = useMemo(() => {
    return (bannerList || []).filter((b) => !isPackageBanner(b));
  }, [bannerList]);

  const packageBanners = useMemo(() => {
    return (bannerList || []).filter((b) => isPackageBanner(b));
  }, [bannerList]);

  const currentList = activeTab === "normal" ? normalBanners : packageBanners;

  const rowData = useMemo(() => {
    return (
      currentList?.map((banner, index) => ({
        id: banner?.id || banner?._id,
        slNo: index + 1,
        title: banner?.title || banner?.name || "N/A",
        description: banner?.description || "N/A",
        image: banner?.image || banner?.banner_image || banner?.imageUrl || "",
        status: banner?.status === "active" || banner?.status === 1 || banner?.status === true,
      })) || []
    );
  }, [currentList]);

  const handleUpdateBanner = (id) => {
    setSelectedBannerId(id);
    dispatch(fetchBannerById(id));
    setOpenUpdateBannerModal(true);
  };

  const handleDeleteBanner = (id) => {
    const label = activeTab === "normal" ? "banner" : "package banner";
    if (window.confirm(`Are you sure you want to delete this ${label}?`)) {
      dispatch(deleteBanner(id)).then((res) => {
        if (res?.meta?.requestStatus === "fulfilled") {
          toast.success("Deleted successfully!");
          dispatch(fetchBanners());
        } else {
          toast.error(res?.payload?.message || "Failed to delete.");
        }
      });
    }
  };

  const columnDefs = useMemo(
    () => [
      {
        field: "title",
        headerName: activeTab === "normal" ? "Banner Title" : "Package Name",
        sortable: true,
        filter: true,
        flex: 1.5,
      },
      {
        field: "image",
        headerName: activeTab === "normal" ? "Banner Image" : "Package Banner Image",
        flex: 1.2,
        cellRenderer: (params) => {
          const imgUrl = resolveImageUrl(params.value);
          return imgUrl ? (
            <div className="flex items-center h-full py-1">
              <img
                src={imgUrl}
                alt="Banner"
                className="w-16 h-10 object-cover rounded-md border border-gray-200"
                onError={() => {
                  console.error("Banner image failed to load:", imgUrl);
                }}
              />
            </div>
          ) : (
            <span className="text-xs text-gray-400">No Image</span>
          );
        },
      },
      {
        field: "status",
        headerName: "Status",
        width: 120,
        cellRenderer: (params) => {
          const isChecked = params.value;

          const handleStatusToggle = () => {
            dispatch(toggleBannerStatus(params.data.id)).then((res) => {
              if (res?.meta?.requestStatus === "fulfilled") {
                toast.success("Status updated successfully!");
                dispatch(fetchBanners());
              } else {
                toast.error(res?.payload?.message || "Failed to update status.");
              }
            });
          };

          return (
            <label className="inline-flex items-center cursor-pointer my-auto">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={handleStatusToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 relative"></div>
            </label>
          );
        },
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 180,
        cellRenderer: (params) => {
          return (
            <div className="flex gap-2 items-center h-full">
              <button
                onClick={() => handleUpdateBanner(params?.data?.id)}
                className="bg-[#52b69a] hover:bg-black px-3 py-1 text-white text-sm font-semibold flex justify-center items-center rounded-md transition-colors"
              >
                Update
              </button>
              <button
                onClick={() => handleDeleteBanner(params?.data?.id)}
                className="bg-red-500 hover:bg-red-700 px-3 py-1 text-white text-sm font-semibold flex justify-center items-center rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          );
        },
      },
    ],
    [dispatch, activeTab]
  );

  return (
    <>
      <ToastContainer />
      <div className="wrapper_area my-0 mx-auto p-6 rounded-xl bg-white">
        <div className="h-full lg:h-screen">
          {/* Top Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Banner Management</h2>
            </div>
            <div className="flex gap-2">
              <Button color="gray" onClick={() => navigate(-1)}>
                Back
              </Button>
              <Button
                onClick={() => setOpenAddBannerModal(true)}
                className="bg-[#52b69a] hover:bg-black px-4 py-1 text-white text-base font-semibold flex justify-center items-center rounded-md"
              >
                {activeTab === "normal" ? "Add Normal Banner" : "Add Package Banner"}
              </Button>
            </div>
          </div>

          {/* 2 Tabs */}
          <div className="flex border-b border-gray-200 mb-6 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("normal")}
              className={`py-2.5 px-5 font-semibold text-sm border-b-2 transition-all duration-200 flex items-center gap-2 ${
                activeTab === "normal"
                  ? "border-[#52b69a] text-[#52b69a] bg-teal-50/60 rounded-t-lg"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span>Normal Banner (App Popup)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-bold">
                {normalBanners.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("package")}
              className={`py-2.5 px-5 font-semibold text-sm border-b-2 transition-all duration-200 flex items-center gap-2 ${
                activeTab === "package"
                  ? "border-[#52b69a] text-[#52b69a] bg-teal-50/60 rounded-t-lg"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span>Package Banner (Support Slider)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-bold">
                {packageBanners.length}
              </span>
            </button>
          </div>

          {/* AG Grid Table */}
          <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
            <AgGridReact
              key={activeTab} // Force refresh grid when switching tabs
              rowData={rowData}
              columnDefs={columnDefs}
              pagination={true}
              paginationPageSize={10}
              domLayout="autoHeight"
              getRowHeight={() => 55}
            />
          </div>
        </div>

        {openAddBannerModal && (
          <AddBannerModal
            openAddBannerModal={openAddBannerModal}
            setOpenAddBannerModal={setOpenAddBannerModal}
            isPackageBanner={activeTab === "package"}
          />
        )}

        {openUpdateBannerModal && (
          <UpdateBannerModal
            openUpdateBannerModal={openUpdateBannerModal}
            setOpenUpdateBannerModal={setOpenUpdateBannerModal}
            bannerId={selectedBannerId}
            currentBanner={currentBanner}
            isPackageBanner={activeTab === "package"}
          />
        )}
      </div>
    </>
  );
};

export default ManageBanner;
