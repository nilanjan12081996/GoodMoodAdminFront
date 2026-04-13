import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useRef, useState } from "react";
import { uploadContent } from "../../Reducer/ContentUploadSlice";


const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB

const generateUUID = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const UploadContent = () => {
  const baseUrl="https://newadminapigoodmood.goodmood.solutions"
  const location = useLocation();
  const id = location?.state?.id;

  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.content);

  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [uploadedMedia, setUploadedMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);

  const log = msg => setLogs(prev => [...prev, msg]);

  const isImage = file => file.type.startsWith("image/");
  const isVideo = file => file.type.startsWith("video/");
  const isAudio = file => file.type.startsWith("audio/");

 
  

  const resetUploadUI = () => {
    setFile(null);
    setProgress(0);
    setLogs([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    /* ================= IMAGE UPLOAD ================= */
    if (isImage(file)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("id", id);
      formData.append("originalName", file.name);

      log("Uploading image");

      const res = await dispatch(uploadContent(formData));

      if (uploadContent.rejected.match(res)) {
        log("Image upload failed");
        return;
      }

      setUploadedMedia({
        imageUrl: URL.createObjectURL(file),
      });
      setMediaType("image");
      resetUploadUI();
      return;
    }

    /* ================= VIDEO / AUDIO (CHUNKS) ================= */
    if (isVideo(file) || isAudio(file)) {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const fileKey = generateUUID();

      log(`Uploading ${file.type} in ${totalChunks} chunks`);

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

        const res = await dispatch(uploadContent(formData));

        if (uploadContent.rejected.match(res)) {
          log("Chunk upload failed");
          return;
        }

        const percent = Math.round(
          ((chunkIndex + 1) / totalChunks) * 100
        );
        setProgress(percent);
        log(`Chunk ${chunkIndex + 1}/${totalChunks} uploaded`);

        /* ===== FINAL CHUNK ===== */
        if (res.payload?.message === "Upload complete") {
          log("Upload completed");

          setUploadedMedia(res.payload);
          setMediaType(isVideo(file) ? "video" : "audio");

          resetUploadUI();
        }
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-2">
        🚀 Upload Content
      </h2>

      {/* Upload Section */}
      {!uploadedMedia && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            onChange={e => setFile(e.target.files[0])}
            className="w-full border-2 border-dashed p-3 rounded mb-4"
          />

          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>

          {/* Progress */}
          {progress > 0 && (
            <div className="mt-4">
              <progress value={progress} max="100" className="w-full" />
              <p className="text-center font-semibold">
                {progress}%
              </p>
            </div>
          )}

          {/* Logs */}
          <div className="mt-4 bg-black text-green-400 p-3 rounded h-36 overflow-y-auto text-xs font-mono">
            {logs.map((l, i) => (
              <div key={i}>&gt; {l}</div>
            ))}
          </div>
        </>
      )}

      {/* Preview Section */}
      {uploadedMedia && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-center mb-3">
            ✅ Upload Complete
          </h3>

          {/* VIDEO */}
          {mediaType === "video" && (
            <video
              controls
              className="w-full rounded"
              src={`${baseUrl}${uploadedMedia.videoUrl}`}
            />
          )}

          {/* AUDIO */}
          {mediaType === "audio" && (
            <audio
              controls
              className="w-full"
              src={`${baseUrl}${uploadedMedia.videoUrl}`}
            />
          )}

          {/* IMAGE */}
          {mediaType === "image" && (
            <img
              src={uploadedMedia.imageUrl}
              alt="Uploaded"
              className="w-full rounded"
            />
          )}

          {/* Thumbnail */}
          {uploadedMedia.thumbnailUrl && (
            <img
              src={`${baseUrl}${uploadedMedia.thumbnailUrl}`}
              alt="Thumbnail"
              className="w-full mt-3 rounded border"
            />
          )}

          <button
            onClick={() => setUploadedMedia(null)}
            className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Upload Another File
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadContent;
