import { useEffect, useMemo, useState } from "react"
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import { changeStatus, getSingleSpecialization, getSpecialization } from "../../../Reducer/SpecializationSlice"
import { AgGridReact } from "ag-grid-react"
import { Button } from "flowbite-react"
import AddSpecialization from "./AddSpecialization"
import UpdateSpecialization from "./UpdateSpecialization"

const ManageSpecialization=()=>{
       const[openAddModal,setOpenAddModal]=useState(false)
        const[openUpdateModal,setOpenUpdateModal]=useState(false)
        const[splId,setSplId]=useState()
    const{getList}=useSelector((state)=>state?.special)
    const dispatch=useDispatch()
    useEffect(()=>{
        dispatch(getSpecialization())
    },[])
    console.log("getList",getList);

        const rowData = useMemo(() => {
        return (
          getList?.data?.map((tags) => ({
            id: tags?.id,
            name: tags?.name,
            description: tags?.des,
            //image:parentcateList?.baseurl+tags?.image,
            status: tags.status,
          })) || []
        );
      }, [getList?.data]);


        const columnDefs = useMemo(
          () => [
            {
              field: "name",
              headerName: "Name",
              sortable: true,
              filter: true,
            },
            {
              field: "description",
              headerName: "Description",
              sortable: true,
              filter: true,
            },
      
        //     {
        // field: "image",
        // headerName: "Avatar",
        // cellRenderer: (params) => {
        // const handleFileChange = (e) => {
        //     const file = e.target.files[0];
        //     if (!file) return;
      
        //     // Create preview URL
        //     const previewUrl = URL.createObjectURL(file);
      
        //     // Update AG Grid cell value
        //     params.node.setDataValue("mood_meter_avatar", previewUrl);
        //       const formData=new FormData()
            
        //       formData.append("file",file)
        //     dispatch(
        //   uploladImage({
        //     id: params.data.id,
        //     user_input: formData,
        //   })
        //     )
        
        //   };
      
        //   return (
        //     <label className="relative w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden hover:border-blue-500 transition">
              
        //       {/* Hidden file input */}
        //       <input
        //         type="file"
        //         accept="image/*"
        //         onChange={handleFileChange}
        //         className="hidden"
        //       />
      
        //       {/* Show image if exists */}
        //       {params.value ? (
        //         <img
        //           src={params.value}
        //           alt="avatar"
        //           className="w-full h-full object-cover rounded-full"
        //         />
        //       ) : (
        //         <span className="text-xs text-gray-400">Upload</span>
        //       )}
        //     </label>
        //   );
        // },
        //     },
           
            
            {
              field: "status",
              headerName: "Status",
              cellRenderer: (params) => {
                const isChecked = params.value;
      
                const handleStatusChange = () => {
                  const newStatus = isChecked ? 0 : 1;
                  dispatch(
                    changeStatus({
                      id: params.data.id,
                      status: newStatus,
                    })
                  ).then(() => {
                      dispatch(getSpecialization()) // refresh data
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
              width: 260,
              headerName: "Actions",
              field: "actions",
              cellRenderer: (params) => {
                return (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateTags(params?.data?.id)}
                      className="bg-[#52b69a] hover:bg-black px-4 py-1 text-white text-base font-semibold flex justify-center items-center rounded-md"
                    >
                      Update
                    </button>
                  </div>
                );
              },
            },
         
          ],
          []
        );
    const handleUpdateTags=(id)=>{
        setOpenUpdateModal(true)
        setSplId(id)
        dispatch(getSingleSpecialization({id:id}))
    }
    return(
          <>
                 <div className="wrapper_area my-0 mx-auto p-6 rounded-xl bg-white">
                        <div className="h-full lg:h-screen">
                          <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold">Specialization</h2>
                            <Button
                               onClick={() => setOpenAddModal(true)}
                              className="bg-[#52b69a] hover:bg-black px-4 py-1 text-white text-base font-semibold flex justify-center items-center rounded-md"
                            >
                              Add Specialization
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
                        {openAddModal && (
                          <AddSpecialization
                            openAddModal={openAddModal}
                            setOpenAddModal={setOpenAddModal}
                            
                          />
                        )}

                             {openUpdateModal && (
                          <UpdateSpecialization
                            openUpdateModal={openUpdateModal}
                            setOpenUpdateModal={setOpenUpdateModal}
                            splId={splId}
                            
                          />
                        )}
                  
                  
                      </div>
                </>
    )
}
export default ManageSpecialization