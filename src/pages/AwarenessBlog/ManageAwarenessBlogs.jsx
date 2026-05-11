import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import { Button } from "flowbite-react";
import { ToastContainer, toast } from "react-toastify";
import { 
    getAwarenessBlogs, 
    editAwarenessBlog, 
    toggleAwarenessBlogStatus, 
    uploadAwarenessBlogImage 
} from "../../Reducer/AwarenessBlogSlice";
import AddAwarenessBlogModal from "./AddAwarenessBlogModal";
import UpdateAwarenessBlogModal from "./UpdateAwarenessBlogModal";

const ManageAwarenessBlogs = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { awarenessId, awarenessName, subsidebarId } = location.state || {};

    const { awarenessBlogList, singleAwarenessBlog, loading } = useSelector((state) => state.awarenessBlog);
    
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openUpdateModal, setOpenUpdateModal] = useState(false);
    const [blogId, setBlogId] = useState(null);

    useEffect(() => {
        if (awarenessId) {
            dispatch(getAwarenessBlogs({ awarenessId, subsidebarId }));
        } else {
            navigate("/moodz-matters"); // Redirect if no ID
        }
    }, [awarenessId, subsidebarId, dispatch, navigate]);

    const rowData = useMemo(() => {
        return awarenessBlogList?.data?.map((blog) => ({
            id: blog.id,
            title: blog.title,
            content: blog.content,
            status: blog.status === 1 ? "Published" : "Not Published",
            statusValue: blog.status,
            name: blog.name,
            image: blog.image,
            publishedAt: blog.publishedAt,
        })) || [];
    }, [awarenessBlogList]);

    const columnDefs = useMemo(() => [
        { field: "title", headerName: "Title", flex: 1, sortable: true, filter: true },
        { 
            field: "content", 
            headerName: "Content", 
            flex: 2,
            cellRenderer: (params) => (
                <div 
                    className="truncate max-w-full"
                    dangerouslySetInnerHTML={{ __html: params.value }} 
                />
            )
        },
        { field: "status", headerName: "Status", width: 150 },
        {
            field: "image",
            headerName: "Image",
            width: 120,
            cellRenderer: (params) => {
                const handleFileChange = (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const previewUrl = URL.createObjectURL(file);
                    params.node.setDataValue("image", previewUrl);

                    const formData = new FormData();
                    formData.append("file", file);
                    dispatch(uploadAwarenessBlogImage({
                        id: params.data.id,
                        user_input: formData,
                    })).then((res) => {
                        if (res?.payload?.statusCode === 200) {
                            toast.success("Image updated successfully");
                        }
                    });
                };

                return (
                    <label className="relative w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden hover:border-blue-500 transition">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        {params.value ? (
                            <img
                                src={params.value}
                                alt="blog"
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            <span className="text-[10px] text-gray-400">Upload</span>
                        )}
                    </label>
                );
            }
        },
        {
            headerName: "Actions",
            width: 250,
            cellRenderer: (params) => (
                <div className="flex gap-2">
                    <Button 
                        size="xs" 
                        color="success" 
                        onClick={() => navigate("/awareness-blog-details", { state: { id: params.data.id } })}
                    >
                        View
                    </Button>
                    <Button 
                        size="xs" 
                        color="success" 
                        onClick={() => handleEdit(params.data.id)}
                    >
                        Edit
                    </Button>
                    <Button 
                        size="xs" 
                        color="success" 
                        onClick={() => handleToggleStatus(params.data.id)}
                        disabled={params.data.statusValue === 1}
                    >
                        Publish
                    </Button>
                </div>
            )
        }
    ], []);

    const handleEdit = (id) => {
        setBlogId(id);
        dispatch(editAwarenessBlog({ id }));
        setOpenUpdateModal(true);
    };

    const handleToggleStatus = (id) => {
        dispatch(toggleAwarenessBlogStatus({ id })).then((res) => {
            if (res?.payload?.statusCode === 200) {
                toast.success("Status Toggled!");
                dispatch(getAwarenessBlogs({ awarenessId, subsidebarId }));
            }
        });
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm">
            <ToastContainer />
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Awareness Blogs</h2>
                    <p className="text-sm text-gray-500">Managing blogs for: <span className="font-semibold">{awarenessName}</span></p>
                </div>
                <div className="flex gap-2">
                    <Button color="gray" onClick={() => navigate(-1)}>Back</Button>
                    <Button color="success" onClick={() => setOpenAddModal(true)}>Add New Blog</Button>
                </div>
            </div>

            <div className="ag-theme-alpine w-full" style={{ height: 500 }}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    pagination={true}
                    paginationPageSize={10}
                />
            </div>

            {openAddModal && (
                <AddAwarenessBlogModal
                    openBlogModal={openAddModal}
                    setOpenBlogModal={setOpenAddModal}
                    awarenessId={awarenessId}
                    subsidebarId={subsidebarId}
                />
            )}

            {openUpdateModal && (
                <UpdateAwarenessBlogModal
                    openUpdateBlogModal={openUpdateModal}
                    setOpenUpdateBlogModal={setOpenUpdateModal}
                    blogId={blogId}
                    singleBlog={singleAwarenessBlog}
                    awarenessId={awarenessId}
                    subsidebarId={subsidebarId}
                />
            )}
        </div>
    );
};

export default ManageAwarenessBlogs;
