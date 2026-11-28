import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    getAllTransactions,
    searchTransactions,
    toggleIsPaid,
    refundTransaction,
    clearTransactionMessage,
} from "../../Reducer/TransactionHistorySlice";
import { getDoctor } from "../../Reducer/DoctorSlice";
import api from "../../store/Api";
import { formatDate } from "../../utils/FormatData";
import BankVerifySettleModal from "./BankVerifySettleModal";
import {
    Search,
    Users,
    List,
    RotateCcw,
    Send,
    ShieldCheck,
    IndianRupee,
    Wallet,
    RefreshCw,
    Info,
} from "lucide-react";
import { Modal } from "flowbite-react";
import debounce from "lodash.debounce";
import { useNavigate, useParams } from "react-router-dom";

const REFUND_REASON_PRESETS = [
    "Expert did not join the scheduled consultation",
    "Technical / network issue prevented consultation",
    "Appointment cancelled on patient's valid request",
    "Duplicate / accidental payment by patient",
];

const formatINR = (val) => {
    const num = Number(val || 0);
    return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getSettlementBadge = (tx) => {
    if (tx.transactionStatus === "REFUNDED" || tx.isPaid === 2) {
        return {
            label: "Refunded",
            cls: "bg-purple-50 text-purple-700 border-purple-200",
        };
    }
    if (tx.transactionStatus !== "SUCCESS") {
        return {
            label: "Unpaid Order",
            cls: "bg-gray-100 text-gray-500 border-gray-200",
        };
    }
    if (tx.isPaid === 1) {
        const viaUpi = tx.settlementMode === "UPI_TRANSFER";
        return {
            label: viaUpi ? "Settled (UPI) ✓" : "Settled (Bank) ✓",
            cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
    }
    return {
        label: "Pending",
        cls: "bg-amber-50 text-amber-700 border-amber-200",
    };
};

const TransactionUser = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const { transactionHistory, loading, actionLoading, message, error } = useSelector(
        (state) => state?.transactionHistory
    );
    const { doctorsDetails } = useSelector((state) => state?.doctors);

    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 25;
    const [defaultMainRate, setDefaultMainRate] = useState(0);

    // Single Transaction Settle Modal (with Bank Verification)
    const [settleModalOpen, setSettleModalOpen] = useState(false);
    const [txToSettle, setTxToSettle] = useState(null);

    // Refund Modal State
    const [refundModalOpen, setRefundModalOpen] = useState(false);
    const [selectedTxForRefund, setSelectedTxForRefund] = useState(null);
    const [refundReason, setRefundReason] = useState(REFUND_REASON_PRESETS[0]);

    useEffect(() => {
        dispatch(getAllTransactions());
        dispatch(getDoctor());

        // Fetch main category commission fallback in case backend hasn't restarted yet
        api.get("goodmood/support/category/list/parents")
            .then((res) => {
                const cats = (res?.data?.data || []).filter(
                    (c) => Number(c?.parentId ?? c?.parent_id ?? 0) === 0
                );
                if (cats.length > 0) {
                    return Promise.all(
                        cats.map((c) =>
                            api
                                .get(`goodmood/charges/get-charges/${c.id}`)
                                .then((r) => Number(r?.data?.data?.charge ?? 0))
                                .catch(() => 0)
                        )
                    );
                }
                return [];
            })
            .then((rates) => {
                const firstConfigured = (rates || []).find((r) => r > 0);
                if (firstConfigured) setDefaultMainRate(firstConfigured);
            })
            .catch(() => {});
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            dispatch(clearTransactionMessage());
        }
    }, [message, dispatch]);

    const debouncedSearch = useCallback(
        debounce((query) => {
            if (query.trim() === "") {
                dispatch(getAllTransactions());
            } else {
                dispatch(searchTransactions(query));
            }
        }, 400),
        [dispatch]
    );

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setCurrentPage(1);
        debouncedSearch(value);
    };

    // Map doctorName -> doctorId fallback when backend hasn't returned doctorId yet
    const doctorIdByName = useMemo(() => {
        const map = {};
        (doctorsDetails?.data || []).forEach((d) => {
            const fullName = `${d.firstName || ""} ${d.lastName || ""}`.trim().toLowerCase();
            if (fullName) map[fullName] = d.id;
        });
        return map;
    }, [doctorsDetails?.data]);

    const computeRowSplit = useCallback(
        (tx) => {
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
            const resolvedDocId =
                tx.doctorId || doctorIdByName[(tx.doctorName || "").trim().toLowerCase()] || null;
            return { gross, pct, comm, net, resolvedDocId };
        },
        [defaultMainRate, doctorIdByName]
    );

    const allRows = useMemo(() => transactionHistory || [], [transactionHistory]);

    const kpis = useMemo(() => {
        let grossCollected = 0;
        let successCount = 0;
        let platformCommission = 0;
        let doctorPendingNet = 0;
        let doctorSettledNet = 0;
        let refundedTotal = 0;
        let refundedCount = 0;

        allRows.forEach((tx) => {
            const { gross, comm, net } = computeRowSplit(tx);

            if (tx.transactionStatus === "SUCCESS") {
                grossCollected += gross;
                successCount += 1;
                platformCommission += comm;

                if (tx.isPaid === 1) {
                    doctorSettledNet += net;
                } else {
                    doctorPendingNet += net;
                }
            } else if (tx.transactionStatus === "REFUNDED") {
                refundedCount += 1;
                refundedTotal += Number(tx.refundAmount || gross);
            }
        });

        return {
            grossCollected,
            successCount,
            platformCommission,
            doctorPendingNet,
            doctorSettledNet,
            refundedTotal,
            refundedCount,
        };
    }, [allRows, computeRowSplit]);

    const filteredRows = useMemo(() => {
        return allRows.filter((tx) => {
            if (activeTab === "SUCCESS") return tx.transactionStatus === "SUCCESS";
            if (activeTab === "PENDING_SETTLE")
                return tx.transactionStatus === "SUCCESS" && tx.isPaid !== 1;
            if (activeTab === "SETTLED") return tx.transactionStatus === "SUCCESS" && tx.isPaid === 1;
            if (activeTab === "REFUNDED") return tx.transactionStatus === "REFUNDED";
            if (activeTab === "UNPAID_ORDER")
                return tx.transactionStatus === "PENDING" || tx.transactionStatus === "FAILED";
            return true;
        });
    }, [allRows, activeTab]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
    const paginatedRows = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredRows.slice(start, start + pageSize);
    }, [filteredRows, currentPage]);

    const openSettleModal = (tx) => {
        const split = computeRowSplit(tx);
        setTxToSettle({
            ...tx,
            ...split,
        });
        setSettleModalOpen(true);
    };

    const handleConfirmSingleTxSettle = async ({ utr, mode }) => {
        if (!txToSettle) return;
        const res = await dispatch(toggleIsPaid({ id: txToSettle.id, utr, mode }));
        if (!res.error) {
            setSettleModalOpen(false);
            setTxToSettle(null);
            dispatch(getAllTransactions());
        }
    };

    const openRefundModal = (tx) => {
        setSelectedTxForRefund(tx);
        setRefundReason(REFUND_REASON_PRESETS[0]);
        setRefundModalOpen(true);
    };

    const handleConfirmRefund = async () => {
        if (!selectedTxForRefund) return;
        const res = await dispatch(
            refundTransaction({
                id: selectedTxForRefund.id,
                reason: refundReason,
                mode: "AUTO",
            })
        );
        if (!res.error) {
            setRefundModalOpen(false);
            setSelectedTxForRefund(null);
            dispatch(getAllTransactions());
        }
    };

    const tabs = [
        { key: "ALL", label: "All", count: allRows.length },
        { key: "SUCCESS", label: "Paid", count: kpis.successCount },
        {
            key: "PENDING_SETTLE",
            label: "Pending Settle",
            count: allRows.filter((r) => r.transactionStatus === "SUCCESS" && r.isPaid !== 1).length,
        },
        {
            key: "SETTLED",
            label: "Settled",
            count: allRows.filter((r) => r.transactionStatus === "SUCCESS" && r.isPaid === 1).length,
        },
        { key: "REFUNDED", label: "Refunded", count: kpis.refundedCount },
        {
            key: "UNPAID_ORDER",
            label: "Incomplete",
            count: allRows.filter((r) => r.transactionStatus === "PENDING" || r.transactionStatus === "FAILED").length,
        },
    ];

    return (
        <div className="wrapper_area my-0 mx-auto h-[calc(100vh-104px)] max-h-full flex flex-col overflow-hidden p-4 rounded-2xl bg-white shadow-sm border border-gray-100 gap-3">
            {/* Unified Top Header + Same Switcher Tabs on Both Pages */}
            <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-2.5 border-b border-gray-100">
                <div>
                    <h2 className="text-base font-bold text-gray-900 leading-tight">
                        Payments, Settlements &amp; Refunds
                    </h2>
                    <p className="text-gray-500 text-[11px]">
                        Verify expert bank account before settling, or refund patient if expert didn&apos;t join
                    </p>
                </div>

                {/* Identical 2-View Switcher + Refresh */}
                <div className="flex items-center gap-2 shrink-0">
                    <div className="inline-flex p-1 rounded-xl bg-gray-100 border border-gray-200">
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0B8843] text-white shadow-xs whitespace-nowrap cursor-pointer"
                        >
                            <List size={13} />
                            All Transactions
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(`/DoctorTransaction/${id || 14}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 whitespace-nowrap cursor-pointer transition-all"
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
                        onClick={() => dispatch(getAllTransactions())}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all cursor-pointer whitespace-nowrap"
                    >
                        <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* 4 Compact KPI Cards */}
            <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div className="py-2.5 px-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 whitespace-nowrap">
                            Patient Collections
                        </span>
                        <div className="p-1 rounded-md bg-emerald-100 text-emerald-700 shrink-0">
                            <IndianRupee size={13} />
                        </div>
                    </div>
                    <div className="text-lg font-black text-gray-900 mt-0.5 whitespace-nowrap leading-tight">
                        {formatINR(kpis.grossCollected)}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate">
                        {kpis.successCount} paid bookings
                    </div>
                </div>

                <div className="py-2.5 px-3 rounded-xl bg-blue-50/50 border border-blue-200/80">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 whitespace-nowrap">
                            GoodMood Commission
                        </span>
                        <div className="p-1 rounded-md bg-blue-100 text-blue-700 shrink-0">
                            <ShieldCheck size={13} />
                        </div>
                    </div>
                    <div className="text-lg font-black text-blue-800 mt-0.5 whitespace-nowrap leading-tight">
                        {formatINR(kpis.platformCommission)}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate">
                        Main Category % share
                    </div>
                </div>

                <div className="py-2.5 px-3 rounded-xl bg-amber-50/60 border border-amber-200/80">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 whitespace-nowrap">
                            Pending Expert Payout
                        </span>
                        <div className="p-1 rounded-md bg-amber-100 text-amber-700 shrink-0">
                            <Wallet size={13} />
                        </div>
                    </div>
                    <div className="text-lg font-black text-amber-900 mt-0.5 whitespace-nowrap leading-tight">
                        {formatINR(kpis.doctorPendingNet)}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate">
                        Settled so far: {formatINR(kpis.doctorSettledNet)}
                    </div>
                </div>

                <div className="py-2.5 px-3 rounded-xl bg-purple-50/50 border border-purple-200/80">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 whitespace-nowrap">
                            Customer Refunds
                        </span>
                        <div className="p-1 rounded-md bg-purple-100 text-purple-700 shrink-0">
                            <RotateCcw size={13} />
                        </div>
                    </div>
                    <div className="text-lg font-black text-gray-900 mt-0.5 whitespace-nowrap leading-tight">
                        {formatINR(kpis.refundedTotal)}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate">
                        {kpis.refundedCount} refunds completed
                    </div>
                </div>
            </div>

            {/* Important Admin Rule Caution Strip */}
            <div className="shrink-0 py-2 px-3 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center gap-2 text-[11px] text-amber-950">
                <Info size={14} className="text-amber-600 shrink-0" />
                <span className="truncate">
                    <strong>Note:</strong> Check whether the session happened before settling — if the doctor didn&apos;t join, click <strong>Refund</strong> <em>before</em> settling (once <strong>Settled ✓</strong>, Refund is locked to prevent double loss).
                </span>
            </div>

            {/* Filter Pills + Search Input */}
            <div className="shrink-0 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                    {tabs.map((tab) => {
                        const active = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => {
                                    setActiveTab(tab.key);
                                    setCurrentPage(1);
                                }}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                                    active
                                        ? "bg-[#0B8843] text-white border-[#0B8843]"
                                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span
                                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                        active
                                            ? "bg-white/20 text-white"
                                            : "bg-white text-gray-700 border border-gray-200"
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="relative w-full lg:w-64 shrink-0">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <Search size={13} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search patient, expert, pay_ ID..."
                        className="block w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white text-[11px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B8843]/25 focus:border-[#0B8843]"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            {/* Internal Scrollable Table within 100vh */}
            <div className="flex-1 min-h-0 w-full overflow-auto rounded-xl border border-gray-200 relative">
                <table className="w-full min-w-[780px] text-left border-collapse">
                    <thead className="sticky top-0 z-20 bg-gray-50 shadow-[0_1px_0_0_#e5e7eb]">
                        <tr className="text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">
                            <th className="py-2.5 px-3 bg-gray-50">Payment / Order ID</th>
                            <th className="py-2.5 px-3 bg-gray-50">Patient &amp; Expert</th>
                            <th className="py-2.5 px-3 bg-gray-50">Amount &amp; Split</th>
                            <th className="py-2.5 px-3 bg-gray-50">Payment</th>
                            <th className="py-2.5 px-3 bg-gray-50">Settlement</th>
                            <th className="py-2.5 px-3 text-right sticky right-0 z-30 bg-gray-50 shadow-[-1px_0_0_0_#e5e7eb]">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-[11px]">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                                    Loading transactions...
                                </td>
                            </tr>
                        ) : paginatedRows.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                                    No transactions match the selected filter.
                                </td>
                            </tr>
                        ) : (
                            paginatedRows.map((tx) => {
                                const settleBadge = getSettlementBadge(tx);
                                const { gross, pct, comm, net } = computeRowSplit(tx);

                                const isSuccess = tx.transactionStatus === "SUCCESS";
                                const isSettled = tx.isPaid === 1;
                                const canAct = isSuccess && !isSettled;

                                return (
                                    <tr
                                        key={tx.id}
                                        className="group transition-colors whitespace-nowrap bg-white hover:bg-gray-50"
                                    >
                                        {/* Payment / Order ID */}
                                        <td className="py-2 px-3 align-middle">
                                            <div className="font-mono font-semibold text-gray-800 text-[11px]">
                                                {tx.transactionCode || "-"}
                                            </div>
                                            <div className="font-mono text-[10px] text-gray-400">
                                                {tx.transactionId || "-"} • {tx.createdAt ? formatDate(tx.createdAt) : "-"}
                                            </div>
                                        </td>

                                        {/* Patient & Expert */}
                                        <td className="py-2 px-3 align-middle">
                                            <div className="font-semibold text-gray-900">
                                                {tx.userName || "N/A"}
                                                <span className="text-gray-400 font-normal mx-1">→</span>
                                                <span className="text-gray-700">Dr. {tx.doctorName || "N/A"}</span>
                                            </div>
                                            {tx.mainCategoryName && (
                                                <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-emerald-50 text-[#0B8843] border border-emerald-200 text-[10px] font-semibold">
                                                    {tx.mainCategoryName}
                                                </span>
                                            )}
                                        </td>

                                        {/* Amount & Split */}
                                        <td className="py-2 px-3 align-middle">
                                            <div className="font-bold text-xs text-gray-900">{formatINR(gross)}</div>
                                            {isSuccess && (
                                                <div className="text-[10px] text-gray-500">
                                                    <span className="text-blue-700 font-medium">
                                                        Fee ({pct}%): -{formatINR(comm)}
                                                    </span>
                                                    <span className="mx-1 text-gray-300">|</span>
                                                    <span className="text-emerald-700 font-semibold">
                                                        Net: {formatINR(net)}
                                                    </span>
                                                </div>
                                            )}
                                            {tx.transactionStatus === "REFUNDED" && (
                                                <div className="text-[10px] text-purple-700 font-semibold">
                                                    Returned: {formatINR(tx.refundAmount || gross)}
                                                </div>
                                            )}
                                        </td>

                                        {/* Payment Status */}
                                        <td className="py-2 px-3 align-middle">
                                            <span
                                                className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    isSuccess
                                                        ? "bg-emerald-100 text-emerald-800"
                                                        : tx.transactionStatus === "REFUNDED"
                                                        ? "bg-purple-100 text-purple-800"
                                                        : tx.transactionStatus === "PENDING"
                                                        ? "bg-amber-100 text-amber-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {tx.transactionStatus}
                                            </span>
                                        </td>

                                        {/* Settlement Status */}
                                        <td className="py-2 px-3 align-middle">
                                            <span
                                                className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${settleBadge.cls}`}
                                            >
                                                {settleBadge.label}
                                            </span>
                                            {isSettled && tx.settlementUtr && (
                                                <div className="text-[9px] font-mono text-gray-400 mt-0.5">
                                                    {tx.settlementUtr}
                                                </div>
                                            )}
                                        </td>

                                        {/* Identical Actions: Settle (checks bank first!) + Refund */}
                                        <td className="py-2 px-3 align-middle text-right sticky right-0 z-10 bg-white group-hover:bg-gray-50 shadow-[-1px_0_0_0_#f3f4f6]">
                                            <div className="inline-flex items-center justify-end gap-1.5">
                                                {canAct && (
                                                    <>
                                                        <button
                                                            onClick={() => openSettleModal(tx)}
                                                            disabled={actionLoading}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#0B8843] hover:bg-black text-white cursor-pointer transition-all"
                                                        >
                                                            <Send size={11} />
                                                            Settle
                                                        </button>

                                                        <button
                                                            onClick={() => openRefundModal(tx)}
                                                            disabled={actionLoading}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 cursor-pointer transition-all"
                                                        >
                                                            <RotateCcw size={11} />
                                                            Refund
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pinned Bottom Pagination */}
            <div className="shrink-0 flex items-center justify-between gap-3 pt-0.5 text-[11px] text-gray-600">
                <div>
                    Showing{" "}
                    <span className="font-bold text-gray-900">
                        {filteredRows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                    </span>
                    –
                    <span className="font-bold text-gray-900">
                        {Math.min(currentPage * pageSize, filteredRows.length)}
                    </span>{" "}
                    of <span className="font-bold text-gray-900">{filteredRows.length}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 font-semibold cursor-pointer"
                    >
                        Prev
                    </button>
                    <span className="px-2 font-semibold text-gray-800">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 font-semibold cursor-pointer"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Shared Bank Account Verification + Settle Modal */}
            <BankVerifySettleModal
                show={settleModalOpen}
                onClose={() => {
                    setSettleModalOpen(false);
                    setTxToSettle(null);
                }}
                doctorId={txToSettle?.resolvedDocId}
                doctorName={txToSettle?.doctorName}
                sessionsCount={1}
                grossAmount={txToSettle?.gross || 0}
                commissionPercentage={txToSettle?.pct || 0}
                commissionAmount={txToSettle?.comm || 0}
                netPayableAmount={txToSettle?.net || 0}
                sessionSummary={txToSettle}
                onConfirmSettle={handleConfirmSingleTxSettle}
                submitting={actionLoading}
            />

            {/* Customer Refund Modal (Auto-Detects Original Payment Method) */}
            <Modal show={refundModalOpen} onClose={() => setRefundModalOpen(false)} size="lg" dismissible>
                <Modal.Header>Issue Customer Refund</Modal.Header>
                <Modal.Body>
                    {selectedTxForRefund && (
                        <div className="space-y-4 text-xs">
                            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Patient:</span>
                                    <span className="font-bold text-gray-900">{selectedTxForRefund.userName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Expert:</span>
                                    <span className="font-bold text-gray-900">Dr. {selectedTxForRefund.doctorName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Payment Reference ID:</span>
                                    <span className="font-mono font-semibold text-gray-800">
                                        {selectedTxForRefund.transactionCode}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Refund Destination:</span>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#0B8843] border border-emerald-200 text-[11px] font-bold">
                                        <ShieldCheck size={12} />
                                        Auto-Detected Original Payment Source (UPI / Card / Bank)
                                    </span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-gray-200 text-sm">
                                    <span className="font-bold text-gray-800">Refund Amount:</span>
                                    <span className="font-black text-red-600">
                                        {formatINR(selectedTxForRefund.transactionPrice)}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 mb-1.5">Reason:</label>
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {REFUND_REASON_PRESETS.map((preset, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setRefundReason(preset)}
                                            className={`px-2.5 py-1 rounded-md text-[10px] border cursor-pointer transition-all ${
                                                refundReason === preset
                                                    ? "bg-gray-900 text-white border-gray-900"
                                                    : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                                            }`}
                                        >
                                            {preset}
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

                            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-[11px] text-amber-900">
                                <Info size={14} className="shrink-0 mt-0.5 text-amber-700" />
                                <span>
                                    Refunding returns the full amount to {selectedTxForRefund.userName}&apos;s original payment account, removes it from Dr. {selectedTxForRefund.doctorName}&apos;s settlement list, and sends a dynamic refund notification to the patient.
                                </span>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="flex justify-end gap-2">
                    <button
                        onClick={() => setRefundModalOpen(false)}
                        className="px-3.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmRefund}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                        <RotateCcw size={13} />
                        {actionLoading ? "Processing..." : "Confirm Refund"}
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default TransactionUser;
