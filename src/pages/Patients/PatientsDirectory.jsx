import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "flowbite-react";
import api from "../../store/Api";
import {
    Activity,
    Calendar,
    CheckCircle2,
    Eye,
    FileText,
    IndianRupee,
    List,
    PhoneMissed,
    RefreshCw,
    Search,
    UserCheck,
    Users,
} from "lucide-react";

const formatINR = (val) => {
    const num = Number(val || 0);
    return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const PatientsDirectory = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("ALL");

    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [patientDetail, setPatientDetail] = useState(null);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const res = await api.get("goodmood/appointments/patients-directory");
            setPatients(res?.data?.data || []);
        } catch {
            // Keep existing state silently
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const openPatientHistory = async (p) => {
        setPatientDetail({
            userId: p.userId,
            fullName: p.fullName,
            email: p.email,
            mobile: p.mobile,
            sessions: [],
        });
        setHistoryModalOpen(true);
        setHistoryLoading(true);
        try {
            const res = await api.get(`goodmood/appointments/patients-directory/${p.userId}`);
            if (res?.data?.data) {
                setPatientDetail(res.data.data);
            }
        } catch {
            // Keep basic info
        } finally {
            setHistoryLoading(false);
        }
    };

    const stats = useMemo(() => {
        let withBookings = 0;
        let completedSessions = 0;
        let missedSessions = 0;
        let totalPaid = 0;
        patients.forEach((p) => {
            if (Number(p.totalBookings || 0) > 0) withBookings++;
            completedSessions += Number(p.completedSessions || 0);
            missedSessions += Number(p.doctorMissedSessions || 0);
            totalPaid += Number(p.totalPaidAmount || 0);
        });
        return {
            totalPatients: patients.length,
            withBookings,
            completedSessions,
            missedSessions,
            totalPaid,
        };
    }, [patients]);

    const filteredPatients = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        return patients.filter((p) => {
            if (activeFilter === "BOOKED" && Number(p.totalBookings || 0) === 0) return false;
            if (activeFilter === "MISSED" && Number(p.doctorMissedSessions || 0) === 0) return false;
            if (q) {
                const hay = `${p.fullName || ""} ${p.mobile || ""} ${p.email || ""} ${p.userId || ""}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [patients, activeFilter, searchTerm]);

    return (
        <div className="wrapper_area my-0 mx-auto h-[calc(100vh-104px)] max-h-full flex flex-col overflow-hidden p-4 rounded-2xl bg-white shadow-sm border border-gray-100 gap-3">
            {/* Top Header */}
            <div className="shrink-0 flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 pb-2.5 border-b border-gray-100">
                <div>
                    <h2 className="text-base font-bold text-gray-900 leading-tight">
                        Patients Directory &amp; Consultation History
                    </h2>
                    <p className="text-gray-500 text-[11px]">
                        Track every registered patient, their scheduled consultations, call outcomes, prescriptions &amp; refunds
                    </p>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto shrink-0">
                    <div className="inline-flex p-1 rounded-xl bg-gray-100 border border-gray-200">
                        <button
                            type="button"
                            onClick={() => navigate("/ConsultationTracker/tracker")}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 whitespace-nowrap cursor-pointer"
                        >
                            <Activity size={13} />
                            Call Tracker
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0B8843] text-white shadow-xs whitespace-nowrap cursor-pointer"
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
                        onClick={fetchPatients}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg cursor-pointer whitespace-nowrap"
                    >
                        <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* 4 KPI Cards */}
            <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div className="py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                            Total Patients
                        </span>
                        <Users size={13} className="text-slate-600" />
                    </div>
                    <div className="text-lg font-black text-gray-900 mt-0.5">{stats.totalPatients}</div>
                    <div className="text-[10px] text-gray-500">Registered in app</div>
                </div>

                <div className="py-2.5 px-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B8843]">
                            Active (Booked)
                        </span>
                        <CheckCircle2 size={13} className="text-[#0B8843]" />
                    </div>
                    <div className="text-lg font-black text-[#0B8843] mt-0.5">{stats.withBookings}</div>
                    <div className="text-[10px] text-gray-500">
                        {stats.completedSessions} completed sessions
                    </div>
                </div>

                <div className="py-2.5 px-3 rounded-xl bg-red-50/70 border border-red-200">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                            Missed by Doctor
                        </span>
                        <PhoneMissed size={13} className="text-red-600" />
                    </div>
                    <div className="text-lg font-black text-red-700 mt-0.5">{stats.missedSessions}</div>
                    <div className="text-[10px] text-gray-500">Across all patients</div>
                </div>

                <div className="py-2.5 px-3 rounded-xl bg-blue-50/70 border border-blue-200">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                            Total Patient Paid
                        </span>
                        <IndianRupee size={13} className="text-blue-700" />
                    </div>
                    <div className="text-lg font-black text-blue-900 mt-0.5">
                        {formatINR(stats.totalPaid)}
                    </div>
                    <div className="text-[10px] text-gray-500">Successful bookings</div>
                </div>
            </div>

            {/* Filter + Search */}
            <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                    {[
                        { key: "ALL", label: "All Patients", count: patients.length },
                        { key: "BOOKED", label: "Booked Consultations", count: stats.withBookings },
                        {
                            key: "MISSED",
                            label: "Affected by Doctor Miss",
                            count: patients.filter((p) => Number(p.doctorMissedSessions || 0) > 0).length,
                        },
                    ].map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setActiveFilter(t.key)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                                activeFilter === t.key
                                    ? "bg-[#0B8843] text-white"
                                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                            }`}
                        >
                            <span>{t.label}</span>
                            <span
                                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                    activeFilter === t.key ? "bg-white/25 text-white" : "bg-gray-200 text-gray-700"
                                }`}
                            >
                                {t.count}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:w-64">
                    <Search size={13} className="absolute left-2.5 top-2 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search patient name, mobile, email..."
                        className="w-full pl-8 pr-3 py-1 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white text-[11px] focus:outline-none focus:border-[#0B8843]"
                    />
                </div>
            </div>

            {/* Patients Table */}
            <div className="flex-1 min-h-0 w-full overflow-auto rounded-xl border border-gray-200 relative">
                <table className="w-full min-w-[860px] text-left border-collapse">
                    <thead className="sticky top-0 z-20 bg-gray-50 shadow-[0_1px_0_0_#e5e7eb]">
                        <tr className="text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">
                            <th className="py-2.5 px-3 bg-gray-50">Patient</th>
                            <th className="py-2.5 px-3 bg-gray-50">Contact</th>
                            <th className="py-2.5 px-3 bg-gray-50">Bookings</th>
                            <th className="py-2.5 px-3 bg-gray-50">Completed / Missed</th>
                            <th className="py-2.5 px-3 bg-gray-50">Advice / Rx</th>
                            <th className="py-2.5 px-3 bg-gray-50">Total Paid</th>
                            <th className="py-2.5 px-3 bg-gray-50">Last Schedule</th>
                            <th className="py-2.5 px-3 text-right sticky right-0 z-30 bg-gray-50 shadow-[-1px_0_0_0_#e5e7eb]">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-[11px]">
                        {loading && filteredPatients.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="py-12 text-center text-gray-400 font-medium">
                                    Loading patients directory...
                                </td>
                            </tr>
                        ) : filteredPatients.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="py-12 text-center text-gray-400 font-medium">
                                    No patients found.
                                </td>
                            </tr>
                        ) : (
                            filteredPatients.map((p) => (
                                <tr
                                    key={p.userId}
                                    className="group bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
                                >
                                    <td className="py-2.5 px-3 align-middle">
                                        <div className="font-bold text-gray-900">{p.fullName}</div>
                                        <div className="text-[10px] text-gray-400">ID #{p.userId}</div>
                                    </td>
                                    <td className="py-2.5 px-3 align-middle">
                                        <div className="font-semibold text-gray-800">{p.mobile || "—"}</div>
                                        <div className="text-[10px] text-gray-400">{p.email || "—"}</div>
                                    </td>
                                    <td className="py-2.5 px-3 align-middle">
                                        <span className="font-black text-gray-900 text-xs">{p.totalBookings}</span>
                                    </td>
                                    <td className="py-2.5 px-3 align-middle">
                                        <span className="text-emerald-700 font-bold">
                                            {p.completedSessions} done
                                        </span>
                                        {p.doctorMissedSessions > 0 && (
                                            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-red-50 text-red-700 text-[10px] font-bold">
                                                {p.doctorMissedSessions} dr missed
                                            </span>
                                        )}
                                        {p.patientNoShowSessions > 0 && (
                                            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold">
                                                {p.patientNoShowSessions} no-show
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-2.5 px-3 align-middle">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[#0B8843] text-[10px] font-bold">
                                            <FileText size={10} />
                                            {p.prescriptionsCount} Rx
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-3 align-middle">
                                        <div className="font-bold text-gray-900">
                                            {formatINR(p.totalPaidAmount)}
                                        </div>
                                        {Number(p.totalRefundedAmount || 0) > 0 && (
                                            <div className="text-[10px] text-purple-700 font-semibold">
                                                Refunded: {formatINR(p.totalRefundedAmount)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-2.5 px-3 align-middle text-gray-600">
                                        {p.lastSessionDate ? (
                                            <span className="inline-flex items-center gap-1">
                                                <Calendar size={11} className="text-gray-400" />
                                                {p.lastSessionDate}
                                            </span>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                    <td className="py-2.5 px-3 align-middle text-right sticky right-0 z-10 bg-white group-hover:bg-gray-50 shadow-[-1px_0_0_0_#f3f4f6]">
                                        <button
                                            type="button"
                                            onClick={() => openPatientHistory(p)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[10px] font-semibold cursor-pointer"
                                        >
                                            <Eye size={11} />
                                            History
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="shrink-0 flex items-center justify-between text-[11px] text-gray-500 pt-0.5">
                <span>
                    Showing <strong className="text-gray-900">{filteredPatients.length}</strong> of{" "}
                    <strong className="text-gray-900">{patients.length}</strong> patients
                </span>
                <span>Click History to inspect all consultations, calls &amp; prescriptions of a patient</span>
            </div>

            {/* Patient Consultation History Modal */}
            <Modal
                show={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                size="4xl"
                dismissible
            >
                <Modal.Header>
                    Patient Consultation History — {patientDetail?.fullName}
                </Modal.Header>
                <Modal.Body>
                    {patientDetail && (
                        <div className="space-y-4 text-xs">
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <span className="text-[10px] uppercase text-gray-400 font-bold block">
                                        Patient Name
                                    </span>
                                    <span className="font-bold text-gray-900">{patientDetail.fullName}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase text-gray-400 font-bold block">
                                        Mobile Number
                                    </span>
                                    <span className="font-bold text-gray-900">{patientDetail.mobile || "—"}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase text-gray-400 font-bold block">
                                        Email Address
                                    </span>
                                    <span className="font-bold text-gray-900">{patientDetail.email || "—"}</span>
                                </div>
                            </div>

                            {historyLoading ? (
                                <div className="py-10 text-center text-gray-400">
                                    Loading patient consultations...
                                </div>
                            ) : !patientDetail.sessions || patientDetail.sessions.length === 0 ? (
                                <div className="py-8 text-center rounded-xl bg-gray-50 border border-gray-200 text-gray-500">
                                    This patient has not booked any consultations yet.
                                </div>
                            ) : (
                                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase text-gray-600 font-bold">
                                            <tr>
                                                <th className="px-3 py-2">Date &amp; Slot</th>
                                                <th className="px-3 py-2">Expert</th>
                                                <th className="px-3 py-2">Dr Calls &amp; Talk Time</th>
                                                <th className="px-3 py-2">Verdict</th>
                                                <th className="px-3 py-2">Advice / Rx</th>
                                                <th className="px-3 py-2 text-right">Payment</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {patientDetail.sessions.map((s) => (
                                                <tr key={s.appointmentId} className="bg-white">
                                                    <td className="px-3 py-2">
                                                        <div className="font-bold text-gray-900">{s.date}</div>
                                                        <div className="text-[10px] text-gray-500">{s.timeSlot}</div>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <div className="font-semibold text-gray-900">
                                                            Dr. {s.doctorName}
                                                        </div>
                                                        <div className="text-[10px] text-gray-500">
                                                            {s.categoryName}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <div className="font-semibold text-gray-800">
                                                            Talked: {s.talkDurationFormatted}
                                                        </div>
                                                        <div className="text-[10px] text-gray-500">
                                                            Dr Called: {s.doctorCallAttempts}x
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <span className="font-bold text-gray-800">
                                                            {s.verdictLabel}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {s.hasPrescription ? (
                                                            <span className="text-[#0B8843] font-bold">
                                                                Sent ✓
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">Pending</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        <div className="font-bold text-gray-900">
                                                            {formatINR(s.transactionPrice)}
                                                        </div>
                                                        <div className="text-[10px] text-gray-500">
                                                            {s.transactionStatus === "REFUNDED"
                                                                ? "Refunded"
                                                                : s.isPaid === 1
                                                                ? "Settled ✓"
                                                                : "Paid"}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="flex justify-end">
                    <button
                        onClick={() => setHistoryModalOpen(false)}
                        className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 cursor-pointer"
                    >
                        Close
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default PatientsDirectory;
