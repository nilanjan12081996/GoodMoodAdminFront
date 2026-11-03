import { Label, Modal, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { createUpdatePlatformCharges } from "../../Reducer/PlatformSlice";
import { toast } from "react-toastify";
import { Percent, CheckCircle2 } from "lucide-react";

const AddUpdateCharges = ({
  openAddModal,
  setOpenAddModal,
  isEdit,
  categoryId,
  categoryName,
  initialCharge,
  onSuccess,
}) => {
  const { charges } = useSelector((state) => state?.platform);
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (openAddModal) {
      if (charges?.data?.charge !== undefined && charges?.data?.charge !== null) {
        setValue("charge", charges.data.charge);
      } else if (initialCharge !== undefined && initialCharge !== null) {
        setValue("charge", initialCharge);
      } else {
        reset({ charge: "" });
      }
    }
  }, [openAddModal, charges, initialCharge, setValue, reset]);

  const onSubmit = (data) => {
    setSubmitting(true);
    dispatch(createUpdatePlatformCharges({ ...data, support_category: categoryId }))
      .then((res) => {
        if (res?.payload?.statusCode === 200 || res?.payload?.statusCode === 201) {
          toast.success(res?.payload?.message || "Charge updated successfully");
          onSuccess?.(categoryId, data.charge);
          setOpenAddModal(false);
        } else {
          toast.error(res?.payload?.message || "Failed to update platform charge");
        }
      })
      .catch((err) => {
        toast.error("An error occurred while saving charge");
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <Modal show={openAddModal} onClose={() => setOpenAddModal(false)} size="md">
      <Modal.Header>
        <div className="flex flex-col text-left">
          <span className="text-lg font-bold text-gray-900">
            {isEdit ? "Edit Platform Charge" : "Add Platform Charge"}
          </span>
          {categoryName && (
            <span className="text-xs text-gray-500 font-normal mt-0.5">
              Category: <span className="font-semibold text-gray-700">{categoryName}</span>
            </span>
          )}
        </div>
      </Modal.Header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="charge" value="Charge Percentage (%)" className="text-xs font-semibold text-gray-700 uppercase tracking-wider" />
              </div>
              <div className="relative">
                <TextInput
                  id="charge"
                  type="number"
                  step="any"
                  min="0"
                  max="100"
                  placeholder="e.g. 20"
                  {...register("charge", {
                    required: "Charge percentage is required",
                    min: { value: 0, message: "Percentage cannot be less than 0" },
                    max: { value: 100, message: "Percentage cannot exceed 100" },
                  })}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 font-bold text-sm">
                  %
                </div>
              </div>
              {errors.charge && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {errors.charge.message}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                This percentage will be charged by Good Mood as the platform fee for this category.
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex justify-end gap-2.5 w-full">
            <button
              type="button"
              onClick={() => setOpenAddModal(false)}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0B8843] hover:bg-black rounded-lg transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 size={14} />
              <span>{submitting ? "Saving..." : isEdit ? "Update Charge" : "Save Charge"}</span>
            </button>
          </div>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default AddUpdateCharges;
