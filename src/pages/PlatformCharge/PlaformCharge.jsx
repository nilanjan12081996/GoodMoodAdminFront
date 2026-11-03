import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import { getCategoryWithoutParent, getPlatformCharges } from "../../Reducer/PlatformSlice";
import api from "../../store/Api";
import AddUpdateCharges from "./AddUpdateCharges";
import { ToastContainer } from "react-toastify";
import { ArrowLeft, Edit3 } from "lucide-react";

const PlaformCharge = () => {
  const [openAddModal, setOpenAddModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [categoryId, setCategoryId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [chargesMap, setChargesMap] = useState({});
  const [loadingCharges, setLoadingCharges] = useState(false);

  const { categoryWithoutParent } = useSelector((state) => state?.platform);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getCategoryWithoutParent());
  }, [dispatch]);

  // Load charges for all categories
  useEffect(() => {
    const list = categoryWithoutParent?.data;
    if (Array.isArray(list) && list.length > 0) {
      setLoadingCharges(true);
      Promise.all(
        list.map((cat) =>
          api
            .get(`goodmood/charges/get-charges/${cat.id}`)
            .then((res) => ({
              id: cat.id,
              charge: res?.data?.data?.charge ?? null,
            }))
            .catch(() => ({
              id: cat.id,
              charge: null,
            }))
        )
      )
        .then((results) => {
          const map = {};
          results.forEach((r) => {
            map[r.id] = r.charge;
          });
          setChargesMap(map);
        })
        .finally(() => {
          setLoadingCharges(false);
        });
    }
  }, [categoryWithoutParent?.data]);

  const rowData = useMemo(() => {
    return (
      categoryWithoutParent?.data?.map((tags) => ({
        id: tags?.id,
        name: tags?.name,
        charge: chargesMap[tags?.id] !== undefined ? chargesMap[tags?.id] : null,
        status: tags?.status,
      })) || []
    );
  }, [categoryWithoutParent?.data, chargesMap]);

  const handleUpdateTags = (category) => {
    setSelectedCategory(category);
    setCategoryId(category.id);
    setOpenAddModal(true);

    dispatch(getPlatformCharges({ categoryId: category.id })).then((res) => {
      if (res?.payload?.statusCode === 200 && res?.payload?.data) {
        setIsEdit(true);
      } else {
        setIsEdit(Boolean(chargesMap[category.id] != null));
      }
    });
  };

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
    }),
    []
  );

  const columnDefs = useMemo(
    () => [
      {
        headerName: "#",
        valueGetter: (params) => (params.node ? params.node.rowIndex + 1 : ""),
        width: 70,
        maxWidth: 80,
        sortable: false,
        filter: false,
        cellRenderer: (params) => (
          <div className="flex items-center justify-center h-full text-xs font-semibold text-gray-500">
            {params.value}
          </div>
        ),
      },
      {
        field: "name",
        headerName: "Category Name",
        flex: 2,
        minWidth: 200,
        cellRenderer: (params) => (
          <div className="flex items-center h-full">
            <span className="font-semibold text-gray-800 text-sm">{params.value || "-"}</span>
          </div>
        ),
      },
      {
        field: "charge",
        headerName: "Charge Percentage",
        flex: 1.3,
        minWidth: 160,
        cellRenderer: (params) => {
          const val = params.value;
          if (loadingCharges && val === undefined) {
            return (
              <div className="flex items-center h-full">
                <span className="text-xs text-gray-400 animate-pulse">Loading...</span>
              </div>
            );
          }
          if (val !== null && val !== undefined && val !== "") {
            return (
              <div className="flex items-center h-full">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#0B8843] border border-emerald-200 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B8843]"></span>
                  {val}%
                </span>
              </div>
            );
          }
          return (
            <div className="flex items-center h-full">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                Not Configured
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Actions",
        field: "actions",
        flex: 1.1,
        minWidth: 160,
        sortable: false,
        filter: false,
        cellRenderer: (params) => {
          const isConfigured =
            params.data?.charge !== null &&
            params.data?.charge !== undefined &&
            params.data?.charge !== "";
          return (
            <div className="flex items-center h-full">
              <button
                onClick={() => handleUpdateTags(params?.data)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0B8843] hover:bg-black rounded-lg transition-all shadow-xs cursor-pointer"
              >
                <Edit3 size={13} />
                <span>{isConfigured ? "Edit Charge" : "Add Charge"}</span>
              </button>
            </div>
          );
        },
      },
    ],
    [loadingCharges, chargesMap]
  );

  return (
    <>
      <div className="wrapper_area my-0 mx-auto p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
        <ToastContainer />
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Platform Charges</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Configure platform commission and charge percentage for each support category
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all shadow-xs cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          </div>

          <div
            className="ag-theme-alpine w-full rounded-xl overflow-hidden border border-gray-200"
            style={{ width: "100%" }}
          >
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 20, 50]}
              domLayout="autoHeight"
              rowHeight={56}
              headerHeight={44}
              animateRows={true}
              onGridReady={(params) => params.api.sizeColumnsToFit()}
              onGridSizeChanged={(params) => params.api.sizeColumnsToFit()}
            />
          </div>
        </div>

        {openAddModal && (
          <AddUpdateCharges
            openAddModal={openAddModal}
            setOpenAddModal={setOpenAddModal}
            isEdit={isEdit}
            categoryId={categoryId}
            categoryName={selectedCategory?.name}
            initialCharge={categoryId ? chargesMap[categoryId] : null}
            onSuccess={(catId, updatedCharge) => {
              setChargesMap((prev) => ({
                ...prev,
                [catId]: updatedCharge,
              }));
            }}
          />
        )}
      </div>
    </>
  );
};

export default PlaformCharge;
