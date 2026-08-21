import { Button, FileInput, Label, Modal, Textarea, TextInput } from "flowbite-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { fetchBanners, updateBanner, clearCurrentBanner } from "../../Reducer/BannerSlice";

const UpdateBannerModal = ({
  openUpdateBannerModal,
  setOpenUpdateBannerModal,
  bannerId,
  currentBanner,
}) => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (currentBanner) {
      const bannerData = currentBanner?.data || currentBanner?.result || currentBanner;
      setValue("title", bannerData?.title || bannerData?.name || "");
      setValue("description", bannerData?.description || "");
    }
  }, [currentBanner, setValue]);

  const handleClose = () => {
    dispatch(clearCurrentBanner());
    setOpenUpdateBannerModal(false);
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("title", data?.title || "");
    formData.append("description", data?.description || "");

    // Key must be "file" to match Spring Boot @RequestParam("file")
    if (data?.image?.[0]) {
      formData.append("file", data?.image[0]);
    }

    dispatch(updateBanner({ id: bannerId, payload: formData })).then((res) => {
      if (res?.meta?.requestStatus === "fulfilled") {
        toast.success("Banner updated successfully!");
        handleClose();
        dispatch(fetchBanners());
      } else {
        toast.error(res?.payload?.message || "Failed to update banner.");
      }
    });
  };

  const bannerData = currentBanner?.data || currentBanner?.result || currentBanner;
  const existingImageUrl = bannerData?.image || bannerData?.banner_image || bannerData?.imageUrl;

  return (
    <Modal show={openUpdateBannerModal} onClose={handleClose}>
      <Modal.Header>Edit Banner</Modal.Header>
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
                <Label htmlFor="image" value="Change Banner Image" />
              </div>
              <FileInput id="image" accept="image/*" {...register("image")} />
              {existingImageUrl && (
                <div className="mt-2">
                  <span className="text-xs text-gray-500 block mb-1">Current Image:</span>
                  <img
                    src={existingImageUrl}
                    alt="Current Banner"
                    className="w-24 h-14 object-cover rounded-md border border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className="cnl_btn" color="failure" onClick={handleClose}>
            Cancel
          </Button>
          <Button color="success" type="submit" className="bg-[#52b69a] hover:bg-black">
            Update Banner
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default UpdateBannerModal;