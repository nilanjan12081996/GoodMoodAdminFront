import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { approveDoctor, getDoctor, getDoctorDetails, toggleStatus } from "../../../Reducer/DoctorSlice"
import DoctorDetailModal from "./DoctorDetailModal"
import { Eye } from 'lucide-react'
import { AgGridReact } from "ag-grid-react"
import { useNavigate } from "react-router-dom"
import { Button } from "flowbite-react"

const ManageDoctor=()=>{
    const navigate = useNavigate()
    const {doctorsDetails, doctorDetail, loading}=useSelector((state)=>state?.doctors)
    const [openDetailModal, setOpenDetailModal] = useState(false)
    const dispatch=useDispatch()
    useEffect(()=>{
        dispatch(getDoctor())
    },[])
    
  const rowData = useMemo(() => {
    return (
      doctorsDetails?.data?.map((tags) => ({
        id: tags?.id,
        name: tags?.firstName,
        lname:tags?.lastName,
        mobile: tags?.mobile,
        // image:doctorsDetails?.baseurl+tags?.image,
        status: tags.status,
        adminStatus:tags.adminStatus
      })) || []
    );

  }, [doctorsDetails?.data]);





    const columnDefs = useMemo(
      () => [
        {
          field: "name",
          headerName: "First Name",
          sortable: true,
          filter: true,
        },
        {
          field: "lname",
          headerName: "Last Name",
          sortable: true,
          filter: true,
        },
           {
          field: "mobile",
          headerName: "Mobile",
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
                toggleStatus({
                  id: params.data.id,
                  status: newStatus,
                })
              ).then(() => {
                 dispatch(getDoctor())
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
    const isApproved = params.data.adminStatus === 1;

    const handleViewDetails = (id) => {
      dispatch(getDoctorDetails(id));
      setOpenDetailModal(true);
    };

    return (
      <div className="flex gap-2">
        <button
          onClick={() => handleViewDetails(params.data.id)}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center gap-1 transition-colors"
        >
          <Eye size={16} /> Details
        </button>
        <button
          disabled={isApproved}
          onClick={() => {
            if (!isApproved) {
              handleApprove(params.data.id);
            }
          }}
          className={`px-4 py-1 text-white text-base font-semibold rounded-md
            ${
              isApproved
                ? "bg-[#52b69a] cursor-not-allowed"
                : "bg-gray-400 hover:bg-black"
            }`}
        >
          {isApproved ? "Approved" : "Approve"}
        </button>
      </div>
    );
  },
}
     
      ],
      []
    );

    const handleApprove=(id)=>{
        dispatch(approveDoctor({id:id})).then((res)=>{
            if(res?.payload?.statusCode===200){
                dispatch(getDoctor())
            }
        })
    }
    return(
        <>

         <div className="wrapper_area my-0 mx-auto p-6 rounded-xl bg-white">
                        <div className="h-full lg:h-screen">
                          <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold">Expert</h2>
                            <Button color="gray" onClick={() => navigate(-1)}>Back</Button>
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
                        {/* {openAddModal && (
                          <AddSupport
                            openAddModal={openAddModal}
                            setOpenAddModal={setOpenAddModal}
                            id={id}
                          />
                        )} */}
                  
        </div>
        <DoctorDetailModal 
          isOpen={openDetailModal} 
          onClose={() => setOpenDetailModal(false)} 
          data={doctorDetail}
          loading={loading}
        />
    
        </>
    )
}
export default ManageDoctor