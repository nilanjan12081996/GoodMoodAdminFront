
// import { useState, useEffect } from "react";
// import { Modal, Button } from "flowbite-react";
// import { useSelector, useDispatch } from "react-redux";
// import {
//   alreadyMappedQuestion,
//   questionMapped,
//   unMappedQuestion,
// } from "../../Reducer/QuestionSlice";

// const MapperQuestion = ({ rowData }) => {
//   const dispatch = useDispatch();

//   const { questionList, alreadyMappedData } = useSelector(
//     (state) => state?.questions
//   );

//   const [openModal, setOpenModal] = useState(false);
//   const [selectedQuestions, setSelectedQuestions] = useState([]);

//   // CHANGED: Added a processing state to disable inputs while "Select All" is running its API calls
//   const [isProcessing, setIsProcessing] = useState(false);

//   /* -------------------------------
//      Open modal + load mapped data
//   --------------------------------*/
//   const handleOpenModal = () => {
//     setOpenModal(true);
//     dispatch(alreadyMappedQuestion({ id: rowData?.id }));
//   };

//   /* -------------------------------
//      Sync checked state from API
//   --------------------------------*/
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

//   /* -------------------------------
//      Toggle handler (MAP / UNMAP)
//   --------------------------------*/
//   const handleToggle = (questionId, isChecked) => {
//     if (isChecked) {
//       // MAP
//       const payload = {
//         question_id: questionId,
//         awareness_id: rowData.id,
//         status: 1,
//       };

//       dispatch(questionMapped(payload)).then((res) => {
//         if (res?.payload?.statusCode === 200) {
//           setSelectedQuestions((prev) => [...prev, questionId]);
//         }
//       });
//     } else {
//       // UNMAP
//       const mappedItem = alreadyMappedData?.data?.find(
//         (item) => item.question_id === questionId
//       );

//       if (!mappedItem) return;

//       dispatch(unMappedQuestion({ id: mappedItem.id })).then((res) => {
//         if (res?.payload?.statusCode === 200) {
//           setSelectedQuestions((prev) =>
//             prev.filter((id) => id !== questionId)
//           );
//         }
//       });
//     }
//   };

//   // CHANGED: Added Select All Logic
//   /* -------------------------------
//      Select All / Deselect All Handler
//   --------------------------------*/
//   // Check if every question in the list is included in selectedQuestions
//   const isAllSelected =
//     questionList?.data?.length > 0 &&
//     questionList.data.every((q) => selectedQuestions.includes(q.id));

//   const handleSelectAll = async (isChecked) => {
//     if (!questionList?.data?.length || isProcessing) return;

//     setIsProcessing(true);

//     if (isChecked) {
//       // Find all questions that are not yet selected
//       const unmappedQuestions = questionList.data.filter(
//         (q) => !selectedQuestions.includes(q.id)
//       );

//       // Optimistically update UI
//       setSelectedQuestions(questionList.data.map((q) => q.id));

//       // Dispatch all mapping APIs in parallel
//       const promises = unmappedQuestions.map((q) =>
//         dispatch(
//           questionMapped({
//             question_id: q.id,
//             awareness_id: rowData.id,
//             status: 1,
//           })
//         )
//       );
//       await Promise.all(promises);
//     } else {
//       // Optimistically clear UI
//       setSelectedQuestions([]);

//       // Dispatch all unmapping APIs in parallel based on alreadyMappedData
//       if (alreadyMappedData?.data?.length > 0) {
//         const promises = alreadyMappedData.data.map((mappedItem) =>
//           dispatch(unMappedQuestion({ id: mappedItem.id }))
//         );
//         await Promise.all(promises);
//       }
//     }

//     // Re-fetch mapped questions to ensure the database IDs sync correctly for future unmapping
//     dispatch(alreadyMappedQuestion({ id: rowData?.id }));
//     setIsProcessing(false);
//   };

//   return (
//     <>
//       {/* Open Modal */}
//       <button
//         onClick={handleOpenModal}
//         className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition"
//       >
//         Map Questions 
//       </button>

//       {/* Modal */}
//       <Modal show={openModal} onClose={() => setOpenModal(false)} size="2xl">
//         <Modal.Header>
//           Map Questions to {rowData?.mood_meter_name}
//         </Modal.Header>

//         <Modal.Body>
//           <div className="space-y-2 max-h-96 overflow-y-auto">
//             {questionList?.data?.length > 0 ? (
//               questionList.data.map((q,index) => {
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
//                        {index+1}.    {q.question}
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

//         {/* CHANGED: Flex alignment added to the footer to push Select All to the left and Close to the right */}
//         <Modal.Footer className="flex justify-between items-center">

