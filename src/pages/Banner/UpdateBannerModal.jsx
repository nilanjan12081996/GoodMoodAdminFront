import { Button, FileInput, Label, Modal, Select, TextInput } from "flowbite-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { fetchBanners, updateBanner, clearCurrentBanner } from "../../Reducer/BannerSlice";
import { PACKAGE_OPTIONS } from "./packageConstants";

const resolveImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const rawBase = import.meta.env.VITE_API_BASE_URL || "https://newadminapigoodmood.goodmood.solutions/api/";
  const baseUrl = rawBase.replace("/api/", "").replace(/\/$/, "");
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

const UpdateBannerModal = ({
  openUpdateBannerModal,
  setOpenUpdateBannerModal,
  bannerId,
  currentBanner,
  isPackageBanner = false,
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
        toast.success(
          isPackageBanner
            ? "Package banner updated successfully!"
            : "Banner updated successfully!"
        );
        handleClose();
        dispatch(fetchBanners());
      } else {
        toast.error(res?.payload?.message || "Failed to update banner.");
      }
    });
  };

  const bannerData = currentBanner?.data || currentBanner?.result || currentBanner;
  const existingImageUrl = resolveImageUrl(bannerData?.image || bannerData?.banner_image || bannerData?.imageUrl);

  return (
    <Modal show={openUpdateBannerModal} onClose={handleClose}>
      <Modal.Header>
        {isPackageBanner ? "Edit Package Banner" : "Edit Banner"}
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
            {isPackageBanner ? "Update Package Banner" : "Update Banner"}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default UpdateBannerModal;
