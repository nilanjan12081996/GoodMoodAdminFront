import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import ReactPlayer from "react-player";
import {
  Play,
  Eye,
  Edit3,
  ArrowLeft,
  Plus,
  Film,
  Image as ImageIcon,
  Music,
  ExternalLink,
  X,
  FileQuestion,
  Calendar,
  CheckCircle2,
  Trash2,
  Gamepad2,
  BookOpen,
} from "lucide-react";

import { contentList, deleteContent } from "../../Reducer/ContentUploadSlice";
import { toast } from "react-toastify";
import { changeStatusEquilizer } from "../../Reducer/EquilizerSlice";
import { getBuiltInGameByTitle, getGameCoverDataUrl } from "../../utils/gameCoverHelper";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

// Helper to construct full media URL with robust fallback
export const getAbsoluteMediaUrl = (path, baseUrl) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const rawBase =
    baseUrl && baseUrl !== "null" && baseUrl !== "undefined" && baseUrl.trim() !== ""
      ? baseUrl
      : import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, "")
      : "https://newadminapigoodmood.goodmood.solutions";

  const cleanBase = String(rawBase).replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

// Detect media type from URL extension
export const detectMediaType = (url) => {
  if (!url) return "unknown";
  const lower = String(url).toLowerCase();
  if (lower.endsWith(".m3u8") || lower.endsWith(".mp4") || lower.includes("/video/")) {
    return "video";
  }
  if (lower.endsWith(".mp3") || lower.endsWith(".wav") || lower.endsWith(".aac") || lower.includes("/audio/")) {
    return "audio";
  }
  if (lower.match(/\.(jpg|jpeg|png|webp|gif|svg)$/)) {
    return "image";
  }
  if (lower.endsWith(".html") || lower.endsWith(".txt")) {
    return "story";
  }
  if (lower.endsWith(".json")) {
    return "game";
  }
  return "media";
};

