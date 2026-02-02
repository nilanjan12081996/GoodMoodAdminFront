import { useEffect, useMemo } from "react"
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import { getTimeSlot } from "../../../Reducer/DoctorSlice"
import { AgGridReact } from "ag-grid-react"

const ManageTimeSlot=()=>{
     const {timeSlotData}=useSelector((state)=>state?.doctors)
     const dispatch=useDispatch()
    useEffect(()=>{
        dispatch(getTimeSlot())
    },[])
      const rowData = useMemo(() => {
        return (
          timeSlotData?.data?.map((tags) => ({
            id: tags?.id,
            slot_time: tags?.slot_time +" Mins",
            status: tags.status,
          })) || []
        );
    
      }, [timeSlotData?.data]);


      
          const columnDefs = useMemo(
            () => [
              {
                field: "slot_time",
                headerName: "Slot Time",
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
                       dispatch(getTimeSlot())
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
          
                className="px-4 py-1 text-white text-base font-semibold rounded-md bg-[#52b69a] hover:bg-black"
                  
              >
                Update
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
             <div className="wrapper_area my-0 mx-auto p-6 rounded-xl bg-white">
                                    <div className="h-full lg:h-screen">
                                      <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-2xl font-semibold">Doctor Time Slot</h2>
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
export default ManageTimeSlot