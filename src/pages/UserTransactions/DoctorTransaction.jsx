import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    getAllDoctorTransactionTotals,
    settleSingleDoctor,
    clearDoctorTransactionMessage,
} from "../../Reducer/DoctorTransactionSlice";
import { getAllTransactions, toggleIsPaid } from "../../Reducer/TransactionHistorySlice";
import { getDoctor } from "../../Reducer/DoctorSlice";
import api from "../../store/Api";
import BankVerifySettleModal from "./BankVerifySettleModal";
import {
    Eye,
    Search,
    CheckCircle,
    Download,
    Send,
    ShieldCheck,
    AlertTriangle,
    FileText,
    Filter,
    X,
    Wallet,
    Building2,
    IndianRupee,
    RefreshCw,
    List,
    Users,
} from "lucide-react";
import { Modal } from "flowbite-react";
import { useNavigate, useParams } from "react-router-dom";

const formatINR = (val) => {
    const num = Number(val || 0);
    return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const DoctorTransaction = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    const { doctorTotals, loading, settling, message, error } = useSelector(
        (state) => state?.doctorTransaction
    );
    const { transactionHistory } = useSelector((state) => state?.transactionHistory);
    const { doctorsDetails } = useSelector((state) => state?.doctors);

    const [searchTerm, setSearchTerm] = useState("");
    const [defaultMainRate, setDefaultMainRate] = useState(0);
    const [bankMapByDoctorId, setBankMapByDoctorId] = useState({});
    const [batchSubmitting, setBatchSubmitting] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        month: "",
        year: "",
    });

    // Modals
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState(null);

    const [settleModalOpen, setSettleModalOpen] = useState(false);
    const [doctorToPay, setDoctorToPay] = useState(null);

    const [batchModalOpen, setBatchModalOpen] = useState(false);
    const [batchVerified, setBatchVerified] = useState(false);
    const [batchUtrPrefix, setBatchUtrPrefix] = useState("");

    const reloadAll = () => {
        dispatch(getAllDoctorTransactionTotals(filters));
        dispatch(getAllTransactions());
        dispatch(getDoctor());
    };

    useEffect(() => {
        reloadAll();
    }, [dispatch, filters]);

    // Load configured Main Category commission rate for fallback accuracy
    useEffect(() => {
        api.get("goodmood/support/category/list/parents")
            .then((res) => {
                const cats = (res?.data?.data || []).filter(
                    (c) => Number(c?.parentId ?? c?.parent_id ?? 0) === 0
                );
                return Promise.all(
                    cats.map((c) =>
                        api
                            .get(`goodmood/charges/get-charges/${c.id}`)
                            .then((r) => Number(r?.data?.data?.charge ?? 0))
                            .catch(() => 0)
                    )
                );
            })
            .then((rates) => {
                const activeRate = (rates || []).find((r) => r > 0);
                if (activeRate) setDefaultMainRate(activeRate);
            })
            .catch(() => {});
    }, []);

    // Fetch live Bank Account status for every relevant doctor via /goodmood/doctors/details/:id
    useEffect(() => {
        const docIds = new Set();
        (doctorTotals || []).forEach((d) => d?.doctorId && docIds.add(d.doctorId));
        (doctorsDetails?.data || []).forEach((d) => d?.id && docIds.add(d.id));
        const idsToFetch = Array.from(docIds).filter((dId) => bankMapByDoctorId[dId] === undefined);
        if (idsToFetch.length === 0) return;

        Promise.all(
            idsToFetch.map((dId) =>
                api
                    .get(`goodmood/doctors/details/${dId}`)
                    .then((res) => {
                        const list = res?.data?.data?.bankDetails || [];
                        const active =
                            list.find((b) => (b.status === undefined || b.status === 1) && b.isMain === 1) ||
                            list.find((b) => b.status === undefined || b.status === 1) ||
                            list[0];
                        return {
                            doctorId: dId,
                            bank: active
                                ? {
                                      accountHolderName: active.accountHolderName || "",
                                      bankName: active.bankName || "",
                                      accountNumber: active.accountOn || active.accountNumber || "",
                                      ifscCode: active.ifscCode || "",
                                      upiId: active.upi || active.upiId || "",
                                  }
                                : null,
                        };
                    })
                    .catch(() => ({ doctorId: dId, bank: null }))
            )
        ).then((results) => {
            setBankMapByDoctorId((prev) => {
                const next = { ...prev };
                results.forEach((r) => {
                    next[r.doctorId] = r.bank;
                });
                return next;
            });
        });
    }, [doctorTotals, doctorsDetails?.data]);

    useEffect(() => {
        if (message) {
            dispatch(clearDoctorTransactionMessage());
        }
    }, [message, dispatch]);

    // Merge backend Doctor Totals + Transaction History fallback (handles NULL is_paid on un-restarted server seamlessly!)
    const enrichedDoctors = useMemo(() => {
        const docsList = doctorsDetails?.data || [];
        const docByName = {};
        const docById = {};
        docsList.forEach((d) => {
            docById[d.id] = d;
            const nameKey = `${d.firstName || ""} ${d.lastName || ""}`.trim().toLowerCase();
            if (nameKey) docByName[nameKey] = d;
        });

        // Group SUCCESS transactions by doctor so we always have exact numbers even if backend wasn't restarted
        const txGroupByDocId = {};
        (transactionHistory || []).forEach((tx) => {
            if (tx.transactionStatus !== "SUCCESS") return;

            // Date filter check if filters applied
            const txDateStr = tx.appointmentDate || (tx.createdAt ? String(tx.createdAt).slice(0, 10) : "");
            if (filters.startDate && txDateStr && txDateStr < filters.startDate) return;
            if (filters.endDate && txDateStr && txDateStr > filters.endDate) return;
            if (filters.month && txDateStr && Number(txDateStr.slice(5, 7)) !== Number(filters.month)) return;
            if (filters.year && txDateStr && Number(txDateStr.slice(0, 4)) !== Number(filters.year)) return;

            const matchedDoc =
                (tx.doctorId && docById[tx.doctorId]) ||
                docByName[(tx.doctorName || "").trim().toLowerCase()];
            const dId = tx.doctorId || matchedDoc?.id || `name_${tx.doctorName}`;

            if (!txGroupByDocId[dId]) {
                txGroupByDocId[dId] = {
                    doctorId: typeof dId === "number" ? dId : null,
                    doctorName:
                        tx.doctorName ||
                        (matchedDoc ? `${matchedDoc.firstName || ""} ${matchedDoc.lastName || ""}`.trim() : "Expert"),
                    doctorMobile: matchedDoc?.mobile || "",
                    unpaidTxs: [],
                    paidTxs: [],
                };
            }

            const gross = Number(tx.transactionPrice || 0);
            const pct =
                tx.commissionPercentage !== undefined && tx.commissionPercentage !== null
                    ? Number(tx.commissionPercentage)
                    : defaultMainRate;
            const comm =
                tx.commissionAmount !== undefined && tx.commissionAmount !== null
                    ? Number(tx.commissionAmount)
                    : Number(((gross * pct) / 100).toFixed(2));
            const net =
                tx.doctorPayableAmount !== undefined && tx.doctorPayableAmount !== null
                    ? Number(tx.doctorPayableAmount)
                    : Math.max(0, Number((gross - comm).toFixed(2)));

            const detailObj = {
                id: tx.id,
                transactionId: tx.id,
                patientName: tx.userName || "Patient",
                transactionCode: tx.transactionCode,
                date: txDateStr,
                totalAmount: gross,
                platformPercentage: pct,
                platformChargeAmount: comm,
                payoutAmount: net,
                supportCategoryName: tx.mainCategoryName || "Consultation",
                settlementUtr: tx.settlementUtr,
            };

            if (tx.isPaid === 1) {
                txGroupByDocId[dId].paidTxs.push(detailObj);
            } else {
                txGroupByDocId[dId].unpaidTxs.push(detailObj);
            }
        });

        // Combine backend doctorTotals + txGroupByDocId
        const allKeys = new Set([
            ...(doctorTotals || []).map((d) => d.doctorId),
            ...Object.keys(txGroupByDocId).map((k) => (isNaN(Number(k)) ? k : Number(k))),
        ]);

        const merged = [];
        allKeys.forEach((key) => {
            const backendRow = (doctorTotals || []).find((d) => d.doctorId === key);
            const fallbackGrp = txGroupByDocId[key];
            const docMeta = typeof key === "number" ? docById[key] : null;
            const liveBank = typeof key === "number" ? bankMapByDoctorId[key] : null;

            const useBackendNumbers =
                backendRow &&
                (Number(backendRow.unpaidTransactionCount || 0) > 0 ||
                    Number(backendRow.paidTransactionCount || 0) > 0);

            const unpaidList = useBackendNumbers
                ? backendRow.unpaidTransactions || []
                : fallbackGrp?.unpaidTxs || [];
            const paidList = useBackendNumbers
                ? backendRow.paidTransactions || []
                : fallbackGrp?.paidTxs || [];

            const unpaidCount = useBackendNumbers
                ? Number(backendRow.unpaidTransactionCount || 0)
                : unpaidList.length;
            const unpaidGross = useBackendNumbers
                ? Number(backendRow.unpaidAmount || 0)
                : unpaidList.reduce((s, t) => s + t.totalAmount, 0);
            const unpaidComm = useBackendNumbers
                ? Number(backendRow.platformCharges || 0)
                : unpaidList.reduce((s, t) => s + t.platformChargeAmount, 0);
            const unpaidNet = useBackendNumbers
                ? Number(backendRow.payableAmount || 0)
                : unpaidList.reduce((s, t) => s + t.payoutAmount, 0);

            const paidCount = useBackendNumbers
                ? Number(backendRow.paidTransactionCount || 0)
                : paidList.length;
            const paidNet = useBackendNumbers
                ? Number(backendRow.paidNetAmount ?? backendRow.paidAmount ?? 0)
                : paidList.reduce((s, t) => s + t.payoutAmount, 0);

            const pct =
                unpaidGross > 0
                    ? Number(((unpaidComm * 100) / unpaidGross).toFixed(2))
                    : Number(backendRow?.platformPercentage || defaultMainRate || 0);

            const bankObj = liveBank || {
                accountHolderName: backendRow?.accountHolderName || "",
                bankName: backendRow?.bankName || "",
                accountNumber: backendRow?.accountNumber || "",
                ifscCode: backendRow?.ifscCode || "",
                upiId: backendRow?.upiId || "",
            };
            const hasValidBank = Boolean(
                (bankObj?.accountNumber &&
                    String(bankObj.accountNumber).trim() !== "" &&
                    bankObj?.ifscCode &&
                    String(bankObj.ifscCode).trim() !== "") ||
                    (bankObj?.upiId && String(bankObj.upiId).trim() !== "")
            );

            if (unpaidCount === 0 && paidCount === 0 && !backendRow) return;

            merged.push({
                doctorId: typeof key === "number" ? key : backendRow?.doctorId,
                doctorName:
                    backendRow?.doctorName ||
                    fallbackGrp?.doctorName ||
                    (docMeta ? `${docMeta.firstName || ""} ${docMeta.lastName || ""}`.trim() : "Expert"),
                doctorMobile: backendRow?.doctorMobile || docMeta?.mobile || fallbackGrp?.doctorMobile || "",
                unpaidCount,
                unpaidGross,
                unpaidComm,
                unpaidNet,
                paidCount,
                paidNet,
                platformPercentage: pct,
                hasBankDetails: hasValidBank,
                bankChecking: typeof key === "number" && bankMapByDoctorId[key] === undefined,
                bankInfo: bankObj,
                unpaidTransactions: unpaidList,
                paidTransactions: paidList,
            });
        });

        merged.sort((a, b) => b.unpaidNet - a.unpaidNet);
        return merged;
    }, [doctorTotals, transactionHistory, doctorsDetails?.data, bankMapByDoctorId, defaultMainRate, filters]);

    const rows = useMemo(() => {
        if (!searchTerm.trim()) return enrichedDoctors;
        const q = searchTerm.toLowerCase().trim();
        return enrichedDoctors.filter(
            (d) =>
                (d.doctorName || "").toLowerCase().includes(q) ||
                (d.doctorMobile || "").toLowerCase().includes(q) ||
                (d.bankInfo?.bankName || "").toLowerCase().includes(q) ||
                (d.bankInfo?.upiId || "").toLowerCase().includes(q)
        );
    }, [enrichedDoctors, searchTerm]);

    const selectedDoctor = useMemo(() => {
        if (!selectedDoctorId) return null;
        return enrichedDoctors.find((d) => d.doctorId === selectedDoctorId) || null;
    }, [selectedDoctorId, enrichedDoctors]);

    const overview = useMemo(() => {
        let pendingDoctors = 0;
        let bankVerifiedPendingDoctors = 0;
        let pendingSessions = 0;
        let pendingNetTotal = 0;
        let verifiedNetTotal = 0;
        let totalCommission = 0;
        let totalSettledNet = 0;
        let totalSettledSessions = 0;

        enrichedDoctors.forEach((d) => {
            if (d.unpaidCount > 0) {
                pendingDoctors += 1;
                pendingSessions += d.unpaidCount;
                pendingNetTotal += d.unpaidNet;
                totalCommission += d.unpaidComm;
                if (d.hasBankDetails) {
                    bankVerifiedPendingDoctors += 1;
                    verifiedNetTotal += d.unpaidNet;
                }
            }
            totalSettledNet += d.paidNet;
            totalSettledSessions += d.paidCount;
        });

        return {
            pendingDoctors,
            bankVerifiedPendingDoctors,
            pendingSessions,
            pendingNetTotal,
            verifiedNetTotal,
            totalCommission,
            totalSettledNet,
            totalSettledSessions,
        };
    }, [enrichedDoctors]);

    const handleExportBankCSV = () => {
        const docsToExport = enrichedDoctors.filter((d) => d.unpaidCount > 0);
        if (docsToExport.length === 0) {
            return;
        }

        const headers = [
            "Doctor ID",
            "Expert Name",
            "Mobile",
            "Bank Status",
            "Pending Sessions",
            "Gross Amount (INR)",
            "Platform Commission (INR)",
            "Net Payout Amount (INR)",
            "Account Holder Name",
            "Bank Name",
            "Account Number",
            "IFSC Code",
            "UPI ID",
        ];

        const csvRows = [
            headers.join(","),
            ...docsToExport.map((d) =>
                [
                    d.doctorId || "",
                    `"${(d.doctorName || "").replace(/"/g, '""')}"`,
                    `"${d.doctorMobile || ""}"`,
                    d.hasBankDetails ? "VERIFIED" : "BANK_MISSING",
                    d.unpaidCount,
                    d.unpaidGross.toFixed(2),
                    d.unpaidComm.toFixed(2),
                    d.unpaidNet.toFixed(2),
                    `"${(d.bankInfo?.accountHolderName || "").replace(/"/g, '""')}"`,
                    `"${(d.bankInfo?.bankName || "").replace(/"/g, '""')}"`,
                    `"${d.bankInfo?.accountNumber || ""}"`,
                    `"${d.bankInfo?.ifscCode || ""}"`,
                    `"${d.bankInfo?.upiId || ""}"`,
                ].join(",")
            ),
        ];

        const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `GoodMood_Doctor_Settlements_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const settleDoctorWithFallback = async (doc, utr, mode = "BANK_TRANSFER") => {
        // Try new batch doctor endpoint first; if backend hasn't been restarted yet, settle each unpaid transaction cleanly
        const res = await dispatch(
            settleSingleDoctor({
                doctorId: doc.doctorId,
                mode,
                utr,
            })
        );
        if (res.error && doc.unpaidTransactions?.length > 0) {
            for (const tx of doc.unpaidTransactions) {
                const txId = tx.id || tx.transactionId;
                if (txId) {
                    await dispatch(toggleIsPaid({ id: txId, utr, mode }));
                }
            }
            dispatch(clearDoctorTransactionMessage());
        }
    };

    const handleConfirmSingleDoctorSettle = async ({ utr, mode }) => {
        if (!doctorToPay) return;
        await settleDoctorWithFallback(doctorToPay, utr, mode);
        setSettleModalOpen(false);
        setDoctorToPay(null);
        reloadAll();
    };

    const handleConfirmBatchSettle = async () => {
        const eligible = enrichedDoctors.filter((d) => d.unpaidCount > 0 && d.hasBankDetails);
        if (eligible.length === 0) return;

        setBatchSubmitting(true);
        try {
            for (const doc of eligible) {
                const ref = batchUtrPrefix
                    ? `${batchUtrPrefix.trim()}_DOC${doc.doctorId}`
                    : `GMPAY${new Date().toISOString().slice(2, 10).replace(/-/g, "")}D${doc.doctorId}`;
                await settleDoctorWithFallback(doc, ref);
            }
            setBatchModalOpen(false);
            setBatchVerified(false);
            setBatchUtrPrefix("");
            reloadAll();
        } finally {
            setBatchSubmitting(false);
        }
    };

    const handleGeneratePDF = async () => {
        const element = document.getElementById("transaction-modal-content");
        if (!element) return;
        const html2pdf = (await import("html2pdf.js/dist/html2pdf.bundle.min.js")).default;
        html2pdf()
            .from(element)
            .set({
                margin: [10, 10, 10, 10],
                filename: `${selectedDoctor?.doctorName || "Expert"}_Settlement_Statement.pdf`,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            })
            .save();
    };

    const months = [
        { value: "1", label: "January" },
        { value: "2", label: "February" },
        { value: "3", label: "March" },
        { value: "4", label: "April" },
        { value: "5", label: "May" },
        { value: "6", label: "June" },
        { value: "7", label: "July" },
        { value: "8", label: "August" },
        { value: "9", label: "September" },
        { value: "10", label: "October" },
        { value: "11", label: "November" },
        { value: "12", label: "December" },
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

    return (
        <div className="wrapper_area my-0 mx-auto h-[calc(100vh-104px)] max-h-full flex flex-col overflow-hidden p-4 rounded-2xl bg-white shadow-sm border border-gray-100 gap-3">
            {/* Identical Top Header + Same Switcher Tabs as TransactionUser */}
            <div className="shrink-0 flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 pb-2.5 border-b border-gray-100">
                <div>
                    <h2 className="text-base font-bold text-gray-900 leading-tight">
                        Payments, Settlements &amp; Refunds
                    </h2>
                    <p className="text-gray-500 text-[11px]">
                        Check expert&apos;s bank account / UPI first, then settle pending payouts individually or all at once
                    </p>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto shrink-0">
                    {/* Identical 2-View Switcher */}
                    <div className="inline-flex p-1 rounded-xl bg-gray-100 border border-gray-200">
                        <button
                            type="button"
                            onClick={() => navigate(`/TransactionHistory/${id || 14}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 whitespace-nowrap cursor-pointer transition-all"
                        >
                            <List size={13} />
                            All Transactions
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0B8843] text-white shadow-xs whitespace-nowrap cursor-pointer"
                        >
                            <Users size={13} />
                            Doctor Settlements
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/ConsultationTracker/tracker")}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 whitespace-nowrap cursor-pointer transition-all"
                        >
                            Call Tracker
                        </button>
                    </div>

                    <button
                        onClick={handleExportBankCSV}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-xs font-bold text-blue-800 cursor-pointer whitespace-nowrap"
                    >
                        <Download size={13} />
                        Bank CSV
                    </button>

                    <button
                        onClick={() => {
                            setBatchVerified(false);
                            setBatchModalOpen(true);
                        }}
                        disabled={overview.bankVerifiedPendingDoctors === 0 || settling || batchSubmitting}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0B8843] hover:bg-black disabled:opacity-40 text-white text-xs font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap"
                        title="Settle all doctors who have verified bank accounts"
                    >
                        <Send size={13} />
                        Settle All Verified ({overview.bankVerifiedPendingDoctors})
                    </button>

                    <button
                        onClick={reloadAll}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-700 cursor-pointer whitespace-nowrap"
                    >
                        <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* 4 Compact Summary Cards */}
            <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div className="py-2.5 px-3 rounded-xl bg-amber-50/60 border border-amber-200">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 whitespace-nowrap">
                            Total Pending Payout
                        </span>
                        <div className="p-1 rounded-md bg-amber-100 text-amber-700 shrink-0">
                            <IndianRupee size={13} />
                        </div>
                    </div>
                    <div className="text-lg font-black text-gray-900 mt-0.5 whitespace-nowrap leading-tight">
                        {formatINR(overview.pendingNetTotal)}
                    </div>
                    <div className="text-[10px] text-gray-600 truncate">
                        {overview.pendingDoctors} doctors • {overview.pendingSessions} sessions
                    </div>
                </div>

                <div className="py-2.5 px-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B8843] whitespace-nowrap">
                            Bank Verified &amp; Ready
                        </span>
                        <div className="p-1 rounded-md bg-emerald-100 text-[#0B8843] shrink-0">
                            <Building2 size={13} />
                        </div>
                    </div>
                    <div className="text-lg font-black text-[#0B8843] mt-0.5 whitespace-nowrap leading-tight">
                        {formatINR(overview.verifiedNetTotal)}
                    </div>
                    <div className="text-[10px] text-gray-600 truncate">
                        {overview.bankVerifiedPendingDoctors} of {overview.pendingDoctors} have bank added
                    </div>
                </div>

                <div className="py-2.5 px-3 rounded-xl bg-blue-50/50 border border-blue-200">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 whitespace-nowrap">
                            Platform Commission
                        </span>
                        <div className="p-1 rounded-md bg-blue-100 text-blue-700 shrink-0">
                            <ShieldCheck size={13} />
                        </div>
                    </div>
                    <div className="text-lg font-black text-blue-800 mt-0.5 whitespace-nowrap leading-tight">
                        {formatINR(overview.totalCommission)}
                    </div>
                    <div className="text-[10px] text-gray-600 truncate">
                        Main Category % share
                    </div>
                </div>

                <div className="py-2.5 px-3 rounded-xl bg-teal-50/50 border border-teal-200">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 whitespace-nowrap">
                            Already Settled
                        </span>
                        <div className="p-1 rounded-md bg-teal-100 text-teal-700 shrink-0">
                            <Wallet size={13} />
                        </div>
                    </div>
                    <div className="text-lg font-black text-teal-800 mt-0.5 whitespace-nowrap leading-tight">
                        {formatINR(overview.totalSettledNet)}
                    </div>
                    <div className="text-[10px] text-gray-600 truncate">
                        {overview.totalSettledSessions} settled sessions
                    </div>
                </div>
            </div>

            {/* Important Admin Rule Caution Strip */}
            <div className="shrink-0 py-2 px-3 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center gap-2 text-[11px] text-amber-950">
                <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                <span className="truncate">
                    <strong>Note:</strong> Refund any missed (No-Show) session from <em>All Transactions</em> <strong>before</strong> settling — once marked <strong>Settled ✓</strong>, customer Refund is locked to prevent double loss.
                </span>
            </div>

            {/* Compact Filter + Search Bar */}
            <div className="shrink-0 bg-gray-50 py-2 px-3 rounded-xl border border-gray-200 flex flex-wrap lg:flex-nowrap items-center justify-between gap-2">
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 flex-1 min-w-0">
                    <span className="inline-flex items-center gap-1 text-gray-600 font-bold text-[10px] uppercase tracking-wider whitespace-nowrap shrink-0">
                        <Filter size={12} /> Date Filter:
                    </span>
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters((p) => ({ ...p, startDate: e.target.value }))}
                        className="px-2 py-1 border border-gray-300 rounded-lg bg-white text-[11px] text-gray-700"
                    />
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters((p) => ({ ...p, endDate: e.target.value }))}
                        className="px-2 py-1 border border-gray-300 rounded-lg bg-white text-[11px] text-gray-700"
                    />
                    <select
                        value={filters.month}
                        onChange={(e) => setFilters((p) => ({ ...p, month: e.target.value }))}
                        className="px-2 py-1 border border-gray-300 rounded-lg bg-white text-[11px] text-gray-700"
                    >
                        <option value="">All Months</option>
                        {months.map((m) => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filters.year}
                        onChange={(e) => setFilters((p) => ({ ...p, year: e.target.value }))}
                        className="px-2 py-1 border border-gray-300 rounded-lg bg-white text-[11px] text-gray-700"
                    >
                        <option value="">All Years</option>
                        {years.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                    {(filters.startDate || filters.endDate || filters.month || filters.year) && (
                        <button
                            onClick={() => setFilters({ startDate: "", endDate: "", month: "", year: "" })}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-[10px] font-semibold text-gray-700 cursor-pointer whitespace-nowrap"
                        >
                            <X size={11} /> Reset
                        </button>
                    )}
                </div>

                <div className="relative w-full lg:w-64 shrink-0">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <Search size={13} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search doctor, bank or UPI..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-8 pr-3 py-1 border border-gray-300 rounded-lg bg-white text-[11px] focus:outline-none focus:border-[#0B8843]"
                    />
                </div>
            </div>

            {/* Doctor Settlements Table — Internal Scroll within 100vh */}
            <div className="flex-1 min-h-0 w-full overflow-auto rounded-xl border border-gray-200 relative">
                <table className="w-full min-w-[820px] text-left border-collapse">
                    <thead className="sticky top-0 z-20 bg-gray-50 shadow-[0_1px_0_0_#e5e7eb]">
                        <tr className="text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">
                            <th className="py-2.5 px-3 bg-gray-50">Doctor Name</th>
                            <th className="py-2.5 px-3 bg-gray-50">Bank / UPI Verification</th>
                            <th className="py-2.5 px-3 bg-gray-50">Pending Gross</th>
                            <th className="py-2.5 px-3 bg-gray-50">Commission</th>
                            <th className="py-2.5 px-3 bg-gray-50">Net Payable</th>
                            <th className="py-2.5 px-3 bg-gray-50">Settled</th>
                            <th className="py-2.5 px-3 text-right sticky right-0 z-30 bg-gray-50 shadow-[-1px_0_0_0_#e5e7eb]">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-[11px]">
                        {loading && rows.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                                    Loading doctor settlements...
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                                    No doctor settlement records found.
                                </td>
                            </tr>
                        ) : (
                            rows.map((doc, idx) => {
                                const hasPending = doc.unpaidCount > 0;

                                return (
                                    <tr
                                        key={doc.doctorId || idx}
                                        className="group bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
                                    >
                                        {/* Doctor Name */}
                                        <td className="py-2.5 px-3 align-middle">
                                            <div className="font-bold text-xs text-gray-900">
                                                Dr. {doc.doctorName}
                                            </div>
                                            {doc.doctorMobile && (
                                                <div className="text-[10px] text-gray-400">{doc.doctorMobile}</div>
                                            )}
                                        </td>

                                        {/* Bank Account Check Column */}
                                        <td className="py-2.5 px-3 align-middle">
                                            {doc.bankChecking ? (
                                                <span className="text-[10px] text-gray-400 animate-pulse">
                                                    Checking bank...
                                                </span>
                                            ) : doc.hasBankDetails ? (
                                                <div>
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                                                        <CheckCircle size={10} />
                                                        {doc.bankInfo?.bankName || "UPI / Bank"} Available
                                                    </span>
                                                    <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                                                        {doc.bankInfo?.accountNumber
                                                            ? `A/C: ••••${String(doc.bankInfo.accountNumber).slice(-4)}`
                                                            : `UPI: ${doc.bankInfo?.upiId}`}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold">
                                                    <AlertTriangle size={10} />
                                                    No Bank Account
                                                </span>
                                            )}
                                        </td>

                                        {/* Pending Gross */}
                                        <td className="py-2.5 px-3 align-middle">
                                            <div className="font-semibold text-xs text-gray-800">
                                                {formatINR(doc.unpaidGross)}
                                            </div>
                                            <div className="text-[10px] text-gray-400">
                                                {doc.unpaidCount} pending session(s)
                                            </div>
                                        </td>

                                        {/* Commission */}
                                        <td className="py-2.5 px-3 align-middle">
                                            <div className="font-bold text-xs text-blue-700">
                                                -{formatINR(doc.unpaidComm)}
                                            </div>
                                            <div className="text-[10px] text-gray-400">
                                                {doc.platformPercentage}% rate
                                            </div>
                                        </td>

                                        {/* Net Payable */}
                                        <td className="py-2.5 px-3 align-middle">
                                            <div
                                                className={`text-sm font-black ${
                                                    hasPending ? "text-[#0B8843]" : "text-gray-400"
                                                }`}
                                            >
                                                {formatINR(doc.unpaidNet)}
                                            </div>
                                        </td>

                                        {/* Already Settled */}
                                        <td className="py-2.5 px-3 align-middle">
                                            <div className="font-bold text-xs text-gray-700">
                                                {formatINR(doc.paidNet)}
                                            </div>
                                            <div className="text-[10px] text-gray-400">
                                                {doc.paidCount} settled
                                            </div>
                                        </td>

                                        {/* Identical Actions: Settle (opens Bank Check Modal!) + Details */}
                                        <td className="py-2.5 px-3 align-middle text-right sticky right-0 z-10 bg-white group-hover:bg-gray-50 shadow-[-1px_0_0_0_#f3f4f6]">
                                            <div className="inline-flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => {
                                                        setDoctorToPay(doc);
                                                        setSettleModalOpen(true);
                                                    }}
                                                    disabled={!hasPending}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer disabled:opacity-35 ${
                                                        hasPending && doc.hasBankDetails
                                                            ? "bg-[#0B8843] hover:bg-black text-white"
                                                            : hasPending && !doc.hasBankDetails
                                                            ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300"
                                                            : "bg-gray-100 text-gray-400"
                                                    }`}
                                                >
                                                    <Send size={11} />
                                                    Settle
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setSelectedDoctorId(doc.doctorId);
                                                        setDetailModalOpen(true);
                                                    }}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[10px] font-semibold cursor-pointer"
                                                >
                                                    <Eye size={12} /> Details
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

            {/* Footer Count */}
            <div className="shrink-0 flex items-center justify-between text-[11px] text-gray-500 pt-0.5">
                <span>
                    Total Experts Listed: <strong className="text-gray-900">{rows.length}</strong>
                </span>
                <span>
                    Bank Verified Pending: <strong className="text-[#0B8843]">{overview.bankVerifiedPendingDoctors}</strong> • Missing Bank:{" "}
                    <strong className="text-red-600">
                        {Math.max(0, overview.pendingDoctors - overview.bankVerifiedPendingDoctors)}
                    </strong>
                </span>
            </div>

            {/* 1. Shared Pre-Settlement Bank Account Check & Verify Modal */}
            <BankVerifySettleModal
                show={settleModalOpen}
                onClose={() => {
                    setSettleModalOpen(false);
                    setDoctorToPay(null);
                }}
                doctorId={doctorToPay?.doctorId}
                doctorName={doctorToPay?.doctorName}
                sessionsCount={doctorToPay?.unpaidCount || 0}
                grossAmount={doctorToPay?.unpaidGross || 0}
                commissionPercentage={doctorToPay?.platformPercentage || 0}
                commissionAmount={doctorToPay?.unpaidComm || 0}
                netPayableAmount={doctorToPay?.unpaidNet || 0}
                initialBank={doctorToPay?.bankInfo}
                onConfirmSettle={handleConfirmSingleDoctorSettle}
                submitting={settling}
            />

            {/* 2. Batch Settle All Bank-Verified Doctors Modal */}
            <Modal show={batchModalOpen} onClose={() => setBatchModalOpen(false)} size="lg" dismissible>
                <Modal.Header>Settle All Bank-Verified Experts</Modal.Header>
                <Modal.Body>
                    <div className="space-y-4 text-xs">
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Experts with Verified Bank / UPI:</span>
                                <span className="font-bold text-gray-900">
                                    {overview.bankVerifiedPendingDoctors} Experts
                                </span>
                            </div>
                            {overview.pendingDoctors > overview.bankVerifiedPendingDoctors && (
                                <div className="flex justify-between text-red-700">
                                    <span>Skipped (No Bank Account Added):</span>
                                    <span className="font-bold">
                                        {overview.pendingDoctors - overview.bankVerifiedPendingDoctors} Expert(s)
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between pt-2 border-t border-emerald-200 text-sm">
                                <span className="font-bold text-gray-900">Total Net Amount to Settle:</span>
                                <span className="font-black text-lg text-[#0B8843]">
                                    {formatINR(overview.verifiedNetTotal)}
                                </span>
                            </div>
                        </div>

                        {/* List of Verified Doctors Being Settled */}
                        <div className="max-h-44 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                            {enrichedDoctors
                                .filter((d) => d.unpaidCount > 0 && d.hasBankDetails)
                                .map((d) => (
                                    <div
                                        key={d.doctorId}
                                        className="px-3 py-2 flex items-center justify-between bg-white"
                                    >
                                        <div>
                                            <div className="font-bold text-gray-900">Dr. {d.doctorName}</div>
                                            <div className="text-[10px] font-mono text-gray-500">
                                                {d.bankInfo?.bankName || "UPI"} •{" "}
                                                {d.bankInfo?.accountNumber
                                                    ? `${d.bankInfo.accountNumber} (${d.bankInfo.ifscCode})`
                                                    : d.bankInfo?.upiId}
                                            </div>
                                        </div>
                                        <div className="font-black text-[#0B8843]">{formatINR(d.unpaidNet)}</div>
                                    </div>
                                ))}
                        </div>

                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-2 text-[11px] text-amber-950">
                            <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                            <span>
                                <strong>Important Warning:</strong> Once settled, customer <strong>Refund</strong> will be locked for these sessions to prevent double loss. If any doctor did not join a session, refund that booking from <em>All Transactions</em> before settling. Dynamic payout notifications will be sent to each settled doctor.
                            </span>
                        </div>

                        <label className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={batchVerified}
                                onChange={(e) => setBatchVerified(e.target.checked)}
                                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#0B8843] cursor-pointer"
                            />
                            <span className="text-xs font-semibold text-gray-800">
                                I have verified the bank accounts above and transferred{" "}
                                <strong className="text-[#0B8843]">{formatINR(overview.verifiedNetTotal)}</strong>.
                            </span>
                        </label>
                    </div>
                </Modal.Body>
                <Modal.Footer className="flex justify-end gap-2">
                    <button
                        onClick={() => setBatchModalOpen(false)}
                        className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmBatchSettle}
                        disabled={!batchVerified || batchSubmitting}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B8843] hover:bg-black text-white text-xs font-bold cursor-pointer disabled:opacity-40"
                    >
                        <Send size={13} />
                        {batchSubmitting
                            ? "Settling..."
                            : `Confirm & Settle All (${overview.bankVerifiedPendingDoctors})`}
                    </button>
                </Modal.Footer>
            </Modal>

            {/* 3. Expert Full Statement & Bank Details Modal */}
            <Modal show={detailModalOpen} onClose={() => setDetailModalOpen(false)} size="4xl" dismissible>
                <Modal.Header>
                    Doctor Statement &amp; Bank Details — Dr. {selectedDoctor?.doctorName}
                </Modal.Header>
                <Modal.Body>
                    {selectedDoctor && (
                        <div id="transaction-modal-content" className="space-y-5 p-1 text-xs">
                            {/* Bank Account Details Banner */}
                            {selectedDoctor.hasBankDetails ? (
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3">
                                    <div>
                                        <span className="text-[10px] uppercase text-gray-400 font-bold block">
                                            Bank Name
                                        </span>
                                        <span className="font-bold text-gray-900">
                                            {selectedDoctor.bankInfo?.bankName || "-"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase text-gray-400 font-bold block">
                                            Account Number
                                        </span>
                                        <span className="font-mono font-bold text-gray-900">
                                            {selectedDoctor.bankInfo?.accountNumber || "-"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase text-gray-400 font-bold block">
                                            IFSC Code
                                        </span>
                                        <span className="font-mono font-bold text-gray-900">
                                            {selectedDoctor.bankInfo?.ifscCode || "-"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase text-gray-400 font-bold block">
                                            UPI ID
                                        </span>
                                        <span className="font-mono font-bold text-gray-900">
                                            {selectedDoctor.bankInfo?.upiId || "-"}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-800 font-semibold">
                                    <AlertTriangle size={16} className="text-red-600 shrink-0" />
                                    Dr. {selectedDoctor.doctorName} has not added any Bank Account or UPI ID yet.
                                </div>
                            )}

                            {/* 3 Summary Boxes */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                                    <div className="text-[10px] font-bold uppercase text-amber-700">
                                        Pending Net Payout
                                    </div>
                                    <div className="text-xl font-black text-amber-900 mt-1">
                                        {formatINR(selectedDoctor.unpaidNet)}
                                    </div>
                                    <div className="text-[11px] text-amber-700 mt-0.5">
                                        {selectedDoctor.unpaidCount} pending session(s)
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                                    <div className="text-[10px] font-bold uppercase text-blue-700">
                                        Platform Commission ({selectedDoctor.platformPercentage}%)
                                    </div>
                                    <div className="text-xl font-black text-blue-900 mt-1">
                                        {formatINR(selectedDoctor.unpaidComm)}
                                    </div>
                                    <div className="text-[11px] text-blue-700 mt-0.5">
                                        On {formatINR(selectedDoctor.unpaidGross)} gross
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                                    <div className="text-[10px] font-bold uppercase text-emerald-700">
                                        Already Settled
                                    </div>
                                    <div className="text-xl font-black text-emerald-900 mt-1">
                                        {formatINR(selectedDoctor.paidNet)}
                                    </div>
                                    <div className="text-[11px] text-emerald-700 mt-0.5">
                                        {selectedDoctor.paidCount} settled session(s)
                                    </div>
                                </div>
                            </div>

                            {/* Pending Sessions Breakdown */}
                            {selectedDoctor.unpaidTransactions?.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[11px]">
                                        Pending Consultations ({selectedDoctor.unpaidTransactions.length})
                                    </h4>
                                    <div className="overflow-x-auto border border-gray-200 rounded-xl">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase text-gray-600 font-bold">
                                                <tr>
                                                    <th className="px-3 py-2">Date &amp; Patient</th>
                                                    <th className="px-3 py-2">Payment ID</th>
                                                    <th className="px-3 py-2">Gross</th>
                                                    <th className="px-3 py-2">Commission</th>
                                                    <th className="px-3 py-2 text-right">Net Payout</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {selectedDoctor.unpaidTransactions.map((tx, idx) => (
                                                    <tr key={idx} className="bg-white">
                                                        <td className="px-3 py-2">
                                                            <div className="font-bold text-gray-900">
                                                                {tx.patientName || "Patient"}
                                                            </div>
                                                            <div className="text-[10px] text-gray-500">{tx.date}</div>
                                                        </td>
                                                        <td className="px-3 py-2 font-mono text-[10px] text-gray-600">
                                                            {tx.transactionCode}
                                                        </td>
                                                        <td className="px-3 py-2 font-semibold">
                                                            {formatINR(tx.totalAmount)}
                                                        </td>
                                                        <td className="px-3 py-2 text-blue-700">
                                                            -{formatINR(tx.platformChargeAmount)} ({tx.platformPercentage}%)
                                                        </td>
                                                        <td className="px-3 py-2 text-right font-black text-[#0B8843]">
                                                            {formatINR(tx.payoutAmount)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Settled History */}
                            {selectedDoctor.paidTransactions?.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-bold text-emerald-800 uppercase tracking-wider text-[11px]">
                                        Settled Payout History ({selectedDoctor.paidTransactions.length})
                                    </h4>
                                    <div className="overflow-x-auto border border-gray-200 rounded-xl">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase text-gray-600 font-bold">
                                                <tr>
                                                    <th className="px-3 py-2">Date &amp; Patient</th>
                                                    <th className="px-3 py-2">Gross</th>
                                                    <th className="px-3 py-2">Commission</th>
                                                    <th className="px-3 py-2">UTR / Ref</th>
                                                    <th className="px-3 py-2 text-right">Settled Net</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {selectedDoctor.paidTransactions.map((tx, idx) => (
                                                    <tr key={idx} className="bg-white">
                                                        <td className="px-3 py-2">
                                                            <div className="font-semibold text-gray-900">
                                                                {tx.patientName || "Patient"}
                                                            </div>
                                                            <div className="text-[10px] text-gray-500">{tx.date}</div>
                                                        </td>
                                                        <td className="px-3 py-2">{formatINR(tx.totalAmount)}</td>
                                                        <td className="px-3 py-2 text-gray-500">
                                                            -{formatINR(tx.platformChargeAmount)} ({tx.platformPercentage}%)
                                                        </td>
                                                        <td className="px-3 py-2 font-mono text-[10px] text-gray-600">
                                                            {tx.settlementUtr || "Settled"}
                                                        </td>
                                                        <td className="px-3 py-2 text-right font-black text-emerald-700">
                                                            {formatINR(tx.payoutAmount)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="flex justify-between items-center">
                    <button
                        onClick={handleGeneratePDF}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B8843] hover:bg-black text-white text-xs font-bold cursor-pointer"
                    >
                        <FileText size={14} /> Download PDF Statement
                    </button>
                    <button
                        onClick={() => setDetailModalOpen(false)}
                        className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 cursor-pointer"
                    >
                        Close
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default DoctorTransaction;
