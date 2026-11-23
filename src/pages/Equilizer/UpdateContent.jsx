import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import ReactPlayer from "react-player";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  Image as ImageIcon,
  Film,
  Music,
  Gamepad2,
  BookOpen,
  FileCode2,
  X,
} from "lucide-react";
import {
  contentListSingle,
  updateContentMedia,
} from "../../Reducer/ContentUploadSlice";
import { getSingleAwarness } from "../../Reducer/MoodMeterSlice";
import { inferContentType } from "../../utils/equalizerHelper";
import { getBuiltInGameByTitle } from "../../utils/gameCoverHelper";

const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB

const getAbsoluteUrl = (path, baseUrl) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (!baseUrl) return path;
  const cleanBase = String(baseUrl).replace(/\/$/, "");
  const cleanPath = String(path).startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

const detectMediaTypeFromUrl = (url) => {
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
  if (lower.endsWith(".html") || lower.endsWith(".htm")) {
    return "html";
  }
  return "unknown";
};

const normalizeCategoryType = (catType, url) => {
  if (catType === "video") return "video";
  if (catType === "audio") return "audio";
  if (catType === "drawing") return "image";
  if (catType === "story" || catType === "game") return "html";
  return detectMediaTypeFromUrl(url);
};

const UpdateContent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { singleContent, loading } = useSelector((state) => state?.content);
  const { singleAwarness } = useSelector((state) => state?.moodData || {});

  const id = location?.state?.id;
  const awid = location?.state?.awid;
  const stateContentType = location?.state?.contentType;

  const [title, setTitle] = useState("");
  const [newMediaFile, setNewMediaFile] = useState(null);
  const [newMediaPreviewUrl, setNewMediaPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (id && awid) {
      dispatch(
        contentListSingle({
          id: awid,
          cid: id,
        })
      );
    }
    if (awid && !stateContentType) {
      dispatch(getSingleAwarness({ id: awid }));
    }
  }, [id, awid, stateContentType, dispatch]);

  const content = singleContent?.data?.[0];
  const baseUrl = singleContent?.baseUrl;

  const existingMediaUrl = content?.url ? getAbsoluteUrl(content.url, baseUrl) : null;
  const builtInGame = getBuiltInGameByTitle(content?.name);

  const awData = singleAwarness?.data?.[0] || singleAwarness?.data || {};
  const inferredCategoryType =
    stateContentType ||
    (awData?.contentType || awData?.name
      ? inferContentType(awData.contentType, awData.name)
      : null);

  const mediaType = normalizeCategoryType(inferredCategoryType, existingMediaUrl);

  useEffect(() => {
    if (content) {
      setTitle(content.name || "");
      setNewMediaFile(null);
      setNewMediaPreviewUrl(null);
      setUploadProgress(0);
    }
  }, [content]);

  const handleMediaFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewMediaFile(file);
    setNewMediaPreviewUrl(URL.createObjectURL(file));
  };

  const clearNewMediaFile = () => {
    setNewMediaFile(null);
    setNewMediaPreviewUrl(null);
  };

  const originalTitle = (content?.name || "").trim();
  const trimmedTitle = title.trim();
  const hasTitleChanged = Boolean(trimmedTitle && trimmedTitle !== originalTitle);
  const hasChanges = Boolean(newMediaFile || hasTitleChanged);

  const handleSaveChanges = async () => {
    if (!content?.id) return;
    if (!trimmedTitle) {
      toast.error("Please enter a content title");
      return;
    }
    if (!hasChanges) {
      toast.info("No changes to save");
      return;
    }

    setSaving(true);
    setUploadProgress(0);

    try {
      // Chunked upload when replacing video or audio
      if (newMediaFile && (mediaType === "video" || mediaType === "audio")) {
        const totalChunks = Math.ceil(newMediaFile.size / CHUNK_SIZE);
        const fileKey = `update_${Date.now()}_${newMediaFile.name}`;

        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
          const start = chunkIndex * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, newMediaFile.size);
          const chunk = newMediaFile.slice(start, end);

          const formData = new FormData();
          formData.append("id", content.id);
          formData.append("file", chunk);
          formData.append("chunkIndex", chunkIndex);
          formData.append("totalChunks", totalChunks);
          formData.append("fileKey", fileKey);
          formData.append("originalName", newMediaFile.name);
          formData.append("name", trimmedTitle);

          const res = await dispatch(updateContentMedia(formData));
          if (updateContentMedia.rejected.match(res)) {
            throw new Error(res?.payload?.message || "Failed to update media");
          }

          setUploadProgress(Math.round(((chunkIndex + 1) / totalChunks) * 100));
        }
      } else {
        // Standard update (image / html / title-only)
        const formData = new FormData();
        formData.append("id", content.id);
        formData.append("name", trimmedTitle);
        if (newMediaFile) {
          formData.append("file", newMediaFile);
        }

        const res = await dispatch(updateContentMedia(formData));
        if (updateContentMedia.rejected.match(res)) {
          throw new Error(res?.payload?.message || "Failed to update content");
        }
      }

      toast.success("Content updated successfully!");
      setNewMediaFile(null);
      setNewMediaPreviewUrl(null);
      setUploadProgress(0);
      dispatch(
        contentListSingle({
          id: awid,
          cid: id,
        })
      );
    } catch (err) {
      toast.error(err?.message || "Something went wrong while updating");
    } finally {
      setSaving(false);
    }
  };

  const activePreviewUrl = newMediaPreviewUrl || existingMediaUrl;

  const renderMediaPreview = () => {
    if (!activePreviewUrl) {
      return (
        <div className="h-56 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 text-sm">
          No preview available
        </div>
      );
    }

    if (mediaType === "video") {
      if (newMediaPreviewUrl) {
        return (
          <video
            src={newMediaPreviewUrl}
            controls
            className="w-full rounded-xl bg-black max-h-[340px]"
          />
        );
      }
      return (
        <div className="rounded-xl overflow-hidden bg-black aspect-video max-h-[340px] w-full">
          <ReactPlayer
            url={existingMediaUrl}
            controls
            width="100%"
            height="100%"
            config={{
              file: {
                forceHLS: existingMediaUrl.toLowerCase().includes(".m3u8"),
              },
            }}
          />
        </div>
      );
    }

    if (mediaType === "audio") {
      return (
        <div className="p-6 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Music size={22} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">
                {newMediaPreviewUrl ? "New Audio Selected" : content?.name || "Audio Track"}
              </p>
              <p className="text-xs text-amber-700">
                {newMediaPreviewUrl ? newMediaFile?.name : "Audio Player Preview"}
              </p>
            </div>
          </div>

          {newMediaPreviewUrl || !existingMediaUrl?.toLowerCase().includes(".m3u8") ? (
            <audio src={activePreviewUrl} controls className="w-full" />
          ) : (
            <ReactPlayer
              url={existingMediaUrl}
              controls
              width="100%"
              height="54px"
              config={{
                file: {
                  forceAudio: true,
                  forceHLS: true,
                },
              }}
            />
          )}
        </div>
      );
    }

    if (mediaType === "image") {
      return (
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center max-h-[340px]">
          <img
            src={activePreviewUrl}
            alt={content?.name || "Content preview"}
            className="max-h-[340px] w-auto object-contain"
          />
        </div>
      );
    }

    if (mediaType === "html") {
      return (
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-900 h-[340px]">
          <iframe
            src={activePreviewUrl}
            title={content?.name || "Interactive Content"}
            className="w-full h-full border-0"
          />
        </div>
      );
    }

    return (
      <div className="h-44 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 text-sm">
        Preview not supported for this file format
      </div>
    );
  };

  const getReplaceConfig = () => {
    switch (mediaType) {
      case "video":
        return {
          heading: "Change Video",
          buttonLabel: "Select New Video",
          accept: "video/*",
          hint: "MP4, MOV, MKV supported • Replaces the current video",
          icon: Film,
        };
      case "audio":
        return {
          heading: "Change Audio",
          buttonLabel: "Select New Audio",
          accept: "audio/*",
          hint: "MP3, WAV, AAC, M4A supported • Replaces the current audio",
          icon: Music,
        };
      case "image":
        return {
          heading: "Change Image",
          buttonLabel: "Select New Image",
          accept: "image/*",
          hint: "JPG, PNG, WEBP supported • Replaces the current image",
          icon: ImageIcon,
        };
      default:
        return {
          heading: "Change File",
          buttonLabel: "Select New File",
          accept: ".html,.htm,.zip,.json",
          hint: "HTML / JSON supported • Replaces the current file",
          icon: FileCode2,
        };
    }
  };

  const replaceCfg = getReplaceConfig();
  const ReplaceIcon = replaceCfg.icon;

  if (loading && !content) {
    return (
      <div className="w-full bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex justify-center items-center h-64">
        <span className="text-gray-500 text-sm font-medium">Loading content...</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-gray-100 h-[calc(100vh-132px)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-5 border-b border-gray-100 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold text-gray-800">Update Content</h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#0B8843] border border-emerald-200">
              {mediaType === "video" && <Film size={13} />}
              {mediaType === "audio" && <Music size={13} />}
              {mediaType === "image" && <ImageIcon size={13} />}
              {mediaType === "html" && (builtInGame ? <Gamepad2 size={13} /> : <BookOpen size={13} />)}
              <span className="capitalize">
                {mediaType === "html" ? (builtInGame ? "Relaxing Game" : "Story / Game") : mediaType}
              </span>
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Update the title or replace the uploaded {mediaType === "html" ? "file" : mediaType}.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition cursor-pointer self-start sm:self-auto"
        >
          <ArrowLeft size={15} />
          <span>Back</span>
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Content Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter content title"
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B8843] focus:border-[#0B8843] outline-none transition"
          />
        </div>

        {/* Two Column Grid: Preview + Replace Media */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Content Preview */}
          <div className="lg:col-span-7 bg-gray-50/70 rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">
                {newMediaPreviewUrl ? "New Preview" : "Current Content Preview"}
              </h3>
              {newMediaFile && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0B8843]">
                  New File Ready
                </span>
              )}
            </div>
            {renderMediaPreview()}
          </div>

          {/* Replace Video / Audio / Image / File */}
          <div className="lg:col-span-5 bg-gray-50/70 rounded-2xl border border-gray-200 p-4 flex flex-col justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                {replaceCfg.heading}
              </h3>

              <label className="w-full h-48 border-2 border-dashed border-gray-300 hover:border-[#0B8843] hover:bg-emerald-50/30 rounded-xl bg-white flex flex-col items-center justify-center p-4 text-center cursor-pointer transition">
                <ReplaceIcon size={32} className="text-[#0B8843] mb-2" />
                {newMediaFile ? (
                  <div className="space-y-1 max-w-full">
                    <p className="text-sm font-semibold text-gray-800 truncate px-2">
                      {newMediaFile.name}
                    </p>
                    <p className="text-xs text-emerald-700 font-medium">
                      {(newMediaFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-700">
                      Click to {replaceCfg.buttonLabel.toLowerCase()}
                    </p>
                    <p className="text-xs text-gray-400">{replaceCfg.hint}</p>
                  </div>
                )}
                <input
                  type="file"
                  accept={replaceCfg.accept}
                  hidden
                  onChange={handleMediaFileChange}
                />
              </label>

              {newMediaFile && (
                <button
                  type="button"
                  onClick={clearNewMediaFile}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 cursor-pointer"
                >
                  <X size={14} />
                  <span>Remove selected file</span>
                </button>
              )}
            </div>

            {saving && uploadProgress > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-[#0B8843]">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#0B8843] h-2 transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <label className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-[#0B8843] border border-emerald-200 hover:bg-emerald-100 font-semibold text-sm rounded-xl transition cursor-pointer">
              <UploadCloud size={17} />
              <span>{replaceCfg.buttonLabel}</span>
              <input
                type="file"
                accept={replaceCfg.accept}
                hidden
                onChange={handleMediaFileChange}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Footer Save Bar */}
      <div className="pt-4 mt-4 border-t border-gray-100 flex justify-end shrink-0">
        <button
          type="button"
          onClick={handleSaveChanges}
          disabled={!hasChanges || saving}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition ${
            hasChanges && !saving
              ? "bg-[#0B8843] hover:bg-[#096e35] cursor-pointer shadow-xs"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          <Save size={16} />
          <span>{saving ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>
    </div>
  );
};

export default UpdateContent;
