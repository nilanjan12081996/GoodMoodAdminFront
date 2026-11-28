import { Modal } from "flowbite-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { createUpdatePlatformCharges } from "../../Reducer/PlatformSlice";
import { Percent, CheckCircle2, ShieldCheck } from "lucide-react";

const AddUpdateCharges = ({
  openAddModal,
  setOpenAddModal,
  isEdit,
  categoryId,
  categoryName,
  initialCharge,
  onSuccess,
}) => {
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
      if (initialCharge !== undefined && initialCharge !== null && initialCharge !== "") {
        setValue("charge", initialCharge);
      } else {
        reset({ charge: "" });
      }
    }
  }, [openAddModal, initialCharge, setValue, reset]);

  const onSubmit = (data) => {
    setSubmitting(true);
    dispatch(createUpdatePlatformCharges({ ...data, support_category: categoryId }))
      .then((res) => {
        if (res?.payload?.statusCode === 200 || res?.payload?.statusCode === 201) {
          onSuccess?.(categoryId, data.charge);
          setOpenAddModal(false);
        }
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <Modal show={openAddModal} onClose={() => setOpenAddModal(false)} size="lg" dismissible>
      <Modal.Header className="border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3 text-left">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-[#0B8843] border border-emerald-200">
            <Percent size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900 leading-tight">
              {isEdit ? "Update Platform Commission" : "Set Platform Commission"}
            </div>
            {categoryName && (
              <div className="text-xs text-gray-500 font-normal mt-0.5 flex items-center gap-1.5">
                <span>Main Category:</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-[#0B8843] font-semibold border border-emerald-200 text-[11px]">
                  <ShieldCheck size={11} /> {categoryName}
                </span>
              </div>
            )}
          </div>
        </div>
      </Modal.Header>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body className="px-6 py-5">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="charge"
                className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2"
              >
                GoodMood Commission Percentage (%)
              </label>
              <div className="relative">
                <input
                  id="charge"
                  type="number"
                  step="any"
                  min="0"
                  max="100"
                  placeholder="Enter commission percentage (e.g. 20)"
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white text-base font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B8843]/25 focus:border-[#0B8843] transition-all"
                  {...register("charge", {
                    required: "Commission percentage is required",
                    min: { value: 0, message: "Percentage cannot be less than 0%" },
                    max: { value: 100, message: "Percentage cannot exceed 100%" },
                  })}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500 font-extrabold text-sm">
                  %
                </div>
              </div>
              {errors.charge && (
                <p className="mt-1.5 text-xs text-red-600 font-semibold">
                  {errors.charge.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">
                This percentage will automatically apply to all consultations booked under{" "}
                <strong className="text-gray-800">{categoryName || "this category"}</strong> and its subcategories.
              </p>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-t border-gray-100 px-6 py-4 bg-gray-50/60">
          <div className="flex justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setOpenAddModal(false)}
              className="px-5 py-2.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#0B8843] hover:bg-black rounded-xl transition shadow-xs disabled:opacity-60 cursor-pointer"
            >
              <CheckCircle2 size={15} />
              <span>{submitting ? "Saving..." : isEdit ? "Update Commission" : "Save Commission"}</span>
            </button>
          </div>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default AddUpdateCharges;
