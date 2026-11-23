import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPrescriptionBody, savePrescriptionBody, clearPrescriptionMessage } from "../../Reducer/PrescriptionSlice";
import { Button, Card, Label, TextInput, Textarea } from "flowbite-react";
import { toast, ToastContainer } from "react-toastify";
import { 
  Save, 
  Building, 
  Stethoscope, 
  FileText, 
  ShieldCheck, 
  Upload, 
  Eye, 
  CheckCircle2, 
  Info,
  X,
  Printer,
  RotateCcw,
  Maximize2,
  Sliders,
  Move,
  Image as ImageIcon,
  User,
  MapPin,
  ClipboardList
} from "lucide-react";
import defaultLogo from "../../assets/imagesource/logo.png";
import smileLogo from "../../assets/imagesource/goodmood_smile_logo.png";

// Compact, sleek Toggle Switch Button
const ToggleSwitch = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={(e) => {
      e.stopPropagation();
      onChange(!checked);
    }}
    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
      checked ? "bg-[#0B8843]" : "bg-gray-300"
    }`}
  >
    <span
      aria-hidden="true"
      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
        checked ? "translate-x-4" : "translate-x-0"
      }`}
    />
  </button>
);

// Reusable Field with Active / Deactive Switch
const ToggleField = ({ checked, onChange, label, children }) => (
  <div className="space-y-1.5 bg-gray-50/50 p-2.5 rounded-lg border border-gray-100">
    <div className="flex items-center justify-between mb-1">
      <span 
        onClick={() => onChange(!checked)}
        className={`text-xs font-bold cursor-pointer select-none transition-colors ${
          checked ? "text-gray-800" : "text-gray-400"
        }`}
      >
        {label}
      </span>

      <div 
        onClick={() => onChange(!checked)}
        className="flex items-center gap-2 cursor-pointer select-none"
      >
        <span className={`text-[11px] font-bold transition-colors ${
          checked ? "text-[#0B8843]" : "text-gray-400"
        }`}>
          {checked ? "Active" : "Deactive"}
        </span>
        <ToggleSwitch checked={checked} onChange={onChange} />
      </div>
    </div>

    <div className={checked ? "transition-opacity duration-200" : "opacity-40 pointer-events-none transition-opacity duration-200"}>
      {children}
    </div>
  </div>
);

const ManagePrescription = () => {
  const dispatch = useDispatch();
  const { prescriptionData, loading, message, error } = useSelector((state) => state?.prescription);

  const [activeTab, setActiveTab] = useState("branding"); // "branding" | "doctor" | "patient" | "content" | "office"
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const a4PrintRef = useRef(null);

  // --- TAB 1: Branding & Header State ---
  const [showLogo, setShowLogo] = useState(true);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  const [showTagline, setShowTagline] = useState(true);
  const [appTagline, setAppTagline] = useState("Mental Health Awareness & Support App");

  const [showDocTitle, setShowDocTitle] = useState(true);
  const [documentTitle, setDocumentTitle] = useState("ONLINE MENTAL HEALTH COUNSELLING ADVICE");

  // --- Session Summary Section (Editable Titles, Subtitles, Samples & Toggles) ---
  const [showSessionSummary, setShowSessionSummary] = useState(true);
  const [summaryTitle, setSummaryTitle] = useState("COUNSELLING SESSION SUMMARY");

  // 1. Key Findings
  const [showKeyFindings, setShowKeyFindings] = useState(true);
  const [keyFindingsTitle, setKeyFindingsTitle] = useState("KEY FINDINGS");
  const [keyFindingsSubtitle, setKeyFindingsSubtitle] = useState("Key concerns, observations, patterns, triggers, or progress identified during the session.");
  const [keyFindingsSample, setKeyFindingsSample] = useState("The client discussed ongoing work-related stress and difficulty maintaining a consistent routine. The client reported that periods of increased workload tend to coincide with increased worry and reduced sleep.");

  // 2. Support Provided
  const [showSupportProvided, setShowSupportProvided] = useState(true);
  const [supportProvidedTitle, setSupportProvidedTitle] = useState("SUPPORT PROVIDED");
  const [supportProvidedSubtitle, setSupportProvidedSubtitle] = useState("Interventions, guidance, techniques, psychoeducation, or support provided during the session.");
  const [supportProvidedSample, setSupportProvidedSample] = useState("Supportive counselling was provided. The session included discussion of stress-management strategies, grounding techniques, and the importance of maintaining a consistent daily routine.");

  // 3. Actions
  const [showActions, setShowActions] = useState(true);
  const [actionsTitle, setActionsTitle] = useState("ACTIONS");
  const [actionsSubtitle, setActionsSubtitle] = useState("Specific steps the client has agreed to take before the next session.");
  const [actionsSample, setActionsSample] = useState("The client agreed to establish a regular sleep routine, break daily tasks into manageable steps, and use a brief breathing exercise during periods of increased stress.");

  // 4. Practice
  const [showPractice, setShowPractice] = useState(true);
  const [practiceTitle, setPracticeTitle] = useState("PRACTICE");
  const [practiceSubtitle, setPracticeSubtitle] = useState("Exercises, skills, habits, or techniques the client should practise between sessions.");
  const [practiceSample, setPracticeSample] = useState("Practise slow breathing for a few minutes each day and note situations that appear to increase stress or worry. Review observations during the next session.");

  // 5. Next Session
  const [showNextSession, setShowNextSession] = useState(true);
  const [nextSessionTitle, setNextSessionTitle] = useState("NEXT SESSION");
  const [nextSessionSubtitle, setNextSessionSubtitle] = useState("Follow-up focus, topics to revisit, and/or agreed next steps for the next session.");
  const [nextSessionSample, setNextSessionSample] = useState("Review progress with the agreed routine and coping strategies, discuss any continuing stressors, and identify further areas for counselling support.");

  // Watermark Settings
  const [showWatermark, setShowWatermark] = useState(true);
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.06); // 0 to 1 (0% - 100%)
  const [watermarkSize, setWatermarkSize] = useState(460); // 100px - 800px
  const [watermarkRotate, setWatermarkRotate] = useState(0); // -180deg to +180deg
  const [watermarkPosX, setWatermarkPosX] = useState(50); // 0% to 100%
  const [watermarkPosY, setWatermarkPosY] = useState(50); // 0% to 100%
  const [watermarkCustomUrl, setWatermarkCustomUrl] = useState(""); // base64 or remote URL

  // --- TAB 2: Doctor Details (Visibility Toggles & Preview Data) ---
  const [showDoctorSection, setShowDoctorSection] = useState(true);
  const [showDocName, setShowDocName] = useState(true);
  const [docName, setDocName] = useState("Dr. Ananya Sen");

  const [showDocRegNo, setShowDocRegNo] = useState(true);
  const [docRegNo, setDocRegNo] = useState("Reg. No.: WB-PSY-48291");

  const [showDocDegree, setShowDocDegree] = useState(true);
  const [docDegree, setDocDegree] = useState("M.Sc. Clinical Psychology");

  const [showDocRole, setShowDocRole] = useState(true);
  const [docRole, setDocRole] = useState("Clinical Psychologist");

  // --- TAB 3: Patient Details (Visibility Toggles & Preview Data) ---
  const [showPatientBar, setShowPatientBar] = useState(true);
  const [showPatientName, setShowPatientName] = useState(true);
  const [patientName, setPatientName] = useState("Nilanjan Das");

  const [showPatientAge, setShowPatientAge] = useState(true);
  const [patientAge, setPatientAge] = useState("30");

  const [showPatientGender, setShowPatientGender] = useState(true);
  const [patientGender, setPatientGender] = useState("Male");

  // --- TAB 4: Disclaimers & Emergency Support ---
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [disclaimerTitle, setDisclaimerTitle] = useState("Online Advice Disclaimer");
  const [disclaimer, setDisclaimer] = useState(
    "This document records guidance and support discussed during an online counselling session. It is intended for supportive counselling purposes and does not replace an in-person medical, psychiatric, psychological, or emergency assessment where such assessment is required."
  );

  const [showEmergencySupport, setShowEmergencySupport] = useState(true);
  const [emergencySupportTitle, setEmergencySupportTitle] = useState("Emergency Support");
  const [emergencySupport, setEmergencySupport] = useState(
    "If there is an immediate risk of harm or a mental health emergency, seek urgent assistance from the appropriate local emergency service, nearest hospital, or qualified emergency mental health service."
  );

  // --- TAB 5: Letterhead Office Info ---
  const [showFooterOffice, setShowFooterOffice] = useState(true);
  const [showCompanyName, setShowCompanyName] = useState(true);
  const [companyName, setCompanyName] = useState("Good Mood Solutions");

  const [showContactEmail, setShowContactEmail] = useState(true);
  const [contactEmail, setContactEmail] = useState("connect@goodmood.solutions");

  const [showWebsite, setShowWebsite] = useState(true);
  const [website, setWebsite] = useState("goodmood.solutions");

  const [showRegOffice, setShowRegOffice] = useState(true);
  const [regOffice, setRegOffice] = useState("136, Basunagar Gate No 1, Madhyamgram, Kolkata 700129");

  const [showCorpOffice, setShowCorpOffice] = useState(true);
  const [corpOffice, setCorpOffice] = useState("MANI CASADONA IT BUILDING, Newtown, Kolkata - 700160, West Bengal, India");

  // Fetch initial data
  useEffect(() => {
    dispatch(getPrescriptionBody());
  }, [dispatch]);

  // Populate from fetched prescriptionData
  useEffect(() => {
    if (prescriptionData) {
      if (prescriptionData.logoUrl) {
        const fullLogo = prescriptionData.logoUrl.startsWith("http")
          ? prescriptionData.logoUrl
          : `${import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/$/, "") || ""}${prescriptionData.logoUrl}`;
        setLogoPreview(fullLogo);
      }

      if (prescriptionData.headerDescription) {
        try {
          const parsed = JSON.parse(prescriptionData.headerDescription);
          if (parsed && typeof parsed === "object") {
            if (parsed.appTagline !== undefined) setAppTagline(parsed.appTagline);
            if (parsed.documentTitle !== undefined) setDocumentTitle(parsed.documentTitle);
            if (parsed.summaryTitle !== undefined) setSummaryTitle(parsed.summaryTitle);

            // Watermark
            if (parsed.watermarkOpacity !== undefined) setWatermarkOpacity(parsed.watermarkOpacity);
            if (parsed.showWatermark !== undefined) setShowWatermark(parsed.showWatermark);
            if (parsed.watermarkSize !== undefined) setWatermarkSize(parsed.watermarkSize);
            if (parsed.watermarkRotate !== undefined) setWatermarkRotate(parsed.watermarkRotate);
            if (parsed.watermarkPosX !== undefined) setWatermarkPosX(parsed.watermarkPosX);
            if (parsed.watermarkPosY !== undefined) setWatermarkPosY(parsed.watermarkPosY);
            if (parsed.watermarkCustomUrl !== undefined) setWatermarkCustomUrl(parsed.watermarkCustomUrl);

            // Branding toggles
            if (parsed.showLogo !== undefined) setShowLogo(parsed.showLogo);
            if (parsed.showTagline !== undefined) setShowTagline(parsed.showTagline);
            if (parsed.showDocTitle !== undefined) setShowDocTitle(parsed.showDocTitle);

            // Doctor toggles & preview
            if (parsed.showDoctorSection !== undefined) setShowDoctorSection(parsed.showDoctorSection);
            if (parsed.showDocName !== undefined) setShowDocName(parsed.showDocName);
            if (parsed.showDocRegNo !== undefined) setShowDocRegNo(parsed.showDocRegNo);
            if (parsed.showDocDegree !== undefined) setShowDocDegree(parsed.showDocDegree);
            if (parsed.showDocRole !== undefined) setShowDocRole(parsed.showDocRole);
            if (parsed.docName !== undefined) setDocName(parsed.docName);
            if (parsed.docRegNo !== undefined) setDocRegNo(parsed.docRegNo);
            if (parsed.docDegree !== undefined) setDocDegree(parsed.docDegree);
            if (parsed.docRole !== undefined) setDocRole(parsed.docRole);

            // Patient toggles & preview
            if (parsed.showPatientBar !== undefined) setShowPatientBar(parsed.showPatientBar);
            if (parsed.showPatientName !== undefined) setShowPatientName(parsed.showPatientName);
            if (parsed.showPatientAge !== undefined) setShowPatientAge(parsed.showPatientAge);
            if (parsed.showPatientGender !== undefined) setShowPatientGender(parsed.showPatientGender);
            if (parsed.patientName !== undefined) setPatientName(parsed.patientName);
            if (parsed.patientAge !== undefined) setPatientAge(parsed.patientAge);
            if (parsed.patientGender !== undefined) setPatientGender(parsed.patientGender);

            // Session summary toggles & titles
            if (parsed.showSessionSummary !== undefined) setShowSessionSummary(parsed.showSessionSummary);
            if (parsed.summaryTitle !== undefined) setSummaryTitle(parsed.summaryTitle);

            if (parsed.showKeyFindings !== undefined) setShowKeyFindings(parsed.showKeyFindings);
            if (parsed.keyFindingsTitle !== undefined) setKeyFindingsTitle(parsed.keyFindingsTitle);
            if (parsed.keyFindingsSubtitle !== undefined) setKeyFindingsSubtitle(parsed.keyFindingsSubtitle);
            if (parsed.keyFindingsSample !== undefined) setKeyFindingsSample(parsed.keyFindingsSample);

            if (parsed.showSupportProvided !== undefined) setShowSupportProvided(parsed.showSupportProvided);
            if (parsed.supportProvidedTitle !== undefined) setSupportProvidedTitle(parsed.supportProvidedTitle);
            if (parsed.supportProvidedSubtitle !== undefined) setSupportProvidedSubtitle(parsed.supportProvidedSubtitle);
            if (parsed.supportProvidedSample !== undefined) setSupportProvidedSample(parsed.supportProvidedSample);

            if (parsed.showActions !== undefined) setShowActions(parsed.showActions);
            if (parsed.actionsTitle !== undefined) setActionsTitle(parsed.actionsTitle);
            if (parsed.actionsSubtitle !== undefined) setActionsSubtitle(parsed.actionsSubtitle);
            if (parsed.actionsSample !== undefined) setActionsSample(parsed.actionsSample);

            if (parsed.showPractice !== undefined) setShowPractice(parsed.showPractice);
            if (parsed.practiceTitle !== undefined) setPracticeTitle(parsed.practiceTitle);
            if (parsed.practiceSubtitle !== undefined) setPracticeSubtitle(parsed.practiceSubtitle);
            if (parsed.practiceSample !== undefined) setPracticeSample(parsed.practiceSample);

            if (parsed.showNextSession !== undefined) setShowNextSession(parsed.showNextSession);
            if (parsed.nextSessionTitle !== undefined) setNextSessionTitle(parsed.nextSessionTitle);
            if (parsed.nextSessionSubtitle !== undefined) setNextSessionSubtitle(parsed.nextSessionSubtitle);
            if (parsed.nextSessionSample !== undefined) setNextSessionSample(parsed.nextSessionSample);
          } else {
            setAppTagline(prescriptionData.headerDescription);
          }
        } catch {
          setAppTagline(prescriptionData.headerDescription);
        }
      }

      if (prescriptionData.footerDescription) {
        try {
          const parsed = JSON.parse(prescriptionData.footerDescription);
          if (parsed && typeof parsed === "object") {
            if (parsed.disclaimerTitle !== undefined) setDisclaimerTitle(parsed.disclaimerTitle);
            if (parsed.disclaimer !== undefined) setDisclaimer(parsed.disclaimer);
            if (parsed.emergencySupportTitle !== undefined) setEmergencySupportTitle(parsed.emergencySupportTitle);
            if (parsed.emergencySupport !== undefined) setEmergencySupport(parsed.emergencySupport);
            if (parsed.companyName !== undefined) setCompanyName(parsed.companyName);
            if (parsed.contactEmail !== undefined) setContactEmail(parsed.contactEmail);
            if (parsed.website !== undefined) setWebsite(parsed.website);
            if (parsed.regOffice !== undefined) setRegOffice(parsed.regOffice);
            if (parsed.corpOffice !== undefined) setCorpOffice(parsed.corpOffice);

            // Toggles
            if (parsed.showDisclaimer !== undefined) setShowDisclaimer(parsed.showDisclaimer);
            if (parsed.showEmergencySupport !== undefined) setShowEmergencySupport(parsed.showEmergencySupport);
            if (parsed.showFooterOffice !== undefined) setShowFooterOffice(parsed.showFooterOffice);
            if (parsed.showCompanyName !== undefined) setShowCompanyName(parsed.showCompanyName);
            if (parsed.showContactEmail !== undefined) setShowContactEmail(parsed.showContactEmail);
            if (parsed.showWebsite !== undefined) setShowWebsite(parsed.showWebsite);
            if (parsed.showRegOffice !== undefined) setShowRegOffice(parsed.showRegOffice);
            if (parsed.showCorpOffice !== undefined) setShowCorpOffice(parsed.showCorpOffice);
          } else {
            setDisclaimer(prescriptionData.footerDescription);
          }
        } catch {
          setDisclaimer(prescriptionData.footerDescription);
        }
      }
    }
  }, [prescriptionData]);

  // Handle toast notifications
  useEffect(() => {
    if (message) {
      if (error) {
        toast.error(message);
      } else {
        toast.success(message);
      }
      dispatch(clearPrescriptionMessage());
    }
  }, [message, error, dispatch]);

  // Logo file upload handler
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setShowLogo(true);
    }
  };

  // Watermark custom upload handler (with client-side canvas compression for safe storage)
  const handleWatermarkUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 450;
        const MAX_HEIGHT = 450;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/png");
        setWatermarkCustomUrl(compressedDataUrl);
        setShowWatermark(true);
        toast.success("Watermark logo uploaded successfully!");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Reset watermark to defaults
  const handleResetWatermark = () => {
    setWatermarkCustomUrl("");
    setWatermarkOpacity(0.06);
    setWatermarkSize(460);
    setWatermarkRotate(0);
    setWatermarkPosX(50);
    setWatermarkPosY(50);
    toast.info("Watermark reset to default Smile logo & position");
  };

  // Save changes
  const handleSave = () => {
    const headerObj = {
      appTagline,
      documentTitle,
      showLogo,
      showTagline,
      showDocTitle,

      // Watermark
      showWatermark,
      watermarkOpacity,
      watermarkSize,
      watermarkRotate,
      watermarkPosX,
      watermarkPosY,
      watermarkCustomUrl,

      // Doctor Details
      showDoctorSection,
      showDocName,
      showDocRegNo,
      showDocDegree,
      showDocRole,
      docName,
      docRegNo,
      docDegree,
      docRole,

      // Patient Details
      showPatientBar,
      showPatientName,
      showPatientAge,
      showPatientGender,
      patientName,
      patientAge,
      patientGender,

      // Session Summary
      showSessionSummary,
      summaryTitle,
      showKeyFindings,
      keyFindingsTitle,
      keyFindingsSubtitle,
      keyFindingsSample,
      showSupportProvided,
      supportProvidedTitle,
      supportProvidedSubtitle,
      supportProvidedSample,
      showActions,
      actionsTitle,
      actionsSubtitle,
      actionsSample,
      showPractice,
      practiceTitle,
      practiceSubtitle,
      practiceSample,
      showNextSession,
      nextSessionTitle,
      nextSessionSubtitle,
      nextSessionSample,
    };

    const footerObj = {
      disclaimerTitle,
      disclaimer,
      emergencySupportTitle,
      emergencySupport,
      companyName,
      contactEmail,
      website,
      regOffice,
      corpOffice,

      showDisclaimer,
      showEmergencySupport,
      showFooterOffice,
      showCompanyName,
      showContactEmail,
      showWebsite,
      showRegOffice,
      showCorpOffice,
    };

    const formData = new FormData();
    formData.append("headerDescription", JSON.stringify(headerObj));
    formData.append("footerDescription", JSON.stringify(footerObj));

    if (prescriptionData?.id) {
      formData.append("id", prescriptionData.id);
    }
    if (logoFile) {
      formData.append("file", logoFile);
    }

    dispatch(savePrescriptionBody(formData));
  };

  return (
    <div className="manage-prescription-wrapper p-4 md:p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-5 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shadow-sm shrink-0">
            <FileText size={26} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Prescription & Counselling Letterhead</h2>
            <p className="text-gray-500 text-xs md:text-sm mt-0.5">
              Configure dynamic branding, doctor info, patient header, disclaimers, and office details.
            </p>
          </div>
        </div>

        {/* Action Buttons: Preview Button & Save Changes (Prevent breaking / text wrapping) */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 flex-nowrap self-end lg:self-auto">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-xl text-xs md:text-sm font-semibold shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <Eye size={16} className="text-[#0B8843] shrink-0" />
            <span className="whitespace-nowrap">Prescription Preview</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#0B8843] hover:bg-[#086a34] text-white rounded-xl text-xs md:text-sm font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <Save size={16} className="shrink-0" />
            <span className="whitespace-nowrap">{loading ? "Saving Changes..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Navigation Tabs */}
        <div className="flex bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab("branding")}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "branding"
                ? "bg-[#0B8843] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Building size={16} /> Branding & Logo
          </button>

          <button
            onClick={() => setActiveTab("doctor")}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "doctor"
                ? "bg-[#0B8843] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Stethoscope size={16} /> Doctor Details
          </button>

          <button
            onClick={() => setActiveTab("patient")}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "patient"
                ? "bg-[#0B8843] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <User size={16} /> Patient Details
          </button>

          <button
            onClick={() => setActiveTab("summary")}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "summary"
                ? "bg-[#0B8843] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ClipboardList size={16} /> Session Summary
          </button>

          <button
            onClick={() => setActiveTab("content")}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "content"
                ? "bg-[#0B8843] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ShieldCheck size={16} /> Disclaimers
          </button>

          <button
            onClick={() => setActiveTab("office")}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "office"
                ? "bg-[#0B8843] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <MapPin size={16} /> Office Details
          </button>
        </div>

        {/* TAB 1: BRANDING & LOGO */}
        {activeTab === "branding" && (
          <Card className="shadow-sm border-gray-200">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
              <Building size={18} className="text-[#0B8843]" /> Header Branding & Watermark
            </h3>

            <div className="space-y-5 pt-1">
              {/* Logo Upload & Preview with Toggle */}
              <ToggleField
                checked={showLogo}
                onChange={setShowLogo}
                label="Company Header Logo"
              >
                <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="h-14 w-44 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center p-2 overflow-hidden shrink-0">
                    <img
                      src={logoPreview || defaultLogo}
                      alt="Company Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="flex-1 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">
                        {logoFile ? logoFile.name : "Active Header Logo"}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        PNG, JPG or SVG. Transparent background recommended.
                      </p>
                    </div>

                    <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#0B8843] border border-emerald-200 rounded-lg text-xs font-semibold transition-all shrink-0">
                      <Upload size={14} /> Upload New Logo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </ToggleField>

              {/* Tagline with Toggle */}
              <ToggleField
                checked={showTagline}
                onChange={setShowTagline}
                label="App Subtitle / Tagline (Under Logo)"
              >
                <TextInput
                  value={appTagline}
                  onChange={(e) => setAppTagline(e.target.value)}
                  placeholder="Mental Health Awareness & Support App"
                  className="text-sm"
                />
              </ToggleField>

              {/* Document Main Title with Toggle */}
              <ToggleField
                checked={showDocTitle}
                onChange={setShowDocTitle}
                label="Document Title (Centered Heading)"
              >
                <TextInput
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="ONLINE MENTAL HEALTH COUNSELLING ADVICE"
                  className="text-sm font-semibold"
                />
              </ToggleField>

              {/* Watermark Section (Upload, Size, Opacity 0-100%, Rotate, Position) */}
              <div className="pt-3 border-t border-gray-200 space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <Label value="Background Watermark" className="text-xs font-bold text-gray-800" />
                    <p className="text-[11px] text-gray-500">Show subtle branding watermark centered behind the prescription canvas.</p>
                  </div>
                  <div 
                    className="flex items-center gap-2 select-none cursor-pointer"
                    onClick={() => setShowWatermark(!showWatermark)}
                  >
                    <span className={`text-[11px] font-bold ${showWatermark ? "text-[#0B8843]" : "text-gray-400"}`}>
                      {showWatermark ? "Active" : "Deactive"}
                    </span>
                    <ToggleSwitch checked={showWatermark} onChange={setShowWatermark} />
                  </div>
                </div>

                {showWatermark && (
                  <div className="bg-gray-50/90 p-4 rounded-xl border border-gray-200 space-y-4">
                    {/* Watermark Logo Upload & Reset */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                          <ImageIcon size={14} className="text-[#0B8843]" /> Watermark Logo
                        </span>
                        {watermarkCustomUrl && (
                          <button
                            type="button"
                            onClick={handleResetWatermark}
                            className="text-[11px] text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw size={12} /> Reset to Default
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        {/* Active Watermark Preview Thumbnail */}
                        <div className="w-20 h-16 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center p-1.5 shrink-0 overflow-hidden relative">
                          <img
                            src={watermarkCustomUrl || smileLogo}
                            alt="Watermark Preview"
                            className="max-w-full max-h-full object-contain"
                            style={{
                              transform: `rotate(${watermarkRotate}deg)`,
                            }}
                          />
                        </div>

                        <div className="flex-1 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-gray-800">
                              {watermarkCustomUrl ? "Custom Watermark Logo" : "Default Good Mood Smile Logo"}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              PNG, JPG, SVG with transparent background recommended
                            </p>
                          </div>

                          <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#0B8843] border border-emerald-200 rounded-lg text-xs font-semibold transition-all shrink-0">
                            <Upload size={13} /> Upload Watermark
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleWatermarkUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Watermark Opacity (0% - 100%) */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                          <Sliders size={13} className="text-[#0B8843]" /> Watermark Opacity:
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-[#0B8843] rounded-md font-bold text-xs">
                          {Math.round(watermarkOpacity * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={watermarkOpacity}
                        onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                        className="w-full accent-[#0B8843] cursor-pointer"
                      />
                      {/* Presets */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-gray-400 font-medium">Quick:</span>
                        {[0.06, 0.15, 0.30, 0.50, 1.0].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setWatermarkOpacity(val)}
                            className={`px-2 py-0.5 text-[10px] rounded border font-medium transition-all ${
                              Math.round(watermarkOpacity * 100) === Math.round(val * 100)
                                ? "bg-[#0B8843] text-white border-[#0B8843]"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            {Math.round(val * 100)}%
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Watermark Size / Scale (Choto - Boro) */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                          <Maximize2 size={13} className="text-[#0B8843]" /> Watermark Size:
                        </span>
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-800 rounded-md font-bold text-xs">
                          {watermarkSize}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="120"
                        max="800"
                        step="10"
                        value={watermarkSize}
                        onChange={(e) => setWatermarkSize(parseInt(e.target.value, 10))}
                        className="w-full accent-[#0B8843] cursor-pointer"
                      />
                      {/* Presets */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-gray-400 font-medium">Presets:</span>
                        {[
                          { label: "Small (280px)", size: 280 },
                          { label: "Medium (460px)", size: 460 },
                          { label: "Large (650px)", size: 650 },
                          { label: "Full (750px)", size: 750 },
                        ].map((item) => (
                          <button
                            key={item.size}
                            type="button"
                            onClick={() => setWatermarkSize(item.size)}
                            className={`px-2 py-0.5 text-[10px] rounded border font-medium transition-all ${
                              watermarkSize === item.size
                                ? "bg-[#0B8843] text-white border-[#0B8843]"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Watermark Rotation (Rotate) */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                          <RotateCcw size={13} className="text-[#0B8843]" /> Rotate Angle:
                        </span>
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-800 rounded-md font-bold text-xs">
                          {watermarkRotate}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="1"
                        value={watermarkRotate}
                        onChange={(e) => setWatermarkRotate(parseInt(e.target.value, 10))}
                        className="w-full accent-[#0B8843] cursor-pointer"
                      />
                      {/* Presets */}
                      <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                        <span className="text-[10px] text-gray-400 font-medium">Angles:</span>
                        {[
                          { label: "0° (Flat)", angle: 0 },
                          { label: "-30°", angle: -30 },
                          { label: "-45°", angle: -45 },
                          { label: "30°", angle: 30 },
                          { label: "45°", angle: 45 },
                          { label: "90° (Vertical)", angle: 90 },
                        ].map((item) => (
                          <button
                            key={item.angle}
                            type="button"
                            onClick={() => setWatermarkRotate(item.angle)}
                            className={`px-2 py-0.5 text-[10px] rounded border font-medium transition-all ${
                              watermarkRotate === item.angle
                                ? "bg-[#0B8843] text-white border-[#0B8843]"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Watermark Position (X & Y Offsets) */}
                    <div className="space-y-2 pt-1 border-t border-gray-200">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                          <Move size={13} className="text-[#0B8843]" /> Watermark Position:
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => { setWatermarkPosX(50); setWatermarkPosY(25); }}
                            className={`px-2 py-0.5 text-[10px] rounded border font-medium transition-all ${
                              watermarkPosY === 25 && watermarkPosX === 50
                                ? "bg-[#0B8843] text-white border-[#0B8843]"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            Top
                          </button>
                          <button
                            type="button"
                            onClick={() => { setWatermarkPosX(50); setWatermarkPosY(50); }}
                            className={`px-2 py-0.5 text-[10px] rounded border font-medium transition-all ${
                              watermarkPosY === 50 && watermarkPosX === 50
                                ? "bg-[#0B8843] text-white border-[#0B8843]"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            Center
                          </button>
                          <button
                            type="button"
                            onClick={() => { setWatermarkPosX(50); setWatermarkPosY(75); }}
                            className={`px-2 py-0.5 text-[10px] rounded border font-medium transition-all ${
                              watermarkPosY === 75 && watermarkPosX === 50
                                ? "bg-[#0B8843] text-white border-[#0B8843]"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            Bottom
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                            <span>Horizontal (X-Axis):</span>
                            <span className="font-semibold text-gray-700">{watermarkPosX}%</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="90"
                            step="1"
                            value={watermarkPosX}
                            onChange={(e) => setWatermarkPosX(parseInt(e.target.value, 10))}
                            className="w-full accent-[#0B8843] cursor-pointer"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                            <span>Vertical (Y-Axis):</span>
                            <span className="font-semibold text-gray-700">{watermarkPosY}%</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="90"
                            step="1"
                            value={watermarkPosY}
                            onChange={(e) => setWatermarkPosY(parseInt(e.target.value, 10))}
                            className="w-full accent-[#0B8843] cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* TAB 2: DOCTOR DETAILS */}
        {activeTab === "doctor" && (
          <Card className="shadow-sm border-gray-200">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
              <Stethoscope size={18} className="text-[#0B8843]" /> Doctor Details Configuration & Preview
            </h3>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed mb-3">
              <Info size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Dynamic in Doctor App:</span> Each toggle determines whether that particular doctor field is shown on the generated prescription. In live consultations, these fields automatically reflect the attending doctor's profile.
              </div>
            </div>

            {/* Master Doctor Details Toggle */}
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200 mb-3">
              <div>
                <Label value="Show Doctor Details in Header" className="text-xs font-bold text-gray-800" />
                <p className="text-[11px] text-gray-500">Toggle entire doctor credentials block on or off.</p>
              </div>
              <div 
                className="flex items-center gap-2 select-none cursor-pointer"
                onClick={() => setShowDoctorSection(!showDoctorSection)}
              >
                <span className={`text-[11px] font-bold ${showDoctorSection ? "text-[#0B8843]" : "text-gray-400"}`}>
                  {showDoctorSection ? "Active" : "Deactive"}
                </span>
                <ToggleSwitch checked={showDoctorSection} onChange={setShowDoctorSection} />
              </div>
            </div>

            {showDoctorSection && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Doctor Name with Toggle */}
                <ToggleField
                  checked={showDocName}
                  onChange={setShowDocName}
                  label="Doctor Name"
                >
                  <TextInput
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="Dr. Ananya Sen"
                    className="text-xs"
                  />
                </ToggleField>

                {/* Registration Number with Toggle */}
                <ToggleField
                  checked={showDocRegNo}
                  onChange={setShowDocRegNo}
                  label="Registration Number"
                >
                  <TextInput
                    value={docRegNo}
                    onChange={(e) => setDocRegNo(e.target.value)}
                    placeholder="Reg. No.: WB-PSY-48291"
                    className="text-xs"
                  />
                </ToggleField>

                {/* Degrees / Qualifications with Toggle */}
                <ToggleField
                  checked={showDocDegree}
                  onChange={setShowDocDegree}
                  label="Degrees / Qualifications"
                >
                  <TextInput
                    value={docDegree}
                    onChange={(e) => setDocDegree(e.target.value)}
                    placeholder="M.Sc. Clinical Psychology"
                    className="text-xs"
                  />
                </ToggleField>

                {/* Role / Specialization with Toggle */}
                <ToggleField
                  checked={showDocRole}
                  onChange={setShowDocRole}
                  label="Role / Specialization"
                >
                  <TextInput
                    value={docRole}
                    onChange={(e) => setDocRole(e.target.value)}
                    placeholder="Clinical Psychologist"
                    className="text-xs"
                  />
                </ToggleField>
              </div>
            )}
          </Card>
        )}

        {/* TAB 3: PATIENT DETAILS */}
        {activeTab === "patient" && (
          <Card className="shadow-sm border-gray-200">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
              <User size={18} className="text-[#0B8843]" /> Patient Details Configuration & Preview
            </h3>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed mb-1">
              <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Client Information Bar:</span> Turn on or off individual patient fields or the entire bar. You can edit the dummy values below to preview how patient demographic data appears on the final A4 advice.
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {/* Master Patient Bar Toggle */}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <Label value="Show Patient Information Bar" className="text-xs font-bold text-gray-800" />
                  <p className="text-[11px] text-gray-500">Toggle entire "For: Patient / Age / Gender" header strip on or off.</p>
                </div>
                <div 
                  className="flex items-center gap-2 select-none cursor-pointer"
                  onClick={() => setShowPatientBar(!showPatientBar)}
                >
                  <span className={`text-[11px] font-bold ${showPatientBar ? "text-[#0B8843]" : "text-gray-400"}`}>
                    {showPatientBar ? "Active" : "Deactive"}
                  </span>
                  <ToggleSwitch checked={showPatientBar} onChange={setShowPatientBar} />
                </div>
              </div>

              {showPatientBar && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Patient Name with Toggle */}
                  <ToggleField
                    checked={showPatientName}
                    onChange={setShowPatientName}
                    label="Patient Name"
                  >
                    <TextInput
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Nilanjan Das"
                      className="text-xs"
                    />
                  </ToggleField>

                  {/* Patient Age with Toggle */}
                  <ToggleField
                    checked={showPatientAge}
                    onChange={setShowPatientAge}
                    label="Patient Age"
                  >
                    <TextInput
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      placeholder="30"
                      className="text-xs"
                    />
                  </ToggleField>

                  {/* Patient Gender with Toggle */}
                  <ToggleField
                    checked={showPatientGender}
                    onChange={setShowPatientGender}
                    label="Patient Gender"
                  >
                    <TextInput
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      placeholder="Male"
                      className="text-xs"
                    />
                  </ToggleField>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* TAB 4: SESSION SUMMARY (HEADINGS, SUBTITLES & CLINICAL SECTIONS) */}
        {activeTab === "summary" && (
          <Card className="shadow-sm border-gray-200">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
              <ClipboardList size={18} className="text-[#0B8843]" /> Counselling Session Summary & Clinical Sections
            </h3>

            {/* Master Summary Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 mb-2">
              <div className="flex-1">
                <Label value="Main Summary Heading" className="text-xs font-bold text-gray-800 block mb-1" />
                <TextInput
                  value={summaryTitle}
                  onChange={(e) => setSummaryTitle(e.target.value)}
                  placeholder="COUNSELLING SESSION SUMMARY"
                  className="text-xs font-bold max-w-lg"
                  disabled={!showSessionSummary}
                />
              </div>

              <div 
                className="flex items-center gap-2 select-none cursor-pointer pt-3 sm:pt-4"
                onClick={() => setShowSessionSummary(!showSessionSummary)}
              >
                <span className={`text-[11px] font-bold ${showSessionSummary ? "text-[#0B8843]" : "text-gray-400"}`}>
                  {showSessionSummary ? "Active" : "Deactive"}
                </span>
                <ToggleSwitch checked={showSessionSummary} onChange={setShowSessionSummary} />
              </div>
            </div>

            {showSessionSummary && (
              <div className="space-y-4 pt-1">
                {/* 1. KEY FINDINGS */}
                <div className="bg-gray-50/60 p-3.5 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-2.5">
                    <div className="flex-1">
                      <Label value="Section 1 Heading / Title" className="text-xs font-bold text-gray-700 block mb-1" />
                      <TextInput
                        value={keyFindingsTitle}
                        onChange={(e) => setKeyFindingsTitle(e.target.value)}
                        placeholder="KEY FINDINGS"
                        className="text-xs font-bold max-w-md"
                        disabled={!showKeyFindings}
                      />
                    </div>

                    <div 
                      className="flex items-center gap-2 select-none cursor-pointer pt-1 shrink-0"
                      onClick={() => setShowKeyFindings(!showKeyFindings)}
                    >
                      <span className={`text-[11px] font-bold ${showKeyFindings ? "text-[#0B8843]" : "text-gray-400"}`}>
                        {showKeyFindings ? "Active" : "Deactive"}
                      </span>
                      <ToggleSwitch checked={showKeyFindings} onChange={setShowKeyFindings} />
                    </div>
                  </div>

                  <div className={showKeyFindings ? "space-y-2" : "space-y-2 opacity-40 pointer-events-none"}>
                    <div>
                      <Label value="Subtitle / Instruction Hint" className="text-[11px] font-medium text-gray-600 block mb-1" />
                      <TextInput
                        value={keyFindingsSubtitle}
                        onChange={(e) => setKeyFindingsSubtitle(e.target.value)}
                        placeholder="Key concerns, observations, patterns..."
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <Label value="Sample / Preview Body Text" className="text-[11px] font-medium text-gray-600 block mb-1" />
                      <Textarea
                        value={keyFindingsSample}
                        onChange={(e) => setKeyFindingsSample(e.target.value)}
                        rows={3}
                        className="text-xs text-gray-700 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. SUPPORT PROVIDED */}
                <div className="bg-gray-50/60 p-3.5 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-2.5">
                    <div className="flex-1">
                      <Label value="Section 2 Heading / Title" className="text-xs font-bold text-gray-700 block mb-1" />
                      <TextInput
                        value={supportProvidedTitle}
                        onChange={(e) => setSupportProvidedTitle(e.target.value)}
                        placeholder="SUPPORT PROVIDED"
                        className="text-xs font-bold max-w-md"
                        disabled={!showSupportProvided}
                      />
                    </div>

                    <div 
                      className="flex items-center gap-2 select-none cursor-pointer pt-1 shrink-0"
                      onClick={() => setShowSupportProvided(!showSupportProvided)}
                    >
                      <span className={`text-[11px] font-bold ${showSupportProvided ? "text-[#0B8843]" : "text-gray-400"}`}>
                        {showSupportProvided ? "Active" : "Deactive"}
                      </span>
                      <ToggleSwitch checked={showSupportProvided} onChange={setShowSupportProvided} />
                    </div>
                  </div>

                  <div className={showSupportProvided ? "space-y-2" : "space-y-2 opacity-40 pointer-events-none"}>
                    <div>
                      <Label value="Subtitle / Instruction Hint" className="text-[11px] font-medium text-gray-600 block mb-1" />
                      <TextInput
                        value={supportProvidedSubtitle}
                        onChange={(e) => setSupportProvidedSubtitle(e.target.value)}
                        placeholder="Interventions, guidance, techniques..."
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <Label value="Sample / Preview Body Text" className="text-[11px] font-medium text-gray-600 block mb-1" />
                      <Textarea
                        value={supportProvidedSample}
                        onChange={(e) => setSupportProvidedSample(e.target.value)}
                        rows={3}
                        className="text-xs text-gray-700 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. ACTIONS */}
                <div className="bg-gray-50/60 p-3.5 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-2.5">
                    <div className="flex-1">
                      <Label value="Section 3 Heading / Title" className="text-xs font-bold text-gray-700 block mb-1" />
                      <TextInput
                        value={actionsTitle}
                        onChange={(e) => setActionsTitle(e.target.value)}
                        placeholder="ACTIONS"
                        className="text-xs font-bold max-w-md"
                        disabled={!showActions}
                      />
                    </div>

                    <div 
                      className="flex items-center gap-2 select-none cursor-pointer pt-1 shrink-0"
                      onClick={() => setShowActions(!showActions)}
                    >
                      <span className={`text-[11px] font-bold ${showActions ? "text-[#0B8843]" : "text-gray-400"}`}>
                        {showActions ? "Active" : "Deactive"}
                      </span>
                      <ToggleSwitch checked={showActions} onChange={setShowActions} />
                    </div>
                  </div>

                  <div className={showActions ? "space-y-2" : "space-y-2 opacity-40 pointer-events-none"}>
                    <div>
                      <Label value="Subtitle / Instruction Hint" className="text-[11px] font-medium text-gray-600 block mb-1" />
                      <TextInput
                        value={actionsSubtitle}
                        onChange={(e) => setActionsSubtitle(e.target.value)}
                        placeholder="Specific steps the client has agreed..."
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <Label value="Sample / Preview Body Text" className="text-[11px] font-medium text-gray-600 block mb-1" />
                      <Textarea
                        value={actionsSample}
                        onChange={(e) => setActionsSample(e.target.value)}
                        rows={3}
                        className="text-xs text-gray-700 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. PRACTICE */}
                <div className="bg-gray-50/60 p-3.5 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-2.5">
                    <div className="flex-1">
                      <Label value="Section 4 Heading / Title" className="text-xs font-bold text-gray-700 block mb-1" />
                      <TextInput
                        value={practiceTitle}
                        onChange={(e) => setPracticeTitle(e.target.value)}
                        placeholder="PRACTICE"
                        className="text-xs font-bold max-w-md"
                        disabled={!showPractice}
                      />
                    </div>

                    <div 
                      className="flex items-center gap-2 select-none cursor-pointer pt-1 shrink-0"
                      onClick={() => setShowPractice(!showPractice)}
                    >
                      <span className={`text-[11px] font-bold ${showPractice ? "text-[#0B8843]" : "text-gray-400"}`}>
                        {showPractice ? "Active" : "Deactive"}
                      </span>
                      <ToggleSwitch checked={showPractice} onChange={setShowPractice} />
                    </div>
                  </div>

                  <div className={showPractice ? "space-y-2" : "space-y-2 opacity-40 pointer-events-none"}>
                    <div>
                      <Label value="Subtitle / Instruction Hint" className="text-[11px] font-medium text-gray-600 block mb-1" />
                      <TextInput
                        value={practiceSubtitle}
                        onChange={(e) => setPracticeSubtitle(e.target.value)}
                        placeholder="Exercises, skills, habits, or techniques..."
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <Label value="Sample / Preview Body Text" className="text-[11px] font-medium text-gray-600 block mb-1" />
                      <Textarea
                        value={practiceSample}
                        onChange={(e) => setPracticeSample(e.target.value)}
                        rows={3}
                        className="text-xs text-gray-700 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. NEXT SESSION */}
                <div className="bg-gray-50/60 p-3.5 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-2.5">
                    <div className="flex-1">
                      <Label value="Section 5 Heading / Title" className="text-xs font-bold text-gray-700 block mb-1" />
                      <TextInput
                        value={nextSessionTitle}
                        onChange={(e) => setNextSessionTitle(e.target.value)}
                        placeholder="NEXT SESSION"
                        className="text-xs font-bold max-w-md"
                        disabled={!showNextSession}
                      />
                    </div>

                    <div 
                      className="flex items-center gap-2 select-none cursor-pointer pt-1 shrink-0"
                      onClick={() => setShowNextSession(!showNextSession)}
                    >
                      <span className={`text-[11px] font-bold ${showNextSession ? "text-[#0B8843]" : "text-gray-400"}`}>
                        {showNextSession ? "Active" : "Deactive"}
                      </span>
                      <ToggleSwitch checked={showNextSession} onChange={setShowNextSession} />
                    </div>
                  </div>

                  <div className={showNextSession ? "space-y-2" : "space-y-2 opacity-40 pointer-events-none"}>
                    <div>
                      <Label value="Subtitle / Instruction Hint" className="text-[11px] font-medium text-gray-600 block mb-1" />
                      <TextInput
                        value={nextSessionSubtitle}
                        onChange={(e) => setNextSessionSubtitle(e.target.value)}
                        placeholder="Follow-up focus, topics to revisit..."
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <Label value="Sample / Preview Body Text" className="text-[11px] font-medium text-gray-600 block mb-1" />
                      <Textarea
                        value={nextSessionSample}
                        onChange={(e) => setNextSessionSample(e.target.value)}
                        rows={3}
                        className="text-xs text-gray-700 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* TAB 5: DISCLAIMERS & EMERGENCY SUPPORT */}
        {activeTab === "content" && (
          <Card className="shadow-sm border-gray-200">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
              <ShieldCheck size={18} className="text-[#0B8843]" /> Disclaimers & Emergency Support
            </h3>

            <div className="space-y-4 pt-1">
              {/* 1. Disclaimer Section */}
              <div className="bg-gray-50/60 p-3.5 rounded-xl border border-gray-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-2.5">
                  <div className="flex-1">
                    <Label value="Section 1 Heading / Title" className="text-xs font-bold text-gray-700 block mb-1" />
                    <TextInput
                      value={disclaimerTitle}
                      onChange={(e) => setDisclaimerTitle(e.target.value)}
                      placeholder="Online Advice Disclaimer"
                      className="text-xs font-semibold max-w-md"
                      disabled={!showDisclaimer}
                    />
                  </div>

                  <div 
                    className="flex items-center gap-2 select-none cursor-pointer pt-1 shrink-0"
                    onClick={() => setShowDisclaimer(!showDisclaimer)}
                  >
                    <span className={`text-[11px] font-bold ${showDisclaimer ? "text-[#0B8843]" : "text-gray-400"}`}>
                      {showDisclaimer ? "Active" : "Deactive"}
                    </span>
                    <ToggleSwitch checked={showDisclaimer} onChange={setShowDisclaimer} />
                  </div>
                </div>

                <div className={showDisclaimer ? "" : "opacity-40 pointer-events-none"}>
                  <Label value="Disclaimer Body / Description" className="text-[11px] font-medium text-gray-600 block mb-1" />
                  <Textarea
                    value={disclaimer}
                    onChange={(e) => setDisclaimer(e.target.value)}
                    rows={4}
                    placeholder="Enter disclaimer text..."
                    className="text-xs text-gray-700 leading-relaxed"
                  />
                </div>
              </div>

              {/* 2. Emergency Support Section */}
              <div className="bg-gray-50/60 p-3.5 rounded-xl border border-gray-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-2.5">
                  <div className="flex-1">
                    <Label value="Section 2 Heading / Title" className="text-xs font-bold text-gray-700 block mb-1" />
                    <TextInput
                      value={emergencySupportTitle}
                      onChange={(e) => setEmergencySupportTitle(e.target.value)}
                      placeholder="Emergency Support"
                      className="text-xs font-semibold max-w-md"
                      disabled={!showEmergencySupport}
                    />
                  </div>

                  <div 
                    className="flex items-center gap-2 select-none cursor-pointer pt-1 shrink-0"
                    onClick={() => setShowEmergencySupport(!showEmergencySupport)}
                  >
                    <span className={`text-[11px] font-bold ${showEmergencySupport ? "text-[#0B8843]" : "text-gray-400"}`}>
                      {showEmergencySupport ? "Active" : "Deactive"}
                    </span>
                    <ToggleSwitch checked={showEmergencySupport} onChange={setShowEmergencySupport} />
                  </div>
                </div>

                <div className={showEmergencySupport ? "" : "opacity-40 pointer-events-none"}>
                  <Label value="Emergency Support Instructions / Body Text" className="text-[11px] font-medium text-gray-600 block mb-1" />
                  <Textarea
                    value={emergencySupport}
                    onChange={(e) => setEmergencySupport(e.target.value)}
                    rows={3}
                    placeholder="Enter emergency support instructions..."
                    className="text-xs text-gray-700 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* TAB 5: OFFICE DETAILS & FOOTER */}
        {activeTab === "office" && (
          <Card className="shadow-sm border-gray-200">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
              <MapPin size={18} className="text-[#0B8843]" /> Letterhead Footer & Office Addresses
            </h3>

            {/* Master Footer Toggle */}
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200 mb-3">
              <div>
                <Label value="Show Letterhead Footer Strip" className="text-xs font-bold text-gray-800" />
                <p className="text-[11px] text-gray-500">Toggle the entire 3-column office address footer on or off.</p>
              </div>
              <div 
                className="flex items-center gap-2 select-none cursor-pointer"
                onClick={() => setShowFooterOffice(!showFooterOffice)}
              >
                <span className={`text-[11px] font-bold ${showFooterOffice ? "text-[#0B8843]" : "text-gray-400"}`}>
                  {showFooterOffice ? "Active" : "Deactive"}
                </span>
                <ToggleSwitch checked={showFooterOffice} onChange={setShowFooterOffice} />
              </div>
            </div>

            {showFooterOffice && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Company / Entity Name */}
                  <ToggleField
                    checked={showCompanyName}
                    onChange={setShowCompanyName}
                    label="Company / Entity Name"
                  >
                    <TextInput
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Good Mood Solutions"
                      className="text-xs font-semibold"
                    />
                  </ToggleField>

                  {/* Contact Email */}
                  <ToggleField
                    checked={showContactEmail}
                    onChange={setShowContactEmail}
                    label="Contact Email"
                  >
                    <TextInput
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="connect@goodmood.solutions"
                      className="text-xs"
                    />
                  </ToggleField>

                  {/* Official Website */}
                  <ToggleField
                    checked={showWebsite}
                    onChange={setShowWebsite}
                    label="Official Website"
                  >
                    <TextInput
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="goodmood.solutions"
                      className="text-xs"
                    />
                  </ToggleField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Registered Office Address */}
                  <ToggleField
                    checked={showRegOffice}
                    onChange={setShowRegOffice}
                    label="Registered Office Address"
                  >
                    <Textarea
                      value={regOffice}
                      onChange={(e) => setRegOffice(e.target.value)}
                      rows={3}
                      placeholder="136, Basunagar Gate No 1, Madhyamgram, Kolkata 700129"
                      className="text-xs"
                    />
                  </ToggleField>

                  {/* Corporate Office Address */}
                  <ToggleField
                    checked={showCorpOffice}
                    onChange={setShowCorpOffice}
                    label="Corporate Office Address"
                  >
                    <Textarea
                      value={corpOffice}
                      onChange={(e) => setCorpOffice(e.target.value)}
                      rows={3}
                      placeholder="MANI CASADONA IT BUILDING, Newtown, Kolkata - 700160, West Bengal, India"
                      className="text-xs"
                    />
                  </ToggleField>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Bottom Save & Preview Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <CheckCircle2 size={16} className="text-[#0B8843] shrink-0" />
            <span>Doctor App and User App will immediately sync with these settings</span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 flex-nowrap self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-xl text-xs md:text-sm font-semibold shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Eye size={16} className="text-[#0B8843] shrink-0" />
              <span className="whitespace-nowrap">Prescription Preview</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#0B8843] hover:bg-[#086a34] text-white rounded-xl text-xs md:text-sm font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <Save size={16} className="shrink-0" />
              <span className="whitespace-nowrap">{loading ? "Saving Changes..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODAL: PRESCRIPTION PREVIEW (PORTAL TO BODY TO COVER SIDEBAR & HEADER) ================= */}
      {showPreviewModal && createPortal(
        <div 
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 md:p-6 overflow-hidden"
          onClick={() => setShowPreviewModal(false)}
        >
          <div 
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[92vh] flex flex-col overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-200 shrink-0">
              <div className="flex items-center gap-2.5">
                <FileText size={20} className="text-[#0B8843]" />
                <h3 className="text-base md:text-lg font-bold text-gray-900">Prescription Preview</h3>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                >
                  <Printer size={14} /> Print
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center cursor-pointer transition-all"
                  title="Close Preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: Scrollable Original Size A4 Document */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-gray-200/80">
              <div
                ref={a4PrintRef}
                id="printable-a4-sheet"
                style={{
                  width: "100%",
                  maxWidth: "760px",
                  minHeight: "1075px",
                  aspectRatio: "1 / 1.414",
                }}
                className="relative bg-white shadow-2xl rounded-sm p-6 md:p-10 flex flex-col justify-between text-gray-800 border border-gray-300 my-auto overflow-hidden"
              >
                {/* Background Watermark with Opacity, Scale, Rotate, Position */}
                {showWatermark && (
                  <div
                    className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden"
                  >
                    <img
                      src={watermarkCustomUrl || smileLogo}
                      alt="Watermark"
                      style={{
                        position: "absolute",
                        left: `${watermarkPosX}%`,
                        top: `${watermarkPosY}%`,
                        transform: `translate(-50%, -50%) rotate(${watermarkRotate}deg)`,
                        width: `${watermarkSize}px`,
                        maxWidth: "96%",
                        opacity: watermarkOpacity,
                        objectFit: "contain",
                        userSelect: "none",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                )}

                {/* Main Document Content */}
                <div className="relative z-10 flex-1 flex flex-col">
                  {/* --- HEADER: Left Company Logo / Right Dynamic Doctor Details --- */}
                  <div className="flex justify-between items-start pb-4 border-b-2 border-[#0B8843]">
                    {/* Left: Logo & Subtitle */}
                    <div className="flex flex-col">
                      {showLogo && (
                        <img
                          src={logoPreview || defaultLogo}
                          alt="Company Logo"
                          className="h-11 md:h-12 w-auto object-contain object-left mb-1"
                        />
                      )}
                      {showTagline && (
                        <p className="text-[11px] font-medium text-gray-600 tracking-tight">
                          {appTagline}
                        </p>
                      )}
                    </div>

                    {/* Right: Dynamic Doctor Details */}
                    {showDoctorSection && (
                      <div className="text-right flex flex-col items-end">
                        {showDocName && (
                          <span className="text-base font-bold text-[#0B8843]">
                            {docName}
                          </span>
                        )}
                        {showDocDegree && (
                          <span className="text-[11px] text-gray-600 font-medium">
                            {docDegree}
                          </span>
                        )}
                        {showDocRole && (
                          <span className="text-[11px] text-gray-600 font-medium">
                            {docRole}
                          </span>
                        )}
                        {showDocRegNo && (
                          <span className="text-[11px] text-gray-500 font-medium">
                            {docRegNo}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* --- DOCUMENT TITLE & PATIENT INFO BAR --- */}
                  <div className="text-center my-4">
                    {showDocTitle && (
                      <h1 className="text-base font-extrabold text-[#0B8843] tracking-wide mb-1 uppercase">
                        {documentTitle}
                      </h1>
                    )}
                    {showPatientBar && (showPatientName || showPatientAge || showPatientGender) && (
                      <p className="text-xs md:text-sm font-semibold text-gray-800">
                        For: {showPatientName && <span className="text-black font-bold mr-1">{patientName}</span>}
                        {showPatientAge && <span className="mr-1">/ Age – {patientAge}</span>}
                        {showPatientGender && <span>/ Gender – {patientGender}</span>}
                      </p>
                    )}
                  </div>

                  {/* --- SESSION SUMMARY TITLE --- */}
                  {showSessionSummary && (
                    <div className="mb-2">
                      <h2 className="text-xs md:text-sm font-bold text-[#0B8843] uppercase tracking-wider">
                        {summaryTitle || "COUNSELLING SESSION SUMMARY"}
                      </h2>
                    </div>
                  )}

                  {/* --- 5 DYNAMIC CLINICAL SECTIONS --- */}
                  {showSessionSummary && (
                    <div className="space-y-2 text-[11px] leading-relaxed">
                      {/* 1. KEY FINDINGS */}
                      {showKeyFindings && (
                        <div className="bg-gray-50/70 p-2.5 rounded border border-gray-100">
                          <h3 className="font-bold text-[#0B8843] text-xs uppercase mb-0.5">
                            {keyFindingsTitle || "KEY FINDINGS"}
                          </h3>
                          {keyFindingsSubtitle && (
                            <p className="text-gray-500 text-[10px] mb-0.5 italic">
                              {keyFindingsSubtitle}
                            </p>
                          )}
                          <p className="text-gray-800 font-normal whitespace-pre-line">
                            {keyFindingsSample}
                          </p>
                        </div>
                      )}

                      {/* 2. SUPPORT PROVIDED */}
                      {showSupportProvided && (
                        <div className="bg-gray-50/70 p-2.5 rounded border border-gray-100">
                          <h3 className="font-bold text-[#0B8843] text-xs uppercase mb-0.5">
                            {supportProvidedTitle || "SUPPORT PROVIDED"}
                          </h3>
                          {supportProvidedSubtitle && (
                            <p className="text-gray-500 text-[10px] mb-0.5 italic">
                              {supportProvidedSubtitle}
                            </p>
                          )}
                          <p className="text-gray-800 font-normal whitespace-pre-line">
                            {supportProvidedSample}
                          </p>
                        </div>
                      )}

                      {/* 3. ACTIONS */}
                      {showActions && (
                        <div className="bg-gray-50/70 p-2.5 rounded border border-gray-100">
                          <h3 className="font-bold text-[#0B8843] text-xs uppercase mb-0.5">
                            {actionsTitle || "ACTIONS"}
                          </h3>
                          {actionsSubtitle && (
                            <p className="text-gray-500 text-[10px] mb-0.5 italic">
                              {actionsSubtitle}
                            </p>
                          )}
                          <p className="text-gray-800 font-normal whitespace-pre-line">
                            {actionsSample}
                          </p>
                        </div>
                      )}

                      {/* 4. PRACTICE */}
                      {showPractice && (
                        <div className="bg-gray-50/70 p-2.5 rounded border border-gray-100">
                          <h3 className="font-bold text-[#0B8843] text-xs uppercase mb-0.5">
                            {practiceTitle || "PRACTICE"}
                          </h3>
                          {practiceSubtitle && (
                            <p className="text-gray-500 text-[10px] mb-0.5 italic">
                              {practiceSubtitle}
                            </p>
                          )}
                          <p className="text-gray-800 font-normal whitespace-pre-line">
                            {practiceSample}
                          </p>
                        </div>
                      )}

                      {/* 5. NEXT SESSION */}
                      {showNextSession && (
                        <div className="bg-gray-50/70 p-2.5 rounded border border-gray-100">
                          <h3 className="font-bold text-[#0B8843] text-xs uppercase mb-0.5">
                            {nextSessionTitle || "NEXT SESSION"}
                          </h3>
                          {nextSessionSubtitle && (
                            <p className="text-gray-500 text-[10px] mb-0.5 italic">
                              {nextSessionSubtitle}
                            </p>
                          )}
                          <p className="text-gray-800 font-normal whitespace-pre-line">
                            {nextSessionSample}
                          </p>
                        </div>
                      )}

                      {/* --- IMPORTANT INFORMATION & DISCLAIMER --- */}
                      {(showDisclaimer || showEmergencySupport) && (
                        <div className="mt-3 bg-gray-50 p-3 rounded border border-gray-200 text-[10px] text-gray-600 leading-normal">
                          <h4 className="font-bold text-[#0B8843] uppercase text-[11px] mb-1">
                            IMPORTANT INFORMATION
                          </h4>
                          {showDisclaimer && (
                            <p className="mb-1">
                              <strong className="text-gray-800">{disclaimerTitle || "Online Advice Disclaimer"}: </strong>
                              {disclaimer}
                            </p>
                          )}
                          {showEmergencySupport && (
                            <p>
                              <strong className="text-gray-800">{emergencySupportTitle || "Emergency Support"}: </strong>
                              {emergencySupport}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* If Session Summary is disabled but Disclaimers are enabled */}
                  {!showSessionSummary && (showDisclaimer || showEmergencySupport) && (
                    <div className="mt-3 bg-gray-50 p-3 rounded border border-gray-200 text-[10px] text-gray-600 leading-normal">
                      <h4 className="font-bold text-[#0B8843] uppercase text-[11px] mb-1">
                        IMPORTANT INFORMATION
                      </h4>
                      {showDisclaimer && (
                        <p className="mb-1">
                          <strong className="text-gray-800">{disclaimerTitle || "Online Advice Disclaimer"}: </strong>
                          {disclaimer}
                        </p>
                      )}
                      {showEmergencySupport && (
                        <p>
                          <strong className="text-gray-800">{emergencySupportTitle || "Emergency Support"}: </strong>
                          {emergencySupport}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* --- OFFICIAL LETTERHEAD FOOTER (MATCHING APPLE PAGES DESIGN) --- */}
                {showFooterOffice && (showCompanyName || showContactEmail || showWebsite || showRegOffice || showCorpOffice) && (
                  <div className="relative z-10 pt-4 mt-auto">
                    {/* Orange dividing line */}
                    <div className="w-full h-[2.5px] bg-[#E28743] mb-3.5" />

                    {/* 3 Columns */}
                    <div className="grid grid-cols-3 gap-5 text-[10px] text-gray-600 pb-3.5">
                      {/* Col 1: Entity Name & Contact */}
                      {(showCompanyName || showContactEmail || showWebsite) && (
                        <div>
                          {showCompanyName && <h5 className="font-bold text-gray-900 text-[10.5px] mb-0.5">{companyName}</h5>}
                          {showContactEmail && <p className="text-gray-600 leading-tight">{contactEmail}</p>}
                          {showWebsite && <p className="text-gray-600 leading-tight font-normal">{website}</p>}
                        </div>
                      )}

                      {/* Col 2: Reg Office */}
                      {showRegOffice && (
                        <div>
                          <h5 className="font-bold text-gray-900 text-[10.5px] mb-0.5">Reg. Office Address:</h5>
                          <p className="text-gray-600 leading-snug whitespace-pre-line">{regOffice}</p>
                        </div>
                      )}

                      {/* Col 3: Corporate Office */}
                      {showCorpOffice && (
                        <div>
                          <h5 className="font-bold text-gray-900 text-[10.5px] mb-0.5">Corporate Office:</h5>
                          <p className="text-gray-600 leading-snug whitespace-pre-line">{corpOffice}</p>
                        </div>
                      )}
                    </div>

                    {/* Edge-to-Edge Solid Green Accent Strip across the bottom */}
                    <div className="-mx-6 md:-mx-10 -mb-6 md:-mb-10 h-4 md:h-5 bg-[#0B8843]" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ManagePrescription;
