
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
              questionList.data.map((q,index) => {
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
                       {index+1}.    {q.question}
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

