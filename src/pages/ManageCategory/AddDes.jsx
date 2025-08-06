import { Button, Label, Modal, TextInput } from "flowbite-react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { addCategoryDes } from "../../Reducer/CategorySlice";
import { toast } from "react-toastify";

const AddDes = ({ openAddDesModal, setOpenAddDesModal, cateGoryId }) => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const onSubmit = (data) => {
    dispatch(addCategoryDes({ ...data, category_id: cateGoryId })).then(
      (res) => {
        if (res?.payload?.status_code === 201) {
          setOpenAddDesModal(false);
          toast.success(res?.payload?.message);
        }
      }
    );
  };
  return (
    <>
      <Modal show={openAddDesModal} onClose={() => setOpenAddDesModal(false)}>
        <Modal.Header>Add Category Description</Modal.Header>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="name" value="Content Type" />
                </div>
                <TextInput
                  id="name"
                  type="text"
                  placeholder="Enter Content Type"
                  {...register("content_type")}
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="name" value="Target Vibes" />
                </div>
                <TextInput
                  id="name"
                  type="text"
                  placeholder="Enter Target Vibes"
                  {...register("target_vibes")}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="cnl_btn"
              onClick={() => setOpenAddDesModal(false)}
            >
              Cancel
            </Button>
            <Button color="success" type="submit">
              Add Category Description
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
};
export default AddDes;
