import { Button, FileInput, Label, Modal, Textarea, TextInput } from "flowbite-react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { MdEdit } from "react-icons/md";
import {

  getAwarness,
  getSingleMoodMeter,
  updateMoodMeter,
  uploadMoodAvatar,
} from "../../Reducer/MoodMeterSlice";

import { inferContentType } from "../../utils/equalizerHelper";
import { contentList } from "../../Reducer/ContentUploadSlice";
import { Lock } from "lucide-react";

const UpdateMoodMeterModal = ({
  openUpdateTagModal,
  setOpenUpdateTagModal,
  moodmeterId,
  id,
  singleAwarness
}) => {
  const dispatch = useDispatch();
  const { singleMoodMeter } = useSelector((state) => state?.moodData);
  const { allContent } = useSelector((state) => state?.content);
  const [selectedFile, setSelectedFile] = useState(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (openUpdateTagModal && id?.id == 5 && moodmeterId) {
      dispatch(contentList({ id: moodmeterId }));
    }
  }, [openUpdateTagModal, id?.id, moodmeterId, dispatch]);

  const existingContentCount = id?.id == 5 ? (allContent?.data?.length || 0) : 0;
  const isTypeLocked = existingContentCount > 0;
  // useState(() => {
  //   dispatch(getSingleMoodMeter({ mood_meter_id: moodmeterId }));
  // }, [moodmeterId]);
    console.log("singleAwarness",singleAwarness);
    
  useEffect(() => {
    setValue("awarenessName", singleAwarness?.data?.awarenessName);
    setValue("description", singleAwarness?.data?.description);
    const existingType = singleAwarness?.data?.colorCode || (id?.id == 5 ? inferContentType(singleAwarness?.data?.awarenessName) : "");
    setValue("colorCode", existingType);
  }, [singleAwarness, setValue, id]);
  const onSubmit = (data) => {
    const fallbackType = singleAwarness?.data?.colorCode || (id?.id == 5 ? inferContentType(singleAwarness?.data?.awarenessName) : "");
    const payload = {
      ...data,
      colorCode: data.colorCode || fallbackType,
      id: moodmeterId,
      subsidebarId: id?.id,
    };
    dispatch(updateMoodMeter(payload)).then(
      (res) => {
        console.log("res", res);

        if (res?.payload?.statusCode === 200) {
          setOpenUpdateTagModal(false);
             dispatch(getAwarness({id:id?.id}));
            
        }
      }
    );
  };

  return (
    <>
       <Modal  show={openUpdateTagModal}
        onClose={() => setOpenUpdateTagModal(false)}>
              <Modal.Header>{id?.id==1?"Edit Mood Meter":id?.id==2?"Edit Moodz Matter":id?.id==3?"Edit Mood Master":id?.id==5?"Edit Mood Equilizer":""}</Modal.Header>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body>
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 block">
                        <Label htmlFor="name" value="Name" />
                      </div>
                      <TextInput
                        id="name"
                        type="text"
                        placeholder="Enter Name"
                        {...register("awarenessName",{required:true})}
                      />
                      {
                        errors.awarenessName&&(
                          <span className="text-red-500">Name is Required</span>
                        )
                      }
                    </div>
                      <div>
                      <div className="mb-2 block">
                        <Label htmlFor="name" value="Description" />
                      </div>
                      <Textarea
                        id="name"
                        type="text"
                        placeholder="Enter Description"
                        {...register("description",{required:true})}
                      />
                       {
                        errors.description&&(
                          <span className="text-red-500">Description is Required</span>
                        )
                      }
                    </div>
                    {
                      (id?.id==3 || id?.id==1)&&(
                         <div>
                      <div className="mb-2 block">
                        <Label htmlFor="name" value="Color code" />
                      </div>
                      <TextInput
                        id="name"
                        type="text"
                        placeholder="Enter Color Code"
                        {...register("colorCode",{required:true})}
                      />
                       {
                        errors.colorCode&&(
                          <span className="text-red-500">Color Code is Required</span>
                        )
                      }
                    </div>
                      )
                    }
                    {
                      id?.id == 5 && (
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <Label htmlFor="contentType" value="Content Type" />
                            {isTypeLocked && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                <Lock size={11} /> Locked
                              </span>
                            )}
                          </div>
                          <select
                            id="contentType"
                            disabled={isTypeLocked}
                            className={`border text-sm rounded-lg block w-full p-2.5 ${
                              isTypeLocked
                                ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-[#0B8843] focus:border-[#0B8843]"
                            }`}
                            {...register("colorCode", { required: !isTypeLocked })}
                          >
                            <option value="">Select Content Type</option>
                            <option value="video">Video Player</option>
                            <option value="audio">Audio Player</option>
                            <option value="story">Story & Article</option>
                            <option value="drawing">Drawing & Art Therapy</option>
                            <option value="game">Relaxing Game</option>
                          </select>
                          {isTypeLocked && (
                            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-2 leading-relaxed">
                              Content Type cannot be changed because <strong>{existingContentCount}</strong> item(s) are already uploaded in this category. You can still update the Name and Description.
                            </p>
                          )}
                          {errors.colorCode && !isTypeLocked && (
                            <span className="text-red-500 text-xs mt-1 block">Content Type is Required</span>
                          )}
                        </div>
                      )
                    }
                      
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button className="cnl_btn"
              onClick={() => setOpenUpdateTagModal(false)}>
                    Cancel
                  </Button>
                  <Button color="success" type="submit">
                   {id?.id==1?"Update Mood Meter":id?.id==2?"Update Moodz Matter":id?.id==3?"Update Mood Master":id?.id==5?"Update Mood Master":""}
                  </Button>
                </Modal.Footer>
              </form>
        </Modal>
    </>
  );
};
export default UpdateMoodMeterModal;