//           {/* CHANGED: Added Select All Checkbox at the very bottom */}
//           {questionList?.data?.length > 0 ? (
//             <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-900 select-none">
//               <input
//                 type="checkbox"
//                 checked={isAllSelected}
//                 disabled={isProcessing}
//                 onChange={(e) => handleSelectAll(e.target.checked)}
//                 className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
//               />
//               Select All Questions ({selectedQuestions.length}/{questionList.data.length})
//             </label>
//           ) : (
//             <div />
//           )}
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
  const [isProcessing, setIsProcessing] = useState(false);

  /* -------------------------------
     Open modal + load mapped data
  --------------------------------*/
  const handleOpenModal = () => {
    setOpenModal(true);
    if (rowData?.id) {
      dispatch(alreadyMappedQuestion({ id: rowData?.id }));
    }
  };

  /* -------------------------------
     Sync checked state from API
  --------------------------------*/
  useEffect(() => {
    if (alreadyMappedData?.data?.length > 0) {
      // String-এ রূপান্তর করা হয়েছে যাতে Type Mismatch না হয়
      const mappedIds = alreadyMappedData.data.map((item) =>
        String(item.question_id)
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
    const stringQId = String(questionId);

    if (isChecked) {
      // MAP
      const payload = {
        question_id: questionId,
        awareness_id: rowData.id,
        status: 1,
      };

      dispatch(questionMapped(payload)).then((res) => {
        // Status code 200 অথবা successful payload চেক
        if (res?.payload?.statusCode === 200 || res?.payload?.status === 200 || res?.meta?.requestStatus === "fulfilled") {
          setSelectedQuestions((prev) => [...prev, stringQId]);
          dispatch(alreadyMappedQuestion({ id: rowData?.id }));
        }
      });
    } else {
      // UNMAP: Loose check or String compare logic
      const mappedItem = alreadyMappedData?.data?.find(
        (item) => String(item.question_id) === stringQId
      );

      if (!mappedItem) return;

      dispatch(unMappedQuestion({ id: mappedItem.id })).then((res) => {
        if (res?.payload?.statusCode === 200 || res?.payload?.status === 200 || res?.meta?.requestStatus === "fulfilled") {
          setSelectedQuestions((prev) =>
            prev.filter((id) => id !== stringQId)
          );
          dispatch(alreadyMappedQuestion({ id: rowData?.id }));
        }
      });
    }
  };

  /* -------------------------------
     Select All / Deselect All Handler
  --------------------------------*/
  const isAllSelected =
    questionList?.data?.length > 0 &&
    questionList.data.every((q) =>
      selectedQuestions.includes(String(q.id))
    );

  const handleSelectAll = async (isChecked) => {
    if (!questionList?.data?.length || isProcessing) return;

    setIsProcessing(true);

    if (isChecked) {
      const unmappedQuestions = questionList.data.filter(
        (q) => !selectedQuestions.includes(String(q.id))
      );

      // Optimistically update UI
      setSelectedQuestions(questionList.data.map((q) => String(q.id)));

      const promises = unmappedQuestions.map((q) =>
        dispatch(
          questionMapped({
            question_id: q.id,
            awareness_id: rowData.id,
            status: 1,
          })
        )
      );
      await Promise.all(promises);
    } else {
      // Optimistically clear UI
      setSelectedQuestions([]);

      if (alreadyMappedData?.data?.length > 0) {
        const promises = alreadyMappedData.data.map((mappedItem) =>
          dispatch(unMappedQuestion({ id: mappedItem.id }))
        );
        await Promise.all(promises);
      }
    }

    dispatch(alreadyMappedQuestion({ id: rowData?.id }));
    setIsProcessing(false);
  };

  return (
    <>
      {/* Open Modal Button */}
      <button
        onClick={handleOpenModal}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition"
      >
        Map Questions
      </button>

      {/* Modal */}
      <Modal show={openModal} onClose={() => setOpenModal(false)} size="2xl">
        <Modal.Header>
          Map Questions to {rowData?.mood_meter_name}
        </Modal.Header>

        <Modal.Body>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {questionList?.data?.length > 0 ? (
              questionList.data.map((q, index) => {
                const isChecked = selectedQuestions.includes(String(q.id));

                return (
                  <label
                    key={q.id}
                    className="flex gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isProcessing}
                      onChange={(e) =>
                        handleToggle(q.id, e.target.checked)
                      }
                      className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                    />

                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {index + 1}. {q.question}
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

        <Modal.Footer className="flex justify-between items-center">
          {questionList?.data?.length > 0 ? (
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-900 select-none">
              <input
                type="checkbox"
                checked={isAllSelected}
                disabled={isProcessing}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
              />
              Select All Questions ({selectedQuestions.length}/
              {questionList.data.length})
            </label>
          ) : (
            <div />
          )}
          <Button color="gray" onClick={() => setOpenModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MapperQuestion;

