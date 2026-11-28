import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCategoryWithoutParent, getPlatformCharges } from "../../Reducer/PlatformSlice";
import api from "../../store/Api";
import AddUpdateCharges from "./AddUpdateCharges";
import { ArrowLeft, Edit3, ShieldCheck, Info, RefreshCw } from "lucide-react";

const PlaformCharge = () => {
  const [openAddModal, setOpenAddModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [categoryId, setCategoryId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [chargesMap, setChargesMap] = useState({});
  const [loadingCharges, setLoadingCharges] = useState(false);

  const { categoryWithoutParent, loading } = useSelector((state) => state?.platform);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getCategoryWithoutParent());
  }, [dispatch]);

  // Strictly keep only the 2 Main Master Categories (Mental Health Expert & Therapies)
  const mainCategoriesList = useMemo(() => {
    const raw = categoryWithoutParent?.data;
    if (!Array.isArray(raw)) return [];
    const masterOnly = raw.filter((cat) => {
      const name = (cat?.name || "").toLowerCase().trim();
      return (
        name.includes("mental health") ||
        name.includes("therap")
      );
    });
    if (masterOnly.length > 0) {
      return masterOnly;
    }
    return raw.filter((cat) => Number(cat?.parentId ?? cat?.parent_id ?? 0) === 0).slice(0, 2);
  }, [categoryWithoutParent?.data]);

  // Load commission % for each Main Category
  useEffect(() => {
    if (mainCategoriesList.length > 0) {
      setLoadingCharges(true);
      Promise.all(
        mainCategoriesList.map((cat) =>
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
  }, [mainCategoriesList]);

  const rowData = useMemo(() => {
    return mainCategoriesList.map((tags) => ({
      id: tags?.id,
      name: tags?.name,
      charge: chargesMap[tags?.id] !== undefined ? chargesMap[tags?.id] : null,
      status: tags?.status,
    }));
  }, [mainCategoriesList, chargesMap]);

  const handleUpdateTags = (category) => {
    setSelectedCategory(category);
    setCategoryId(category.id);
    setIsEdit(category.charge !== null && category.charge !== undefined && category.charge !== "");
    setOpenAddModal(true);
    dispatch(getPlatformCharges({ categoryId: category.id }));
  };

  return (
    <div className="wrapper_area my-0 mx-auto h-[calc(100vh-104px)] max-h-full flex flex-col overflow-hidden p-4 rounded-2xl bg-white shadow-sm border border-gray-100 gap-3">
      {/* Compact Top Header */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-gray-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer shrink-0"
            title="Go Back"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-gray-900 leading-tight whitespace-nowrap">
                Platform Commission Setup
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#0B8843] border border-emerald-200 whitespace-nowrap">
                <ShieldCheck size={11} /> Main Category Only
              </span>
            </div>
            <p className="text-[11px] text-gray-500 truncate">
              Configure GoodMood&apos;s commission % for the primary categories — automatically applies to all subcategories inside them
            </p>
          </div>
        </div>

        <button
          onClick={() => dispatch(getCategoryWithoutParent())}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <RefreshCw size={13} className={loading || loadingCharges ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Compact Rule Banner */}
      <div className="shrink-0 py-2.5 px-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 flex items-center gap-2.5">
        <Info size={15} className="text-[#0B8843] shrink-0" />
        <div className="text-[11px] text-gray-700 leading-snug">
          <span className="font-bold text-gray-900">Main Category Rule:</span> Setting commission on{" "}
          <span className="font-semibold text-[#0B8843]">Mental Health Expert</span> and{" "}
          <span className="font-semibold text-[#0B8843]">Therapies</span> automatically covers every subcategory under them. No subcategory setup is needed.
        </div>
      </div>

      {/* Internal Scrollable Table within 100vh */}
      <div className="flex-1 min-h-0 w-full overflow-auto rounded-xl border border-gray-200 relative">
        <table className="w-full min-w-[560px] text-left border-collapse">
          <thead className="sticky top-0 z-20 bg-gray-50 shadow-[0_1px_0_0_#e5e7eb]">
            <tr className="text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">
              <th className="py-2.5 px-4 bg-gray-50 w-14">#</th>
              <th className="py-2.5 px-4 bg-gray-50">Main Category</th>
              <th className="py-2.5 px-4 bg-gray-50">GoodMood Commission (%)</th>
              <th className="py-2.5 px-4 bg-gray-50 text-right sticky right-0 z-30 shadow-[-1px_0_0_0_#e5e7eb]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {loading && rowData.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-gray-400 font-medium">
                  Loading main categories...
                </td>
              </tr>
            ) : rowData.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-gray-400 font-medium">
                  No main categories found.
                </td>
              </tr>
            ) : (
              rowData.map((cat, idx) => {
                const isConfigured =
                  cat.charge !== null && cat.charge !== undefined && cat.charge !== "";

                return (
                  <tr
                    key={cat.id}
                    className="group bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
                  >
                    <td className="py-3 px-4 font-semibold text-gray-500">{idx + 1}</td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-[#0B8843] shrink-0"></span>
                        <div>
                          <div className="font-bold text-gray-900 text-sm leading-tight">
                            {cat.name || "-"}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            Applies to all consultations &amp; subcategories under {cat.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {loadingCharges && cat.charge === undefined ? (
                        <span className="text-xs text-gray-400 animate-pulse">Loading...</span>
                      ) : isConfigured ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#0B8843] border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0B8843]"></span>
                          {cat.charge}% Commission
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Not Configured (0%)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right sticky right-0 z-10 bg-white group-hover:bg-gray-50 shadow-[-1px_0_0_0_#f3f4f6]">
                      <button
                        onClick={() => handleUpdateTags(cat)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#0B8843] hover:bg-black rounded-lg transition-all shadow-xs cursor-pointer"
                      >
                        <Edit3 size={12} />
                        <span>{isConfigured ? "Update %" : "Set %"}</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="shrink-0 flex items-center justify-between text-[11px] text-gray-500 pt-0.5">
        <span>
          Total Primary Categories: <strong className="text-gray-800">{rowData.length}</strong>
        </span>
        <span>Changes apply to all new consultations immediately</span>
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
  );
};

export default PlaformCharge;
