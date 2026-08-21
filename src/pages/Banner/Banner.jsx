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
} from "../../Reducer/BannerSlice";

import AddBannerModal from "./AddBannerModal";
import UpdateBannerModal from "./UpdateBannerModal";

const ManageBanner = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { bannerList, currentBanner } = useSelector((state) => state?.banner || {});

  const [openAddBannerModal, setOpenAddBannerModal] = useState(false);
  const [openUpdateBannerModal, setOpenUpdateBannerModal] = useState(false);
  const [selectedBannerId, setSelectedBannerId] = useState(null);

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  const rowData = useMemo(() => {
    return (
      bannerList?.map((banner, index) => ({
        id: banner?.id || banner?._id,
        slNo: index + 1,
        title: banner?.title || banner?.name || "N/A",
        description: banner?.description || "N/A",
        image: banner?.image || banner?.banner_image || banner?.imageUrl || "",
        status: banner?.status === "active" || banner?.status === 1 || banner?.status === true,
      })) || []
    );
  }, [bannerList]);

  const columnDefs = useMemo(
    () => [
      {
        field: "title",
        headerName: "Banner Title",
        sortable: true,
        filter: true,
        flex: 1,
      },
      {
        field: "description",
        headerName: "Banner Description",
        sortable: true,
        filter: true,
        flex: 1.5,
      },
      {
        field: "image",
        headerName: "Banner Image",
        flex: 1,
        cellRenderer: (params) => {
          return params.value ? (
            <div className="flex items-center h-full py-1">
              <img
                src={params.value}
                alt="Banner"
                className="w-16 h-10 object-cover rounded-md border border-gray-200"
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
        width: 160,
        cellRenderer: (params) => {
          return (
            <div className="flex gap-2 items-center h-full">
              <button
                onClick={() => handleUpdateBanner(params?.data?.id)}
                className="bg-[#52b69a] hover:bg-black px-4 py-1 text-white text-base font-semibold flex justify-center items-center rounded-md transition-colors"
              >
                Update
              </button>
            </div>
          );
        },
      },
    ],
    [dispatch]
  );

  const handleUpdateBanner = (id) => {
    setSelectedBannerId(id);
    dispatch(fetchBannerById(id));
    setOpenUpdateBannerModal(true);
  };

  return (
    <>
      <ToastContainer />
      <div className="wrapper_area my-0 mx-auto p-6 rounded-xl bg-white">
        <div className="h-full lg:h-screen">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Banner Management</h2>
            <div className="flex gap-2">
              <Button color="gray" onClick={() => navigate(-1)}>
                Back
              </Button>
              <Button
                onClick={() => setOpenAddBannerModal(true)}
                className="bg-[#52b69a] hover:bg-black px-4 py-1 text-white text-base font-semibold flex justify-center items-center rounded-md"
              >
                Add Banner
              </Button>
            </div>
          </div>

          <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
            <AgGridReact
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
          />
        )}

        {openUpdateBannerModal && (
          <UpdateBannerModal
            openUpdateBannerModal={openUpdateBannerModal}
            setOpenUpdateBannerModal={setOpenUpdateBannerModal}
            bannerId={selectedBannerId}
            currentBanner={currentBanner}
          />
        )}
      </div>
    </>
  );
};

export default ManageBanner;