import { Button, Label, Modal, Textarea, TextInput } from "flowbite-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import {
  getQuestion,
  updateQuestionDetails,
} from "../../Reducer/QuestionSlice";

// const UpdateQuestionModal = ({
//   openUpdateModal,
//   setOpenUpdateModal,
//   singleQuestion,
//   questionId,
// }) => {
//   const dispatch = useDispatch();
//   console.log("singleQuestion", singleQuestion);

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     formState: { errors },
//   } = useForm();
//   useEffect(() => {
//     setValue("question", singleQuestion?.data?.question);
//     setValue(
//       "question_description",
//       singleQuestion?.data?.question_description
//     );
//   }, [singleQuestion]);
//   const onSubmit = (data) => {
//     dispatch(updateQuestionDetails({ question_id: questionId, ...data })).then(
//       (res) => {
//         if (res?.payload?.status_code === 200) {
//           setOpenUpdateModal(false);
//           dispatch(getQuestion());
//         }
//       }
//     );
//   };
//   return (
//     <>
//       <Modal show={openUpdateModal} onClose={() => setOpenUpdateModal(false)}>
//         <Modal.Header>Update Questions</Modal.Header>
//         <form onSubmit={handleSubmit(onSubmit)}>
//           <Modal.Body>
//             <div className="space-y-4">
//               <div>
//                 <div className="mb-2 block">
//                   <Label htmlFor="name" value="Question" />
//                 </div>
//                 <TextInput
//                   id="name"
//                   type="text"
//                   placeholder="Enter Question"
//                   {...register("question")}
//                 />
//               </div>

//               <div>
//                 <div className="mb-2 block">
//                   <Label htmlFor="name" value="Question Description" />
//                 </div>
//                 <TextInput
//                   id="name"
//                   type="text"
//                   placeholder="Enter Question Description"
//                   {...register("question_description")}
//                 />
//               </div>
//             </div>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button
//               className="cnl_btn"
//               onClick={() => setOpenUpdateModal(false)}
//             >
//               Cancel
//             </Button>
//             <Button color="success" type="submit">
//               Update Question
//             </Button>
//           </Modal.Footer>
//         </form>
//       </Modal>
//     </>
//   );
// };


const UpdateQuestionModal = ({
  openUpdateModal,
  setOpenUpdateModal,
  singleQuestion,
  questionId,
  setOptionId,
  setDeleteConfirmationModal
}) => {
  const dispatch = useDispatch();

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

  const { fields, append, remove,replace  } = useFieldArray({
    control,
    name: "answer",
  });

  const watchAnswers = watch("answer");

  /* ---------------- Prefill data ---------------- */
  // useEffect(() => {
  //   if (singleQuestion?.data) {
  //     reset({
  //       question: singleQuestion.data?.[0]?.question,
  //       answer: singleQuestion.data?.[0].answer || [],
  //     });
  //   }
  // }, [singleQuestion, reset]);

  useEffect(() => {
  if (singleQuestion?.data?.[0]) {
    const questionData = singleQuestion.data[0];

    reset({
      question: questionData.question,
    });

    replace(
      questionData.answer?.map((ans) => ({
        answerId: ans.id,          // keep backend id
        answer: ans.answer,
        point: ans.point,
      })) || []
    );
  }
}, [singleQuestion, reset, replace]);


  /* ---------------- Submit ---------------- */
  const onSubmit = (data) => {
    dispatch(
      updateQuestionDetails({
        question_id: questionId,
        question: data.question,
        answer: data.answer,
      })
    ).then((res) => {
      if (res?.payload?.statusCode === 200) {
        dispatch(getQuestion());
        setOpenUpdateModal(false);
      }
    });
  };

  /* ---------------- Delete answer ---------------- */
  const handleDeleteAnswer = (index, answerId) => {
    // Existing answer → API delete
    if (answerId) {
        setOptionId(answerId)
      setDeleteConfirmationModal(true)
    } 
    // New answer → just remove
    else {
      remove(index);
    }
  };

  return (
    <Modal show={openUpdateModal} onClose={() => setOpenUpdateModal(false)}>
      <Modal.Header>Update Question</Modal.Header>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <div className="space-y-6">

            {/* Question */}
            <div>
              <Label value="Question" />
              <Textarea
                {...register("question", { required: "Question is required" })}
                className="mt-2"
              />
            </div>

            {/* Answers */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label value="Answers (Max 4)" />
                {fields.length < 4 && (
                  <Button
                    size="xs"
                    color="gray"
                    onClick={() => append({answerId: null, answer: "", point: 0 })}
                  >
                    + Add Choice
                  </Button>
                )}
              </div>

              {fields.map((item, index) => (
                <div
                  key={item.id}
                  className="border p-3 rounded-lg space-y-2"
                >
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label value={`Answer ${index + 1}`} />
                      <TextInput
                        {...register(`answer.${index}.answer`, {
                          required: "Text required",
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
        </Modal.Body>

        <Modal.Footer>
          <Button color="gray" onClick={() => setOpenUpdateModal(false)}>
            Cancel
          </Button>
          <Button color="success" type="submit">
            Update Question
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default UpdateQuestionModal;
