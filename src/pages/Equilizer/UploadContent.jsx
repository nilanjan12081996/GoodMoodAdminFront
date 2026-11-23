import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { uploadContent, contentList } from "../../Reducer/ContentUploadSlice";
import { getSingleAwarness } from "../../Reducer/MoodMeterSlice";
import { inferContentType, EQUALIZER_TYPE_CONFIG } from "../../utils/equalizerHelper";
import { BUILT_IN_GAMES } from "../../data/builtInGames";
import { generateGameCoverFile, getGameCoverDataUrl } from "../../utils/gameCoverHelper";
import { toast } from "react-toastify";
import {
  Video,
  Headphones,
  BookOpen,
  Palette,
  Gamepad2,
  ArrowLeft,
  UploadCloud,
  CheckCircle2,
  Eye,
  FileText,
  Image as ImageIcon,
  FileCode2,
  X,
  Play,
  Plus,
  HelpCircle,
} from "lucide-react";

const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB

const TYPE_ICONS = {
  video: Video,
  audio: Headphones,
  story: BookOpen,
  drawing: Palette,
  game: Gamepad2,
};

const generateUUID = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const UploadContent = () => {
  const navigate = useNavigate();
  const baseUrl = "https://newadminapigoodmood.goodmood.solutions";
  const location = useLocation();
  const id = location?.state?.id;

  const dispatch = useDispatch();
  const { loading, allContent } = useSelector((state) => state.content);
  const { singleAwarness } = useSelector((state) => state.moodData);

  const [contentType, setContentType] = useState(
    location?.state?.contentType || ""
  );
  const [categoryName, setCategoryName] = useState(
    location?.state?.categoryName || ""
  );

  useEffect(() => {
    if (id && (!contentType || !categoryName)) {
      dispatch(getSingleAwarness({ id }));
    }
  }, [id, contentType, categoryName, dispatch]);

  useEffect(() => {
    if (singleAwarness?.data) {
      const name = singleAwarness.data.awarenessName || "";
      if (!categoryName) setCategoryName(name);
      if (!contentType) {
        setContentType(
          singleAwarness.data.colorCode || inferContentType(name)
        );
      }
    }
  }, [singleAwarness, categoryName, contentType]);

  const activeType = (contentType || "video").toLowerCase();
  const typeConfig = EQUALIZER_TYPE_CONFIG[activeType] || EQUALIZER_TYPE_CONFIG.video;
  const TypeIcon = TYPE_ICONS[activeType] || Video;

  // Shared media state
  const fileInputRef = useRef(null);
  const thumbInputRef = useRef(null);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [uploadedMedia, setUploadedMedia] = useState(null);
  const [uploadedType, setUploadedType] = useState(null);

  // Story (Tiptap) state
  const [storyTitleHtml, setStoryTitleHtml] = useState("");
  const [storyContentHtml, setStoryContentHtml] = useState("");

  // Built-in 20 Games Library state
  const [gameTab, setGameTab] = useState("library"); // "library" | "custom"
  const [gameGroupFilter, setGameGroupFilter] = useState("All");
  const [previewGame, setPreviewGame] = useState(null);
  const [helpGame, setHelpGame] = useState(null);
  const [showInGameHelp, setShowInGameHelp] = useState(false);
  const [publishingGameId, setPublishingGameId] = useState(null);
  const [bulkPublishing, setBulkPublishing] = useState(false);

  useEffect(() => {
    if (id && activeType === "game") {
      dispatch(contentList({ id }));
    }
  }, [id, activeType, dispatch]);

  const publishedTitles = new Set(
    (allContent?.data || []).map((item) =>
      String(item?.name || "").trim().toLowerCase()
    )
  );

  const uploadSingleBuiltInGame = async (game) => {
    const response = await fetch(`/games/${game.file}`);
    if (!response.ok) throw new Error(`Could not load ${game.file}`);
    const htmlText = await response.text();
    const gameBlob = new Blob([htmlText], { type: "text/html" });
    const gameFile = new File([gameBlob], game.file, { type: "text/html" });

    const coverFile = await generateGameCoverFile(game);

    const formData = new FormData();
    formData.append("file", gameFile);
    formData.append("id", id);
    formData.append("originalName", game.file);
    formData.append("name", game.title);
    if (coverFile) {
      formData.append("thumbnail", coverFile);
    }

    const res = await dispatch(uploadContent(formData));
    if (uploadContent.rejected.match(res)) {
      throw new Error(`Failed to upload ${game.title}`);
    }
  };

  const handlePublishBuiltInGame = async (game) => {
    setPublishingGameId(game.id);
    try {
      await uploadSingleBuiltInGame(game);
      toast.success(`"${game.title}" added! You can toggle it On/Off in View Content.`);
      dispatch(contentList({ id }));
    } catch (err) {
      toast.error(err?.message || "Failed to add game");
    } finally {
      setPublishingGameId(null);
    }
  };

  const handlePublishAllGames = async () => {
    const missing = BUILT_IN_GAMES.filter(
      (g) => !publishedTitles.has(g.title.trim().toLowerCase())
    );
    if (missing.length === 0) {
      toast.info("All 20 games are already added to this category!");
      return;
    }
    setBulkPublishing(true);
    let addedCount = 0;
    try {
      for (const game of missing) {
        await uploadSingleBuiltInGame(game);
        addedCount++;
      }
      toast.success(`Successfully added ${addedCount} game(s)! Toggle any On/Off in View Content.`);
      dispatch(contentList({ id }));
    } catch (err) {
      toast.error(`Added ${addedCount} games, then encountered an error.`);
      dispatch(contentList({ id }));
    } finally {
      setBulkPublishing(false);
    }
  };

  const log = (msg) => setLogs((prev) => [...prev, msg]);

  const resetForm = () => {
    setTitle("");
    setFile(null);
    setImagePreview(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setProgress(0);
    setLogs([]);
    setStoryTitleHtml("");
    setStoryContentHtml("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (thumbInputRef.current) thumbInputRef.current.value = "";
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    if (selectedFile.type.startsWith("image/")) {
      setImagePreview(URL.createObjectURL(selectedFile));
    } else {
      setImagePreview(null);
    }
    if (!title.trim()) {
      const cleanName = selectedFile.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[_-]+/g, " ");
      setTitle(cleanName);
    }
  };

  const handleThumbnailSelect = (selectedFile) => {
    if (!selectedFile) return;
    setThumbnailFile(selectedFile);
    setThumbnailPreview(URL.createObjectURL(selectedFile));
  };

  const clearThumbnail = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (thumbInputRef.current) thumbInputRef.current.value = "";
  };

  /* ================= VIDEO & AUDIO UPLOAD (CHUNKS) ================= */
  const handleMediaChunkUpload = async () => {
    if (!title.trim()) {
      toast.error(
        `Please enter a ${activeType === "video" ? "Video" : "Audio"} Title`
      );
      return;
    }
    if (!file) {
      toast.error(`Please select a ${activeType} file`);
      return;
    }

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const fileKey = generateUUID();
    setLogs([]);
    log(`Uploading ${file.name} in ${totalChunks} chunks...`);

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(file.size, start + CHUNK_SIZE);
      const chunkBlob = file.slice(start, end);

      const formData = new FormData();
      formData.append("file", chunkBlob);
      formData.append("chunkIndex", chunkIndex);
      formData.append("totalChunks", totalChunks);
      formData.append("fileKey", fileKey);
      formData.append("originalName", file.name);
      formData.append("id", id);
      formData.append("name", title.trim());

      const res = await dispatch(uploadContent(formData));

      if (uploadContent.rejected.match(res)) {
        log("Chunk upload failed");
        toast.error("Upload failed. Please try again.");
        return;
      }

      const percent = Math.round(((chunkIndex + 1) / totalChunks) * 100);
      setProgress(percent);
      log(`Chunk ${chunkIndex + 1}/${totalChunks} uploaded`);

      if (res.payload?.message === "Upload complete") {
        log("Upload completed successfully!");
        toast.success(`${typeConfig.label} uploaded successfully!`);
        setUploadedMedia({ ...res.payload, title: title.trim() });
        setUploadedType(activeType);
        resetForm();
      }
    }
  };

  /* ================= DRAWING / IMAGE UPLOAD ================= */
  const handleDrawingUpload = async () => {
    if (!title.trim()) {
      toast.error("Please enter a Drawing / Artwork Title");
      return;
    }
    if (!file) {
      toast.error("Please select an image file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("id", id);
    formData.append("originalName", file.name);
    formData.append("name", title.trim());

    const res = await dispatch(uploadContent(formData));
    if (uploadContent.rejected.match(res)) {
      toast.error("Image upload failed");
      return;
    }

    toast.success("Artwork uploaded successfully!");
    setUploadedMedia({
      imageUrl: URL.createObjectURL(file),
      title: title.trim(),
    });
    setUploadedType("drawing");
    resetForm();
  };

  /* ================= STORY (PLAIN TEXT + THUMBNAIL) UPLOAD ================= */
  const handleStoryUpload = async () => {
    const plainTitle = storyTitleHtml.trim();
    const plainBody = storyContentHtml.trim();

    if (!plainTitle) {
      toast.error("Please enter a Story Title");
      return;
    }
    if (!plainBody) {
      toast.error("Please write the Story Content");
      return;
    }

    const formattedTitleHtml = `<h1>${escapeHtml(plainTitle)}</h1>`;
    const formattedBodyHtml = plainBody
      .split(/\n+/)
      .map((para) => para.trim())
      .filter(Boolean)
      .map((para) => `<p>${escapeHtml(para)}</p>`)
      .join("\n      ");

    const htmlDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(plainTitle)}</title>
</head>
<body>
  <article data-type="goodmood-story">
    <header class="story-title">${formattedTitleHtml}</header>
    <section class="story-content">
      ${formattedBodyHtml}
    </section>
  </article>
</body>
</html>`;

    const storyBlob = new Blob([htmlDocument], { type: "text/html" });
    const storyFile = new File([storyBlob], `story_${Date.now()}.html`, {
      type: "text/html",
    });

    const formData = new FormData();
    formData.append("file", storyFile);
    formData.append("id", id);
    formData.append("originalName", storyFile.name);
    formData.append("name", plainTitle);
    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }

    const res = await dispatch(uploadContent(formData));
    if (uploadContent.rejected.match(res)) {
      toast.error("Failed to publish story");
      return;
    }

    toast.success("Story published successfully!");
    setUploadedMedia({
      title: plainTitle,
      storyTitleHtml: formattedTitleHtml,
      storyContentHtml: formattedBodyHtml,
      thumbPreview: thumbnailPreview,
    });
    setUploadedType("story");
    resetForm();
  };

  /* ================= CUSTOM PROGRAMMED GAME UPLOAD ================= */
  const handleGameUpload = async () => {
    if (!title.trim()) {
      toast.error("Please enter a Game Title");
      return;
    }
    if (!file) {
      toast.error("Please select your game file (.html, .htm, .zip, or .json)");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("id", id);
    formData.append("originalName", file.name);
    formData.append("name", title.trim());
    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }

    const res = await dispatch(uploadContent(formData));
    if (uploadContent.rejected.match(res)) {
      toast.error("Failed to upload game package");
      return;
    }

    toast.success("Game package uploaded successfully!");
    setUploadedMedia({
      title: title.trim(),
      fileName: file.name,
      thumbPreview: thumbnailPreview,
    });
    setUploadedType("game");
    resetForm();
  };

  if (!id) {
    return (
      <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <p className="text-gray-600 mb-4">No Mood Equalizer category selected.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-[#0B8843] text-white rounded-lg font-medium hover:bg-[#096e35] cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="w-full bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-gray-100 h-[calc(100vh-132px)] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-gray-100 shrink-0">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl font-bold text-gray-800">
                Upload {typeConfig.label}
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${typeConfig.bg}`}
              >
                <TypeIcon size={13} className="shrink-0" />
                <span>{typeConfig.label}</span>
              </span>
            </div>
            {categoryName && (
              <p className="text-sm text-gray-500 mt-1">
                Category:{" "}
                <span className="font-semibold text-gray-700">{categoryName}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                navigate("/view-content", {
                  state: { id, contentType: activeType, categoryName },
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-[#0B8843] bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition cursor-pointer"
            >
              <Eye size={15} />
              <span>View Uploaded</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* ================= UPLOAD FORM BY TYPE ================= */}
        {!uploadedMedia && (
          <div
            className={`flex-1 min-h-0 ${
              activeType === "game"
                ? "flex flex-col"
                : "overflow-y-auto pr-1 space-y-6"
            }`}
          >
            {/* ---------- 1. VIDEO & AUDIO ---------- */}
            {(activeType === "video" || activeType === "audio") && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {activeType === "video" ? "Video Title" : "Audio Title"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      activeType === "video"
                        ? "e.g. 5-Minute Guided Breathing Session"
                        : "e.g. Peaceful Rainforest Relaxation"
                    }
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B8843] focus:border-[#0B8843] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {activeType === "video"
                      ? "Select Video File"
                      : "Select Audio File"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-[#0B8843] hover:bg-emerald-50/30 transition">
                    <UploadCloud size={36} className="text-[#0B8843] mb-2" />
                    <span className="text-sm font-semibold text-gray-700">
                      {file
                        ? file.name
                        : activeType === "video"
                        ? "Click to choose a video file (MP4, MOV, MKV)"
                        : "Click to choose an audio file (MP3, WAV, AAC, M4A)"}
                    </span>
                    {file && (
                      <span className="text-xs text-gray-500 mt-1">
                        Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={activeType === "video" ? "video/*" : "audio/*"}
                      onChange={(e) => handleFileSelect(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleMediaChunkUpload}
                  disabled={loading}
                  className="w-full bg-[#0B8843] hover:bg-[#096e35] text-white font-semibold py-3 rounded-xl transition disabled:bg-gray-400 cursor-pointer flex items-center justify-center gap-2"
                >
                  <UploadCloud size={18} />
                  <span>
                    {loading
                      ? `Uploading (${progress}%)...`
                      : `Upload ${activeType === "video" ? "Video" : "Audio"}`}
                  </span>
                </button>

                {progress > 0 && (
                  <div className="space-y-1.5">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-[#0B8843] h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-center font-semibold text-gray-600">
                      {progress}% uploaded
                    </p>
                  </div>
                )}

                {logs.length > 0 && (
                  <div className="bg-slate-900 text-emerald-400 p-3.5 rounded-xl h-32 overflow-y-auto text-xs font-mono">
                    {logs.map((l, i) => (
                      <div key={i}>&gt; {l}</div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ---------- 2. DRAWING / ART ---------- */}
            {activeType === "drawing" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Drawing / Artwork Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Peaceful Mandala Coloring Pattern"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B8843] focus:border-[#0B8843] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Drawing / Reference Image{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-[#0B8843] hover:bg-emerald-50/30 transition">
                    {imagePreview ? (
                      <div className="text-center">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-56 rounded-lg mx-auto mb-3 border border-gray-200 shadow-xs"
                        />
                        <span className="text-xs font-medium text-gray-600">
                          {file?.name} — Click to change image
                        </span>
                      </div>
                    ) : (
                      <>
                        <Palette size={36} className="text-purple-600 mb-2" />
                        <span className="text-sm font-semibold text-gray-700">
                          Click to upload image (PNG, JPG, WEBP, SVG)
                        </span>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleDrawingUpload}
                  disabled={loading}
                  className="w-full bg-[#0B8843] hover:bg-[#096e35] text-white font-semibold py-3 rounded-xl transition disabled:bg-gray-400 cursor-pointer flex items-center justify-center gap-2"
                >
                  <UploadCloud size={18} />
                  <span>{loading ? "Uploading..." : "Upload Artwork"}</span>
                </button>
              </>
            )}

            {/* ---------- 3. STORY / TEXT (PLAIN INPUTS + THUMBNAIL) ---------- */}
            {activeType === "story" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Story Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={storyTitleHtml}
                    onChange={(e) => setStoryTitleHtml(e.target.value)}
                    placeholder="Enter story or article title..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-[#0B8843] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Story Thumbnail / Cover Image (Optional)
                  </label>
                  <label className="relative flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl p-5 cursor-pointer hover:border-[#0B8843] hover:bg-emerald-50/30 transition">
                    {thumbnailPreview ? (
                      <div className="relative flex items-center gap-4">
                        <img
                          src={thumbnailPreview}
                          alt="Story Thumbnail"
                          className="h-24 w-36 object-cover rounded-lg border border-gray-200 shadow-xs"
                        />
                        <div className="text-left">
                          <p className="text-sm font-semibold text-gray-700">
                            {thumbnailFile?.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Click to change thumbnail
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={clearThumbnail}
                          title="Remove thumbnail"
                          className="p-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-gray-600">
                        <ImageIcon size={24} className="text-[#0B8843]" />
                        <span className="text-sm font-medium">
                          Click to upload Story Cover / Thumbnail (PNG, JPG, WEBP)
                        </span>
                      </div>
                    )}
                    <input
                      ref={thumbInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleThumbnailSelect(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Story Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={10}
                    value={storyContentHtml}
                    onChange={(e) => setStoryContentHtml(e.target.value)}
                    placeholder="Write the calming story, reflection, or mindfulness article here..."
                    className="w-full border border-gray-300 rounded-xl p-4 text-sm text-gray-800 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-[#0B8843] focus:border-transparent resize-y"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleStoryUpload}
                  disabled={loading}
                  className="w-full bg-[#0B8843] hover:bg-[#096e35] text-white font-semibold py-3 rounded-xl transition disabled:bg-gray-400 cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileText size={18} />
                  <span>{loading ? "Saving Story..." : "Publish Story"}</span>
                </button>
              </>
            )}

            {/* ---------- 4. RELAXING GAME (BUILT-IN 20 GAMES LIBRARY + CUSTOM UPLOAD) ---------- */}
            {activeType === "game" && (
              <div className="flex flex-col flex-1 min-h-0 space-y-4">
                {/* Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setGameTab("library")}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
                        gameTab === "library"
                          ? "bg-[#0B8843] text-white shadow-xs"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <Gamepad2 size={16} />
                      <span>Built-in 20 Games Library</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGameTab("custom")}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
                        gameTab === "custom"
                          ? "bg-[#0B8843] text-white shadow-xs"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <FileCode2 size={16} />
                      <span>Upload Custom Game</span>
                    </button>
                  </div>

                  {gameTab === "library" && (
                    <button
                      type="button"
                      onClick={handlePublishAllGames}
                      disabled={bulkPublishing || publishingGameId !== null}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-50 text-[#0B8843] border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                      <Plus size={16} />
                      <span>
                        {bulkPublishing
                          ? "Publishing Games..."
                          : "Publish All 20 Games"}
                      </span>
                    </button>
                  )}
                </div>

                {/* Tab 1: Built-in 20 Games Library */}
                {gameTab === "library" && (
                  <div className="flex flex-col flex-1 min-h-0 space-y-3">
                    {/* Group Filter */}
                    <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {[
                          { label: "All (20)", value: "All" },
                          {
                            label: "GoodMood Wellness (10)",
                            value: "GoodMood Wellness",
                          },
                          {
                            label: "Common Relaxing (10)",
                            value: "Common Relaxing",
                          },
                        ].map((tab) => (
                          <button
                            key={tab.value}
                            type="button"
                            onClick={() => setGameGroupFilter(tab.value)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                              gameGroupFilter === tab.value
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        Added games can be toggled ON/OFF anytime from View
                        Content.
                      </span>
                    </div>

                    {/* Games Grid (Inner Scrollable Area) */}
                    <div className="flex-1 min-h-0 overflow-y-auto pr-1.5">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-2">
                      {BUILT_IN_GAMES.filter(
                        (g) =>
                          gameGroupFilter === "All" ||
                          g.group === gameGroupFilter
                      ).map((game) => {
                        const isAdded = publishedTitles.has(
                          game.title.toLowerCase()
                        );
                        const isPublishing = publishingGameId === game.id;

                        return (
                          <div
                            key={game.id}
                            className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:border-[#52b69a] hover:shadow-xs transition flex flex-col justify-between"
                          >
                            <div className="relative h-28 w-full overflow-hidden bg-gray-100">
                              <img
                                src={getGameCoverDataUrl(game)}
                                alt={game.title}
                                className="w-full h-full object-cover"
                              />
                              <span
                                className={`absolute top-2.5 right-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-xs ${
                                  game.group === "GoodMood Wellness"
                                    ? "bg-emerald-950/75 text-emerald-100 border border-emerald-400/30"
                                    : "bg-slate-900/70 text-sky-100 border border-sky-300/30"
                                }`}
                              >
                                {game.group === "GoodMood Wellness"
                                  ? "GoodMood App"
                                  : "Common"}
                              </span>
                            </div>

                            <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
                              <div>
                                <h3 className="text-sm font-bold text-gray-900 leading-snug mb-1">
                                  {game.title}
                                </h3>
                                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                                  {game.description}
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
                                <button
                                  type="button"
                                  onClick={() => setHelpGame(game)}
                                  className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-[#0B8843] border border-emerald-200 transition cursor-pointer flex items-center justify-center gap-1 shrink-0"
                                  title="How to Play / Instructions"
                                >
                                  <HelpCircle size={14} />
                                  <span>Help</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreviewGame(game);
                                    setShowInGameHelp(false);
                                  }}
                                  className="flex-1 py-2 px-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <Play size={14} />
                                  <span>Play</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handlePublishBuiltInGame(game)}
                                  disabled={
                                    isAdded ||
                                    isPublishing ||
                                    bulkPublishing
                                  }
                                  className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 ${
                                    isAdded
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                                      : "bg-[#0B8843] hover:bg-[#096e35] text-white cursor-pointer disabled:opacity-50"
                                  }`}
                                >
                                  {isAdded ? (
                                    <>
                                      <CheckCircle2 size={13} />
                                      <span>Added</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus size={13} />
                                      <span>
                                        {isPublishing
                                          ? "Adding..."
                                          : "Add"}
                                      </span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Custom Game Upload */}
                {gameTab === "custom" && (
                  <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Game Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Calm Bubble Popper / Mindful Memory Game"
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B8843] focus:border-[#0B8843] outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Game Thumbnail / Cover Image (Optional)
                      </label>
                      <label className="relative flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl p-5 cursor-pointer hover:border-[#0B8843] hover:bg-emerald-50/30 transition">
                        {thumbnailPreview ? (
                          <div className="relative flex items-center gap-4">
                            <img
                              src={thumbnailPreview}
                              alt="Game Thumbnail"
                              className="h-24 w-36 object-cover rounded-lg border border-gray-200 shadow-xs"
                            />
                            <div className="text-left">
                              <p className="text-sm font-semibold text-gray-700">
                                {thumbnailFile?.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Click to change thumbnail
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={clearThumbnail}
                              title="Remove thumbnail"
                              className="p-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-gray-600">
                            <ImageIcon size={24} className="text-[#0B8843]" />
                            <span className="text-sm font-medium">
                              Click to upload Game Cover / Thumbnail (PNG, JPG,
                              WEBP)
                            </span>
                          </div>
                        )}
                        <input
                          ref={thumbInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleThumbnailSelect(e.target.files[0])
                          }
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Upload Game Code / Package{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-[#0B8843] hover:bg-emerald-50/30 transition">
                        <FileCode2 size={38} className="text-[#0B8843] mb-2" />
                        <span className="text-sm font-semibold text-gray-700">
                          {file
                            ? file.name
                            : "Click to upload your built game (.html, .htm, .zip, .json)"}
                        </span>
                        <span className="text-xs text-gray-500 mt-1 text-center max-w-md">
                          Build your relaxing game in HTML5 / CSS / JavaScript
                          (single standalone <code>.html</code> file or{" "}
                          <code>.zip</code> / <code>.json</code> package) and
                          upload it here.
                        </span>
                        {file && (
                          <span className="text-xs text-emerald-700 font-medium mt-2">
                            Size: {(file.size / 1024).toFixed(1)} KB
                          </span>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".html,.htm,.zip,.json"
                          onChange={(e) => handleFileSelect(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={handleGameUpload}
                      disabled={loading}
                      className="w-full bg-[#0B8843] hover:bg-[#096e35] text-white font-semibold py-3 rounded-xl transition disabled:bg-gray-400 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Gamepad2 size={18} />
                      <span>
                        {loading ? "Uploading Game..." : "Upload Game"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= UPLOAD COMPLETE PREVIEW ================= */}
        {uploadedMedia && (
          <div className="mt-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-lg">
              <CheckCircle2 size={22} />
              <span>Upload Complete!</span>
            </div>

            {uploadedMedia.title && (
              <p className="text-center text-sm font-semibold text-gray-800">
                Title: {uploadedMedia.title}
              </p>
            )}

            {uploadedMedia.thumbPreview && (
              <img
                src={uploadedMedia.thumbPreview}
                alt="Thumbnail"
                className="h-32 mx-auto rounded-xl border border-gray-200 shadow-xs object-cover"
              />
            )}

            {uploadedType === "video" && uploadedMedia.videoUrl && (
              <video
                controls
                className="w-full max-h-80 rounded-xl bg-black"
                src={`${baseUrl}${uploadedMedia.videoUrl}`}
              />
            )}

            {uploadedType === "audio" && uploadedMedia.videoUrl && (
              <audio
                controls
                className="w-full"
                src={`${baseUrl}${uploadedMedia.videoUrl}`}
              />
            )}

            {uploadedType === "drawing" && uploadedMedia.imageUrl && (
              <img
                src={uploadedMedia.imageUrl}
                alt={uploadedMedia.title || "Uploaded"}
                className="max-h-72 mx-auto rounded-xl border border-gray-200 shadow-xs"
              />
            )}

            {uploadedType === "story" && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 max-h-80 overflow-y-auto prose prose-sm max-w-none">
                <div
                  className="text-lg font-bold mb-2 text-gray-900"
                  dangerouslySetInnerHTML={{
                    __html: uploadedMedia.storyTitleHtml,
                  }}
                />
                <div
                  className="text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: uploadedMedia.storyContentHtml,
                  }}
                />
              </div>
            )}

            {uploadedType === "game" && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center text-sm text-gray-600">
                Game file <strong>{uploadedMedia.fileName}</strong> uploaded
                successfully!
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUploadedMedia(null)}
                className="flex-1 bg-[#0B8843] hover:bg-[#096e35] text-white font-semibold py-2.5 rounded-xl transition cursor-pointer"
              >
                Upload Another
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate("/view-content", {
                    state: { id, contentType: activeType, categoryName },
                  })
                }
                className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-xl transition cursor-pointer"
              >
                View All Content
              </button>
            </div>
          </div>
        )}
        {/* ================= GAME PLAY / TEST MODAL ================= */}
        {previewGame && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-200 flex flex-col">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: previewGame.accent }}
                  />
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {previewGame.title}
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      {previewGame.group}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowInGameHelp(!showInGameHelp)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                      showInGameHelp
                        ? "bg-[#0B8843] text-white border-[#0B8843]"
                        : "bg-white text-[#0B8843] border-emerald-200 hover:bg-emerald-50"
                    }`}
                  >
                    <HelpCircle size={14} />
                    <span>{showInGameHelp ? "Hide Rules" : "How to Play"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewGame(null);
                      setShowInGameHelp(false);
                    }}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Collapsible How to Play Banner in Test Modal */}
              {showInGameHelp && (
                <div className="bg-emerald-50/95 border-b border-emerald-200 p-4 text-xs text-gray-700 animate-in fade-in duration-150 space-y-2 max-h-48 overflow-y-auto">
                  <div className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                    <span>🎯</span> Objective: {previewGame.howToPlay?.objective || previewGame.description}
                  </div>
                  <div>
                    <span className="font-bold text-[#0B8843]">Rules & Controls:</span>
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-600">
                      {(previewGame.howToPlay?.rules || []).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                  {previewGame.howToPlay?.benefit && (
                    <div className="text-[11px] font-semibold text-emerald-800 pt-1 border-t border-emerald-200/60">
                      🌿 {previewGame.howToPlay.benefit}
                    </div>
                  )}
                </div>
              )}

              <div className="w-full h-[540px] bg-gray-900">
                <iframe
                  src={`/games/${previewGame.file}`}
                  title={previewGame.title}
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= HOW TO PLAY / HELP MODAL ================= */}
        {helpGame && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-200 flex flex-col animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#0B8843] flex items-center justify-center shrink-0">
                    <HelpCircle size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 leading-tight">
                      {helpGame.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">How to Play & Game Rules</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHelpGame(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4 max-h-[70vh] text-sm text-gray-700">
                {/* Objective */}
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <span>🎯</span> Objective
                  </div>
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                    {helpGame.howToPlay?.objective || helpGame.description}
                  </p>
                </div>

                {/* How to Play Rules */}
                <div>
                  <div className="text-xs font-bold text-[#0B8843] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span>🕹️</span> How to Play
                  </div>
                  <ol className="space-y-2 pl-4 list-decimal text-xs text-gray-600 leading-relaxed">
                    {(helpGame.howToPlay?.rules || []).map((rule, idx) => (
                      <li key={idx} className="pl-1">
                        {rule}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Wellness Benefit */}
                {helpGame.howToPlay?.benefit && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <span>🌿</span> Mental Wellness Benefit
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed">
                      {helpGame.howToPlay.benefit}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const target = helpGame;
                    setHelpGame(null);
                    setPreviewGame(target);
                    setShowInGameHelp(false);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#0B8843] hover:bg-[#096e35] text-white transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Play size={15} />
                  <span>Play & Test Game</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHelpGame(null)}
                  className="py-2.5 px-5 rounded-xl text-xs font-semibold bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UploadContent;
