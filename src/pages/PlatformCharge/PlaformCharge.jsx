import { useEffect, useMemo, useState } from "react"
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { getParentCategory } from "../../Reducer/SupportSlice"
import { AgGridReact } from "ag-grid-react"
import { getPlatformCharges } from "../../Reducer/PlatformSlice"
import AddUpdateCharges from "./AddUpdateCharges"
import { ToastContainer } from "react-toastify"


const PlaformCharge=()=>{
    const[openAddModal,setOpenAddModal]=useState(false)
    const[isEdit,setisEdit]=useState(false)
    const[categoryId,setCategoryId]=useState()
    const{parentcateList}=useSelector((state)=>state?.support)
    const id=useParams()
    const dispatch=useDispatch()
    const navigate=useNavigate()
    useEffect(()=>{
        dispatch(getParentCategory({id:id?.id}))
    },[])
    console.log("parentcateList",parentcateList);
      const rowData = useMemo(() => {
    return (
      parentcateList?.data?.map((tags) => ({
        id: tags?.id,
        name: tags?.name,
        description: tags?.description,
        image:parentcateList?.baseurl+tags?.image,
        status: tags.status,
      })) || []
    );
  }, [parentcateList?.data]);

  const handleUpdateTags=(id)=>{
    setCategoryId(id)
    setOpenAddModal(true)
   dispatch(getPlatformCharges({categoryId:id})).then((res)=>{
        if(res?.payload?.statusCode===200){
            setisEdit(true)
        }
        else{
            setisEdit(false)
        }
    })
    
  }

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

      {
  field: "image",
  headerName: "Avatar",
  cellRenderer: (params) => {
  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

      // Update AG Grid cell value
      params.node.setDataValue("mood_meter_avatar", previewUrl);
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
     
      
    //   {
    //     field: "status",
    //     headerName: "Status",
    //     cellRenderer: (params) => {
    //       const isChecked = params.value;

    //       const handleStatusChange = () => {
    //         const newStatus = isChecked ? 0 : 1;
    //         dispatch(
    //           changeStatus({
    //             id: params.data.id,
    //             status: newStatus,
    //           })
    //         ).then(() => {
    //             dispatch(getParentCategory({id:id?.id}))// refresh data
    //         });
    //       };

    //       return (
    //         <label className="inline-flex items-center cursor-pointer">
    //           <input
    //             type="checkbox"
    //             checked={isChecked}
    //             onChange={() => handleStatusChange(params.data.id, isChecked)}
    //             className="sr-only peer"
    //           />
    //           <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 relative"></div>
    //         </label>
    //       );
    //     },
    //   },
    
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
                Add Edit Charges
              </button>
            </div>
          );
        },
      },
   
    ],
    []
  );
    return(
        <>
         <div className="wrapper_area my-0 mx-auto p-6 rounded-xl bg-white">
            <ToastContainer/>
                <div className="h-full lg:h-screen">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Platform Charges</h2>
                    {/* <Button
                       onClick={() => setOpenAddModal(true)}
                      className="bg-[#52b69a] hover:bg-black px-4 py-1 text-white text-base font-semibold flex justify-center items-center rounded-md"
                    >
                      Add Support
                    </Button> */}
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
                  <AddUpdateCharges
                    openAddModal={openAddModal}
                    setOpenAddModal={setOpenAddModal}
                    isEdit={isEdit}
                    categoryId={categoryId}
                  />
                )}
          
          </div>
        </>
    )
}
export default PlaformCharge