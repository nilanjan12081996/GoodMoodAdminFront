import { Button, FileInput, Label, Modal, TextInput } from "flowbite-react"
import { useForm, Controller } from "react-hook-form";
import { useDispatch } from "react-redux";
import { updateAwarenessBlog, getAwarenessBlogs } from "../../Reducer/AwarenessBlogSlice";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { toast } from "react-toastify";
import { useEffect } from "react";

const UpdateAwarenessBlogModal = ({
  openUpdateBlogModal,
  setOpenUpdateBlogModal,
  blogId,
  singleBlog,
  awarenessId,
  subsidebarId
}) => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    reset
  } = useForm();

  useEffect(() => {
    if (singleBlog?.data) {
      setValue("title", singleBlog.data.title);
      setValue("content", singleBlog.data.content);
      setValue("status", singleBlog.data.status);
    }
  }, [singleBlog, setValue]);

  const htmlToPlainText = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const onSubmit = (data) => {
    const payload = {
      id: blogId,
      title: data.title,
      content: data.content,
      awarenessId: awarenessId,
      subsidebarId: subsidebarId,
      summary: htmlToPlainText(data.content).slice(0, 300),
      status: singleBlog?.data?.status // Keep existing status
    };

    dispatch(updateAwarenessBlog(payload)).then((res) => {
      if (res?.payload?.statusCode === 200) {
        toast.success("Blog Updated successfully");
        setOpenUpdateBlogModal(false);
        dispatch(getAwarenessBlogs({ awarenessId, subsidebarId }));
      } else {
        toast.error(res?.payload?.response?.data?.message || "Something went wrong");
      }
    })
  }

  const handleModalClose = () => {
    setOpenUpdateBlogModal(false);
  }

  return (
    <Modal show={openUpdateBlogModal} onClose={handleModalClose} size="2xl">
      <Modal.Header>Update Awareness Blog</Modal.Header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="title" value="Blog Title" />
              </div>
              <TextInput
                id="title"
                type="text"
                placeholder="Enter Title"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>
            
           

            <div>
              <div className="mb-2 block">
                <Label htmlFor="content" value="Content" />
              </div>
              <Controller
                name="content"
                control={control}
                rules={{ required: "Content is required" }}
                render={({ field }) => (
                  <CKEditor
                    editor={ClassicEditor}
                    data={field.value || ''}
                    onChange={(event, editor) => {
                      field.onChange(editor.getData());
                    }}
                  />
                )}
              />
              {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
            </div>

            
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" color="gray" onClick={handleModalClose}>Cancel</Button>
          <Button color="success" type="submit">Update Blog</Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default UpdateAwarenessBlogModal;
