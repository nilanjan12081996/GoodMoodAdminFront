// import { Button, Label, Modal, Textarea, TextInput } from "flowbite-react";
// import { useEffect } from "react";
// import { useFieldArray, useForm } from "react-hook-form";
// import { useDispatch } from "react-redux";
// import {
//   getQuestion,
//   updateQuestionDetails,
// } from "../../Reducer/QuestionSlice";


// const UpdateQuestionModal = ({
//   openUpdateModal,
//   setOpenUpdateModal,
//   singleQuestion,
//   questionId,
//   setOptionId,
//   setDeleteConfirmationModal
// }) => {
//   const dispatch = useDispatch();

//   const {
//     register,
//     control,
//     handleSubmit,
//     watch,
//     reset,
    
//     formState: { errors },
//   } = useForm({
//     defaultValues: {
//       question: "",
//       answer: [],
//     },
//   });

//   const { fields, append, remove,replace  } = useFieldArray({
//     control,
//     name: "answer",
//   });

//   const watchAnswers = watch("answer");

//   /* ---------------- Prefill data ---------------- */
//   // useEffect(() => {
//   //   if (singleQuestion?.data) {
//   //     reset({
//   //       question: singleQuestion.data?.[0]?.question,
//   //       answer: singleQuestion.data?.[0].answer || [],
//   //     });
//   //   }
//   // }, [singleQuestion, reset]);

//   useEffect(() => {
//   if (singleQuestion?.data?.[0]) {
//     const questionData = singleQuestion.data[0];

//     reset({
//       question: questionData.question,
//     });

//     replace(
//       questionData.answer?.map((ans) => ({
//         id: ans.id,          // keep backend id
//         answer: ans.answer,
//         point: ans.point,
//       })) || []
//     );
//   }
// }, [singleQuestion, reset, replace]);


//   /* ---------------- Submit ---------------- */
//   const onSubmit = (data) => {
//     dispatch(
//       updateQuestionDetails({
//         id: questionId,
//         question: data.question,
//         answer: data.answer,
//       })
//     ).then((res) => {
//       if (res?.payload?.statusCode === 200) {
//         dispatch(getQuestion());
//         setOpenUpdateModal(false);
//       }
//     });
//   };

//   /* ---------------- Delete answer ---------------- */
//   const handleDeleteAnswer = (index, answerId) => {
//     console.log("answerId",answerId);
    
//     // Existing answer → API delete
//     // if (answerId) {
//     //     setOptionId(answerId)
//     //   setDeleteConfirmationModal(true)
//     // } 
//     // // New answer → just remove
//     // else {
//     //   remove(index);
//     // }
//   };

//   return (
//     <Modal show={openUpdateModal} onClose={() => setOpenUpdateModal(false)}>
//       <Modal.Header>Update Question</Modal.Header>

//       <form onSubmit={handleSubmit(onSubmit)}>
//         <Modal.Body>
//           <div className="space-y-6">

//             {/* Question */}
//             <div>
//               <Label value="Question" />
//               <Textarea
//                 {...register("question", { required: "Question is required" })}
//                 className="mt-2"
//               />
//             </div>

//             {/* Answers */}
//             <div className="space-y-4">
//               <div className="flex justify-between items-center">
//                 <Label value="Answers (Max 5)" />
//                 {fields.length < 5 && (
//                   <Button
//                     size="xs"
//                     color="gray"
//                     onClick={() => append({id: null, answer: "", point: 0 })}
//                   >
//                     + Add Choice
//                   </Button>
//                 )}
//               </div>

//               {fields.map((item, index) => (
//                 <>
//               {console.log("item",item)}
//                 <div
//                   key={item.id}
//                   className="border p-3 rounded-lg space-y-2"
//                 >
//                   <div className="flex gap-4 items-end">
//                     <div className="flex-1">
//                       <Label value={`Answer ${index + 1}`} />
//                       <TextInput
//                         {...register(`answer.${index}.answer`, {
//                           required: "Text required",
//                         })}
//                       />
//                     </div>

//                     <div className="w-28">
//                       <Label value="Point" />
//                       <TextInput
//                         type="number"
//                         {...register(`answer.${index}.point`, {
//                           required: true,
//                           valueAsNumber: true,
//                           min: 0,
//                           max: 10,
//                           validate: (value) => {
//                             const duplicates = watchAnswers.filter(
//                               (a) => a.point === value
//                             );
//                             return (
//                               duplicates.length <= 1 ||
//                               "Points must be unique"
//                             );
//                           },
//                         })}
//                       />
//                     </div>

//                     <Button
//                        type="button"
//                       color="failure"
//                       onClick={() =>
//                         handleDeleteAnswer(index, item.answerId)
//                       }
//                     >
//                       Delete
//                     </Button>
//                   </div>

//                   {errors.answer?.[index]?.point && (
//                     <p className="text-red-500 text-xs">
//                       {errors.answer[index].point.message}
//                     </p>
//                   )}
//                 </div>
//                   </>
//               ))}
//             </div>
//           </div>
//         </Modal.Body>

