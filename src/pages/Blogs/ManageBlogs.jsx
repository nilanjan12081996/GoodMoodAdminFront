import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import {
  changeStatus,
  getMoodMaster,
  getMoodMasterSingle,
} from "../../Reducer/MoodMasterSlice";
import { MdDelete } from "react-icons/md";
import { AgGridReact } from "ag-grid-react";
import { ToastContainer } from "react-toastify";
import { Button } from "flowbite-react";
import AddMoodMeterModal from "../MoodMeter/AddMoodMeterModal";
// import AddMoodMasterMdoal from "./AddMoodMasterMdoal";
// import UpdateMoodMasterModal from "./UpdateMoodMasterModal";
import { getBlog, editBlog, publishUnPublished, uploadImage } from "../../Reducer/BlogSlice";
import AddBlogModal from "./AddBlogModal";
import UpdateBlogModal from "./UpdateBlogModal";
import { useNavigate } from "react-router-dom";

const ManageBlogs = () => {
  const { blogList,singleBlog } = useSelector(
    (state) => state?.blog
  );
  const dispatch = useDispatch();
  const navigate=useNavigate()
  const [openBlogModal, setOpenBlogModal] = useState(false);
  const [blogId, setBlogId] = useState();
  const [openUpdateBlogModal, setOpenUpdateBlogModal] =
    useState(false);

  useEffect(() => {
    dispatch(getBlog());
  }, []);
  console.log("blogList", blogList);

  const rowData = useMemo(() => {
    return (
      blogList?.data?.map((tags) => ({
        id: tags?.id,
        title: tags?.title,
        content: tags?.content,
        image_url:tags?.image,
        status:tags?.status===0?"Publish":"Published",
        is_published: tags.is_published,
      })) || []
    );
  }, [blogList?.data]);

  const columnDefs = useMemo(
    () => [
      {
        field: "title",
        headerName: "Blog Title",
        sortable: true,
        filter: true,
      },
     {
  field: "content",
  headerName: "Content",
  sortable: true,
  filter: true,
  cellRenderer: (params) => {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: params.value }}
      />
    );
  },
},

      
   {
              field: "image_url",
              headerName: "Avatar",
              cellRenderer: (params) => {
              const handleFileChange = (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
            
                  // Create preview URL
                  const previewUrl = URL.createObjectURL(file);
            
                  // Update AG Grid cell value
                  params.node.setDataValue("image_url", previewUrl);
                    const formData=new FormData()
                  
                    formData.append("file",file)
                  dispatch(
                uploadImage({
                  id: params.data.id,
                  user_input: formData,
                })
                  )
              
                };
            
                return (
                  <label className="relative w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden hover:border-blue-500 transition">
                    
                    {/* Hidden file input */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
            
                    {/* Show image if exists */}
                    {params.value ? (
                      <img
                        src={params.value}
                        alt="avatar"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">Upload</span>
                    )}
                  </label>
                );
              },
         },
      {
        width: 400,
        headerName: "Actions",
        field: "actions",
        cellRenderer: (params) => {
          return (
            <div className="flex gap-2">
              <button
                onClick={() => handleBlogUpdate(params?.data?.id)}
                className="bg-[#52b69a] hover:bg-black px-4 py-1 text-white text-base font-semibold flex justify-center items-center rounded-md"
              >
                View
              </button>
              <button
                onClick={() => handleEditBlog(params?.data?.id)}
                className="bg-blue-500 hover:bg-black px-4 py-1 text-white text-base font-semibold flex justify-center items-center rounded-md"
              >
                Edit
              </button>
            </div>
          );
        },
      },

      {
        field: "status",
        headerName: "Status",
         sortable: true,
        filter: true,
        
      },
    ],
    []
  );

  const handleBlogUpdate = (id) => {
    navigate("/blog-details",{state:{id:id}})
  };

  const handleEditBlog = (id) => {
    setBlogId(id);
    dispatch(editBlog({ id }));
    setOpenUpdateBlogModal(true);
  };

  return (
    <>
      <>
        <ToastContainer />
        <div className="wrapper_area my-0 mx-auto p-6 rounded-xl bg-white">
          <div className="h-full lg:h-screen">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Blog</h2>
              <Button
                onClick={() => setOpenBlogModal(true)}
                className="bg-[#52b69a] hover:bg-black px-4 py-1 text-white text-base font-semibold flex justify-center items-center rounded-md"
              >
                Add Blog
              </Button>
            </div>
            <div
              className="ag-theme-alpine"
              style={{ height: 600, width: "100%" }}
            >
              <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                pagination={true}
                paginationPageSize={10}
                domLayout="autoHeight"
                getRowHeight={() => 50}
              />
            </div>
          </div>
          {openBlogModal && (
            <AddBlogModal
              openBlogModal={openBlogModal}
              setOpenBlogModal={setOpenBlogModal}
            />
          )}
          {singleBlog && openUpdateBlogModal && (
            <UpdateBlogModal
              openUpdateBlogModal={openUpdateBlogModal}
              setOpenUpdateBlogModal={setOpenUpdateBlogModal}
              blogId={blogId}
              singleBlog={singleBlog}
            />
          )}
        </div>
      </>
    </>
  );
};
export default ManageBlogs;
