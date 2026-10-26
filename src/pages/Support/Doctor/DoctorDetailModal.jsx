import { useState, useEffect, useMemo } from 'react';
import {
  X,
  Eye,
  Mail,
  Phone,
  Calendar,
  Award,
  BookOpen,
  Clock,
  User,
  Landmark,
  CreditCard,
  Briefcase,
  Languages,
  Check,
  CheckCircle2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

const DoctorDetailModal = ({ isOpen, onClose, data, loading, onApprove }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [imageError, setImageError] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    setImageError(false);
    if (isOpen) {
      setActiveTab('personal');
    }
  }, [data, isOpen]);

  const doctor = data?.doctor || {};
  const about = data?.about || {};
  const rawSpecializations = data?.specializations || [];
  const educations = data?.educations || [];
  const appointments = data?.appointments || [];

  // Helper to resolve URLs uploaded from Doctor App (Java API)
  const resolveDoctorMediaUrl = (path) => {
    if (!path || typeof path !== 'string' || path === 'null' || path === 'undefined' || !path.trim()) {
      return null;
    }
    const clean = path.trim();
    if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) {
      return clean;
    }
    const doctorApiBase =
      import.meta.env.VITE_DOCTOR_API_BASE_URL ||
      import.meta.env.VITE_DOCTOR_IMAGE_BASE_URL ||
      'https://goodmoodjavadoctorapi.goodmood.solutions/';

    const root = doctorApiBase.replace(/\/+$/, '');
    const cleanPath = clean.startsWith('/') ? clean : `/${clean}`;
    return `${root}${cleanPath}`;
  };

  // Resolve avatar URL with Doctor API base URL fallback
  const rawImage = doctor?.avatar || data?.avatar || doctor?.image || data?.image || doctor?.profileImage;
  const avatarSrc = useMemo(() => {
    return resolveDoctorMediaUrl(rawImage);
  }, [rawImage]);

  // Doctor initials for fallback
  const initials = useMemo(() => {
    const f = doctor.firstName ? doctor.firstName.trim()[0] : '';
    const l = doctor.lastName ? doctor.lastName.trim()[0] : '';
    return (f + l).toUpperCase() || 'DR';
  }, [doctor.firstName, doctor.lastName]);

  // Clean & deduplicate specializations
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

  // Bank details from API response
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

  const isApproved = doctor.adminStatus === 1;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[90vh] max-h-[820px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">

        {/* ── Top Header (No Cover Pic, Clean & Modern) ── */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 sm:gap-5 min-w-0">
            {/* Avatar with Eye Icon on Hover & Lightbox on Click */}
            <div
              className="relative group shrink-0 cursor-pointer w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-emerald-100 dark:border-slate-700 bg-emerald-50/50 dark:bg-slate-800 overflow-hidden shadow-sm transition-all duration-200"
              onClick={() => avatarSrc && !imageError && setShowLightbox(true)}
              title={avatarSrc && !imageError ? "Click to view original photo" : ""}
            >
              {avatarSrc && !imageError ? (
                <img
                  src={avatarSrc}
                  alt={`Dr. ${doctor.firstName || 'Expert'}`}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-emerald-100 text-[#0B8843] flex items-center justify-center font-bold text-xl sm:text-2xl select-none uppercase">
                  {initials}
                </div>
              )}

              {/* Eye Button Overlay on Hover */}
              {avatarSrc && !imageError && (
                <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-0.5 text-white z-10">
                  <div className="p-1.5 bg-white/20 hover:bg-white/35 rounded-full transition-colors">
                    <Eye size={18} className="text-white" />
                  </div>
                  <span className="text-[10px] font-semibold tracking-wide">View</span>
                </div>
              )}
            </div>

            {/* Title & Metadata */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white capitalize truncate">
                  Dr. {doctor.firstName} {doctor.lastName}
                </h2>
                {isApproved ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Approved
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Pending Approval
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {doctor.email && (
                  <span className="inline-flex items-center gap-1.5 truncate">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <span>{doctor.email}</span>
                  </span>
                )}
                {doctor.mobile && (
                  <span className="inline-flex items-center gap-1.5 shrink-0">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <span className="font-mono">{doctor.mobile}</span>
                  </span>
                )}
                {about.exp && (
                  <span className="inline-flex items-center gap-1.5 shrink-0">
                    <Clock size={14} className="text-slate-400 shrink-0" />
                    <span>{about.exp} Years Exp.</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Close Icon Button */}
          <button
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all shrink-0 cursor-pointer ml-3"
            title="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Tab Navigation Bar ── */}
        <div className="px-6 sm:px-8 border-b border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex items-center gap-2 sm:gap-6 shrink-0 overflow-x-auto select-none">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex items-center gap-2 py-3.5 px-2 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'personal'
                ? 'border-[#0B8843] text-[#0B8843]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <User size={16} />
            <span>Personal</span>
          </button>

          <button
            onClick={() => setActiveTab('professional')}
            className={`flex items-center gap-2 py-3.5 px-2 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'professional'
                ? 'border-[#0B8843] text-[#0B8843]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Briefcase size={16} />
            <span>Professional</span>
            {specializations.length > 0 && (
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                {specializations.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('bank')}
            className={`flex items-center gap-2 py-3.5 px-2 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'bank'
                ? 'border-[#0B8843] text-[#0B8843]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Landmark size={16} />
            <span>Bank Details</span>
            {bankDetailsList.length > 0 && (
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-[#0B8843] font-semibold">
                {bankDetailsList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center gap-2 py-3.5 px-2 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'appointments'
                ? 'border-[#0B8843] text-[#0B8843]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Calendar size={16} />
            <span>Recent Appointments</span>
            {appointments.length > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-[#0B8843] font-bold">
                {appointments.length}
              </span>
            )}
          </button>
        </div>

        {/* ── Scrollable Tab Body ── */}
        <div
          className="flex-1 overflow-y-auto p-6 sm:p-8"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 border-4 border-[#0B8843] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 font-medium">Fetching expert details...</p>
            </div>
          ) : (
            <>
              {/* ─────────────────── TAB 1: PERSONAL ─────────────────── */}
              {activeTab === 'personal' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Full Name */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-3.5">
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#0B8843] shrink-0">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-400">Full Name</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white capitalize mt-0.5">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-3.5">
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#0B8843] shrink-0">
                        <Mail size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-400">Email Address</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate mt-0.5" title={doctor.email}>
                          {doctor.email || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-3.5">
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#0B8843] shrink-0">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-400">Mobile Number</p>
                        <p className="text-sm font-mono font-semibold text-slate-800 dark:text-white mt-0.5">
                          {doctor.mobile || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-3.5">
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#0B8843] shrink-0">
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-400">Gender</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white capitalize mt-0.5">
                          {doctor.gender || about.gender || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    {/* Experience */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-3.5">
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#0B8843] shrink-0">
                        <Clock size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-400">Total Experience</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">
                          {about.exp ? `${about.exp} Years` : 'Not specified'}
                        </p>
                      </div>
                    </div>

                    {/* Verification Status */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-3.5">
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#0B8843] shrink-0">
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-400">Account Approval</p>
                        <p className="text-sm font-semibold mt-0.5">
                          {isApproved ? (
                            <span className="text-emerald-600 font-bold">Verified & Approved</span>
                          ) : (
                            <span className="text-amber-600 font-bold">Pending Review</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Languages Section */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Languages size={18} className="text-[#0B8843]" />
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">Languages Spoken</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {about.language ? (
                        about.language.split(',').map((lang, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-full border border-slate-200 dark:border-slate-700 shadow-xs"
                          >
                            {lang.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No languages specified</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────────── TAB 2: PROFESSIONAL ─────────────────── */}
              {activeTab === 'professional' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Bio */}
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                      <User size={18} className="text-[#0B8843]" />
                      <h4 className="text-base font-bold text-slate-800 dark:text-white">Professional Bio</h4>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm italic">
                      &quot;{about.about || 'No biography provided by the expert.'}&quot;
                    </p>
                  </div>

                  {/* Specializations */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center gap-2 mb-4">
                      <Award size={18} className="text-[#0B8843]" />
                      <h4 className="text-base font-bold text-slate-800 dark:text-white">Specializations</h4>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {specializations.length > 0 ? (
                        specializations.map((spec, index) => (
                          <div
                            key={index}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-200/80 dark:border-emerald-800 shadow-2xs"
                          >
                            <Check size={13} className="text-[#0B8843] stroke-[2.5]" />
                            <span>{spec}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No specializations specified</span>
                      )}
                    </div>
                  </div>

                  {/* Education & Certifications */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen size={18} className="text-[#0B8843]" />
                      <h4 className="text-base font-bold text-slate-800 dark:text-white">Education & Certifications</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {educations.length > 0 ? (
                        educations.map((edu) => (
                          <div
                            key={edu.id || Math.random()}
                            className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-2xs hover:border-emerald-300 transition-colors"
                          >
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B8843] bg-emerald-100/60 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md inline-block mb-1.5">
                              {edu.degree || 'Degree'}
                            </span>
                            <h5 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1">{edu.course || 'Course'}</h5>
                            <p className="text-slate-500 text-xs line-clamp-1 mt-0.5">{edu.institute || 'Institute / University'}</p>
                            {edu.doc && (
                              <a
                                href={resolveDoctorMediaUrl(edu.doc)}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex items-center gap-1 text-xs text-[#0B8843] hover:underline font-semibold"
                              >
                                <ExternalLink size={12} />
                                <span>View Document Certificate</span>
                              </a>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-8 text-center text-slate-400 text-xs italic bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                          No education or certification records found
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────────── TAB 3: BANK DETAILS ─────────────────── */}
              {activeTab === 'bank' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="text-base font-bold text-slate-800 dark:text-white">Payout Bank Accounts</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Verified bank account details for expert payout settlements</p>
                    </div>
                    {bankDetailsList.length > 0 && (
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified Payout
                      </span>
                    )}
                  </div>

                  {bankDetailsList.length > 0 ? (
                    <div className="space-y-4">
                      {bankDetailsList.map((bank, index) => {
                        const isPrimary = bank.isMain === 1 || bank.isMain === true || bank.isMain === '1' || index === 0;
                        const isActive = bank.status === 1 || bank.status === '1' || bank.status === true || bank.status === 'ACTIVE' || bank.status === 'active';
                        const accountHolder = bank.accountHolderName || bank.holderName || bank.name || '—';
                        const accountNumber = bank.accountOn || bank.accountNo || bank.accountNumber || bank.accNo || '—';
                        const ifsc = bank.ifscCode || bank.ifsc || '—';
                        const upiId = bank.upi || bank.upiId || bank.vpa || '—';
                        const bankTitle = bank.bankName || bank.bank || 'Bank Account';

                        return (
                          <div
                            key={bank.id || index}
                            className="p-5 sm:p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/80 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-xs hover:border-[#0B8843]/40 transition-all"
                          >
                            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3 mb-4 gap-2">
                              <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-[#0B8843] rounded-xl shrink-0">
                                  <CreditCard size={20} />
                                </div>
                                <div>
                                  <span className="text-[11px] font-bold text-[#0B8843] uppercase tracking-wider block">
                                    {isPrimary ? 'Primary Payout Account' : 'Secondary Account'}
                                  </span>
                                  <h5 className="font-bold text-slate-800 dark:text-white text-base break-words">
                                    {bankTitle}
                                  </h5>
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
                              <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Account Holder</p>
                                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1 text-sm break-all">
                                  {accountHolder}
                                </p>
                              </div>

                              <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Account Number</p>
                                <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-1 text-sm tracking-wider break-all select-all">
                                  {accountNumber}
                                </p>
                              </div>

                              <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">IFSC Code</p>
                                <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-1 text-sm uppercase break-all">
                                  {ifsc}
                                </p>
                              </div>

                              <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">UPI ID / VPA</p>
                                <p className="font-semibold text-[#0B8843] mt-1 text-sm break-all select-all" title={upiId}>
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
                    <div className="p-10 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                      <Landmark className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={38} />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Bank Details Provided</p>
                      <p className="text-xs text-slate-400 mt-1">This expert has not submitted payout bank account details yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ─────────────────── TAB 4: RECENT APPOINTMENTS ─────────────────── */}
              {activeTab === 'appointments' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2">
                    <div>
                      <h4 className="text-base font-bold text-slate-800 dark:text-white">Recent Appointments</h4>
                      <p className="text-xs text-slate-400 mt-0.5">List of consultations and sessions booked with this expert</p>
                    </div>
                    {appointments.length > 0 && (
                      <span className="text-xs font-semibold text-slate-500">
                        Total {appointments.length} appointment(s)
                      </span>
                    )}
                  </div>

                  {/* Appointments Table */}
                  <div className="overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold border-b border-slate-200 dark:border-slate-700 tracking-wider">
                            <th className="px-5 py-3.5">#</th>
                            <th className="px-5 py-3.5">Date</th>
                            <th className="px-5 py-3.5">Time Slot</th>
                            <th className="px-5 py-3.5">Patient / Service</th>
                            <th className="px-5 py-3.5 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {appointments.length > 0 ? (
                            appointments.map((app, index) => {
                              const isComplete = app.isComplete === 1 || app.isComplete === true || app.status === 'COMPLETED' || app.status === 'completed';
                              const isCancelled = app.status === 'CANCELLED' || app.status === 'cancelled';

                              return (
                                <tr
                                  key={app.id || index}
                                  className="hover:bg-slate-50/80 dark:hover:bg-slate-750 transition-colors"
                                >
                                  <td className="px-5 py-4 font-mono text-xs text-slate-400">
                                    {index + 1}
                                  </td>
                                  <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      <Calendar size={14} className="text-[#0B8843]" />
                                      <span>{app.date || 'N/A'}</span>
                                    </div>
                                  </td>
                                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      <Clock size={14} className="text-slate-400" />
                                      <span>{app.timeSlot || app.slot || 'N/A'}</span>
                                    </div>
                                  </td>
                                  <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                                    <p className="font-semibold text-xs sm:text-sm">
                                      {app.patientName || app.userName || app.patient || 'Patient Consultation'}
                                    </p>
                                    {(app.service || app.type) && (
                                      <p className="text-[11px] text-slate-400">{app.service || app.type}</p>
                                    )}
                                  </td>
                                  <td className="px-5 py-4 text-center whitespace-nowrap">
                                    {isComplete ? (
                                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <Check size={12} className="stroke-[2.5]" />
                                        Completed
                                      </span>
                                    ) : isCancelled ? (
                                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                        <X size={12} className="stroke-[2.5]" />
                                        Cancelled
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                        <Clock size={12} />
                                        Upcoming
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan="5" className="px-6 py-12 text-center">
                                <div className="flex flex-col items-center justify-center">
                                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                                    <Calendar size={22} />
                                  </div>
                                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    No Recent Appointments Found
                                  </p>
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    This expert does not have any recorded appointments in the system yet.
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 px-6 sm:px-8 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60">
          <div>
            {!isApproved && onApprove && (
              <button
                onClick={() =>
                  onApprove(
                    doctor.id,
                    doctor.firstName
                      ? `Dr. ${doctor.firstName} ${doctor.lastName || ''}`.trim()
                      : 'Doctor / Expert'
                  )
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B8843] hover:bg-black text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Check size={16} />
                <span>Approve Expert</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-black dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold rounded-xl transition-all shadow-xs text-sm cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>

      {/* Lightbox Modal for Full View */}
      {showLightbox && avatarSrc && (
        <div
          className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowLightbox(false)}
        >
          <div
            className="relative max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl p-3 border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-5 right-5 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-all z-10 cursor-pointer shadow-md"
            >
              <X size={20} />
            </button>
            <div className="relative overflow-hidden rounded-2xl bg-slate-950 flex items-center justify-center">
              <img
                src={avatarSrc}
                alt="Doctor Full Photo"
                className="w-full max-h-[75vh] object-contain"
              />
            </div>
            <p className="text-center font-bold text-slate-800 dark:text-white capitalize text-base mt-2.5 pb-1">
              Dr. {doctor.firstName} {doctor.lastName}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDetailModal;