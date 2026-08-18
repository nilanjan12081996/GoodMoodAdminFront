import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { fetchMasterSidebars, createSubSidebar } from '../../Reducer/AddSidebarSlice';

export default function AddSidebarForm() {
  const dispatch = useDispatch();
  
  // Extract state from the sidebar slice
  const { masterSidebars, loading, error, message } = useSelector((state) => state.sidebar);

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      masterSidebarId: '',
      masterSidebarName: '',
      subSidebarName: '',
      subSidebarShortName: '',
      status: 'active',
    },
  });

  // Fetch list on mount
  useEffect(() => {
    dispatch(fetchMasterSidebars());
  }, [dispatch]);

  // Sync ID when Name is selected
  const handleMasterNameChange = (e) => {
    const value = e.target.value;
    const selectedItem = masterSidebars?.find((item) => {
      const itemName = item.masterSidebarName || item.name || item.master_sidebar_name || item.title || item.sidebarName || '';
      return itemName === value;
    });

    const foundId = selectedItem 
      ? (selectedItem.id || selectedItem.masterSidebarId || selectedItem.master_sidebar_id || selectedItem._id || '') 
      : '';

    setValue('masterSidebarId', String(foundId), { shouldValidate: true });
  };

  const onSubmit = (data) => {
    // Dispatch the thunk with the form data payload
    dispatch(createSubSidebar(data))
      .unwrap()
      .then((response) => {
        // Success handling
        console.log('Sub-sidebar created successfully:', response);
        reset(); // Clear form fields after successful creation
      })
      .catch((err) => {
        // Error handling
        console.error('Failed to create sub-sidebar:', err);
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans text-slate-900 antialiased">
      
      {/* Main Content Area */}
      <main className="max-w-3xl w-full mx-auto px-4 py-10 flex-1">
        
        {/* Breadcrumbs */}
        <nav className="flex text-sm text-slate-500 mb-6 space-x-2">
          <span className="hover:text-indigo-600 cursor-pointer">Projects</span>
          <span>/</span>
          <span className="hover:text-indigo-600 cursor-pointer">Sidebar Management</span>
          <span>/</span>
          <span className="text-slate-800 font-medium">Add New Sidebar</span>
        </nav>

        {/* Form Card Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
            <h1 className="text-xl font-bold text-slate-900">Add Sidebar Item</h1>
            <p className="text-sm text-slate-500 mt-1">Configure master and sub-sidebar navigation elements for your project layout.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* 1. MASTER SIDEBAR NAME DROPDOWN */}
              <div>
                <label htmlFor="masterSidebarName" className="block text-sm font-semibold text-slate-700 mb-2">
                  Master Sidebar Name <span className="text-rose-500">*</span>
                </label>
                <select
                  id="masterSidebarName"
                  disabled={loading && !masterSidebars?.length}
                  {...register('masterSidebarName', {
                    required: 'Master Sidebar Name is required',
                    onChange: handleMasterNameChange,
                  })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:bg-slate-100"
                >
                  <option value="" disabled>
                    {loading && !masterSidebars?.length ? 'Loading Names...' : 'Select Master Sidebar Name'}
                  </option>
                  
                  {masterSidebars?.map((item, index) => {
                    const idValue = item.id || item.masterSidebarId || item.master_sidebar_id || item._id || index;
                    const nameValue = item.masterSidebarName || item.name || item.master_sidebar_name || item.title || item.sidebarName || 'Unnamed Menu';
                    return (
                      <option key={idValue} value={nameValue}>
                        {nameValue}
                      </option>
                    );
                  })}
                </select>
                {errors.masterSidebarName && (
                  <p className="text-xs text-rose-500 mt-1">{errors.masterSidebarName.message}</p>
                )}
                <p className="text-xs text-slate-400 mt-1.5">Displays Names only.</p>
              </div>

            </div>

            {/* Sub-sidebar Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Subsidebar Name */}
              <div>
                <label htmlFor="subSidebarName" className="block text-sm font-semibold text-slate-700 mb-2">
                  Subsidebar Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="subSidebarName"
                  placeholder="e.g. Active Users"
                  {...register('subSidebarName', {
                    required: 'Subsidebar Name is required',
                  })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                {errors.subSidebarName && (
                  <p className="text-xs text-rose-500 mt-1">{errors.subSidebarName.message}</p>
                )}
                <p className="text-xs text-slate-400 mt-1.5">Display title shown in menu.</p>
              </div>

              {/* Subsidebar Short Name */}
              <div>
                <label htmlFor="subSidebarShortName" className="block text-sm font-semibold text-slate-700 mb-2">
                  Subsidebar Short Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="subSidebarShortName"
                  placeholder="e.g. active-users"
                  {...register('subSidebarShortName', {
                    required: 'Subsidebar Short Name is required',
                  })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                {errors.subSidebarShortName && (
                  <p className="text-xs text-rose-500 mt-1">{errors.subSidebarShortName.message}</p>
                )}
                <p className="text-xs text-slate-400 mt-1.5">System key or route slug.</p>
              </div>

            </div>
            
            {/* Display Error Message (if any API failure occurs) */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600">
                {message || 'An error occurred while creating the sidebar.'}
              </div>
            )}

            {/* Submit Action */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => reset()}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all flex items-center justify-center disabled:bg-indigo-400"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Sidebar'
                )}
              </button>
            </div>

          </form>

        </div>

      </main>

    </div>
  );
}