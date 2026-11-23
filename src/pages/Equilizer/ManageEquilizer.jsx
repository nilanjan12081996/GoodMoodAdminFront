import { useEffect, useMemo, useState } from "react"
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import { changeStatusEquilizer, getEquilizer, toggleStatus } from "../../Reducer/EquilizerSlice"
import { ToastContainer } from "react-toastify"
import { Button } from "flowbite-react"
import { AgGridReact } from "ag-grid-react"
import AddManageEquilizer from "./AddManageEquilizer"
import { useNavigate, useParams } from "react-router-dom"
import AddMoodMeterModal from "../MoodMeter/AddMoodMeterModal"
import { getAwarness, getSingleAwarness, uploladImage } from "../../Reducer/MoodMeterSlice"
import UpdateMoodMeterModal from "../MoodMeter/UpdateMoodMeterModal"
import { inferContentType, EQUALIZER_TYPE_CONFIG } from "../../utils/equalizerHelper"
import { Video, Headphones, BookOpen, Palette, Gamepad2 } from "lucide-react"

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const TYPE_ICONS = {
  video: Video,
  audio: Headphones,
  story: BookOpen,
  drawing: Palette,
  game: Gamepad2,
};

const ManageEquilizer=()=>{
    const{equilizerList}=useSelector((state)=>state?.equilize)
      const { allMoodMeter,singleAwarness } = useSelector((state) => state?.moodData);
       const [openUpdateTagModal, setOpenUpdateTagModal] = useState(false);
    const dispatch=useDispatch()
    const navigate=useNavigate()
    const[openAddEqModal,setOpenEqModal]=useState(false)
    const [openAddTagModal, setOpenTagModal] = useState(false);
      const [moodmeterId, setMoodMeterId] = useState();
    const id=useParams()
    
   useEffect(() => {
      dispatch(getAwarness({
        id:id?.id
      }));
    }, []);

     const handleUpdateMoodMaster = (id) => {
        dispatch(getSingleAwarness({
          id:id
        }))
        console.log(id, "id");
        setOpenUpdateTagModal(true);
        setMoodMeterId(id);
      };
      const handleUploadContent = (row) => {
        navigate("/upload-content", {
          state: {
            id: row?.id,
            contentType: row?.contentType,
            categoryName: row?.mood_equelizer_name,
          },
        });
      };
      const handleViewContent = (row) => {
        navigate("/view-content", {
          state: {
            id: row?.id,
            contentType: row?.contentType,
            categoryName: row?.mood_equelizer_name,
          },
        });
      };
console.log("equilizerList",equilizerList);

      const rowData = useMemo(() => {
        return (
          allMoodMeter?.data?.map((tags) => ({
            id: tags?.id,
            mood_equelizer_name: tags?.awarenessName,
            mood_equelizer_avatar: tags?.image,
            description: tags?.description,
            contentType: tags?.colorCode || inferContentType(tags?.awarenessName),
            status: tags.status,
          })) || []
        );
      }, [allMoodMeter?.data]);

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
            field: "mood_equelizer_name",
            headerName: "Mood Equilizer Name",
            sortable: true,
            filter: true,
            width: 220,
            minWidth: 180,
          },
          {
            field: "contentType",
            headerName: "Content Type",
            sortable: true,
            filter: true,
            width: 180,
            minWidth: 160,
            cellRenderer: (params) => {
              const rawType = params.value || inferContentType(params.data?.mood_equelizer_name);
              const type = String(rawType).toLowerCase();
              const config = EQUALIZER_TYPE_CONFIG[type] || { label: type, bg: "bg-gray-100 text-gray-700 border-gray-200" };
              const IconComponent = TYPE_ICONS[type] || Video;
              return (
                <div className="flex items-center h-full">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg}`}>
                    <IconComponent size={13} className="shrink-0" />
                    <span>{config.label}</span>
                  </span>
                </div>
              );
            },
          },
          {
            field: "description",
            headerName: "Description",
            sortable: true,
            filter: true,
            width: 240,
            minWidth: 200,
          },
         
            {
              field: "status",
              headerName: "Status",
              width: 110,
              minWidth: 100,
              cellRenderer: (params) => {
                const isChecked = params.value;
      
                const handleStatusChange = () => {
                  const newStatus = isChecked ? 0 : 1;
                  dispatch(
                    toggleStatus({ id: params.data.id, status: newStatus })
                  ).then(() => {
                     dispatch(getAwarness({
                      id:id?.id
                    }));
                  });
                };
      
                return (
                  <div className="flex items-center h-full">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleStatusChange(params.data.id, isChecked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 relative"></div>
                    </label>
                  </div>
                );
              },
            },
           {
           field: "mood_equelizer_avatar",
           headerName: "Avatar",
           width: 110,
           minWidth: 100,
           cellRenderer: (params) => {
           const handleFileChange = (e) => {
               const file = e.target.files[0];
               if (!file) return;
         
               // Create preview URL
               const previewUrl = URL.createObjectURL(file);
         
               // Update AG Grid cell value
               params.node.setDataValue("mood_equelizer_avatar", previewUrl);
                 const formData=new FormData()
               
                 formData.append("file",file)
               dispatch(
             uploladImage({
               id: params.data.id,
               user_input: formData,
             })
               )
           
             };
         
             return (
               <div className="flex items-center h-full">
                 <label className="relative w-11 h-11 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden hover:border-blue-500 transition">
                   {/* Hidden file input */}
                   <input
                     type="file"
                     accept="image/*"
                     onChange={handleFileChange}
                     className="hidden"
                   />
           
                   {/* Show image if exists */}
                   {params.value ? (
                     <img
                       src={params.value}
                       alt="avatar"
                       className="w-full h-full object-cover rounded-full"
                     />
                   ) : (
                     <span className="text-xs text-gray-400">Upload</span>
                   )}
                 </label>
               </div>
             );
           },
            },
            {
              width: 130,
              minWidth: 120,
              headerName: "Actions",
              field: "actions",
              cellRenderer: (params) => {
                return (
                  <div className="flex items-center h-full">
                    <button
                      onClick={() => handleUpdateMoodMaster(params?.data?.id)}
                      className="bg-[#52b69a] hover:bg-black px-4 py-1.5 text-white text-sm font-semibold flex justify-center items-center rounded-md cursor-pointer transition-colors"
                    >
                      Update
                    </button>
                  </div>
                );
              },
            },
            {
              width: 320,
              minWidth: 300,
              headerName: "Content",
              field: "content",
              cellRenderer: (params) => {
                return (
                  <div className="flex gap-2 items-center h-full">
                    <button
                      type="button"
                      onClick={() => handleUploadContent(params?.data)}
                      className="bg-[#52b69a] hover:bg-black px-3.5 py-1.5 text-white text-sm font-semibold flex justify-center items-center rounded-md whitespace-nowrap cursor-pointer transition-colors"
                    >
                      Upload Content
                    </button>
                    <button
                      type="button"
                      onClick={() => handleViewContent(params?.data)}
                      className="bg-[#52b69a] hover:bg-black px-3.5 py-1.5 text-white text-sm font-semibold flex justify-center items-center rounded-md whitespace-nowrap cursor-pointer transition-colors"
                    >
                      View Content
                    </button>
                  </div>
                );
              },
            }
          ],
          []
        );
      
    return(
        <>
        <ToastContainer />
                <div className="wrapper_area my-0 mx-auto p-6 rounded-xl bg-white shadow-xs">
                  <div className="h-full">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-semibold">Mood Equilizer</h2>
                      <div className="flex gap-2">
                        <Button color="gray" onClick={() => navigate(-1)}>Back</Button>
                        <Button
                          onClick={() => setOpenTagModal(true)}
                          className="bg-[#52b69a] hover:bg-black px-4 py-1 text-white text-base font-semibold flex justify-center items-center rounded-md cursor-pointer"
                        >
                          Add Mood Equilizer
                        </Button>
                      </div>
                    </div>
                    <div
                      className="ag-theme-alpine w-full"
                      style={{ width: "100%" }}
                    >
                      <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        pagination={true}
                        paginationPageSize={10}
                        domLayout="autoHeight"
                        rowHeight={60}
                        headerHeight={44}
                        animateRows={true}
                        suppressHorizontalScroll={false}
                      />
                    </div>
                  </div>
                   {openAddTagModal && (
                    <AddMoodMeterModal
                      openAddTagModal={openAddTagModal}
                      setOpenTagModal={setOpenTagModal}
                      id={id}
                    />
                  )}
                   {openUpdateTagModal && (
                    <UpdateMoodMeterModal
                      openUpdateTagModal={openUpdateTagModal}
                      setOpenUpdateTagModal={setOpenUpdateTagModal}
                      moodmeterId={moodmeterId}
                      id={id}
                      singleAwarness={singleAwarness}
                    />
                  )}
                 
                </div>
        </>
    )
}
export default ManageEquilizer