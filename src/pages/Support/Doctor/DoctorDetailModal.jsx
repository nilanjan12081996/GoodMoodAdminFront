import React, { useState, useEffect, useMemo } from 'react';
import { X, Mail, Phone, Calendar, Award, BookOpen, Clock, User, Landmark, CreditCard } from 'lucide-react';

const DoctorDetailModal = ({ isOpen, onClose, data, loading }) => {
  if (!isOpen) return null;

  const doctor = data?.doctor || {};
  const about = data?.about || {};
  const rawSpecializations = data?.specializations || [];
  const educations = data?.educations || [];
  const appointments = data?.appointments || [];

  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [data, isOpen]);

  // Resolve avatar URL with base URL fallback
  const rawImage = doctor?.avatar || data?.avatar || doctor?.image || data?.image || doctor?.profileImage;
  const avatarSrc = useMemo(() => {
    if (!rawImage || typeof rawImage !== 'string' || rawImage === 'null' || rawImage === 'undefined' || !rawImage.trim()) {
      return null;
    }
    const cleanImg = rawImage.trim();
    if (cleanImg.startsWith('http://') || cleanImg.startsWith('https://') || cleanImg.startsWith('data:')) {
      return cleanImg;
    }
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/';
    const root = apiBase.replace(/\/api\/?$/, '');
    const cleanPath = cleanImg.startsWith('/') ? cleanImg : `/${cleanImg}`;
    return `${root}${cleanPath}`;
  }, [rawImage]);

  // Doctor initials for fallback
  const initials = useMemo(() => {
    const f = doctor.firstName ? doctor.firstName.trim()[0] : '';
    const l = doctor.lastName ? doctor.lastName.trim()[0] : '';
    return (f + l).toUpperCase() || 'DR';
  }, [doctor.firstName, doctor.lastName]);

  // Clean & deduplicate specializations (removes duplicate items and 'unknown')
  const specializations = useMemo(() => {
    if (!Array.isArray(rawSpecializations)) return [];
    const seen = new Set();
    return rawSpecializations
      .map((spec) => (typeof spec === 'string' ? spec.trim() : spec?.name || spec?.title || ''))
      .filter((spec) => {
        if (!spec) return false;
        const lower = spec.toLowerCase();
        if (lower === 'unknown' || seen.has(lower)) return false;
        seen.add(lower);
        return true;
      });
  }, [rawSpecializations]);

  // Bank details from API response (displaying dynamic/encrypted values as returned)
  const bankDetailsList = useMemo(() => {
    const raw =
      data?.bankDetails ??
      data?.bankDetail ??
      data?.doctor?.bankDetails ??
      data?.doctor?.bankDetail ??
      data?.bank;

    if (!raw) return [];

    if (Array.isArray(raw)) {
      return raw.filter((item) => item && typeof item === 'object');
    }

    if (typeof raw === 'object' && Object.keys(raw).length > 0) {
      return [raw];
    }

    return [];
  }, [data]);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">

        {/* Header matching GoodMood brand theme */}
        <div className="relative h-28 bg-gradient-to-r from-[#409e83] to-[#52b69a] shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 transition-colors rounded-full text-white z-10"
          >
            <X size={20} />
          </button>
          {/* Avatar overlapping banner */}
          <div className="absolute -bottom-10 left-8 w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden shadow-lg z-10 shrink-0">
            {avatarSrc && !imageError ? (
              <img
                src={avatarSrc}
                alt={`Dr. ${doctor.firstName || 'Expert'}`}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-[#52b69a]/15 text-[#52b69a] flex flex-col items-center justify-center select-none font-bold text-2xl">
                {initials}
              </div>
            )}
          </div>
        </div>

        {/* Doctor Identity Header (brought down cleanly into white area) */}
        <div className="pt-3 pb-4 px-8 pl-36 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white capitalize leading-tight">
              Dr. {doctor.firstName} {doctor.lastName}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              {doctor.adminStatus === 1 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Approved
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Pending
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto p-8 pt-6"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-[#52b69a] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 font-medium">Fetching expert details...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left Column - Contact & Basic info */}
              <div className="space-y-6">
                <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                      <div className="p-2 bg-[#52b69a]/10 rounded-lg text-[#52b69a]">
                        <Mail size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Email Address</p>
                        <p className="font-semibold text-sm truncate">{doctor.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                      <div className="p-2 bg-[#52b69a]/10 rounded-lg text-[#52b69a]">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Mobile Number</p>
                        <p className="font-semibold text-sm">{doctor.mobile || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                      <div className="p-2 bg-[#52b69a]/10 rounded-lg text-[#52b69a]">
                        <Clock size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Experience</p>
                        <p className="font-semibold text-sm">{about.exp ? `${about.exp} Years` : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">
                    Languages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {about.language ? (
                      about.language.split(',').map((lang, index) => (
                        <span key={index} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-full border border-slate-200 dark:border-slate-700">
                          {lang.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Not specified</span>
                    )}
                  </div>
                </section>
              </div>

              {/* Right Column - Details */}
              <div className="lg:col-span-2 space-y-8">

                {/* About Section */}
                <section className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white mb-3">
                    <User size={20} className="text-[#52b69a]" /> Professional Bio
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic">
                    "{about.about || 'No biography provided'}"
                  </p>
                </section>

                {/* Specializations */}
                <section>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white mb-4">
                    <Award size={20} className="text-[#52b69a]" /> Specializations
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {specializations.length > 0 ? (
                      specializations.map((spec, index) => (
                        <div
                          key={index}
                          className="px-3.5 py-1.5 bg-[#52b69a]/10 text-[#216754] dark:text-[#52b69a] text-xs font-semibold rounded-xl border border-[#52b69a]/25 shadow-2xs"
                        >
                          {spec}
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No specializations specified</span>
                    )}
                  </div>
                </section>

                {/* Education */}
                <section>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white mb-4">
                    <BookOpen size={20} className="text-[#52b69a]" /> Education & Certifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {educations.length > 0 ? (
                      educations.map((edu) => (
                        <div key={edu.id} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                          <p className="text-[#52b69a] text-xs font-bold uppercase mb-1">{edu.degree}</p>
                          <h4 className="font-bold text-slate-800 dark:text-white mb-1 line-clamp-1">{edu.course}</h4>
                          <p className="text-slate-500 text-xs line-clamp-1">{edu.institute}</p>
                          {edu.doc && (
                            <a
                              href={edu.doc}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 inline-block text-xs text-[#52b69a] hover:underline font-semibold"
                            >
                              View Certificate
                            </a>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-6 text-slate-400 text-xs italic bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        No education records found
                      </div>
                    )}
                  </div>
                </section>

                {/* Bank Details */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                      <Landmark size={20} className="text-[#52b69a]" /> Bank Details
                    </h3>
                    {bankDetailsList.length > 0 && (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified Payout Account
                      </span>
                    )}
                  </div>

                  {bankDetailsList.length > 0 ? (
                    <div className="space-y-4">
                      {bankDetailsList.map((bank, index) => {
                        const isPrimary = bank.isMain === 1 || bank.isMain === true || bank.isMain === '1';
                        const isActive = bank.status === 1 || bank.status === '1' || bank.status === true || bank.status === 'ACTIVE' || bank.status === 'active';
                        const accountHolder = bank.accountHolderName || bank.holderName || bank.name || '—';
                        const accountNumber = bank.accountOn || bank.accountNo || bank.accountNumber || bank.accNo || '—';
                        const ifsc = bank.ifscCode || bank.ifsc || '—';
                        const upiId = bank.upi || bank.upiId || bank.vpa || '—';
                        const bankTitle = bank.bankName || bank.bank || 'Bank Account';

                        return (
                          <div
                            key={bank.id || index}
                            className="p-5 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/80 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-xs hover:border-[#52b69a]/40 transition-all"
                          >
                            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3 mb-3.5 gap-2">
                              <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-[#52b69a]/10 text-[#52b69a] rounded-xl shrink-0">
                                  <CreditCard size={18} />
                                </div>
                                <div>
                                  <p className="text-[11px] font-bold text-[#52b69a] uppercase tracking-wider">
                                    {isPrimary ? 'Primary Payout Account' : 'Secondary Bank Account'}
                                  </p>
                                  <h4 className="font-bold text-slate-800 dark:text-white text-base break-words">
                                    {bankTitle}
                                  </h4>
                                </div>
                              </div>
                              {bank.status !== undefined && (
                                <span
                                  className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full shrink-0 border ${
                                    isActive
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}
                                >
                                  {isActive ? 'Active' : 'Inactive'}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Account Holder</p>
                                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 text-sm break-all">
                                  {accountHolder}
                                </p>
                              </div>

                              <div>
                                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Account Number</p>
                                <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5 text-sm tracking-wider break-all select-all">
                                  {accountNumber}
                                </p>
                              </div>

                              <div>
                                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">IFSC Code</p>
                                <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5 text-sm uppercase break-all">
                                  {ifsc}
                                </p>
                              </div>

                              <div>
                                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">UPI ID / VPA</p>
                                <p className="font-semibold text-[#52b69a] mt-0.5 text-sm break-all select-all" title={upiId}>
                                  {upiId}
                                </p>
                              </div>

                              {bank.branch && (
                                <div className="col-span-full pt-1">
                                  <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Branch</p>
                                  <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 text-sm break-words">
                                    {bank.branch}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                      <Landmark className="mx-auto text-slate-400 mb-2" size={32} />
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No bank details provided</p>
                      <p className="text-xs text-slate-400 mt-0.5">This expert has not submitted payout bank account details yet.</p>
                    </div>
                  )}
                </section>

                {/* Appointments */}
                <section>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white mb-4">
                    <Calendar size={20} className="text-[#52b69a]" /> Recent Appointments
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
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${app.isComplete
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-[#52b69a]/15 text-[#216754] border border-[#52b69a]/30'
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
        <div className="shrink-0 p-5 border-t dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#52b69a] hover:bg-black text-white font-semibold rounded-xl transition-all shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailModal;