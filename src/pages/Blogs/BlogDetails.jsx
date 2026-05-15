import { Clock, Tag, ChevronRight, Info } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getBlogDetails, publishUnPublished } from '../../Reducer/BlogSlice';
import { useSelector } from 'react-redux';
import { Button } from 'flowbite-react';

const BlogDetails=()=>{
    const{singleBlog}=useSelector((state)=>state?.blog)
    const location=useLocation()
    const id=location?.state?.id
    const dispatch=useDispatch()
    const navigate = useNavigate();

    useEffect(()=>{
        dispatch(getBlogDetails({id:id}))
    },[id])

    const handlePublish=()=>{
        dispatch(publishUnPublished({id:id})).then((res)=>{
            if(res?.payload?.statusCode===200){
                  dispatch(getBlogDetails({id:id}))
            }
        })
    }

    return(
        <>
        <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
              <Button color="gray" onClick={() => navigate(-1)}>Back</Button>
              {
                  singleBlog?.data?.[0]?.status===0?(
                      <button onClick={handlePublish} className='bg-green-500 px-4 py-2 rounded-md text-white font-medium hover:bg-green-600 transition-colors'>Publish</button>
                  ):(
                      <span className='bg-green-100 text-green-800 px-4 py-2 rounded-md font-medium'>Published</span>
                  )
              }
            </div>

            <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Hero Image Section */}
              <div className="relative w-full h-[400px] overflow-hidden">
                <img 
                  src={singleBlog?.data?.[0]?.image} 
                  alt={singleBlog?.data?.[0]?.title} 
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Content Section */}
              <div className="px-8 py-12 md:px-16">
                {/* Headline */}
                <h1 className="text-3xl md:text-4xl font-bold text-center text-sky-900 leading-tight mb-8">
                  {singleBlog?.data?.[0]?.title}
                </h1>

                {/* Article Body */}
                <div className="prose max-w-none text-lg leading-relaxed text-gray-700"
                     dangerouslySetInnerHTML={{
                       __html: singleBlog?.data?.[0]?.content || "",
                     }}
                />
              </div>
            </article>
          </div>
          {/* Footer Spacer */}
          <div className="h-20"></div>
        </div>
        </>
    )
}
export default BlogDetails