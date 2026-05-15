// import { useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { useLocation } from "react-router-dom"
// import { contentListSingle } from "../../Reducer/ContentUploadSlice";
// import { useSelector } from "react-redux";

// const UpdateContent=()=>{
//     const{singleContent}=useSelector((state)=>state?.content)
//     const location=useLocation();

//     const id=location?.state?.id
//     const awid=location?.state?.awid
//     const dispatch=useDispatch()
//    useEffect(() => {
//     if (id && awid) {
//       dispatch(
//         contentListSingle({
//           id: awid,
//           cid: id,
//         })
//       );
//     }
//   }, [id, awid, dispatch]);
//     console.log("single data",singleContent);
    
//     return(
//         <>

//         </>
//     )
// }
// export default UpdateContent



import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { contentListSingle, contentUpdate } from "../../Reducer/ContentUploadSlice";

const UpdateContent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { singleContent, loading } = useSelector(
    (state) => state?.content
  );

  const id = location?.state?.id;
  const awid = location?.state?.awid;

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  useEffect(() => {
    if (id && awid) {
      dispatch(
        contentListSingle({
          id: awid,
          cid: id,
        })
      );
    }
  }, [id, awid, dispatch]);

  const content = singleContent?.data?.[0];
  const baseUrl = singleContent?.baseUrl;

  const mediaUrl = content ? `${baseUrl}${content.url}` : null;
  const thumbUrl = content ? `${baseUrl}${content.type}` : null;

  useEffect(() => {
    if (thumbUrl) {
      setThumbnailPreview(thumbUrl);
    }
  }, [thumbUrl]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleSaveThumbnail=()=>{
    if(!thumbUrl||!content?.id){
        return;
    }
    const formData=new FormData()
    formData.append('file',thumbnailFile)
    dispatch(contentUpdate({
        id:id,
        file:formData
    })).then((res)=>{
        if(res?.payload?.statusCode===200||res?.payload?.statusCode===201){
            dispatch(
        contentListSingle({
          id: awid,
          cid: id,
        })
      );
        }
    })
  }

  const getMediaType = (url) => {
    if (!url) return null;
    if (url.endsWith(".m3u8") || url.endsWith(".mp4")) return "video";
    if (url.endsWith(".mp3") || url.endsWith(".wav")) return "audio";
    if (url.match(/\.(jpg|jpeg|png|webp)$/)) return "image";
    return null;
  };

  const renderMedia = () => {
    const mediaType = getMediaType(mediaUrl);

    if (mediaType === "video") {
      return (
        <video
          src={mediaUrl}
          controls
          className="w-full rounded-lg shadow"
        />
      );
    }

    if (mediaType === "audio") {
      return (
        <audio
          src={mediaUrl}
          controls
          className="w-full"
        />
      );
    }

    if (mediaType === "image") {
      return (
        <img
          src={mediaUrl}
          alt="content"
          className="w-full rounded-lg shadow object-cover"
        />
      );
    }

    return (
      <p className="text-gray-500">
        Unsupported media type
      </p>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-gray-500">Loading content...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
     
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">
          Update Content
        </h2>
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
        >
          Back
        </button>
      </div>

      {/* Content Preview */}
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-medium mb-3">
          Content Preview
        </h3>
        {renderMedia()}
      </div>

      {/* Thumbnail Update */}
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-medium mb-3">
          Thumbnail
        </h3>

        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Thumbnail Preview */}
          <div className="w-44 h-44 border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
            {thumbnailPreview ? (
              <img
                src={thumbnailPreview}
                alt="thumbnail"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400 text-sm">
                No Thumbnail
              </span>
            )}
          </div>

          {/* Upload */}
          <div>
            <label className="inline-block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleThumbnailChange}
              />
              <div className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">
                Change Thumbnail
              </div>
            </label>

            <p className="text-xs text-gray-500 mt-2">
              Image only • JPG, PNG, WEBP
            </p>
          </div>
        </div>
      </div>

      {/* Save Button (optional) */}
      <div className="flex justify-end">
        <button
        onClick={()=>{handleSaveThumbnail()}}
          disabled={!thumbnailFile}
          className={`px-6 py-2 rounded-md text-white transition ${
            thumbnailFile
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Save Thumbnail
        </button>
      </div>
    </div>
  );
};

export default UpdateContent;
