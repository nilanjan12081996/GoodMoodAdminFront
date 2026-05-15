import { Button, FileInput, Label, Modal, TextInput } from "flowbite-react"
import { useForm, Controller } from "react-hook-form";
import { useDispatch } from "react-redux";
import { addAwarenessBlog, getAwarenessBlogs } from "../../Reducer/AwarenessBlogSlice";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { toast } from "react-toastify";

const AddAwarenessBlogModal = ({
  openBlogModal,
  setOpenBlogModal,
  awarenessId,
  subsidebarId
}) => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm();

  const htmlToPlainText = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const onSubmit = (data) => {
    const payload = {
      title: data.title,
      content: data.content,
      awarenessId: awarenessId,
      subsidebarId: subsidebarId,
      summary: htmlToPlainText(data.content).slice(0, 300),
      
    };

    dispatch(addAwarenessBlog(payload)).then((res) => {
      if (res?.payload?.statusCode === 201) {
        toast.success("Content Added successfully");
        setOpenBlogModal(false);
        dispatch(getAwarenessBlogs({ awarenessId, subsidebarId }));
        reset();
      } else {
        toast.error(res?.payload?.response?.data?.message || "Something went wrong");
      }
    })
  }

  const handleModalClose = () => {
    setOpenBlogModal(false);
    reset();
  }

  return (
    <Modal show={openBlogModal} onClose={handleModalClose} size="2xl">
      <Modal.Header>Add New Content</Modal.Header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="title" value="Content Title" />
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
          <Button color="success" type="submit">Add Content</Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default AddAwarenessBlogModal;
