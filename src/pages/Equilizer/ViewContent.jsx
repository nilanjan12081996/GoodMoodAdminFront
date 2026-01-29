import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import { contentList } from "../../Reducer/ContentUploadSlice";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { changeStatusEquilizer } from "../../Reducer/EquilizerSlice";

const VideoCellRenderer = (params) => {
  const { data, context } = params;
  if (!data) return null;
 
  

  const baseUrl = context.baseUrl;
   console.log("baseUrl",baseUrl);
  const isVideo = data.url?.endsWith(".m3u8");
  const isImage =
    data.url?.endsWith(".png") ||
    data.url?.endsWith(".jpg") ||
    data.url?.endsWith(".jpeg");

  /* ===== VIDEO (continuous play) ===== */
  if (isVideo) {
    return (
      <video
        src={`${baseUrl}${data.url}`}
        poster={`${baseUrl}${data.type}`} // thumbnail
        autoPlay
        loop
        muted
        playsInline
        className="w-40 h-24 object-cover rounded"
      />
    );
  }

  /* ===== IMAGE ===== */
  if (isImage) {
    return (
      <img
        src={`${baseUrl}${data.url}`}
        alt="content"
        className="w-24 h-24 object-cover rounded"
      />
    );
  }

  return null;
};

const ViewContent = () => {
    const navigate=useNavigate()
  const dispatch = useDispatch();
  const location = useLocation();
  const id = location.state.id;

  const { allContent } = useSelector((state) => state.content);

  useEffect(() => {
    dispatch(contentList({ id }));
  }, [dispatch, id]);

  const handleUpdateThumbnil=(cid)=>{
    navigate("/update-content",{state:{id:cid,awid:id}})
  }

  const columnDefs = useMemo(
    () => [
      {
        headerName: "Preview",
        field: "url",
        cellRenderer: VideoCellRenderer,
        width: 220,
      },
        
      {
                   field: "status",
                   headerName: "Status",
                   cellRenderer: (params) => {
                     const isChecked = params.value;
           
                     const handleStatusChange = () => {
                       const newStatus = isChecked ? 0 : 1;
                       dispatch(
                         changeStatusEquilizer({ id: params.data.id, status: newStatus })
                       ).then(() => {
                         dispatch(contentList({ id }));
                       });
                     };
           
                     return (
                       <label className="inline-flex items-center cursor-pointer">
                         <input
                           type="checkbox"
                           checked={isChecked}
                           onChange={() => handleStatusChange(params.data.id, isChecked)}
                           className="sr-only peer"
                         />
                         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 relative"></div>
                       </label>
                     );
                   },
                 },
      {
        headerName:"Action",
        field:"action",
        width:150,
        cellRenderer:(params)=>{
          return(
            <>
            <button
            type="button"
            onClick={()=>handleUpdateThumbnil(params?.data?.id)}
             className="bg-[#52b69a] hover:bg-black px-4 py-1 text-white text-base font-semibold flex justify-center items-center rounded-md"
            >
              Update
            </button>
            </>
          )
        }
      }
     
    ],
    []
  );
const handleNewUpload=()=>{
  navigate("/upload-content",{state:{id:id}})
}
  return (
    <div className="p-6">
        <div className="flex justify-between items-center mb-4">
           <h2 className="text-2xl font-semibold mb-4">
        🎥 Uploaded Content
        </h2> 
        <button
        className="bg-[#52b69a] hover:bg-black px-4 py-1 text-white text-base font-semibold flex justify-center items-center rounded-md"
        onClick={()=>handleNewUpload()}
        >
            Upload New Content
        </button>
        </div>
   

      <div className="ag-theme-alpine w-full" style={{ height: 500 }}>
        <AgGridReact
          rowData={allContent?.data || []}
          columnDefs={columnDefs}
          context={{ baseUrl: allContent?.baseUrl }}
          rowHeight={110}
          pagination
          paginationPageSize={5}
          suppressCellFocus
        />
      </div>
    </div>
  );
};

export default ViewContent;
