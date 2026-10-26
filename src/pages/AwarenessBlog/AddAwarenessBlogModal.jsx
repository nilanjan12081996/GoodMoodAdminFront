import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch } from "react-redux";
import { addAwarenessBlog, getAwarenessBlogs } from "../../Reducer/AwarenessBlogSlice";
import TiptapEditor from "../../components/TiptapEditor";
import TitleEditor from "../../components/TitleEditor";
import { toast } from "react-toastify";
import { X, PlusCircle, Check, Loader2 } from "lucide-react";

const AddAwarenessBlogModal = ({
  openBlogModal,
  setOpenBlogModal,
  awarenessId,
  subsidebarId
}) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm();

  if (!openBlogModal) return null;

  const htmlToPlainText = (html) => {
    if (!html) return "";
    let cleaned = html.replace(/<table[\s\S]*?<\/table>/gi, " ");
    const div = document.createElement("div");
    div.innerHTML = cleaned;
    let text = (div.textContent || div.innerText || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) {
      div.innerHTML = html;
      text = (div.textContent || div.innerText || "")
        .replace(/\u00a0/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }
    return text;
  };

  const onSubmit = (data) => {
    setIsSubmitting(true);
    const payload = {
      title: data.title,
      content: data.content,
      awarenessId: awarenessId,
      subsidebarId: subsidebarId,
      summary: htmlToPlainText(data.content).slice(0, 300),
    };

    dispatch(addAwarenessBlog(payload))
      .then((res) => {
        setIsSubmitting(false);
        if (res?.payload?.statusCode === 201) {
          toast.success("Content Added successfully");
          setOpenBlogModal(false);
          dispatch(getAwarenessBlogs({ awarenessId, subsidebarId }));
          reset();
        } else {
          toast.error(res?.payload?.response?.data?.message || "Something went wrong");
        }
      })
      .catch(() => {
        setIsSubmitting(false);
      });
  };

  const handleModalClose = () => {
    if (!isSubmitting) {
      setOpenBlogModal(false);
      reset();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={handleModalClose}
    >
      <div
        className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div className="shrink-0 px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/80 flex items-center justify-center text-[#0B8843] shrink-0 shadow-xs">
              <PlusCircle size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Add New Content
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Create a new awareness article with rich formatting and resource details
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleModalClose}
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer disabled:opacity-50"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Form Body (Scrollable) ── */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
            {/* Title Field */}
            <div>
              <label htmlFor="add-title" className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                Content Title <span className="text-red-500">*</span>
              </label>
              <Controller
                name="title"
                control={control}
                rules={{ required: "Title is required" }}
                render={({ field }) => (
                  <TitleEditor
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="e.g. Coping with Anxiety & Work Stress"
                  />
                )}
              />
              {errors.title && (
                <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1">
                  <span>{errors.title.message}</span>
                </p>
              )}
            </div>

            {/* Rich Content Editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="add-content" className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                  Article Content <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-400 font-medium">
                  Supports headings, bold, lists & links
                </span>
              </div>

              <div className="tiptap-editor-custom">
                <Controller
                  name="content"
                  control={control}
                  rules={{ required: "Content is required" }}
                  render={({ field }) => (
                    <TiptapEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              {errors.content && (
                <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1">
                  <span>{errors.content.message}</span>
                </p>
              )}
            </div>
          </div>

          {/* ── Modal Footer ── */}
          <div className="shrink-0 px-6 sm:px-8 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end bg-slate-50/70 dark:bg-slate-900/60">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleModalClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#0B8843] hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} className="stroke-[2.5]" />
                    <span>Add Content</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAwarenessBlogModal;
