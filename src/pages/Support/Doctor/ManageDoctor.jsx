import { useEffect, useMemo, useState } from "react"
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import { approveDoctor, getDoctor, toggleStatus } from "../../../Reducer/DoctorSlice"
import { AgGridReact } from "ag-grid-react"

const ManageDoctor=()=>{
    const {doctorsDetails}=useSelector((state)=>state?.doctors)
    const dispatch=useDispatch()
    useEffect(()=>{
        dispatch(getDoctor())
    },[])
    console.log();
    
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

    return (
      <div className="flex gap-2">
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
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#52b69a] hover:bg-black"
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
                            <h2 className="text-2xl font-semibold">Doctor</h2>
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
                        {/* {openAddModal && (
                          <AddSupport
                            openAddModal={openAddModal}
                            setOpenAddModal={setOpenAddModal}
                            id={id}
                          />
                        )} */}
                  
        </div>
    
        </>
    )
}
export default ManageDoctor