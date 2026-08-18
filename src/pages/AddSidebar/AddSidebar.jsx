import React, { useState } from 'react';

export default function AddSidebarForm() {
  const [formData, setFormData] = useState({
    masterSidebarName: '',
    subSidebarName: '',
    subSidebarShortName: '',
    status: 'active',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Sidebar Data Submitted:', formData);
    alert('Sidebar item saved successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans text-slate-900 antialiased">
      
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">P</div>
          <span className="text-xl font-semibold tracking-tight">ProjectHub</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-600">Admin Workspace</span>
          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-medium text-slate-700 text-sm">JD</div>
        </div>
      </header>

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
          
          {/* Card Header */}
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
            <h1 className="text-xl font-bold text-slate-900">Add Sidebar Item</h1>
            <p className="text-sm text-slate-500 mt-1">Configure master and sub-sidebar navigation elements for your project layout.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {/* 1. Master Sidebar Name */}
            <div>
              <label htmlFor="masterSidebarName" className="block text-sm font-semibold text-slate-700 mb-2">
                Master Sidebar Name <span className="text-rose-500">*</span>
              </label>
              <select
                id="masterSidebarName"
                name="masterSidebarName"
                value={formData.masterSidebarName}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              >
                <option value="" disabled>Select Master Sidebar Category</option>
                <option value="Dashboard & Overview">Dashboard & Overview</option>
                <option value="User Management">User Management</option>
                <option value="Settings & Configuration">Settings & Configuration</option>
                <option value="Reports & Analytics">Reports & Analytics</option>
              </select>
              <p className="text-xs text-slate-400 mt-1.5">Group this sub-sidebar under an existing master section.</p>
            </div>

            {/* Grid Layout for Sub-sidebar Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 2. Subsidebar Name */}
              <div>
                <label htmlFor="subSidebarName" className="block text-sm font-semibold text-slate-700 mb-2">
                  Subsidebar Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="subSidebarName"
                  name="subSidebarName"
                  value={formData.subSidebarName}
                  onChange={handleChange}
                  placeholder="e.g. Active Users"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <p className="text-xs text-slate-400 mt-1.5">The display title shown in the menu.</p>
              </div>

              {/* 3. Subsidebar Short Name */}
              <div>
                <label htmlFor="subSidebarShortName" className="block text-sm font-semibold text-slate-700 mb-2">
                  Subsidebar Short Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="subSidebarShortName"
                  name="subSidebarShortName"
                  value={formData.subSidebarShortName}
                  onChange={handleChange}
                  placeholder="e.g. active-users"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <p className="text-xs text-slate-400 mt-1.5">Used for routing and system keys (slug format).</p>
              </div>

            </div>

            {/* 4. Status */}
            <div className="pt-2">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Status</label>
              <div className="flex items-center space-x-6">
                
                <label className="relative flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={formData.status === 'active'}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className="h-5 w-5 rounded-full border border-slate-300 bg-white peer-checked:border-indigo-600 peer-checked:bg-indigo-600 flex items-center justify-center transition-all">
                    <div className="h-2 w-2 rounded-full bg-white scale-0 peer-checked:scale-100 transition-transform"></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-slate-700">Active</span>
                </label>
                
                <label className="relative flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={formData.status === 'inactive'}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className="h-5 w-5 rounded-full border border-slate-300 bg-white peer-checked:border-indigo-600 peer-checked:bg-indigo-600 flex items-center justify-center transition-all">
                    <div className="h-2 w-2 rounded-full bg-white scale-0 peer-checked:scale-100 transition-transform"></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-slate-700">Inactive</span>
                </label>

              </div>
              <p className="text-xs text-slate-400 mt-2">Inactive sidebars will be hidden from the standard project layout.</p>
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-100">
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              >
                Save Sidebar
              </button>
            </div>

          </form>

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        &copy; 2026 ProjectHub Workspace. All rights reserved.
      </footer>

    </div>
  );
}