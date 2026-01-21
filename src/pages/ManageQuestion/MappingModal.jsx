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









import React, { useMemo } from "react";
import { Modal, Button } from "flowbite-react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const MappingModal = ({ openMappingModal, setOpenMappingModal, answerArray, onEdit, onDelete }) => {
  
  // Define columns based on your array structure
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
      headerName: "Actions",
      flex: 1.5,
      cellRenderer: (params) => (
        <div className="flex items-center gap-3 h-full">
          <button
            onClick={() => onEdit(params.data)}
            className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(params.data.id)}
            className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
          >
            Delete
          </button>
        </div>
      )
    }
  ], [onEdit, onDelete]);

  const defaultColDef = useMemo(() => ({
    resizable: true,
  }), []);

  return (
    <Modal show={openMappingModal} onClose={() => setOpenMappingModal(false)} size="2xl">
      <Modal.Header>Answers</Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Showing {answerArray.length} mapped options. You can manage points and descriptions here.
          </p>
          
          <div className="ag-theme-alpine" style={{ height: 350, width: '100%' }}>
            <AgGridReact
              rowData={answerArray} 
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              animateRows={true}
              pagination={true}
              paginationPageSize={5}
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={() => setOpenMappingModal(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
export default MappingModal;