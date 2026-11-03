import { Button, FileInput, Label, Modal, Select, TextInput } from "flowbite-react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { addBanner, fetchBanners } from "../../Reducer/BannerSlice";
import { PACKAGE_OPTIONS } from "./packageConstants";

const AddBannerModal = ({ openAddBannerModal, setOpenAddBannerModal, isPackageBanner = false }) => {
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
        toast.success(
          isPackageBanner
            ? "Package banner added successfully!"
            : "Banner added successfully!"
        );
        setOpenAddBannerModal(false);
        dispatch(fetchBanners());
      } else {
        toast.error(res?.payload?.message || "Failed to add banner.");
      }
    });
  };

  return (
    <Modal show={openAddBannerModal} onClose={() => setOpenAddBannerModal(false)}>
      <Modal.Header>
        {isPackageBanner ? "Add New Package Banner" : "Add New Banner"}
      </Modal.Header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <div className="mb-2 block">
                <Label
                  htmlFor="title"
                  value={
                    isPackageBanner
                      ? "Package Title (Select from 4 Packages)"
                      : "Banner Title"
                  }
                />
              </div>
              {isPackageBanner ? (
                <Select id="title" {...register("title", { required: true })}>
                  <option value="">Select Package</option>
                  {PACKAGE_OPTIONS.map((pkg) => (
                    <option key={pkg} value={pkg}>
                      {pkg}
                    </option>
                  ))}
                </Select>
              ) : (
                <TextInput
                  id="title"
                  type="text"
                  placeholder="Enter Banner Title"
                  {...register("title", { required: true })}
                />
              )}
              {errors.title && (
                <span className="text-red-500 text-sm">
                  {isPackageBanner
                    ? "Please select a package title"
                    : "Title is required"}
                </span>
              )}
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="image" value="Banner Image / Photo" />
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
            {isPackageBanner ? "Add Package Banner" : "Add New Banner"}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default AddBannerModal;
