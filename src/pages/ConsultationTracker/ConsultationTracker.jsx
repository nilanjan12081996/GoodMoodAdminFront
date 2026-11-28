import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Modal } from "flowbite-react";
import api from "../../store/Api";
import { refundTransaction } from "../../Reducer/TransactionHistorySlice";
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Eye,
    FileText,
    List,
    PhoneCall,
    PhoneMissed,
    PhoneOff,
    RefreshCw,
    RotateCcw,
    Search,
    ShieldCheck,
    UserCheck,
    Users,
    Video,
    WifiOff,
    X,
} from "lucide-react";

const REFUND_REASON_PRESETS = [
    "Expert did not initiate call during scheduled consultation",
    "Technical / network issue prevented consultation",
    "Appointment cancelled on patient's valid request",
];

const formatINR = (val) => {
    const num = Number(val || 0);
    return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getVerdictBadgeStyle = (severity) => {
    switch (severity) {
        case "GREEN":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "RED":
            return "bg-red-50 text-red-700 border-red-200";
        case "ORANGE":
            return "bg-orange-50 text-orange-700 border-orange-200";
        case "AMBER":
            return "bg-amber-50 text-amber-800 border-amber-200";
        case "BLUE":
            return "bg-blue-50 text-blue-700 border-blue-200";
        case "PURPLE":
            return "bg-purple-50 text-purple-700 border-purple-200";
        default:
            return "bg-gray-100 text-gray-600 border-gray-200";
    }
};

const formatEndReasonLabel = (reason) => {
    if (!reason) return "—";
    switch (reason) {
        case "PATIENT_ENDED":
            return "Ended by Patient ✓";
        case "DOCTOR_ENDED":
            return "Ended by Doctor";
        case "AUTO_COMPLETED":
            return "Full Timer Completed";
        case "PATIENT_DECLINED":
            return "Declined by Patient";
        case "NO_ANSWER":
            return "Patient Did Not Answer";
        case "NETWORK_DROP":
            return "Network Disconnected";
        default:
            return reason.replace(/_/g, " ");
    }
};

const extractTimePart = (ts) => {
    if (!ts) return "";
    const str = String(ts);
    return str.length >= 16 ? str.slice(11, 16) : str;
};

const ConsultationTracker = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [consultations, setConsultations] = useState([]);
    const [kpis, setKpis] = useState({
        totalScheduled: 0,
        completedCount: 0,
        doctorMissedCount: 0,
        doctorLateOrShortCount: 0,
        patientNoShowCount: 0,
        liveOrUpcomingCount: 0,
        prescriptionsGivenCount: 0,
    });

    const [activeTab, setActiveTab] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Timeline & Prescription Modal
    const [timelineModalOpen, setTimelineModalOpen] = useState(false);
    const [selectedConsultation, setSelectedConsultation] = useState(null);
    const [timelineLoading, setTimelineLoading] = useState(false);
    const [timelineData, setTimelineData] = useState({ events: [], prescription: null });

    // Direct 1-Click Refund Modal for Missed Sessions
    const [refundModalOpen, setRefundModalOpen] = useState(false);
    const [refundTarget, setRefundTarget] = useState(null);
    const [refundReason, setRefundReason] = useState(REFUND_REASON_PRESETS[0]);
    const [refundSubmitting, setRefundSubmitting] = useState(false);

    const fetchTracker = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);
            const qs = params.toString() ? `?${params.toString()}` : "";
            const res = await api.get(`goodmood/appointments/tracker${qs}`);
            const data = res?.data?.data || {};
            setConsultations(data.consultations || []);
            if (data.kpis) setKpis(data.kpis);
        } catch {
            // Keep existing state silently
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTracker();
    }, [startDate, endDate]);

    const openTimelineModal = async (row) => {
        setSelectedConsultation(row);
        setTimelineData({ events: [], prescription: row.prescriptionSummary || null });
        setTimelineModalOpen(true);
        setTimelineLoading(true);
        try {
            const res = await api.get(`goodmood/appointments/timeline/${row.appointmentId}`);
            const d = res?.data?.data || {};
            setTimelineData({
                events: d.events || [],
                prescription: d.prescription || row.prescriptionSummary || null,
            });
        } catch {
            // Fallback to summary already on row
        } finally {
            setTimelineLoading(false);
        }
    };

    const handleConfirmRefund = async () => {
        if (!refundTarget?.transactionDbId) return;
        setRefundSubmitting(true);
        try {
            const res = await dispatch(
                refundTransaction({
                    id: refundTarget.transactionDbId,
                    reason: refundReason,
                    mode: "AUTO",
                })
            );
            if (!res.error) {
                setRefundModalOpen(false);
                setRefundTarget(null);
                fetchTracker();
            }
        } finally {
            setRefundSubmitting(false);
        }
    };

    const filteredRows = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        return consultations.filter((c) => {
            if (activeTab === "DOCTOR_MISSED" && c.verdictCode !== "DOCTOR_MISSED") return false;
            if (
                activeTab === "LATE_OR_EARLY" &&
                !["DOCTOR_CALLED_LATE", "DOCTOR_ENDED_EARLY", "NETWORK_INCOMPLETE"].includes(c.verdictCode)
            )
                return false;
            if (activeTab === "PATIENT_NO_SHOW" && c.verdictCode !== "PATIENT_UNREACHABLE") return false;
            if (
                activeTab === "COMPLETED" &&
                !["COMPLETED_SMOOTHLY", "COMPLETED_PATIENT_ENDED"].includes(c.verdictCode)
            )
                return false;
            if (
                activeTab === "LIVE_UPCOMING" &&
                !["UPCOMING", "IN_WINDOW", "PATIENT_WAITING_LIVE", "CALLING_PATIENT", "IN_PROGRESS"].includes(
                    c.verdictCode
                )
            )
                return false;

            if (q) {
                const hay = `${c.patientName || ""} ${c.patientMobile || ""} ${c.doctorName || ""} ${
                    c.transactionCode || ""
                } ${c.appointmentId || ""}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [consultations, activeTab, searchTerm]);

    const tabs = [
        { key: "ALL", label: "All Schedules", count: consultations.length },
        { key: "DOCTOR_MISSED", label: "Doctor Missed (Refund)", count: kpis.doctorMissedCount },
        { key: "LATE_OR_EARLY", label: "Late / Short Call", count: kpis.doctorLateOrShortCount },
        { key: "PATIENT_NO_SHOW", label: "Patient No-Show", count: kpis.patientNoShowCount },
        { key: "COMPLETED", label: "Completed", count: kpis.completedCount },
        { key: "LIVE_UPCOMING", label: "Live / Upcoming", count: kpis.liveOrUpcomingCount },
    ];

    return (
        <div className="wrapper_area my-0 mx-auto h-[calc(100vh-104px)] max-h-full flex flex-col overflow-hidden p-4 rounded-2xl bg-white shadow-sm border border-gray-100 gap-3">
            {/* Top Header + Quick Switcher */}
            <div className="shrink-0 flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 pb-2.5 border-b border-gray-100">
                <div>
                    <h2 className="text-base font-bold text-gray-900 leading-tight">
                        Consultation &amp; Call Analytics Tracker
                    </h2>
                    <p className="text-gray-500 text-[11px]">
                        Track doctor call attempts, late joins, talk duration, reconnects, who cut the call &amp; prescription status
                    </p>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto shrink-0">
                    <div className="inline-flex p-1 rounded-xl bg-gray-100 border border-gray-200">
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0B8843] text-white shadow-xs whitespace-nowrap cursor-pointer"
                        >
                            <Activity size={13} />
                            Call Tracker
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/PatientsDirectory/patients")}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 whitespace-nowrap cursor-pointer"
                        >
                            <UserCheck size={13} />
                            Patients
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/TransactionHistory/14")}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 whitespace-nowrap cursor-pointer"
                        >
                            <List size={13} />
                            Payments &amp; Refunds
                        </button>
                    </div>

                    <button
                        onClick={fetchTracker}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg cursor-pointer whitespace-nowrap"
                    >
                        <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* 5 Compact KPI Cards */}
            <div className="shrink-0 grid grid-cols-2 lg:grid-cols-5 gap-2.5">
                <div className="py-2 px-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                            Total Schedules
                        </span>
                        <Video size={13} className="text-slate-600" />
                    </div>
                    <div className="text-lg font-black text-gray-900 mt-0.5">{kpis.totalScheduled}</div>
                    <div className="text-[10px] text-gray-500 truncate">
                        Advice Sent: {kpis.prescriptionsGivenCount}
                    </div>
                </div>

                <div className="py-2 px-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B8843]">
                            Completed Smoothly
                        </span>
                        <CheckCircle2 size={13} className="text-[#0B8843]" />
                    </div>
                    <div className="text-lg font-black text-[#0B8843] mt-0.5">{kpis.completedCount}</div>
                    <div className="text-[10px] text-gray-500 truncate">Safe to settle</div>
                </div>

                <div className="py-2 px-3 rounded-xl bg-red-50/70 border border-red-200">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                            Doctor Missed
                        </span>
                        <PhoneMissed size={13} className="text-red-600" />
                    </div>
                    <div className="text-lg font-black text-red-700 mt-0.5">{kpis.doctorMissedCount}</div>
                    <div className="text-[10px] text-red-600 truncate">0 calls made • Refund</div>
                </div>

                <div className="py-2 px-3 rounded-xl bg-amber-50/70 border border-amber-200">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                            Dr Late / Early Cut
                        </span>
                        <Clock size={13} className="text-amber-700" />
                    </div>
                    <div className="text-lg font-black text-amber-900 mt-0.5">
                        {kpis.doctorLateOrShortCount}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate">10m+ late or &lt;15m dr cut</div>
                </div>

                <div className="py-2 px-3 rounded-xl bg-blue-50/70 border border-blue-200 col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                            Patient No-Show
                        </span>
                        <PhoneOff size={13} className="text-blue-700" />
                    </div>
                    <div className="text-lg font-black text-blue-900 mt-0.5">{kpis.patientNoShowCount}</div>
                    <div className="text-[10px] text-gray-500 truncate">Dr called • Pt didn&apos;t pick up</div>
                </div>
            </div>

            {/* Tabs + Date & Search Filter Row */}
            <div className="shrink-0 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                                activeTab === tab.key
                                    ? "bg-[#0B8843] text-white shadow-xs"
                                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span
                                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                    activeTab === tab.key ? "bg-white/25 text-white" : "bg-gray-200/80 text-gray-700"
                                }`}
                            >
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-2 py-1 border border-gray-200 rounded-lg bg-gray-50 text-[11px] text-gray-700"
                        title="From Date"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-2 py-1 border border-gray-200 rounded-lg bg-gray-50 text-[11px] text-gray-700"
                        title="To Date"
                    />
                    {(startDate || endDate) && (
                        <button
                            onClick={() => {
                                setStartDate("");
                                setEndDate("");
                            }}
                            className="p-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 cursor-pointer"
                            title="Reset Dates"
                        >
                            <X size={12} />
                        </button>
                    )}

                    <div className="relative w-full sm:w-56">
                        <Search size={13} className="absolute left-2.5 top-2 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search patient, doctor, phone..."
                            className="w-full pl-8 pr-3 py-1 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white text-[11px] focus:outline-none focus:border-[#0B8843]"
                        />
                    </div>
                </div>
            </div>

            {/* Scrollable Consultation Table inside 100vh */}
            <div className="flex-1 min-h-0 w-full overflow-auto rounded-xl border border-gray-200 relative">
                <table className="w-full min-w-[1040px] text-left border-collapse">
                    <thead className="sticky top-0 z-20 bg-gray-50 shadow-[0_1px_0_0_#e5e7eb]">
                        <tr className="text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">
                            <th className="py-2.5 px-3 bg-gray-50">Slot &amp; Date</th>
                            <th className="py-2.5 px-3 bg-gray-50">Patient &amp; Expert</th>
                            <th className="py-2.5 px-3 bg-gray-50">Dr Calls &amp; Punctuality</th>
                            <th className="py-2.5 px-3 bg-gray-50">Talk Time &amp; Who Ended</th>
                            <th className="py-2.5 px-3 bg-gray-50">Advice / Rx</th>
                            <th className="py-2.5 px-3 bg-gray-50">Smart Verdict</th>
                            <th className="py-2.5 px-3 bg-gray-50">Payment</th>
                            <th className="py-2.5 px-3 text-right sticky right-0 z-30 bg-gray-50 shadow-[-1px_0_0_0_#e5e7eb]">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-[11px]">
                        {loading && filteredRows.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="py-12 text-center text-gray-400 font-medium">
                                    Loading consultation tracker...
                                </td>
                            </tr>
                        ) : filteredRows.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="py-12 text-center text-gray-400 font-medium">
                                    No scheduled consultations match the current filter.
                                </td>
                            </tr>
                        ) : (
                            filteredRows.map((c) => {
                                const canDirectRefund =
                                    c.verdictCode === "DOCTOR_MISSED" &&
                                    c.transactionStatus === "SUCCESS" &&
                                    c.isPaid === 0 &&
                                    c.transactionDbId;

                                return (
                                    <tr
                                        key={c.appointmentId}
                                        className="group bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
                                    >
                                        {/* Slot & Date */}
                                        <td className="py-2.5 px-3 align-middle">
                                            <div className="font-bold text-gray-900">{c.date || "—"}</div>
                                            <div className="text-[10px] text-gray-500">
                                                {c.timeSlot || c.timeOnly || "—"} • {c.callType}
                                            </div>
                                        </td>

                                        {/* Patient & Expert */}
                                        <td className="py-2.5 px-3 align-middle">
                                            <div className="font-bold text-gray-900">
                                                {c.patientName}
                                                <span className="text-gray-400 font-normal mx-1">→</span>
                                                <span className="text-gray-700">Dr. {c.doctorName}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-400">
                                                Pt: {c.patientMobile || "—"} • {c.categoryName}
                                            </div>
                                        </td>

                                        {/* Dr Calls & Punctuality + Patient Online */}
                                        <td className="py-2.5 px-3 align-middle">
                                            <div className="flex items-center gap-1.5">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                        c.doctorCallAttempts > 0 || c.doctorJoined
                                                            ? c.doctorLateMinutes >= 10
                                                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                            : "bg-gray-100 text-gray-500 border-gray-200"
                                                    }`}
                                                >
                                                    <PhoneCall size={10} />
                                                    {c.doctorCallAttempts > 0
                                                        ? `Dr Called ${c.doctorCallAttempts}x`
                                                        : c.doctorJoined
                                                        ? "Dr Joined"
                                                        : "0 Dr Calls"}
                                                </span>
                                                {c.doctorLateMinutes >= 5 && (
                                                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[9px] font-bold">
                                                        {c.doctorLateMinutes}m Late
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-gray-500 mt-0.5">
                                                {c.doctorFirstCallAt
                                                    ? `1st call: ${extractTimePart(c.doctorFirstCallAt)} • `
                                                    : ""}
                                                <span
                                                    className={
                                                        c.patientOnline
                                                            ? "text-emerald-700 font-semibold"
                                                            : "text-gray-400"
                                                    }
                                                >
                                                    {c.patientOnline
                                                        ? `Pt Online ✓${
                                                              c.patientReadyPings > 0
                                                                  ? ` (Pinged ${c.patientReadyPings}x)`
                                                                  : ""
                                                          }`
                                                        : "Pt Offline"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Talk Time & Who Ended */}
                                        <td className="py-2.5 px-3 align-middle">
                                            <div className="font-bold text-gray-900">
                                                {c.totalTalkSeconds > 0 ? c.talkDurationFormatted : "0m (Not Connected)"}
                                                {c.reconnectCount > 0 && (
                                                    <span className="ml-1.5 px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 text-[9px] font-semibold">
                                                        {c.reconnectCount} reconnect(s)
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-gray-500">
                                                {formatEndReasonLabel(c.lastEndReason)}
                                            </div>
                                        </td>

                                        {/* Advice / Prescription */}
                                        <td className="py-2.5 px-3 align-middle">
                                            {c.hasPrescription ? (
                                                <button
                                                    type="button"
                                                    onClick={() => openTimelineModal(c)}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[#0B8843] border border-emerald-200 text-[10px] font-bold cursor-pointer hover:bg-emerald-100"
                                                >
                                                    <FileText size={10} />
                                                    Advice Sent ✓
                                                </button>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold">
                                                    Not Sent
                                                </span>
                                            )}
                                        </td>

                                        {/* Smart Verdict */}
                                        <td className="py-2.5 px-3 align-middle">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getVerdictBadgeStyle(
                                                    c.verdictSeverity
                                                )}`}
                                            >
                                                {c.verdictLabel}
                                            </span>
                                            <div
                                                className="text-[10px] text-gray-500 max-w-[230px] truncate mt-0.5"
                                                title={c.verdictExplanation}
                                            >
                                                {c.verdictExplanation}
                                            </div>
                                        </td>

                                        {/* Payment / Settlement State */}
                                        <td className="py-2.5 px-3 align-middle">
                                            <div className="font-bold text-gray-900">
                                                {c.transactionPrice ? formatINR(c.transactionPrice) : "—"}
                                            </div>
                                            <div className="text-[10px]">
                                                {c.transactionStatus === "REFUNDED" ? (
                                                    <span className="text-purple-700 font-bold">Refunded</span>
                                                ) : c.isPaid === 1 ? (
                                                    <span className="text-emerald-700 font-bold">Settled ✓</span>
                                                ) : c.transactionStatus === "SUCCESS" ? (
                                                    <span className="text-amber-700 font-semibold">Pending Settle</span>
                                                ) : (
                                                    <span className="text-gray-400">{c.transactionStatus || "—"}</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-2.5 px-3 align-middle text-right sticky right-0 z-10 bg-white group-hover:bg-gray-50 shadow-[-1px_0_0_0_#f3f4f6]">
                                            <div className="inline-flex items-center justify-end gap-1.5">
                                                {canDirectRefund && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setRefundTarget(c);
                                                            setRefundReason(REFUND_REASON_PRESETS[0]);
                                                            setRefundModalOpen(true);
                                                        }}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold cursor-pointer"
                                                    >
                                                        <RotateCcw size={10} />
                                                        Refund
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => openTimelineModal(c)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[10px] font-semibold cursor-pointer"
                                                >
                                                    <Eye size={11} />
                                                    Timeline
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="shrink-0 flex items-center justify-between text-[11px] text-gray-500 pt-0.5">
                <span>
                    Showing <strong className="text-gray-900">{filteredRows.length}</strong> of{" "}
                    <strong className="text-gray-900">{consultations.length}</strong> consultations
                </span>
                <span>Rule: 45-min consultation (+10m grace) • Doctor initiates call</span>
            </div>

            {/* Call Timeline & Prescription Inspection Modal */}
            <Modal
                show={timelineModalOpen}
                onClose={() => setTimelineModalOpen(false)}
                size="2xl"
                dismissible
            >
                <Modal.Header>
                    Consultation Call Log &amp; Advice — #{selectedConsultation?.appointmentId}
                </Modal.Header>
                <Modal.Body>
                    {selectedConsultation && (
                        <div className="space-y-4 text-xs">
                            {/* Summary Strip */}
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div>
                                    <span className="text-[10px] uppercase text-gray-400 font-bold block">
                                        Patient
                                    </span>
                                    <span className="font-bold text-gray-900">
                                        {selectedConsultation.patientName}
                                    </span>
                                    <div className="text-[10px] text-gray-500">
                                        {selectedConsultation.patientMobile}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase text-gray-400 font-bold block">
                                        Expert
                                    </span>
                                    <span className="font-bold text-gray-900">
                                        Dr. {selectedConsultation.doctorName}
                                    </span>
                                    <div className="text-[10px] text-gray-500">
                                        {selectedConsultation.date} • {selectedConsultation.timeSlot}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase text-gray-400 font-bold block">
                                        Connected Talk Time
                                    </span>
                                    <span className="font-black text-[#0B8843] text-sm">
                                        {selectedConsultation.talkDurationFormatted}
                                    </span>
                                    <div className="text-[10px] text-gray-500">
                                        Dr Called: {selectedConsultation.doctorCallAttempts}x
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase text-gray-400 font-bold block">
                                        Verdict
                                    </span>
                                    <span
                                        className={`inline-flex mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getVerdictBadgeStyle(
                                            selectedConsultation.verdictSeverity
                                        )}`}
                                    >
                                        {selectedConsultation.verdictLabel}
                                    </span>
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 text-[11px] text-gray-800">
                                <strong>System Analysis:</strong> {selectedConsultation.verdictExplanation}
                            </div>

                            {/* Chronological Call Events Log */}
                            <div className="space-y-2">
                                <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[11px]">
                                    Chronological Call Events Timeline
                                </h4>
                                {timelineLoading ? (
                                    <div className="p-4 text-center text-gray-400">Loading call events...</div>
                                ) : timelineData.events.length === 0 ? (
                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 text-center">
                                        No granular call events were logged for this appointment yet.
                                    </div>
                                ) : (
                                    <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                                        {timelineData.events.map((ev, idx) => (
                                            <div
                                                key={ev.id || idx}
                                                className="px-3.5 py-2.5 flex items-start justify-between gap-3 bg-white"
                                            >
                                                <div className="flex items-start gap-2.5">
                                                    <span
                                                        className={`mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                                            ev.actor === "DOCTOR"
                                                                ? "bg-blue-100 text-blue-800"
                                                                : ev.actor === "PATIENT"
                                                                ? "bg-emerald-100 text-emerald-800"
                                                                : "bg-gray-100 text-gray-700"
                                                        }`}
                                                    >
                                                        {ev.actor}
                                                    </span>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">
                                                            {ev.note || ev.eventType}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="font-mono text-[10px] text-gray-400 shrink-0">
                                                    {ev.createdAt}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Prescription / Counselling Advice Section */}
                            <div className="space-y-2">
                                <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[11px]">
                                    Prescription / Counselling Advice Status
                                </h4>
                                {timelineData.prescription ? (
                                    <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                                        <div className="font-bold text-[#0B8843] flex items-center gap-1.5">
                                            <ShieldCheck size={14} />
                                            Advice Uploaded by Doctor ✓
                                        </div>
                                        {timelineData.prescription.keyFindings && (
                                            <div>
                                                <strong>Key Findings:</strong>{" "}
                                                {timelineData.prescription.keyFindings}
                                            </div>
                                        )}
                                        {timelineData.prescription.supportProvided && (
                                            <div>
                                                <strong>Support Provided:</strong>{" "}
                                                {timelineData.prescription.supportProvided}
                                            </div>
                                        )}
                                        {timelineData.prescription.actions && (
                                            <div>
                                                <strong>Actions:</strong> {timelineData.prescription.actions}
                                            </div>
                                        )}
                                        {timelineData.prescription.practice && (
                                            <div>
                                                <strong>Practice:</strong> {timelineData.prescription.practice}
                                            </div>
                                        )}
                                        {timelineData.prescription.nextSession && (
                                            <div>
                                                <strong>Next Session:</strong>{" "}
                                                {timelineData.prescription.nextSession}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-500">
                                        No prescription / counselling advice has been submitted for this session yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="flex justify-end">
                    <button
                        onClick={() => setTimelineModalOpen(false)}
                        className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 cursor-pointer"
                    >
                        Close
                    </button>
                </Modal.Footer>
            </Modal>

            {/* Quick Missed-Call Refund Modal */}
            <Modal show={refundModalOpen} onClose={() => setRefundModalOpen(false)} size="lg" dismissible>
                <Modal.Header>Refund Missed Consultation to Patient</Modal.Header>
                <Modal.Body>
                    {refundTarget && (
                        <div className="space-y-4 text-xs">
                            <div className="p-4 rounded-xl bg-red-50/60 border border-red-200 space-y-1.5">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Patient:</span>
                                    <span className="font-bold text-gray-900">{refundTarget.patientName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Missed By Expert:</span>
                                    <span className="font-bold text-gray-900">Dr. {refundTarget.doctorName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Call Verification:</span>
                                    <span className="font-bold text-red-700">{refundTarget.verdictLabel}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-red-200 text-sm">
                                    <span className="font-bold text-gray-900">Auto-Refund Amount:</span>
                                    <span className="font-black text-red-600">
                                        {formatINR(refundTarget.transactionPrice)}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 mb-1.5">
                                    Refund Message / Reason (sent dynamically to patient):
                                </label>
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {REFUND_REASON_PRESETS.map((p, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setRefundReason(p)}
                                            className={`px-2.5 py-1 rounded-md text-[10px] border cursor-pointer ${
                                                refundReason === p
                                                    ? "bg-gray-900 text-white border-gray-900"
                                                    : "bg-gray-100 text-gray-700 border-gray-200"
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    rows={2}
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#0B8843]"
                                />
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="flex justify-end gap-2">
                    <button
                        onClick={() => setRefundModalOpen(false)}
                        className="px-4 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmRefund}
                        disabled={refundSubmitting}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                        <RotateCcw size={13} />
                        {refundSubmitting ? "Refunding..." : "Confirm Auto-Refund"}
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ConsultationTracker;
