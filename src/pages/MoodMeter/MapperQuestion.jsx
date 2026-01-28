// import { useState, useEffect } from "react";
// import { Modal, Button } from "flowbite-react";
// import { useSelector, useDispatch } from "react-redux";
// import { alreadyMappedQuestion, questionMapped } from "../../Reducer/QuestionSlice";



// const MapperQuestion = ({ rowData }) => {
//   const{alreadyMappedData}=useSelector((state)=>state?.questions)
  
//   const dispatch = useDispatch();
//   useEffect(()=>{
//     dispatch(alreadyMappedQuestion({id:rowData?.id}))
//   },[])
//   console.log("alreadyMappedData",alreadyMappedData);
  
//   const [openModal, setOpenModal] = useState(false);
  
//   // Get questions directly from store to avoid stale data
//   const { questionList } = useSelector((state) => state?.questions);

//   // Local state to track checked boxes for UI feedback
//   // We initialize this from rowData, but we will update it as the user clicks
//   const [selectedQuestions, setSelectedQuestions] = useState([]);

//   useEffect(() => {
//     if (rowData && rowData.mapped_questions) {
//         setSelectedQuestions(rowData.mapped_questions);
//     }
//   }, [rowData]);

//   const handleToggle = (questionId, isChecked) => {
//     const payload = {
//       question_id: questionId,
//       awareness_id: rowData.id, // The ID of the Mood Meter (row)
//       status:1
//     };

//     // 3. Dispatch the API Action
//     dispatch(questionMapped(payload)).then((res) => {
//         if(res.payload?.statusCode === 200) {
//             // Success: Update local UI state
//             if (isChecked) {
//                 setSelectedQuestions((prev) => [...prev, questionId]);
//             } else {
//                 setSelectedQuestions((prev) => prev.filter((id) => id !== questionId));
//             }
//             // Optional: You might want to refresh the main grid data here
//             // dispatch(getMoodMeter()); 
//         } else {
//            console.error("Failed to map question");
//         }
//     });
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
//             {questionList?.data && questionList?.data?.length > 0 ? (
//               questionList.data.map((q) => {
//                 const isChecked = selectedQuestions.includes(q.id);
//                 return (
//                   <label
//                     key={q.id}
//                     className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-md cursor-pointer transition-colors border border-gray-100"
//                   >
//                     <input
//                       type="checkbox"
//                       checked={isChecked}
//                       // Pass the new checked state (e.target.checked) to the handler
//                       onChange={(e) => handleToggle(q.id, e.target.checked)}
//                       className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
//                     />
//                     <div className="flex-1">
//                       <span className="text-sm text-gray-900">{q.question}</span>
//                       {q.description && (
//                         <p className="text-xs text-gray-500 mt-1">
//                           {q.description}
//                         </p>
//                       )}
//                     </div>
//                   </label>
//                 );
//               })
//             ) : (
//               <p className="text-center text-gray-500 py-4">
//                 No questions available
//               </p>
//             )}
//           </div>
//         </Modal.Body>
//         <Modal.Footer>
//           {/* Since actions are immediate, we only need a Close button */}
//           <Button color="gray" onClick={() => setOpenModal(false)}>
//             Close
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </>
//   );
// };

// export default MapperQuestion;




// import { useState, useEffect } from "react";
// import { Modal, Button } from "flowbite-react";
// import { useSelector, useDispatch } from "react-redux";
// import {
//   alreadyMappedQuestion,
//   questionMapped,
// } from "../../Reducer/QuestionSlice";

// const MapperQuestion = ({ rowData }) => {
//   const dispatch = useDispatch();

//   const { questionList, alreadyMappedData } = useSelector(
//     (state) => state?.questions
//   );

//   const [openModal, setOpenModal] = useState(false);
//   const [selectedQuestions, setSelectedQuestions] = useState([]);

//   /* ----------------------------------
//      Fetch mapped questions on open
//   -----------------------------------*/
//   const handleOpenModal = () => {
//     setOpenModal(true);
//     dispatch(alreadyMappedQuestion({ id: rowData?.id }));
//   };

//   /* ----------------------------------
//      Set checked questions from API
//   -----------------------------------*/
//   useEffect(() => {
//     if (alreadyMappedData?.data?.length > 0) {
//       const mappedIds = alreadyMappedData.data.map(
//         (item) => item.question_id
//       );
//       setSelectedQuestions(mappedIds);
//     } else {
//       setSelectedQuestions([]);
//     }
//   }, [alreadyMappedData]);

//   /* ----------------------------------
//      Checkbox toggle handler
//   -----------------------------------*/
//   const handleToggle = (questionId, isChecked) => {
//     const payload = {
//       question_id: questionId,
//       awareness_id: rowData.id,
//       status: 1,
//     };