//         <Modal.Footer>
//           <Button color="gray" onClick={() => setOpenUpdateModal(false)}>
//             Cancel
//           </Button>
//           <Button color="success" type="submit">
//             Update Question
//           </Button>
//         </Modal.Footer>
//       </form>
//     </Modal>
//   );
// };

// export default UpdateQuestionModal;













import { Button, Label, Modal, Textarea, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  getQuestion,
  updateQuestionDetails,
} from "../../Reducer/QuestionSlice";
import { useLocation, useNavigate } from "react-router-dom";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const UpdateQuestionModal = ({}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { singleQuestion } = useSelector(
    (state) => state?.questions
  );
  const location=useLocation()
  const questionId=location?.state?.id
const[deleteConfirmModal,setDeleteConfirmationModal]=useState(false)
const[optionid,setOptionId]=useState()
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      question: "",
      answer: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "answer",
  });

  const watchAnswers = watch("answer");

  /* ================= Prefill data ================= */
  useEffect(() => {
    if (singleQuestion?.data?.[0]) {
      const questionData = singleQuestion.data[0];

      reset({
        question: questionData.question,
      });

      replace(
        questionData.answer.map((ans) => ({
          answerId: ans.id, // ✅ backend ID stored safely
          answer: ans.answer,
          point: ans.point,
        }))
      );
    }
  }, [singleQuestion, reset, replace]);

  /* ================= Submit ================= */
  const onSubmit = (data) => {
    const payload = {
      id: questionId, // ✅ question ID sent as `id`
      question: data.question,
      answer: data.answer.map((ans) => ({
        id: ans.answerId || null, // ✅ answer ID sent as `id`
        answer: ans.answer,
        point: ans.point,
      })),
    };

    dispatch(updateQuestionDetails(payload)).then((res) => {
      if (res?.payload?.statusCode === 200) {
        dispatch(getQuestion());
        // setOpenUpdateModal(false);
      }
    });
  };

  /* ================= Delete Answer ================= */
  const handleDeleteAnswer = (index, answerId) => {
    if (answerId) {
      setOptionId(answerId); // backend ID
      setDeleteConfirmationModal(true);
    } else {
      remove(index);
    }
  };

  return (
    <div >
       <div className="flex justify-between items-center mb-3">
         <h2 className="text-[30px] font-semibold">Update Question</h2>
         <Button color="gray" onClick={() => navigate(-1)}>Back</Button>
       </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <div className="space-y-6">

            {/* Question */}
            <div>
              <Label value="Question" />
              <Textarea
                className="mt-2"
                {...register("question", {
                  required: "Question is required",
                })}
              />
            </div>

            {/* Answers */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label value="Answers (Max 5)" />
                {fields.length < 5 && (
                  <Button
                    size="xs"
                    color="gray"
                    type="button"
                    onClick={() =>
                      append({ answerId: null, answer: "", point: 0 })
                    }
                  >
                    + Add Choice
                  </Button>
                )}
              </div>

              {fields.map((item, index) => (
                <div
                  key={item.id} // ✅ RHF internal ID (KEEP THIS)
                  className="border p-3 rounded-lg space-y-2"
                >
                  {/* Backend Answer ID */}
              

                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label
                        value={`Answer ${index + 1}${
                          item.answerId ? ` (${item.answerId})` : ""
                        }`}
                      />
                      <TextInput
                        {...register(`answer.${index}.answer`, {
                          required: "Answer text required",
                        })}
                      />
                    </div>

                    <div className="w-28">
                      <Label value="Point" />
                      <TextInput
                        type="number"
                        {...register(`answer.${index}.point`, {
                          required: true,
                          valueAsNumber: true,
                          min: 0,
                          max: 10,
                          validate: (value) => {
                            const duplicates = watchAnswers.filter(
                              (a) => a.point === value
                            );
                            return (
                              duplicates.length <= 1 ||
                              "Points must be unique"
                            );
                          },
                        })}
                      />
                    </div>

                    <Button
                      type="button"
                      color="failure"
                      onClick={() =>
                        handleDeleteAnswer(index, item.answerId)
                      }
                    >
                      Delete
                    </Button>
                  </div>

                  {errors.answer?.[index]?.point && (
                    <p className="text-red-500 text-xs">
                      {errors.answer[index].point.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          {/* <Button color="gray" onClick={() => setOpenUpdateModal(false)}>
            Cancel
          </Button> */}
          <Button color="success" type="submit">
            Update Question
          </Button>
        </div>
      </form>
      {
        deleteConfirmModal&&(
          <DeleteConfirmationModal
          deleteConfirmModal={deleteConfirmModal}
          setDeleteConfirmationModal={setDeleteConfirmationModal}
          optionid={optionid}
          id={questionId}
          />
        )
      }
      
    </div>
  );
};

export default UpdateQuestionModal;

