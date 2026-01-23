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

const UpdateMoodMeterModal = ({
  openUpdateTagModal,
  setOpenUpdateTagModal,
  moodmeterId,
  id,
  singleAwarness
}) => {
  const dispatch = useDispatch();
  const { singleMoodMeter } = useSelector((state) => state?.moodData);
  const [selectedFile, setSelectedFile] = useState(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  // useState(() => {
  //   dispatch(getSingleMoodMeter({ mood_meter_id: moodmeterId }));
  // }, [moodmeterId]);
    console.log("singleAwarness",singleAwarness);
    
  useEffect(() => {
    setValue("awarenessName", singleAwarness?.data?.awarenessName);
    setValue("description",singleAwarness?.data?.description);
    setValue("colorCode",singleAwarness?.data?.colorCode);
  }, [singleAwarness, setValue]);
  const onSubmit = (data) => {
    dispatch(updateMoodMeter({ ...data, id: moodmeterId,subsidebarId:id?.id })).then(
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