//     dispatch(questionMapped(payload)).then((res) => {
//       if (res?.payload?.statusCode === 200) {
//         setSelectedQuestions((prev) =>
//           isChecked
//             ? [...prev, questionId]
//             : prev.filter((id) => id !== questionId)
//         );
//       } else {
//         console.error("Question mapping failed");
//       }
//     });
//   };

//   return (
//     <>
//       {/* Open Modal Button */}
//       <button
//         onClick={handleOpenModal}
//         className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition"
//       >
//         Map Questions 
//       </button>

//       {/* Modal */}
//       <Modal show={openModal} onClose={() => setOpenModal(false)} size="lg">
//         <Modal.Header>
//           Map Questions to {rowData?.mood_meter_name}
//         </Modal.Header>

//         <Modal.Body>
//           <div className="space-y-2 max-h-96 overflow-y-auto">
//             {questionList?.data?.length > 0 ? (
//               questionList.data.map((q) => {
//                 const isChecked = selectedQuestions.includes(q.id);

//                 return (
//                   <label
//                     key={q.id}
//                     className="flex gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition"
//                   >
//                     <input
//                       type="checkbox"
//                       checked={isChecked}
//                       onChange={(e) =>
//                         handleToggle(q.id, e.target.checked)
//                       }
//                       className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
//                     />

//                     <div>
//                       <p className="text-sm font-medium text-gray-900">
//                         {q.question}
//                       </p>
//                       {q.description && (
//                         <p className="text-xs text-gray-500 mt-1">
//                           {q.description}
//                         </p>
//                       )}
//                     </div>
//                   </label>
//                 );
//               })
//             ) : (
//               <p className="text-center text-gray-500 py-4">
//                 No questions available
//               </p>
//             )}
//           </div>
//         </Modal.Body>

//         <Modal.Footer>
//           <Button color="gray" onClick={() => setOpenModal(false)}>
//             Close
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
import {
  alreadyMappedQuestion,
  questionMapped,
  unMappedQuestion,
} from "../../Reducer/QuestionSlice";

const MapperQuestion = ({ rowData }) => {
  const dispatch = useDispatch();

  const { questionList, alreadyMappedData } = useSelector(
    (state) => state?.questions
  );

  const [openModal, setOpenModal] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  /* -------------------------------
     Open modal + load mapped data
  --------------------------------*/
  const handleOpenModal = () => {
    setOpenModal(true);
    dispatch(alreadyMappedQuestion({ id: rowData?.id }));
  };

  /* -------------------------------
     Sync checked state from API
  --------------------------------*/
  useEffect(() => {
    if (alreadyMappedData?.data?.length > 0) {
      const mappedIds = alreadyMappedData.data.map(
        (item) => item.question_id
      );
      setSelectedQuestions(mappedIds);
    } else {
      setSelectedQuestions([]);
    }
  }, [alreadyMappedData]);

  /* -------------------------------
     Toggle handler (MAP / UNMAP)
  --------------------------------*/
  const handleToggle = (questionId, isChecked) => {
    if (isChecked) {
      // MAP
      const payload = {
        question_id: questionId,
        awareness_id: rowData.id,
        status: 1,
      };

      dispatch(questionMapped(payload)).then((res) => {
        if (res?.payload?.statusCode === 200) {
          setSelectedQuestions((prev) => [...prev, questionId]);
        }
      });
    } else {
      // UNMAP
      const mappedItem = alreadyMappedData?.data?.find(
        (item) => item.question_id === questionId
      );

      if (!mappedItem) return;

      dispatch(unMappedQuestion({ id: mappedItem.id })).then((res) => {
        if (res?.payload?.statusCode === 200) {
          setSelectedQuestions((prev) =>
            prev.filter((id) => id !== questionId)
          );
        }
      });
    }
  };

  return (
    <>
      {/* Open Modal */}
      <button
        onClick={handleOpenModal}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition"
      >
        Map Questions 
      </button>

      {/* Modal */}
      <Modal show={openModal} onClose={() => setOpenModal(false)} size="lg">
        <Modal.Header>
          Map Questions to {rowData?.mood_meter_name}
        </Modal.Header>

        <Modal.Body>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {questionList?.data?.length > 0 ? (
              questionList.data.map((q) => {
                const isChecked = selectedQuestions.includes(q.id);

                return (
                  <label
                    key={q.id}
                    className="flex gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        handleToggle(q.id, e.target.checked)
                      }
                      className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />

                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {q.question}
                      </p>
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
          <Button color="gray" onClick={() => setOpenModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MapperQuestion;

