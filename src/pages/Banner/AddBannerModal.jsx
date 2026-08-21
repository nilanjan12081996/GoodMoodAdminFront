import { Button, FileInput, Label, Modal, Textarea, TextInput } from "flowbite-react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { addBanner, fetchBanners } from "../../Reducer/BannerSlice";

const AddBannerModal = ({ openAddBannerModal, setOpenAddBannerModal }) => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("title", data?.title || "");
    formData.append("description", data?.description || "");

    // Key must be "file" to match Spring Boot @RequestParam("file")
    if (data?.image?.[0]) {
      formData.append("file", data?.image[0]);
    }

    dispatch(addBanner(formData)).then((res) => {
      if (res?.meta?.requestStatus === "fulfilled") {
        toast.success("Banner added successfully!");
        setOpenAddBannerModal(false);
        dispatch(fetchBanners());
      } else {
        toast.error(res?.payload?.message || "Failed to add banner.");
      }
    });
  };

  return (
    <Modal show={openAddBannerModal} onClose={() => setOpenAddBannerModal(false)}>
      <Modal.Header>Add New Banner</Modal.Header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="title" value="Banner Title" />
              </div>
              <TextInput
                id="title"
                type="text"
                placeholder="Enter Banner Title"
                {...register("title", { required: true })}
              />
              {errors.title && (
                <span className="text-red-500 text-sm">Title is required</span>
              )}
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="description" value="Banner Description" />
              </div>
              <Textarea
                id="description"
                placeholder="Enter Banner Description"
                rows={3}
                {...register("description", { required: true })}
              />
              {errors.description && (
                <span className="text-red-500 text-sm">Description is required</span>
              )}
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="image" value="Banner Image" />
              </div>
              <FileInput
                id="image"
                accept="image/*"
                {...register("image", { required: true })}
              />
              {errors.image && (
                <span className="text-red-500 text-sm">Image is required</span>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className="cnl_btn" color="failure" onClick={() => setOpenAddBannerModal(false)}>
            Cancel
          </Button>
          <Button color="success" type="submit" className="bg-[#52b69a] hover:bg-black">
            Add New Banner
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default AddBannerModal;