// Thumbnail / Preview Cell Renderer
const PreviewCellRenderer = (params) => {
  const { data, context } = params;
  if (!data) return null;

  const baseUrl = context?.baseUrl;
  const mediaType = detectMediaType(data.url);
  const rawThumbnail = data.type; // Java backend saves thumbnail path in `type`
  const thumbUrl = rawThumbnail ? getAbsoluteMediaUrl(rawThumbnail, baseUrl) : null;
  const mediaUrl = data.url ? getAbsoluteMediaUrl(data.url, baseUrl) : null;

  if (mediaType === "video") {
    return (
      <div className="flex items-center h-full py-1">
        <div
          onClick={() => context?.onPreview(data)}
          className="relative w-24 h-14 rounded-lg overflow-hidden bg-gray-900 border border-gray-200 cursor-pointer group shadow-sm flex items-center justify-center hover:ring-2 hover:ring-[#0B8843]/40 transition-all"
          title="Click to preview video"
        >
          {thumbUrl ? (
            <img
              src={thumbUrl}
              alt={data.name || "Video thumbnail"}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : null}

          {/* Play Badge Overlay */}
          <div className="absolute inset-0 bg-black/35 group-hover:bg-black/15 flex items-center justify-center transition-all">
            <div className="w-6 h-6 rounded-full bg-white/95 text-[#0B8843] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Play className="w-3 h-3 fill-current ml-0.5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mediaType === "image") {
    const previewImg = thumbUrl || mediaUrl;
    return (
      <div className="flex items-center h-full py-1">
        <div
          onClick={() => context?.onPreview(data)}
          className="relative w-16 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer group shadow-sm flex items-center justify-center hover:ring-2 hover:ring-[#0B8843]/40 transition-all"
          title="Click to view image"
        >
          {previewImg ? (
            <img
              src={previewImg}
              alt={data.name || "Image"}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <ImageIcon className="w-6 h-6 text-gray-400" />
          )}
        </div>
      </div>
    );
  }

  if (mediaType === "audio") {
    return (
      <div className="flex items-center h-full py-1">
        <div
          onClick={() => context?.onPreview(data)}
          className="w-16 h-14 rounded-lg bg-amber-50 border border-amber-200 cursor-pointer flex flex-col items-center justify-center text-amber-600 shadow-sm hover:ring-2 hover:ring-amber-400/40 transition-all group"
          title="Click to play audio"
        >
          <Music className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-semibold mt-0.5 text-amber-700">Audio</span>
        </div>
      </div>
    );
  }

  const builtInGame = getBuiltInGameByTitle(data.name);
  const fallbackCoverUrl = builtInGame ? getGameCoverDataUrl(builtInGame) : null;
  const effectiveCover = thumbUrl || fallbackCoverUrl;

  if (effectiveCover && (mediaType === "story" || mediaType === "game" || mediaType === "media")) {
    return (
      <div className="flex items-center h-full py-1">
        <div
          onClick={() => context?.onPreview(data)}
          className="relative w-24 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer group shadow-sm flex items-center justify-center hover:ring-2 hover:ring-[#0B8843]/40 transition-all"
          title="Click to preview"
        >
          <img
            src={effectiveCover}
            alt={data.name || "Cover"}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        </div>
      </div>
    );
  }

  if (mediaType === "story" || mediaType === "game") {
    return (
      <div className="flex items-center h-full py-1">
        <div
          onClick={() => context?.onPreview(data)}
          className="w-24 h-14 rounded-lg bg-emerald-50 border border-emerald-200 cursor-pointer flex flex-col items-center justify-center text-[#0B8843] shadow-sm hover:ring-2 hover:ring-[#0B8843]/40 transition-all"
          title="Click to preview"
        >
          {mediaType === "game" ? (
            <Gamepad2 className="w-5 h-5" />
          ) : (
            <BookOpen className="w-5 h-5" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center h-full py-1">
      <div
        onClick={() => context?.onPreview(data)}
        className="w-16 h-14 rounded-lg bg-gray-100 border border-gray-200 cursor-pointer flex items-center justify-center text-gray-500 shadow-sm"
      >
        <FileQuestion className="w-5 h-5" />
      </div>
    </div>
  );
};

const ViewContent = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // Safely persist and retrieve awareness ID across reloads
  const [awarenessId] = useState(() => {
    const locId = location?.state?.id;
    if (locId) {
      sessionStorage.setItem("lastViewContentAwarenessId", String(locId));
      return locId;
    }
    return sessionStorage.getItem("lastViewContentAwarenessId");
  });

  const { allContent, loading } = useSelector((state) => state.content);

  // Preview modal state
  const [previewItem, setPreviewItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setIsDeleting(true);
    try {
      const res = await dispatch(deleteContent({ id: deleteTarget.id }));
      if (deleteContent.fulfilled.match(res)) {
        toast.success("Content deleted successfully");
        setDeleteTarget(null);
        if (awarenessId) {
          dispatch(contentList({ id: awarenessId }));
        }
      } else {
        toast.error("Failed to delete content");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (awarenessId) {
      dispatch(contentList({ id: awarenessId }));
    }
  }, [dispatch, awarenessId]);

  const handleUpdateThumbnail = (cid) => {
    navigate("/update-content", {
      state: {
        id: cid,
        awid: awarenessId,
        contentType: location?.state?.contentType,
        categoryName: location?.state?.categoryName,
      },
    });
  };

  const handleNewUpload = () => {
    navigate("/upload-content", {
      state: {
        id: awarenessId,
        contentType: location?.state?.contentType,
        categoryName: location?.state?.categoryName,
      },
    });
  };

  const handlePreview = (item) => {
    setPreviewItem(item);
  };

  const closePreview = () => {
    setPreviewItem(null);
  };

  // Default Column Definitions with auto flex
  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
      flex: 1,
    }),
    []
  );

  const columnDefs = useMemo(
    () => [
      {
        headerName: "#",
        valueGetter: (params) => params.node.rowIndex + 1,
        width: 65,
        maxWidth: 75,
        sortable: false,
        filter: false,
        cellClass: "flex items-center justify-center font-medium text-gray-500",
      },
      {
        headerName: "Preview",
        field: "url",
        cellRenderer: PreviewCellRenderer,
        width: 120,
        maxWidth: 130,
        sortable: false,
        filter: false,
      },
      {
        headerName: "Title",
        field: "name",
        flex: 1.8,
        minWidth: 180,
        cellRenderer: (params) => {
          const name = params.value || "Untitled Content";
          const builtIn = getBuiltInGameByTitle(name);

          return (
            <div className="flex items-center gap-2 h-full">
              <span className="font-semibold text-gray-800 text-sm truncate" title={name}>
                {name}
              </span>
              {builtIn && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                    builtIn.group === "GoodMood Wellness"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-sky-50 text-sky-700 border border-sky-200"
                  }`}
                >
                  {builtIn.group === "GoodMood Wellness" ? "GoodMood App" : "Common"}
                </span>
              )}
            </div>
          );
        },
      },
      {
        headerName: "Uploaded On",
        field: "createdAt",
        width: 160,
        maxWidth: 180,
        cellRenderer: (params) => {
          const dateStr = params.value;
          if (!dateStr) return <span className="text-gray-400 text-xs">—</span>;

          try {
            const date = new Date(dateStr);
            const formatted = isNaN(date.getTime())
              ? dateStr
              : date.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
            return (
              <div className="flex items-center h-full text-xs text-gray-600 gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>{formatted}</span>
              </div>
            );
          } catch {
            return <span className="text-gray-500 text-xs">{dateStr}</span>;
          }
        },
      },
      {
        headerName: "Status",
        field: "status",
        width: 130,
        maxWidth: 150,
        cellRenderer: (params) => {
          const isChecked = Boolean(params.value);

          const handleStatusChange = () => {
            const newStatus = isChecked ? 0 : 1;
            dispatch(
              changeStatusEquilizer({ id: params.data.id, status: newStatus })
            ).then(() => {
              if (awarenessId) {
                dispatch(contentList({ id: awarenessId }));
              }
            });
          };

          return (
            <div className="flex items-center h-full gap-2">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={handleStatusChange}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0B8843] relative"></div>
              </label>
              <span
                className={`text-xs font-semibold ${
                  isChecked ? "text-[#0B8843]" : "text-gray-400"
                }`}
              >
                {isChecked ? "Active" : "Inactive"}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Actions",
        field: "action",
        width: 260,
        minWidth: 250,
        sortable: false,
        filter: false,
        cellRenderer: (params) => {
          return (
            <div className="flex items-center h-full gap-1.5">
              <button
                type="button"
                onClick={() => handlePreview(params.data)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-md transition shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
                title="Preview Content"
              >
                <Eye className="w-3.5 h-3.5 text-gray-600" />
                <span>Preview</span>
              </button>
              <button
                type="button"
                onClick={() => handleUpdateThumbnail(params?.data?.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-[#0B8843] hover:bg-[#097036] rounded-md transition shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
                title="Update Thumbnail"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Update</span>
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(params.data)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
                title="Delete Content"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          );
        },
      },
    ],
    [awarenessId, dispatch]
  );

  const contentItems = allContent?.data || [];
  const activeCount = contentItems.filter((i) => i.status).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ── Top Header Bar ── */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-lg bg-emerald-50 text-[#0B8843] shrink-0">
              <Film className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-gray-800 truncate">
              Uploaded Content Library
            </h1>
          </div>
          <p className="text-xs text-gray-500 ml-9">
            Manage audio/video media, preview streaming content, and configure display thumbnails.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap shrink-0">
          {/* Quick Stat Badges */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 whitespace-nowrap shrink-0">
              <span className="text-gray-500">Total:</span>
              <strong className="text-gray-900">{contentItems.length}</strong>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#0B8843] shrink-0"></span>
              <span className="text-emerald-700">Active:</span>
              <strong className="text-emerald-900">{activeCount}</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition whitespace-nowrap shrink-0"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Back</span>
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B8843] hover:bg-[#097036] text-white text-sm font-semibold rounded-lg shadow-sm transition whitespace-nowrap shrink-0"
            onClick={handleNewUpload}
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Upload New Content</span>
          </button>
        </div>
      </div>

      {/* ── Ag-Grid Table Container ── */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="ag-theme-alpine w-full" style={{ width: "100%", height: 520 }}>
          <AgGridReact
            rowData={contentItems}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            context={{
              baseUrl: allContent?.baseUrl,
              onPreview: handlePreview,
            }}
            rowHeight={74}
            headerHeight={44}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 50]}
            suppressCellFocus={true}
            animateRows={true}
            onGridReady={(params) => params.api.sizeColumnsToFit()}
            onGridSizeChanged={(params) => params.api.sizeColumnsToFit()}
          />
        </div>
      </div>

      {/* ── Interactive Preview Modal ── */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 text-[#0B8843] rounded-lg">
                  <Film className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">
                    {previewItem.name || "Media Preview"}
                  </h3>
                  <span className="text-[11px] text-gray-500">
                    Type: {detectMediaType(previewItem.url).toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={closePreview}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 bg-black flex items-center justify-center min-h-[300px]">
              {(() => {
                const mediaType = detectMediaType(previewItem.url);
                const fullMediaUrl = getAbsoluteMediaUrl(
                  previewItem.url,
                  allContent?.baseUrl
                );

                if (mediaType === "video") {
                  return (
                    <div className="w-full flex justify-center">
                      <ReactPlayer
                        url={fullMediaUrl}
                        controls
                        playing
                        width="100%"
                        height="360px"
                        config={{
                          file: {
                            forceHLS: fullMediaUrl.endsWith(".m3u8"),
                          },
                        }}
                      />
                    </div>
                  );
                }

                if (mediaType === "image") {
                  return (
                    <img
                      src={fullMediaUrl}
                      alt={previewItem.name || "Preview"}
                      className="max-h-[420px] w-auto max-w-full rounded-lg object-contain shadow-lg"
                    />
                  );
                }

                if (mediaType === "audio") {
                  return (
                    <div className="w-full p-6 bg-gray-900 rounded-xl text-center space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Music className="w-8 h-8" />
                      </div>
                      <p className="text-white text-sm font-medium">
                        {previewItem.name}
                      </p>
                      <ReactPlayer
                        url={fullMediaUrl}
                        controls
                        playing
                        width="100%"
                        height="50px"
                      />
                    </div>
                  );
                }

                if (
                  mediaType === "story" ||
                  mediaType === "game" ||
                  String(previewItem.url || "").toLowerCase().endsWith(".html") ||
                  String(previewItem.url || "").toLowerCase().endsWith(".htm")
                ) {
                  return (
                    <div className="w-full h-[520px] bg-gray-900 rounded-lg overflow-hidden">
                      <iframe
                        src={fullMediaUrl}
                        title={previewItem.name || "Interactive Preview"}
                        className="w-full h-full border-0"
                      />
                    </div>
                  );
                }

                return (
                  <div className="text-white text-sm">
                    Unable to preview this file format directly.
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
              <a
                href={getAbsoluteMediaUrl(previewItem.url, allContent?.baseUrl)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B8843] hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Direct URL
              </a>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    closePreview();
                    handleUpdateThumbnail(previewItem.id);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0B8843] hover:bg-[#097036] rounded-lg transition"
                >
                  Edit Thumbnail
                </button>
                <button
                  onClick={closePreview}
                  className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[100001] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => !isDeleting && setDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Content</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                {deleteTarget.name || "Untitled Content"}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-60 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewContent;
