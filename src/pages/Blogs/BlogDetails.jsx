import { Clock, Tag, ChevronRight, Info } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getBlogDetails, publishUnPublished } from '../../Reducer/BlogSlice';
import { useSelector } from 'react-redux';
const BlogDetails=()=>{
    const{singleBlog}=useSelector((state)=>state?.blog)
    const location=useLocation()
    console.log("location",location);
    const id=location?.state?.id
    const dispatch=useDispatch()
    useEffect(()=>{
        dispatch(getBlogDetails({id:id}))
    },[id])

    console.log("singleBlog",singleBlog);
    
    const handlePublish=()=>{
        dispatch(publishUnPublished({id:id})).then((res)=>{
            console.log("res",res);
            if(res?.payload?.statusCode===200){
                  dispatch(getBlogDetails({id:id}))
            }
            
        })
    }
    return(
        <>
        <div className="min-h-screen bg-gray-50 font-sans text-slate-900 flex justify-center gap-3">
      {/* Main Container */}
      <div>

   
      <article>
        
        {/* Hero Image Section */}
        <div className="relative w-full h-[400px] overflow-hidden">
          <img 
            src={singleBlog?.data?.[0]?.image} 
            alt="Physiotherapy session" 
            className="object-cover justify-center content-center w-full"
          />
        </div>

        {/* Content Section */}
        <div className="px-8 py-12 md:px-16">
          
          {/* Headline */}
          <h1 className="text-3xl md:text-4xl font-bold text-center text-sky-900 leading-tight mb-6">
       {singleBlog?.data?.[0]?.title}
          </h1>

          {/* Article Body */}
          <div className="space-y-6 text-lg leading-relaxed text-gray-700">
            <p>
            <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                    __html: singleBlog?.data?.[0]?.content || "",
                }}
                />
            </p>

           
          
          </div>

        </div>
      </article>
         </div>
         <div>
            {
                singleBlog?.data?.[0]?.status===0?(
                    <button onClick={handlePublish} className='bg-green-500 p-2 rounded-md mt-2 text-white text-lg'>Publish</button>
                ):(
                    <button  className='bg-green-500 p-2 rounded-md mt-2 text-white text-lg'>Published</button>
                )
            }
            
         </div>
      
      
      {/* Footer Spacer */}
      <div className="h-20"></div>
    </div>
        </>
    )
}
export default BlogDetails