// import { useState } from "react";
// import { Modal, Button } from "flowbite-react";

// const MapperQuestion = ({ rowData, questions }) => {
//   const [openModal, setOpenModal] = useState(false);
//   const [selectedQuestions, setSelectedQuestions] = useState(
//     rowData.mapped_questions || []
//   );

 


//   const handleSave = () => {
//     // TODO: Dispatch action to save mapped questions
//     console.log("Saving mapped questions:", selectedQuestions);
//     // Example: dispatch(updateMappedQuestions({ moodMeterId: rowData.id, questionIds: selectedQuestions }));
//     setOpenModal(false);
//   };

//   return (
//     <>
//       <button
//         onClick={() => setOpenModal(true)}
//         className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors"
//       >
//         Map Questions ({selectedQuestions.length})
//       </button>

//       <Modal show={openModal} onClose={() => setOpenModal(false)} size="lg">
//         <Modal.Header>Map Questions to {rowData.mood_meter_name}</Modal.Header>
//         <Modal.Body>
//           <div className="space-y-2 max-h-96 overflow-y-auto">
//             {questions?.data && questions?.data?.length > 0 ? (
//               questions?.data?.map((q) => (
//                 <label
//                   key={q.id}
//                   className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-md cursor-pointer transition-colors border border-gray-100"
//                 >
//                   <input
//                     type="checkbox"
//                     checked={selectedQuestions.includes(q.id)}
//                     // onChange={() => handleToggle(q.id)}
//                     className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
//                   />
//                   <div className="flex-1">
//                     <span className="text-sm text-gray-900">{q.question}</span>
//                     {q.description && (
//                       <p className="text-xs text-gray-500 mt-1">
//                         {q.description}
//                       </p>
//                     )}
//                   </div>
//                 </label>
//               ))
//             ) : (
//               <p className="text-center text-gray-500 py-4">
//                 No questions available
//               </p>
//             )}
//           </div>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button
//             onClick={handleSave}
//             className="bg-[#52b69a] hover:bg-black"
//           >
//             Save Mapping
//           </Button>
//           <Button color="gray" onClick={() => setOpenModal(false)}>
//             Cancel
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </>
//   );
// };

// export default MapperQuestion;



import { useState, useEffect } from "react";
import { Modal, Button } from "flowbite-react";
import { useSelector, useDispatch } from "react-redux";
import { questionMapped } from "../../Reducer/QuestionSlice";
// Import your thunk here. Adjust the path as necessary.


const MapperQuestion = ({ rowData }) => {
  const dispatch = useDispatch();
  const [openModal, setOpenModal] = useState(false);
  
  // Get questions directly from store to avoid stale data
  const { questionList } = useSelector((state) => state?.questions);

  // Local state to track checked boxes for UI feedback
  // We initialize this from rowData, but we will update it as the user clicks
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  useEffect(() => {
    if (rowData && rowData.mapped_questions) {
        setSelectedQuestions(rowData.mapped_questions);
    }
  }, [rowData]);

  const handleToggle = (questionId, isChecked) => {
    // 1. Determine the new status (1 = Active/Mapped, 0 = Inactive/Unmapped)
    // If the box is currently checked (isChecked is true), we want to map it (status: 1)
    // If we are unchecking it, we might want to unmap it (status: 0 or delete)
    // Based on your payload request, I assume checking = status 1.
    
   ; 

    // 2. Prepare the payload
    const payload = {
      question_id: questionId,
      awareness_id: rowData.id, // The ID of the Mood Meter (row)
      status:1
    };

    // 3. Dispatch the API Action
    dispatch(questionMapped(payload)).then((res) => {
        if(res.payload?.statusCode === 200) {
            // Success: Update local UI state
            if (isChecked) {
                setSelectedQuestions((prev) => [...prev, questionId]);
            } else {
                setSelectedQuestions((prev) => prev.filter((id) => id !== questionId));
            }
            // Optional: You might want to refresh the main grid data here
            // dispatch(getMoodMeter()); 
        } else {
           console.error("Failed to map question");
        }
    });
  };

  return (
    <>
      <button
        onClick={() => setOpenModal(true)}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors"
      >
        Map Questions ({selectedQuestions.length})
      </button>

      <Modal show={openModal} onClose={() => setOpenModal(false)} size="lg">
        <Modal.Header>Map Questions to {rowData.mood_meter_name}</Modal.Header>
        <Modal.Body>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {questionList?.data && questionList?.data?.length > 0 ? (
              questionList.data.map((q) => {
                const isChecked = selectedQuestions.includes(q.id);
                return (
                  <label
                    key={q.id}
                    className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-md cursor-pointer transition-colors border border-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      // Pass the new checked state (e.target.checked) to the handler
                      onChange={(e) => handleToggle(q.id, e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm text-gray-900">{q.question}</span>
                      {q.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {q.description}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })
            ) : (
              <p className="text-center text-gray-500 py-4">
                No questions available
              </p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          {/* Since actions are immediate, we only need a Close button */}
          <Button color="gray" onClick={() => setOpenModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MapperQuestion;