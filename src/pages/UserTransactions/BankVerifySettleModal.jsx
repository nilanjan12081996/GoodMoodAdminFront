import React, { useEffect, useState } from "react";
import { Modal } from "flowbite-react";
import api from "../../store/Api";
import {
    Building2,
    AlertTriangle,
    CheckCircle,
    Copy,
    Check,
    Send,
    ShieldCheck,
    RefreshCw,
} from "lucide-react";

const formatINR = (val) => {
    const num = Number(val || 0);
    return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Shared Pre-Settlement Bank Account Check & Verification Modal
 * Used identically in BOTH "Customer Payments" (TransactionUser) and "Doctor Settlements" (DoctorTransaction).
 */
const BankVerifySettleModal = ({
    show,
    onClose,
    doctorId,
    doctorName,
    sessionsCount = 1,
    grossAmount = 0,
    commissionPercentage = 0,
    commissionAmount = 0,
    netPayableAmount = 0,
    initialBank = null,
    sessionSummary = null,
    onConfirmSettle,
    submitting = false,
}) => {
    const [loadingBank, setLoadingBank] = useState(false);
    const [bankInfo, setBankInfo] = useState(null);
    const [payoutMode, setPayoutMode] = useState("BANK_TRANSFER");
    const [bankVerifiedChecked, setBankVerifiedChecked] = useState(false);
    const [utr, setUtr] = useState("");
    const [copiedKey, setCopiedKey] = useState("");

    useEffect(() => {
        if (!show) return;
        setBankVerifiedChecked(false);
        setUtr("");

        // Check if initialBank already has decrypted account details
        if (
            initialBank &&
            ((initialBank.accountNumber && initialBank.ifscCode) || initialBank.upiId)
        ) {
            setBankInfo({
                accountHolderName: initialBank.accountHolderName || doctorName || "",
                bankName: initialBank.bankName || "",
                accountNumber: initialBank.accountNumber || "",
                ifscCode: initialBank.ifscCode || "",
                upiId: initialBank.upiId || "",
            });
        } else {
            setBankInfo(null);
        }

        // Always verify live against /goodmood/doctors/details/:doctorId if doctorId is available
        if (doctorId) {
            setLoadingBank(true);
            api.get(`goodmood/doctors/details/${doctorId}`)
                .then((res) => {
                    const details = res?.data?.data || res?.data;
                    const list = details?.bankDetails || [];
                    const active =
                        list.find((b) => (b.status === undefined || b.status === 1) && b.isMain === 1) ||
                        list.find((b) => b.status === undefined || b.status === 1) ||
                        list[0];

                    if (active) {
                        setBankInfo({
                            accountHolderName: active.accountHolderName || doctorName || "",
                            bankName: active.bankName || "",
                            accountNumber: active.accountOn || active.accountNumber || "",
                            ifscCode: active.ifscCode || "",
                            upiId: active.upi || active.upiId || "",
                        });
                    } else if (!initialBank) {
                        setBankInfo(null);
                    }
                })
                .catch(() => {
                    // Keep initialBank if request fails
                })
                .finally(() => {
                    setLoadingBank(false);
                });
        }
    }, [show, doctorId, doctorName, initialBank]);

    const hasBankAccount = Boolean(
        bankInfo?.accountNumber &&
            String(bankInfo.accountNumber).trim() !== "" &&
            bankInfo?.ifscCode &&
            String(bankInfo.ifscCode).trim() !== ""
    );
    const hasUpi = Boolean(bankInfo?.upiId && String(bankInfo.upiId).trim() !== "");
    const isBankAvailable = hasBankAccount || hasUpi;

    useEffect(() => {
        if (hasBankAccount) {
            setPayoutMode("BANK_TRANSFER");
        } else if (hasUpi) {
            setPayoutMode("UPI_TRANSFER");
        }
    }, [hasBankAccount, hasUpi]);

    const copyValue = (key, val) => {
        if (!val) return;
        navigator.clipboard.writeText(val);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(""), 1600);
    };

    const isUpiSelected = payoutMode === "UPI_TRANSFER" && hasUpi;

    return (
        <Modal show={show} onClose={onClose} size="lg" dismissible>
            <Modal.Header className="border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-[#0B8843] border border-emerald-200">
                        <Building2 size={19} />
                    </div>
                    <div>
                        <div className="text-base font-bold text-gray-900 leading-tight">
                            Verify Bank Account &amp; Settle Payout
                        </div>
                        <div className="text-xs text-gray-500 font-normal mt-0.5">
                            Expert: <strong className="text-gray-800">Dr. {doctorName || "Expert"}</strong> •{" "}
                            {sessionsCount} session(s)
                        </div>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body className="px-6 py-5">
                <div className="space-y-4 text-xs">
                    {/* Step 1: Bank Account Check */}
                    {loadingBank ? (
                        <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center gap-2 text-gray-600 font-semibold">
                            <RefreshCw size={15} className="animate-spin text-[#0B8843]" />
                            Checking expert&apos;s registered bank account...
                        </div>
                    ) : !isBankAvailable ? (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                            <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <div className="font-bold text-sm text-red-900">
                                    No Bank Account or UPI Found!
                                </div>
                                <p className="text-xs text-red-700 leading-relaxed">
                                    <strong>Dr. {doctorName}</strong> has not added any Bank Account (Account Number + IFSC) or UPI ID in the Doctor App yet. Settlement is blocked until bank details are added.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="font-bold text-gray-900 flex items-center gap-1.5">
                                    <ShieldCheck size={15} className="text-[#0B8843]" />
                                    {hasBankAccount && hasUpi
                                        ? "Select Payout Method (Bank or UPI)"
                                        : hasBankAccount
                                        ? "Registered Bank Account Verified"
                                        : "Registered UPI Verified"}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    {isUpiSelected ? "UPI Active ✓" : "Bank Active ✓"}
                                </span>
                            </div>

                            {/* Only show Bank vs UPI switcher if the doctor has added BOTH Bank Account AND UPI */}
                            {hasBankAccount && hasUpi && (
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPayoutMode("BANK_TRANSFER");
                                            setBankVerifiedChecked(false);
                                        }}
                                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                            !isUpiSelected
                                                ? "bg-emerald-50 border-[#0B8843] ring-1 ring-[#0B8843]"
                                                : "bg-white border-gray-200 hover:border-gray-300"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-gray-900 text-xs">
                                                Bank Account (IMPS/NEFT)
                                            </span>
                                            {!isUpiSelected && (
                                                <CheckCircle size={13} className="text-[#0B8843]" />
                                            )}
                                        </div>
                                        <div className="text-[10px] text-gray-500 font-mono mt-0.5 truncate">
                                            {bankInfo.bankName || "Bank"} • ••••
                                            {String(bankInfo.accountNumber).slice(-4)}
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPayoutMode("UPI_TRANSFER");
                                            setBankVerifiedChecked(false);
                                        }}
                                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                            isUpiSelected
                                                ? "bg-emerald-50 border-[#0B8843] ring-1 ring-[#0B8843]"
                                                : "bg-white border-gray-200 hover:border-gray-300"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-gray-900 text-xs">
                                                UPI Transfer
                                            </span>
                                            {isUpiSelected && (
                                                <CheckCircle size={13} className="text-[#0B8843]" />
                                            )}
                                        </div>
                                        <div className="text-[10px] text-gray-500 font-mono mt-0.5 truncate">
                                            {bankInfo.upiId}
                                        </div>
                                    </button>
                                </div>
                            )}

                            {/* Details for Selected Method */}
                            {!isUpiSelected && hasBankAccount ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <div className="bg-white px-3 py-2 rounded-lg border border-gray-200">
                                        <span className="text-[10px] uppercase text-gray-400 font-bold block">
                                            Account Holder
                                        </span>
                                        <span className="font-bold text-gray-900">
                                            {bankInfo.accountHolderName || doctorName}
                                        </span>
                                    </div>

                                    <div className="bg-white px-3 py-2 rounded-lg border border-gray-200">
                                        <span className="text-[10px] uppercase text-gray-400 font-bold block">
                                            Bank Name
                                        </span>
                                        <span className="font-bold text-gray-900">
                                            {bankInfo.bankName || "-"}
                                        </span>
                                    </div>

                                    <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] uppercase text-gray-400 font-bold block">
                                                Account Number
                                            </span>
                                            <span className="font-mono font-bold text-gray-900">
                                                {bankInfo.accountNumber}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => copyValue("acc", bankInfo.accountNumber)}
                                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 cursor-pointer"
                                            title="Copy Account Number"
                                        >
                                            {copiedKey === "acc" ? (
                                                <Check size={14} className="text-emerald-600" />
                                            ) : (
                                                <Copy size={14} />
                                            )}
                                        </button>
                                    </div>

                                    <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] uppercase text-gray-400 font-bold block">
                                                IFSC Code
                                            </span>
                                            <span className="font-mono font-bold text-gray-900">
                                                {bankInfo.ifscCode}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => copyValue("ifsc", bankInfo.ifscCode)}
                                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 cursor-pointer"
                                            title="Copy IFSC Code"
                                        >
                                            {copiedKey === "ifsc" ? (
                                                <Check size={14} className="text-emerald-600" />
                                            ) : (
                                                <Copy size={14} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <div className="bg-white px-3 py-2 rounded-lg border border-gray-200">
                                        <span className="text-[10px] uppercase text-gray-400 font-bold block">
                                            Account Holder
                                        </span>
                                        <span className="font-bold text-gray-900">
                                            {bankInfo.accountHolderName || doctorName}
                                        </span>
                                    </div>

                                    <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] uppercase text-gray-400 font-bold block">
                                                UPI ID
                                            </span>
                                            <span className="font-mono font-bold text-gray-900">
                                                {bankInfo.upiId}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => copyValue("upi", bankInfo.upiId)}
                                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 cursor-pointer"
                                            title="Copy UPI ID"
                                        >
                                            {copiedKey === "upi" ? (
                                                <Check size={14} className="text-emerald-600" />
                                            ) : (
                                                <Copy size={14} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Optional Call & Consultation Verification Box (Single Session Settle) */}
                    {sessionSummary && (
                        <div
                            className={`p-3 rounded-xl border space-y-1 ${
                                sessionSummary.sessionStatus === "DOCTOR_NO_SHOW"
                                    ? "bg-red-50 border-red-300 text-red-900"
                                    : sessionSummary.sessionStatus === "DOCTOR_ENDED_EARLY" ||
                                      sessionSummary.sessionStatus === "DOCTOR_LATE"
                                    ? "bg-amber-50 border-amber-300 text-amber-950"
                                    : "bg-slate-50 border-slate-200 text-gray-800"
                            }`}
                        >
                            <div className="flex items-center justify-between font-bold">
                                <span>Consultation &amp; Call Verification:</span>
                                <span>
                                    {sessionSummary.sessionStatus === "DOCTOR_NO_SHOW"
                                        ? "Doctor Missed Call (0 Attempts)!"
                                        : sessionSummary.sessionStatus === "PATIENT_UNREACHABLE"
                                        ? `Patient No-Show (Dr Called ${sessionSummary.doctorCallAttempts || 1}x)`
                                        : sessionSummary.sessionStatus === "DOCTOR_ENDED_EARLY"
                                        ? "Doctor Ended Call Early"
                                        : sessionSummary.sessionStatus === "DOCTOR_LATE"
                                        ? `Doctor Joined ${sessionSummary.doctorLateMinutes || 0}m Late`
                                        : "Session Verified ✓"}
                                </span>
                            </div>
                            <div className="text-[11px] flex flex-wrap items-center gap-x-3 gap-y-0.5 opacity-90">
                                <span>
                                    Dr Calls: <strong>{sessionSummary.doctorCallAttempts || 0}x</strong>
                                </span>
                                <span>
                                    Connected Talk Time:{" "}
                                    <strong>
                                        {Math.floor(Number(sessionSummary.totalTalkSeconds || 0) / 60)}m{" "}
                                        {Number(sessionSummary.totalTalkSeconds || 0) % 60}s
                                    </strong>
                                </span>
                                <span>
                                    Advice / Rx:{" "}
                                    <strong>{sessionSummary.hasPrescription ? "Sent ✓" : "Pending"}</strong>
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Payout Breakdown */}
                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Patient Paid (Gross):</span>
                            <span className="font-bold text-gray-900">{formatINR(grossAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">
                                GoodMood Commission ({Number(commissionPercentage || 0)}%):
                            </span>
                            <span className="font-bold text-blue-700">-{formatINR(commissionAmount)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-emerald-200 text-sm">
                            <span className="font-bold text-gray-900">Net Amount to Pay Expert:</span>
                            <span className="font-black text-lg text-[#0B8843]">
                                {formatINR(netPayableAmount)}
                            </span>
                        </div>
                    </div>

                    {/* Step 3: Caution Warning + UTR + Bank Verification Checkbox */}
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-2.5 text-[11px] text-amber-950">
                        <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                            <strong className="font-bold">Important Warning Before Settling:</strong> Make sure the consultation took place before settling. Once marked <strong>Settled ✓</strong>, customer <strong>Refund</strong> will be permanently locked to prevent double loss (if the expert did not join, cancel and <strong>Refund</strong> the customer first). Settling will also notify Dr. {doctorName}.
                        </div>
                    </div>

                    {isBankAvailable && (
                        <label className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={bankVerifiedChecked}
                                onChange={(e) => setBankVerifiedChecked(e.target.checked)}
                                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#0B8843] cursor-pointer"
                            />
                            <span className="text-xs font-semibold text-gray-800 leading-snug">
                                {isUpiSelected ? (
                                    <>
                                        I have verified Dr. {doctorName}&apos;s UPI ID (
                                        <span className="font-mono">{bankInfo.upiId}</span>) before settling{" "}
                                    </>
                                ) : (
                                    <>
                                        I have verified Dr. {doctorName}&apos;s bank account (••••
                                        {String(bankInfo.accountNumber || "").slice(-4)}) before settling{" "}
                                    </>
                                )}
                                <strong className="text-[#0B8843]">{formatINR(netPayableAmount)}</strong>.
                            </span>
                        </label>
                    )}
                </div>
            </Modal.Body>

            <Modal.Footer className="border-t border-gray-100 px-6 py-4 bg-gray-50/60">
                <div className="flex justify-end gap-2.5 w-full">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={loadingBank || !isBankAvailable || !bankVerifiedChecked || submitting}
                        onClick={() =>
                            onConfirmSettle?.({
                                utr,
                                mode: isUpiSelected ? "UPI_TRANSFER" : "BANK_TRANSFER",
                                bankInfo,
                            })
                        }
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0B8843] hover:bg-black text-white text-xs font-bold cursor-pointer disabled:opacity-40 transition-all"
                    >
                        <Send size={13} />
                        {submitting ? "Settling..." : `Confirm & Settle ${formatINR(netPayableAmount)}`}
                    </button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default BankVerifySettleModal;
