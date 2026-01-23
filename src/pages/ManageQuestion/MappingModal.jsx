// import { Button, Label, Modal, Select, TextInput } from "flowbite-react";
// import { useForm } from "react-hook-form";
// import { useDispatch } from "react-redux";
// import { questionAnswerMap } from "../../Reducer/AnswerSlice";
// import { data } from "autoprefixer";
// import { toast } from "react-toastify";

// const MappingModal = ({
//   openMappingModal,
//   setOpenMappingModal,
//   answer
// }) => {
//   const dispatch = useDispatch();
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm();
//   const onSubmit = (data) => {
//     dispatch(questionAnswerMap({ ...data, question_id: questionId })).then(
//       (res) => {
//         console.log("res", res);

//         if (res?.payload?.status_code === 201) {
//           setOpenMappingModal(false);
//         } else if (res?.payload?.response?.data?.status_code === 422) {
//           toast.error(res?.payload?.response?.data?.message);
//         }
//       }
//     );
//   };
  
  
//   return (
//     <>
//       <Modal show={openMappingModal} onClose={() => setOpenMappingModal(false)}>
//         <Modal.Header>Mapped Answer</Modal.Header>
//         <form onSubmit={handleSubmit(onSubmit)}>
//           <Modal.Body>
//             <div className="space-y-4">
//               <div>
//                 <div className="mb-2 block">
//                   <Label htmlFor="name" value="Answer" />
//                 </div>
//                 <Select {...register("answer_id")}>
//                   <option>Select Answer</option>
//                   {/* {answerList?.data?.map((ans) => {
//                     return (
//                       <>
//                         <option value={ans?.id}>{ans?.answer}</option>
//                       </>
//                     );
//                   })} */}
//                 </Select>
//               </div>
//             </div>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button
//               className="cnl_btn"
//               onClick={() => setOpenMappingModal(false)}
//             >
//               Cancel
//             </Button>
//             <Button color="success" type="submit">
//               Mapped
//             </Button>
//           </Modal.Footer>
//         </form>
//       </Modal>
//     </>
//   );
// };
// export default MappingModal;









import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button } from "flowbite-react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { changeAnswer, getSingleQuestion } from "../../Reducer/QuestionSlice";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const MappingModal = ( ) => {

  const {  singleQuestion } = useSelector(
    (state) => state?.questions
  );
   const [deleteConfirmModal,setDeleteConfirmationModal]=useState(false)
     const[optionid,setOptionId]=useState()
  const dispatch=useDispatch()
    const id=useParams()
  
  // Define columns based on your array structure
  useEffect(()=>{
dispatch(getSingleQuestion({ id: id?.id }))
  },[])

  const handledeleteConfirm=(id)=>{
    setDeleteConfirmationModal(true)
    setOptionId(id)
  }
  const columnDefs = useMemo(() => [
    { 
      field: "answer", 
      headerName: "Answer Option", 
      flex: 2,
      filter: true 
    },
    { 
      field: "point", 
      headerName: "Points", 
      flex: 1,
      sortable: true,
      // Optional: Add a CSS class to highlight higher points
      cellClassRules: {
        'text-green-600 font-bold': 'data.point > 5',
      }
    },
     {
            field: "status",
            headerName: "Status",
            cellRenderer: (params) => {
              const isChecked = params.value;
    
              const handleStatusChange = () => {
                const newStatus = isChecked ? 0 : 1;
                dispatch(
                  changeAnswer({
                    id: params.data.id,
                    status: newStatus,
                  })
                ).then(() => {
                 dispatch(getSingleQuestion({ id: id?.id })) // refresh data
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
      headerName: "Actions",
      flex: 1.5,
      cellRenderer: (params) => (
        <div className="flex items-center gap-3 h-full">
        
          <button
            onClick={() => handledeleteConfirm(params.data.id)}
            className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
          >
            Delete
          </button>
        </div>
      )
    }
  ], [deleteConfirmModal]);

  const defaultColDef = useMemo(() => ({
    resizable: true,
  }), []);

  return (
   
    <div className="wrapper_area my-0 mx-auto p-6 rounded-xl bg-white">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
           <p className="text-sm font-bold">{singleQuestion?.data?.[0]?.question}</p> 
          <p className="text-xs mt-3">Showing {singleQuestion.data?.[0]?.answer.length} mapped options. You can manage points and descriptions here.</p>  
          </p>
          
          <div className="ag-theme-alpine" style={{ height: 350, width: '100%' }}>
            <AgGridReact
              rowData={singleQuestion?.data?.[0]?.answer} 
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              animateRows={true}
              pagination={true}
              paginationPageSize={5}
            />
          </div>
        </div>
        {
                deleteConfirmModal&&(
                  <DeleteConfirmationModal
                  deleteConfirmModal={deleteConfirmModal}
                  setDeleteConfirmationModal={setDeleteConfirmationModal}
                  optionid={optionid}
                 
                  id={id}
                  />
                )
              }
        </div>

  );
};
export default MappingModal;