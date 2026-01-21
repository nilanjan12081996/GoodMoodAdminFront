import { Button, FileInput, Label, Modal, TextInput } from "flowbite-react";
import { useFieldArray, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import {
  addCateGory,
  addCategoryDes,
  getCateGory,
} from "../../Reducer/CategorySlice";
import { toast } from "react-toastify";
import { addQuestions, getQuestion } from "../../Reducer/QuestionSlice";

const AddQuestion = ({ openAddQueModal, setOpenAddQueModal,id }) => {
  const dispatch = useDispatch();
const { register, control, handleSubmit,watch, reset,formState: { errors } } = useForm({
    defaultValues: {
      question: "",
      answer: [{ answer: "", point: 0 }] // Start with one empty answer
    }
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "answer"
  });
  const watchAnswers = watch("answer");
  const onSubmit = (data) => {
    console.log("cate_Data: ", data);

    dispatch(addQuestions(data)).then((res) => {
      if (res?.payload?.statusCode === 200) {
        dispatch(getQuestion());
        setOpenAddQueModal(false);

        toast.success(res?.payload?.message);
      }
    });
  };
  return (
    <>
     <Modal show={openAddQueModal} onClose={() => setOpenAddQueModal(false)}>
      <Modal.Header>Add Questions</Modal.Header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <div className="space-y-6">
            <div>
              <Label htmlFor="question" value="Question" />
              <TextInput
                id="question"
                {...register("question", { required: "Question is required" })}
                className="mt-2"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label value="Answers (Max 4)" />
                {fields.length < 4 && (
                  <Button 
                    size="xs" 
                    color="gray" 
                    onClick={() => append({ answer: "", point: 0 })}
                  >
                    + Add Choice
                  </Button>
                )}
              </div>

              {fields.map((item, index) => (
                <div key={item.id} className="space-y-2 border p-3 rounded-lg">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label value={`Answer ${index + 1}`} />
                      <TextInput
                        {...register(`answer.${index}.answer`, { required: "Text required" })}
                      />
                    </div>
                    
                    <div className="w-28">
                      <Label value="Point (0-10)" />
                      <TextInput
                        type="number"
                        {...register(`answer.${index}.point`, {
                          required: true,
                          valueAsNumber: true,
                          min: { value: 0, message: "Min 0" },
                          max: { value: 10, message: "Max 10" },
                          validate: (value) => {
                            // Check if this point value exists in other answer fields
                            const duplicates = watchAnswers.filter(a => a.point === value);
                            return duplicates.length <= 1 || "Points must be unique";
                          }
                        })}
                      />
                    </div>

                    {fields.length > 1 && (
                      <Button color="failure" onClick={() => remove(index)}>Delete</Button>
                    )}
                  </div>
                  
                  {/* Error Messaging */}
                  {errors.answer?.[index]?.point && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.answer[index].point.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="success" type="submit">Add Question</Button>
        </Modal.Footer>
      </form>
    </Modal>
    </>
  );
};
export default AddQuestion;
