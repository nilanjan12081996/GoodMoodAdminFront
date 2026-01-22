import { Button, FileInput, Label, Modal, Textarea, TextInput } from "flowbite-react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

import { toast } from "react-toastify";
import { addMoodMeter, getAwarness } from "../../Reducer/MoodMeterSlice";

const AddMoodMeterModal = ({ openAddTagModal, setOpenTagModal,id }) => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    // const formData = new FormData();
    // formData.append("mood_meter_name", data?.mood_meter_name);
    // formData.append("image", data?.image?.[0]);
    const payload={
      awarenessName:data?.awarenessName,
      description:data?.description,
      subsidebarId:id?.id,
      colorCode:data?.colorCode
    }
    dispatch(addMoodMeter(payload)).then((res) => {
      console.log("res", res);
      if (res?.payload?.statusCode === 201) {
        setOpenTagModal(false);
        dispatch(getAwarness({id:id?.id}));
      } else if (res?.payload?.response?.data?.status_code === 400) {
        toast.error(res?.payload?.response?.data?.message);
      }
    });
  };
  return (
    <>
      <Modal show={openAddTagModal} onClose={() => setOpenTagModal(false)}>
        <Modal.Header>{id?.id==1?"Add New Mood Meter":id?.id==2?"Add New Moodz Matter":id?.id==3?"Add New Mood Master":""}</Modal.Header>
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
            <Button className="cnl_btn" onClick={() => setOpenTagModal(false)}>
              Cancel
            </Button>
            <Button color="success" type="submit">
             {id?.id==1?"Add New Mood Meter":id?.id==2?"Add New Moodz Matter":id?.id==3?"Add New Mood Master":""}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
};
export default AddMoodMeterModal;
