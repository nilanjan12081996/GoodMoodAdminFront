import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { fetchBanners, addBanner, clearBannerState } from '../../Reducer/BannerSlice';

export default function BannerManager() {
  const dispatch = useDispatch();
  const { bannerList, loading, error, message } = useSelector((state) => state.banner);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      image: null,
    },
  });

  useEffect(() => {
    dispatch(fetchBanners());
    return () => dispatch(clearBannerState());
  }, [dispatch]);

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);

    // Appending binary file under 'file' key to match backend @RequestParam("file")
    if (data.image && data.image[0]) {
      formData.append('file', data.image[0]);
    }

    dispatch(addBanner(formData))
      .unwrap()
      .then(() => {
        reset();
        dispatch(fetchBanners());
      })
      .catch((err) => {
        console.error('Submit error:', err);
      });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8085${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased py-10 px-4 md:px-8">
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Form Section */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
              <h1 className="text-xl font-bold text-slate-900">Add New Banner</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Banner Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Full Body Health Checkup - 20% Off"
                  {...register('title', { required: 'Banner title is required' })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                />
                {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="4"
                  placeholder="e.g. Book your comprehensive wellness package today..."
                  {...register('description', { required: 'Description is required' })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none outline-none"
                />
                {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Banner Image <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  {...register('image', { required: 'Please select an image file' })}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
                {errors.image && <p className="text-xs text-rose-500 mt-1">{errors.image.message}</p>}
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600">
                  {message}
                </div>
              )}
              {!error && message && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-600">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:bg-indigo-400 transition-all shadow-sm"
              >
                {loading ? 'Uploading...' : 'Save Banner'}
              </button>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="flex flex-col space-y-4">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Active Banners</h2>
          {loading && bannerList?.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">Loading banners...</div>
          ) : bannerList?.length > 0 ? (
            bannerList.map((banner) => (
              <div key={banner.id || banner._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col sm:flex-row">
                <div className="sm:w-1/3 bg-slate-100 flex-shrink-0">
                  {banner.image ? (
                    <img src={getImageUrl(banner.image)} alt={banner.title} className="w-full h-36 object-cover" />
                  ) : (
                    <div className="w-full h-36 flex items-center justify-center text-slate-400 text-xs">No Image Available</div>
                  )}
                </div>
                <div className="p-5 sm:w-2/3 flex flex-col justify-center">
                  <h3 className="text-base font-bold text-slate-800 mb-1">{banner.title}</h3>
                  <p className="text-slate-600 text-sm line-clamp-3">{banner.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center bg-white border border-slate-200 rounded-2xl border-dashed text-slate-500">
              No banners added yet.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}