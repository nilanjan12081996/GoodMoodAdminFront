import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { editAwarenessBlog, toggleAwarenessBlogStatus } from '../../Reducer/AwarenessBlogSlice';
import { Button } from 'flowbite-react';
import { ToastContainer, toast } from 'react-toastify';

const AwarenessBlogDetails = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const id = location?.state?.id;
    const { singleAwarenessBlog } = useSelector((state) => state.awarenessBlog);

    useEffect(() => {
        if (id) {
            dispatch(editAwarenessBlog({ id }));
        }
    }, [id, dispatch]);

    const handleToggleStatus = () => {
        dispatch(toggleAwarenessBlogStatus({ id })).then((res) => {
            if (res?.payload?.statusCode === 200) {
                toast.success("Status Toggled!");
                dispatch(editAwarenessBlog({ id }));
            }
        });
    };

    const blog = singleAwarenessBlog?.data;
    const rootBaseUrl = import.meta.env.VITE_API_BASE_URL.replace("/api/", "").replace(/\/$/, "");

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <ToastContainer />
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <Button color="gray" onClick={() => navigate(-1)}>Back</Button>
                    <div className="flex gap-2">
                        {blog?.status === 1 ? (
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">Published</span>
                        ) : (
                            <Button color="success" size="xs" onClick={handleToggleStatus}>Publish</Button>
                        )}
                    </div>
                </div>

                {blog?.image && (
                    <div className="w-full h-96 overflow-hidden">
                        <img 
                            src={`${rootBaseUrl}${blog.image}`} 
                            alt={blog.title} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className="p-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{blog?.title}</h1>
                    <div className="flex items-center text-gray-500 text-sm mb-6">
                        <span>By {blog?.name}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(blog?.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div 
                        className="prose max-w-none text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: blog?.content || "" }}
                    />
                </div>
            </div>
        </div>
    );
};

export default AwarenessBlogDetails;
