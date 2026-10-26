import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { approveDoctor, getDoctor, getDoctorDetails, toggleStatus } from "../../../Reducer/DoctorSlice"
import DoctorDetailModal from "./DoctorDetailModal"
import { Eye, Check, ArrowLeft, X, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react'
import { AgGridReact } from "ag-grid-react"
import { useNavigate } from "react-router-dom"

const ManageDoctor = () => {
  const navigate = useNavigate()
  const { doctorsDetails, doctorDetail, loading } = useSelector((state) => state?.doctors)
  const [openDetailModal, setOpenDetailModal] = useState(false)
  const [previewPhoto, setPreviewPhoto] = useState(null)
  const [confirmDoctor, setConfirmDoctor] = useState(null)
  const [isApproving, setIsApproving] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getDoctor())
  }, [dispatch])

  const rowData = useMemo(() => {
    if (!Array.isArray(doctorsDetails?.data)) return [];

    // Sort latest registered doctor first (descending by createdAt or ID, fallback to reversed)
    const sortedList = [...doctorsDetails.data].sort((a, b) => {
      if (a?.createdAt && b?.createdAt) {
        const timeDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (!isNaN(timeDiff) && timeDiff !== 0) return timeDiff;
      }
      const idA = Number(a?.id) || 0;
      const idB = Number(b?.id) || 0;
      if (idA && idB && idA !== idB) {
        return idB - idA;
      }
      return 0;
    });

    const finalList = sortedList.length > 0 && sortedList[0]?.id === doctorsDetails.data[0]?.id && doctorsDetails.data.length > 1
      ? [...doctorsDetails.data].reverse()
      : sortedList;

    return finalList.map((tags) => {
      const fName = tags?.firstName?.trim() || '';
      const lName = tags?.lastName?.trim() || '';
      const fullName = [fName, lName].filter(Boolean).join(' ') || '-';

      return {
        id: tags?.id,
        fullName: fullName,
        name: fName,
        lname: lName,
        mobile: tags?.mobile,
        image: tags?.image || tags?.avatar || tags?.profileImage,
        status: tags?.status,
        adminStatus: tags?.adminStatus,
        createdAt: tags?.createdAt,
      };
    });
  }, [doctorsDetails?.data]);

  const columnDefs = useMemo(
    () => [
      {
        field: "fullName",
        headerName: "Full Name",
        flex: 1.8,
        minWidth: 200,
        sortable: true,
        filter: true,
        cellRenderer: (params) => {
          const rawImg = params.data.image;
          let avatarUrl = null;
          if (rawImg && typeof rawImg === 'string' && rawImg !== 'null' && rawImg.trim()) {
            const clean = rawImg.trim();
            if (clean.startsWith('http://') || clean.startsWith('https://')) {
              avatarUrl = clean;
            } else {
              const base = (
                import.meta.env.VITE_DOCTOR_API_BASE_URL ||
                'https://goodmoodjavadoctorapi.goodmood.solutions/'
              ).replace(/\/+$/, '');
              avatarUrl = `${base}/${clean.replace(/^\/+/, '')}`;
            }
          }

          const initial = params.value ? params.value.trim().charAt(0) : "D";

          return (
            <div className="flex items-center gap-2.5 h-full">
              {avatarUrl ? (
                <div
                  className="relative group/avatar cursor-pointer shrink-0 w-8 h-8 rounded-full overflow-hidden border border-emerald-200 shadow-2xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewPhoto({ url: avatarUrl, name: params.value });
                  }}
                  title="Click to view original photo"
                >
                  <img
                    src={avatarUrl}
                    alt={params.value || 'Doctor'}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover/avatar:scale-110"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextSibling) {
                        e.currentTarget.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                  <div
                    className="w-full h-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center uppercase"
                    style={{ display: 'none' }}
                  >
                    {initial}
                  </div>
                  {/* Eye Button Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/55 backdrop-blur-[0.5px] opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-150 flex items-center justify-center text-white">
                    <Eye size={13} className="text-white drop-shadow" />
                  </div>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200 uppercase shrink-0">
                  {initial}
                </div>
              )}
              <span className="capitalize font-semibold text-gray-800 dark:text-gray-200 truncate text-sm" title={params.value}>
                {params.value || "-"}
              </span>
            </div>
          );
        },
      },
      {
        field: "mobile",
        headerName: "Mobile",
        width: 140,
        minWidth: 130,
        maxWidth: 160,
        sortable: true,
        filter: true,
        cellRenderer: (params) => (
          <div className="flex items-center h-full">
            <span className="font-mono text-gray-700 text-sm tracking-wide">
              {params.value || "-"}
            </span>
          </div>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 130,
        minWidth: 120,
        maxWidth: 150,
        sortable: true,
        cellRenderer: (params) => {
          const isChecked = Boolean(params.value);

          const handleStatusChange = () => {
            const newStatus = isChecked ? 0 : 1;
            dispatch(
              toggleStatus({
                id: params.data.id,
                status: newStatus,
              })
            ).then(() => {
              dispatch(getDoctor());
            });
          };

          return (
            <div className="flex items-center gap-2 h-full">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={handleStatusChange}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 relative"></div>
              </label>
              <span className={`text-xs font-semibold ${isChecked ? "text-emerald-600" : "text-gray-400"}`}>
                {isChecked ? "Active" : "Inactive"}
              </span>
            </div>
          );
        },
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 1.4,
        minWidth: 185,
        sortable: false,
        filter: false,
        cellRenderer: (params) => {
          const isApproved = params.data.adminStatus === 1;

          const handleViewDetails = (id) => {
            dispatch(getDoctorDetails(id));
            setOpenDetailModal(true);
          };

          return (
            <div className="flex items-center gap-2 h-full">
              <button
                onClick={() => handleViewDetails(params.data.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 rounded-lg text-xs font-semibold transition-all duration-150 shadow-xs"
                title="View Doctor Details"
              >
                <Eye size={14} />
                <span>Details</span>
              </button>

              {isApproved ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold select-none">
                  <Check size={14} className="stroke-[2.5]" />
                  <span>Approved</span>
                </span>
              ) : (
                <button
                  onClick={() => promptApprove(params.data.id, params.data.fullName)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-all duration-150 shadow-xs cursor-pointer"
                  title="Approve Doctor"
                >
                  <Check size={14} />
                  <span>Approve</span>
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [dispatch]
  );

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
    }),
    []
  );

  const promptApprove = (id, name) => {
    setConfirmDoctor({
      id: id,
      name: name || 'Doctor / Expert',
    });
  };

  const handleConfirmApproval = () => {
    if (!confirmDoctor?.id) return;
    setIsApproving(true);
    dispatch(approveDoctor({ id: confirmDoctor.id }))
      .then((res) => {
        setIsApproving(false);
        const approvedId = confirmDoctor.id;
        setConfirmDoctor(null);
        if (res?.payload?.statusCode === 200) {
          dispatch(getDoctor());
          if (openDetailModal && approvedId) {
            dispatch(getDoctorDetails(approvedId));
          }
        }
      })
      .catch(() => {
        setIsApproving(false);
      });
  };

  return (
    <>
      <div className="wrapper_area my-0 mx-auto p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Expert Management</h2>
              <p className="text-xs text-gray-500 mt-0.5">Manage and verify registered experts and doctors</p>
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
              onGridReady={(params) => {
                params.api.sizeColumnsToFit();
              }}
              onGridSizeChanged={(params) => {
                params.api.sizeColumnsToFit();
              }}
            />
          </div>
        </div>
      </div>

      <DoctorDetailModal
        isOpen={openDetailModal}
        onClose={() => setOpenDetailModal(false)}
        data={doctorDetail}
        loading={loading}
        onApprove={promptApprove}
      />

      {/* ── Confirmation Modal Before Approval ── */}
      {confirmDoctor && (
        <div
          className="fixed inset-0 z-[100010] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !isApproving && setConfirmDoctor(null)}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -top-16 -left-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => !isApproving && setConfirmDoctor(null)}
              disabled={isApproving}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer disabled:opacity-50"
              title="Cancel"
            >
              <X size={18} />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/80 flex items-center justify-center shadow-xs text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={32} className="stroke-[2.2]" />
            </div>

            {/* Title & Description */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Approve Expert Account?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Please confirm before granting platform approval
              </p>

              {/* Target Doctor Badge */}
              <div className="my-4 px-4 py-2.5 bg-emerald-50/60 dark:bg-slate-800/80 rounded-2xl border border-emerald-100 dark:border-slate-700/80 inline-flex items-center gap-2 max-w-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">Doctor:</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white capitalize truncate">
                  {confirmDoctor.name}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed px-2">
                Are you sure you want to approve this doctor? Once approved, the account will be verified and active to take appointments.
              </p>
            </div>

            {/* Action Buttons (No / Yes) */}
            <div className="flex items-center gap-3 mt-6 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDoctor(null)}
                disabled={isApproving}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
              >
                No, Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                disabled={isApproving}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#0B8843] hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70"
              >
                {isApproving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Approving...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} className="stroke-[2.5]" />
                    <span>Yes, Approve</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Original Photo */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="min-w-0 pr-3">
                <h3 className="font-bold text-slate-800 dark:text-white capitalize text-base truncate">
                  {previewPhoto.name || 'Doctor Photo'}
                </h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  Original Profile Picture
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <a
                  href={previewPhoto.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                  title="Open original in new tab"
                >
                  <ExternalLink size={18} />
                </a>
                <button
                  onClick={() => setPreviewPhoto(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Photo Body */}
            <div className="p-4 bg-slate-950/5 dark:bg-slate-950/40 flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.name || 'Doctor'}
                className="max-h-[60vh] w-auto max-w-full rounded-2xl object-contain shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ManageDoctor