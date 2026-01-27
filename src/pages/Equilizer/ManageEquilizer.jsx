import { useEffect, useMemo, useState } from "react"
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import { changeStatusEquilizer, getEquilizer } from "../../Reducer/EquilizerSlice"
import { ToastContainer } from "react-toastify"
import { Button } from "flowbite-react"
import { AgGridReact } from "ag-grid-react"
import AddManageEquilizer from "./AddManageEquilizer"
import { useNavigate, useParams } from "react-router-dom"
import AddMoodMeterModal from "../MoodMeter/AddMoodMeterModal"
import { getAwarness, getSingleAwarness, uploladImage } from "../../Reducer/MoodMeterSlice"
import UpdateMoodMeterModal from "../MoodMeter/UpdateMoodMeterModal"

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
      const handleUploadContent=(id)=>{
        navigate("/upload-content",{state:{id:id}})
      }
        const handleViewContent=(id)=>{
        navigate("/view-content",{state:{id:id}})
      }
console.log("equilizerList",equilizerList);

      const rowData = useMemo(() => {
        return (
          allMoodMeter?.data?.map((tags) => ({
            id: tags?.id,
            mood_equelizer_name: tags?.awarenessName,
            mood_equelizer_avatar: tags?.image,
            description:tags?.description,
            status: tags.status,
          })) || []
        );
      }, [allMoodMeter?.data]);

      
        const columnDefs = useMemo(
          () => [
            {
              field: "mood_equelizer_name",
              headerName: "Mood Equelizer Name",
              sortable: true,
              filter: true,
            },
            {
              field: "description",
              headerName: "Mood Equilizer Description",
              sortable: true,
              filter: true,
            },
         
            {
              field: "status",
              headerName: "Status",
              cellRenderer: (params) => {
                const isChecked = params.value;
      
                const handleStatusChange = () => {
                  const newStatus = isChecked ? 0 : 1;
                  dispatch(
                    changeStatusEquilizer({ mood_eq_id: params.data.id, status: newStatus })
                  ).then(() => {
                    dispatch(getEquilizer()); // refresh data after success
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
           field: "mood_equelizer_avatar",
           headerName: "Avatar",
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
               <label className="relative w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden hover:border-blue-500 transition">
                 
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
             );
           },
            },
            {
              width: 200,
              headerName: "Actions",
              field: "actions",
              cellRenderer: (params) => {
                return (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateMoodMaster(params?.data?.id)}
                      className="bg-[#52b69a] hover:bg-black px-4 py-1 text-white text-base font-semibold flex justify-center items-center rounded-md"
                    >
                      Update
                    </button>
      
                    {/* <button
                    // onClick={() => handleDeleteZone(params?.data?.id)}
                    >
                      <MdDelete size={20} color="red" />
                    </button> */}
                  </div>
                );
              },
            },
            {
               width: 400,
              headerName:"Content",
              field:"content",
              cellRenderer:(params)=>{
                return(
                  <div className="flex gap-2">
                    <div>
                    <button
                    type="button"
                    onClick={()=>handleUploadContent(params?.data?.id)}
                    className="bg-[#52b69a] hover:bg-black px-4 py-1
                     text-white text-base font-semibold flex justify-center items-center rounded-md"
                    >
                      Upload Content
                    </button>
                    </div>
                    <div>
                       <button
                    type="button"
                    onClick={()=>handleViewContent(params?.data?.id)}
                    className="bg-[#52b69a] hover:bg-black px-4 py-1
                     text-white text-base font-semibold flex justify-center items-center rounded-md"
                    >
                      View Content
                    </button>
                    </div>
                  </div>
                )
              }
            }
          ],
          []
        );
      
    return(
        <>
        <ToastContainer />
                <div className="wrapper_area my-0 mx-auto p-6 rounded-xl bg-white">
                  <div className="h-full lg:h-screen">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-semibold">Mood Equilizer</h2>
                      <Button
                        onClick={() => setOpenTagModal(true)}
                        className="bg-[#52b69a] hover:bg-black px-4 py-1 text-white text-base font-semibold flex justify-center items-center rounded-md"
                      >
                        Add Mood Equilizer
                      </Button>
                    </div>
                    <div
                      className="ag-theme-alpine"
                      style={{ height: 600, width: "100%" }}
                    >
                      <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        pagination={true}
                        paginationPageSize={10}
                        domLayout="autoHeight"
                        getRowHeight={() => 50}
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