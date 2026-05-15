import { useEffect, useMemo } from "react"
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import { daysChangeStatus, getallDays } from "../../../Reducer/DaysSlice"
import { AgGridReact } from "ag-grid-react"
import { useNavigate } from "react-router-dom"
import { Button } from "flowbite-react"

const ManageDays=()=>{
    const navigate = useNavigate()
    const{alldays}=useSelector((state)=>state?.days)
    const dispatch=useDispatch()
    useEffect(()=>{
        dispatch(getallDays())
    },[])
     const rowData = useMemo(() => {
        return (
          alldays?.data?.map((tags) => ({
            id: tags?.id,
            dayName: tags?.dayName,
            status: tags.status,
          
          })) || []
        );
    
      }, [alldays?.data]);

          const columnDefs = useMemo(
            () => [
              {
                field: "dayName",
                headerName: "Days",
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
                      daysChangeStatus({
                        id: params.data.id,
                        status: newStatus,
                      })
                    ).then(() => {
                       dispatch(getallDays())
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
            
     
           
            ],
            []
          );
    return(
        <>
             <div className="wrapper_area my-0 mx-auto p-6 rounded-xl bg-white">
                                    <div className="h-full lg:h-screen">
                                      <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-2xl font-semibold">Days</h2>
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
                                 
                              
                    </div>
        </>
    )
}
export default ManageDays