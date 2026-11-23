import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { changeStatus, getChildCategory, getSingleChildCategory, uploladImage } from "../../../Reducer/SupportSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import { Button } from "flowbite-react";
import AddSupport from "./AddSupport";
import UpdateSupport from "./UpdateSupport";

const SupportDetails=()=>{
    const[openAddModal,setOpenAddModal]=useState(false)
    const[openUpdateModal,setOpenUpdateModal]=useState(false)
    const[categoryId,setCategoryId]=useState()
    const location=useLocation()
    const parentId=location?.state?.parentid
    const{childCateList}=useSelector((state)=>state?.support)
    const dispatch=useDispatch()
    const navigate=useNavigate()
    useEffect(()=>{
        dispatch(getChildCategory({id:parentId}))
    },[])
    console.log("childCateList",childCateList);
         const rowData = useMemo(() => {
        return (
          childCateList?.data?.map((tags) => ({
            id: tags?.id,
            name: tags?.name,
            description: tags?.description,
            image:tags?.image&&(childCateList?.baseurl+tags?.image),
            status: tags.status,
          })) || []
        );
      }, [childCateList?.data]);


      
  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
      flex: 1,
    }),
    []
  );

  const columnDefs = useMemo(
    () => [
      {
        field: "name",
        headerName: "Name",
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 180,
        cellClass: "flex items-center font-medium text-gray-800",
      },
      {
        field: "image",
        headerName: "Avatar",
        flex: 1,
        minWidth: 120,
        cellClass: "flex items-center",
        cellRenderer: (params) => {
          const handleFileChange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Create preview URL
            const previewUrl = URL.createObjectURL(file);

            // Update AG Grid cell value
            params.node.setDataValue("image", previewUrl);
            const formData = new FormData();

            formData.append("file", file);
            dispatch(
              uploladImage({
                id: params.data.id,
                user_input: formData,
              })
            ).then((res) => {
              if (res?.payload?.statusCode === 200) {
                dispatch(getChildCategory({ id: parentId }));
              }
            });
          };

          return (
            <label className="relative w-11 h-11 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden hover:border-[#0B8843] transition">
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
                <span className="text-[11px] text-gray-400">Upload</span>
              )}
            </label>
          );
        },
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        minWidth: 120,
        cellClass: "flex items-center",
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
              dispatch(getChildCategory({ id: parentId })); // refresh data
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B8843] relative"></div>
            </label>
          );
        },
      },
      {
        headerName: "Actions",
        field: "actions",
        flex: 1,
        minWidth: 140,
        cellClass: "flex items-center",
        cellRenderer: (params) => {
          return (
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateTags(params?.data?.id)}
                className="bg-[#0B8843] hover:bg-[#086a34] px-4 py-1.5 text-white text-sm font-semibold flex justify-center items-center rounded-lg shadow-xs transition-colors cursor-pointer"
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
            console.log("id",id);
            
            setOpenUpdateModal(true)
            setCategoryId(id)
            dispatch(getSingleChildCategory({
                id:parentId,
                single_id:id
            }))
        }
    return(
        <>
        <div className="wrapper_area my-0 mx-auto p-6 rounded-xl bg-white">
                        <div className="h-full lg:h-screen">
                          <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">Support Category</h2>
                            <div className="flex gap-2">
                              <Button color="gray" onClick={() => navigate(-1)}>Back</Button>
                              <Button
                                onClick={() => setOpenAddModal(true)}
                                className="bg-[#0B8843] hover:bg-[#086a34] text-white font-semibold rounded-lg shadow-sm"
                              >
                                Add 
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
                              paginationPageSizeSelector={[10, 20, 50]}
                              domLayout="autoHeight"
                              rowHeight={58}
                              headerHeight={44}
                              animateRows={true}
                              onGridReady={(params) => params.api.sizeColumnsToFit()}
                              onGridSizeChanged={(params) => params.api.sizeColumnsToFit()}
                            />
                          </div>
                        </div>
                        {openAddModal && (
                          <AddSupport
                            openAddModal={openAddModal}
                            setOpenAddModal={setOpenAddModal}
                            id={parentId}
                          />
                        )}
                           {openUpdateModal && (
                          <UpdateSupport
                            openUpdateModal={openUpdateModal}
                            setOpenUpdateModal={setOpenUpdateModal}
                            id={parentId}
                            cateId={categoryId}
                          />
                        )}
                  
                      </div>
        </>
    )
}
export default SupportDetails;