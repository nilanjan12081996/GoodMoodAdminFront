import React from 'react';
import { X, Mail, Phone, Calendar, Award, BookOpen, Clock, User } from 'lucide-react';

const DoctorDetailModal = ({ isOpen, onClose, data, loading }) => {
  if (!isOpen) return null;

  const doctor = data?.doctor || {};
  const about = data?.about || {};
  const specializations = data?.specializations || [];
  const educations = data?.educations || [];
  const appointments = data?.appointments || [];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-r from-teal-500 to-blue-600 shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 transition-colors rounded-full text-white z-10"
          >
            <X size={20} />
          </button>
          <div className="absolute -bottom-12 left-8 flex items-end gap-6">
            <div className="w-24 h-24 rounded-2xl border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden shadow-lg">
              {doctor.avatar ? (
                <img src={doctor.avatar} alt="Expert" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-slate-400" />
              )}
            </div>
            <div className="mb-2">
              <h2 className="text-2xl font-bold text-black drop-shadow-md mt-2">
                Dr. {doctor.firstName} {doctor.lastName}
              </h2>
              <p className="text-teal-500 text-sm font-medium"># Status: {doctor.adminStatus === 1 ? 'Approved' : 'Pending'}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-14 flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 font-medium">Fetching expert details...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column - Contact & Basic info */}
              <div className="space-y-6">
                <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600">
                        <Mail size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Email Address</p>
                        <p className="font-semibold text-sm truncate">{doctor.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                      <div className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-lg text-teal-600">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Mobile Number</p>
                        <p className="font-semibold text-sm">{doctor.mobile}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600">
                        <Clock size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Experience</p>
                        <p className="font-semibold text-sm">{about.exp} Years</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {about.language?.split(',').map((lang, index) => (
                      <span key={index} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-full border border-slate-200 dark:border-slate-700">
                        {lang.trim()}
                      </span>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column - Details */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* About Section */}
                <section className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white mb-3">
                    <User size={20} className="text-teal-600" /> Professional Bio
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic">
                    "{about.about}"
                  </p>
                </section>

                {/* Specializations */}
                <section>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white mb-4">
                    <Award size={20} className="text-amber-500" /> Specializations
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {specializations.map((spec, index) => (
                      <div key={index} className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 text-sm font-bold rounded-xl border border-amber-100 dark:border-amber-900/50 shadow-sm">
                        {spec}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Education */}
                <section>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white mb-4">
                    <BookOpen size={20} className="text-indigo-500" /> Education & Certifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {educations.map((edu) => (
                      <div key={edu.id} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase mb-1">{edu.degree}</p>
                        <h4 className="font-bold text-slate-800 dark:text-white mb-1 line-clamp-1">{edu.course}</h4>
                        <p className="text-slate-500 text-xs line-clamp-1">{edu.institute}</p>
                        {edu.doc && (
                          <a href="#" className="mt-3 inline-block text-xs text-indigo-500 hover:underline font-semibold">View Certificate</a>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Appointments */}
                <section>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white mb-4">
                    <Calendar size={20} className="text-red-500" /> Recent Appointments
                  </h3>
                  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase text-xs font-bold">
                        <tr>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Time Slot</th>
                          <th className="px-4 py-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {appointments.length > 0 ? appointments.slice(0, 5).map((app) => (
                          <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{app.date}</td>
                            <td className="px-4 py-3 text-slate-500">{app.timeSlot}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                app.isComplete ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {app.isComplete ? 'Completed' : 'Upcoming'}
                              </span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="3" className="px-4 py-8 text-center text-slate-400 italic">No appointments found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 p-6 border-t dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors"
          >
            Close
          </button>
          {/* <button
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-500/20 active:scale-95"
          >
            Download Profile
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailModal;
