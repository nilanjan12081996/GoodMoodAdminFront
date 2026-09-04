import React, { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useDispatch, useSelector } from "react-redux";
import { getAllDoctorTransactionTotals } from "../../Reducer/DoctorTransactionSlice";
import { getDoctor } from "../../Reducer/DoctorSlice";
import { Eye, IndianRupee, ArrowLeft, Search, CheckCircle, CreditCard } from "lucide-react";
import { Button, Modal, Select, Label, TextInput } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { Filter, X } from "lucide-react";
import { toggleIsPaid, getAllTransactions } from "../../Reducer/TransactionHistorySlice";
import { FileText } from "lucide-react";

const DoctorTransaction = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { doctorTotals, loading } = useSelector((state) => state?.doctorTransaction);
    const { doctorsDetails } = useSelector((state) => state?.doctors);
    const { transactionHistory } = useSelector((state) => state?.transactionHistory);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Filter states
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        month: "",
        year: ""
    });

    useEffect(() => {
        dispatch(getAllDoctorTransactionTotals(filters));
        dispatch(getDoctor());
        dispatch(getAllTransactions());
    }, [dispatch, filters]);

    const handleTogglePaid = async (tx) => {
        const transaction = transactionHistory?.find(t => t.transactionCode === tx.transactionCode);
        const idToToggle = tx.id || transaction?.id;
        if (idToToggle) {
            await dispatch(toggleIsPaid(idToToggle));
            dispatch(getAllDoctorTransactionTotals(filters));
            dispatch(getAllTransactions());
            
            // Update selectedDoctor in the modal to reflect changes
            if (selectedDoctor) {
                // The re-fetch will update doctorTotals, we should update selectedDoctor
                // But since doctorTotals is used in rowData, maybe just close modal or let user see it disappear.
                // We'll close the modal or let the user close it.
                // It might be better to just let Redux update state, but selectedDoctor is local state.
                // To safely update the modal without closing, we can trigger a refetch and update selectedDoctor from new rowData.
            }
        }
    };

    // Keep selectedDoctor in sync with Redux updates
    useEffect(() => {
        if (selectedDoctor && doctorTotals) {
            const updatedDoctor = doctorTotals.find(d => d.doctorId === selectedDoctor.doctorId);
            if (updatedDoctor) {
                const doctorInfo = doctorsDetails?.data?.find(d => d.id === updatedDoctor.doctorId);
                setSelectedDoctor({
                    ...updatedDoctor,
                    doctorName: updatedDoctor.doctorName || (doctorInfo ? `${doctorInfo.firstName} ${doctorInfo.lastName}` : `Expert ID: ${updatedDoctor.doctorId}`),
                    unpaidAmount: updatedDoctor.unpaidAmount || 0,
                    unpaidTransactionCount: updatedDoctor.unpaidTransactionCount || 0,
                    paidAmount: updatedDoctor.paidAmount || 0,
                    paidTransactionCount: updatedDoctor.paidTransactionCount || 0,
                    platformPercentage: updatedDoctor.platformPercentage || 0,
                    appliedPercentages: updatedDoctor.appliedPercentages || [],
                    platformCharges: updatedDoctor.platformCharges || 0,
                    payableAmount: updatedDoctor.payableAmount || 0,
                    unpaidTransactions: updatedDoctor.unpaidTransactions || [],
                    paidTransactions: updatedDoctor.paidTransactions || []
                });
            } else {
                setIsModalOpen(false);
            }
        }
    }, [doctorTotals, doctorsDetails]);
    
    const handleGeneratePDF = async () => {
        const element = document.getElementById('transaction-modal-content');
        if (!element) return;
        
        const html2pdf = (await import('html2pdf.js/dist/html2pdf.bundle.min.js')).default;

        const opt = {
            margin:       [10, 10, 10, 10],
            filename:     `${selectedDoctor?.doctorName || 'Expert'}_Payment_Statement.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Temporarily hide actions column if any
        html2pdf().from(element).set(opt).save();
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        setFilters({
            startDate: "",
            endDate: "",
            month: "",
            year: ""
        });
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
        { value: "12", label: "December" }
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

    // Merge doctor details with totals if needed, or just use totals
    const rowData = useMemo(() => {
        if (!doctorTotals) return [];
        
        return doctorTotals.map(total => {
            const doctor = doctorsDetails?.data?.find(d => d.id === total.doctorId);
            return {
                ...total,
                doctorName: total.doctorName || (doctor ? `${doctor.firstName} ${doctor.lastName}` : `Expert ID: ${total.doctorId}`),
                unpaidAmount: total.unpaidAmount || 0,
                unpaidTransactionCount: total.unpaidTransactionCount || 0,
                paidAmount: total.paidAmount || 0,
                paidTransactionCount: total.paidTransactionCount || 0,
                platformPercentage: total.platformPercentage || 0,
                appliedPercentages: total.appliedPercentages || [],
                platformCharges: total.platformCharges || 0,
                payableAmount: total.payableAmount || 0,
                unpaidTransactions: total.unpaidTransactions || [],
                paidTransactions: total.paidTransactions || []
            };
        });
    }, [doctorTotals, doctorsDetails]);

    const columnDefs = useMemo(() => [
        {
            field: "doctorName",
            headerName: "Expert Name",
            sortable: true,
            filter: true,
            flex: 1.5
        },
        {
            field: "unpaidTransactionCount",
            headerName: "Unpaid Payments",
            sortable: true,
            filter: true,
            flex: 1,
            cellRenderer: (params) => (
                <div className="flex items-center h-full">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                        {params.value}
                    </span>
                </div>
            )
        },
        {
            field: "unpaidAmount",
            headerName: "Unpaid Amount",
            sortable: true,
            filter: true,
            flex: 1,
            valueFormatter: (params) => {
                return params.value ? `₹${params.value.toFixed(2)}` : "₹0.00";
            },
            cellClass: "font-bold text-red-500"
        },
        {
            field: "platformCharges",
            headerName: "Platform Charges",
            sortable: true,
            filter: true,
            flex: 1,
            valueFormatter: (params) => {
                return params.value ? `₹${params.value.toFixed(2)}` : "₹0.00";
            },
            cellClass: "text-gray-600 italic"
        },
        {
            field: "platformPercentage",
            headerName: "Platform %",
            sortable: true,
            filter: true,
            flex: 0.8,
            valueFormatter: (params) => {
                return params.value ? `${params.value}%` : "0%";
            },
            cellClass: "text-blue-500 font-medium"
        },
        {
            field: "payableAmount",
            headerName: "Payout Due",
            sortable: true,
            filter: true,
            flex: 1,
            valueFormatter: (params) => {
                return params.value ? `₹${params.value.toFixed(2)}` : "₹0.00";
            },
            cellClass: "font-bold text-[#52b69a]"
        },
        {
            headerName: "Actions",
            width: 120,
            cellRenderer: (params) => (
                <div className="flex items-center h-full">
                    <Button
                        size="xs"
                        className="bg-[#52b69a] hover:bg-black text-white"
                        onClick={() => {
                            setSelectedDoctor(params.data);
                            setIsModalOpen(true);
                        }}
                    >
                        <Eye size={14} className="mr-1" /> View
                    </Button>
                </div>
            )
        }
    ], []);

    return (
        <div className="wrapper_area my-0 mx-auto p-6 rounded-xl bg-white shadow-sm">
            <div className="h-full">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft size={20} className="text-gray-600" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Experts Revenue</h2>
                            <p className="text-gray-500 text-sm mt-1">Manage pending and completed settlements</p>
                        </div>
                    </div>

                    <div className="relative w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search expert or amount..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#52b69a] focus:border-[#52b69a] sm:text-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 space-y-4">
                    <div className="flex items-center gap-2 text-gray-700 font-bold text-sm mb-2">
                        <Filter size={16} />
                        Settlement Filters
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="space-y-1">
                            <Label htmlFor="startDate" value="Start Date" className="text-[10px] uppercase text-gray-500 font-bold" />
                            <TextInput
                                id="startDate"
                                name="startDate"
                                type="date"
                                size="sm"
                                value={filters.startDate}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="endDate" value="End Date" className="text-[10px] uppercase text-gray-500 font-bold" />
                            <TextInput
                                id="endDate"
                                name="endDate"
                                type="date"
                                size="sm"
                                value={filters.endDate}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="month" value="By Month" className="text-[10px] uppercase text-gray-500 font-bold" />
                            <Select id="month" name="month" value={filters.month} onChange={handleFilterChange}>
                                <option value="">All Months</option>
                                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="year" value="By Year" className="text-[10px] uppercase text-gray-500 font-bold" />
                            <Select id="year" name="year" value={filters.year} onChange={handleFilterChange}>
                                <option value="">All Years</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </Select>
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                color="light" 
                                className="w-full border-gray-300 text-gray-600 hover:bg-gray-100"
                                onClick={resetFilters}
                                disabled={!filters.startDate && !filters.endDate && !filters.month && !filters.year}
                            >
                                <X size={16} className="mr-2" /> Reset
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="ag-theme-alpine w-full overflow-hidden rounded-lg border border-gray-200" style={{ height: 'calc(100vh - 250px)' }}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        pagination={true}
                        paginationPageSize={15}
                        domLayout="normal"
                        quickFilterText={searchTerm}
                        defaultColDef={{
                            resizable: true,
                        }}
                        overlayLoadingTemplate='<span class="ag-overlay-loading-center">Fetching data...</span>'
                        overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No records found</span>'
                    />
                </div>
            </div>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} size="4xl">
                <Modal.Header>
                    Transaction Details: {selectedDoctor?.doctorName}
                </Modal.Header>
                <Modal.Body>
                    <div id="transaction-modal-content" className="space-y-6 p-2">
                        {/* Unpaid Section */}
                        <div className="border border-orange-200 rounded-xl overflow-hidden">
                            <div className="bg-orange-50 px-4 py-2 border-b border-orange-200">
                                <h3 className="text-orange-800 font-bold flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                    Unpaid Summary
                                </h3>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 uppercase font-semibold">Payments</span>
                                    <span className="text-xl font-bold text-gray-800">{selectedDoctor?.unpaidTransactionCount}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 uppercase font-semibold">Pending Amount</span>
                                    <span className="text-xl font-bold text-red-600">₹{selectedDoctor?.unpaidAmount?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Paid Section */}
                        <div className="border border-green-200 rounded-xl overflow-hidden">
                            <div className="bg-green-50 px-4 py-2 border-b border-green-200">
                                <h3 className="text-green-800 font-bold flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    Paid Summary
                                </h3>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 uppercase font-semibold">Payments</span>
                                    <span className="text-xl font-bold text-gray-800">{selectedDoctor?.paidTransactionCount}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 uppercase font-semibold">Total Settled</span>
                                    <span className="text-xl font-bold text-green-700">₹{selectedDoctor?.paidAmount?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Overall Section */}
                        <div className="border border-blue-200 rounded-xl overflow-hidden">
                            <div className="bg-blue-50 px-4 py-2 border-b border-blue-200">
                                <h3 className="text-blue-800 font-bold flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    Settlement Summary
                                </h3>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 font-medium text-sm">Unpaid Revenue (Pending)</span>
                                    <span className="font-bold text-gray-800">
                                        ₹{selectedDoctor?.unpaidAmount?.toFixed(2) || "0.00"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-start text-sm border-t border-blue-100 pt-2">
                                    <div className="flex flex-col">
                                        <span className="text-gray-600 font-medium italic">Platform Charges ({selectedDoctor?.platformPercentage}% Effective)</span>
                                        {selectedDoctor?.appliedPercentages?.length > 1 && (
                                            <span className="text-[10px] text-gray-400">Applied rates: {selectedDoctor.appliedPercentages.join("%, ")}%</span>
                                        )}
                                    </div>
                                    <span className="font-bold text-red-500">- ₹{selectedDoctor?.platformCharges?.toFixed(2) || "0.00"}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-blue-200 mt-1">
                                    <span className="text-lg font-bold text-gray-900 uppercase tracking-tight">Net Payout Due</span>
                                    <span className="text-2xl font-black text-[#52b69a]">
                                        ₹{selectedDoctor?.payableAmount?.toFixed(2) || "0.00"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Total Revenue Footer */}
                        <div className="p-4 bg-gray-50 rounded-xl flex justify-between items-center border border-gray-200">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Overall Expert Earnings</span>
                                <span className="text-sm text-gray-400 font-medium">(Paid + Unpaid)</span>
                            </div>
                            <span className="text-xl font-bold text-gray-700">
                                ₹{((selectedDoctor?.unpaidAmount || 0) + (selectedDoctor?.paidAmount || 0)).toFixed(2)}
                            </span>
                        </div>

                        {/* Detailed Transactions Section */}
                        <div className="mt-8 space-y-8">
                            {/* Unpaid Detailed Table */}
                            {selectedDoctor?.unpaidTransactions?.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-orange-700 uppercase tracking-wider flex items-center gap-2 px-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                        Pending Payments Breakdown
                                    </h4>
                                    <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
                                        <table className="w-full text-sm text-left text-gray-500">
                                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-3 font-bold">Date / Category</th>
                                                    <th className="px-4 py-3 font-bold">Total</th>
                                                    <th className="px-4 py-3 font-bold text-red-500 text-center">Platform Charges</th>
                                                    <th className="px-4 py-3 font-bold text-[#52b69a] text-right">Net Payout</th>
                                                    <th className="px-4 py-3 font-bold text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {selectedDoctor.unpaidTransactions.map((tx, idx) => (
                                                    <tr key={idx} className="bg-white hover:bg-orange-50/30 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <div className="font-semibold text-gray-900">{tx.date}</div>
                                                            <div className="text-[10px] text-gray-400 font-medium uppercase">{tx.supportCategoryName || "General Support"}</div>
                                                            <div className="text-[9px] text-gray-300 font-mono mt-0.5">{tx.transactionCode}</div>
                                                        </td>
                                                        <td className="px-4 py-3 font-medium text-gray-700">₹{tx.totalAmount.toFixed(2)}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="text-red-500 font-bold">-₹{tx.platformChargeAmount.toFixed(2)}</div>
                                                            <div className="text-[10px] text-gray-400 italic">({tx.platformPercentage}%)</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="text-[#52b69a] font-black text-base">₹{tx.payoutAmount.toFixed(2)}</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <Button
                                                                size="xs"
                                                                className="bg-[#52b69a] hover:bg-black text-white w-full max-w-[110px] mx-auto"
                                                                onClick={() => handleTogglePaid(tx)}
                                                            >
                                                                <CheckCircle size={14} className="mr-1" /> Mark Paid
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Paid Detailed Table */}
                            {selectedDoctor?.paidTransactions?.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-green-700 uppercase tracking-wider flex items-center gap-2 px-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                        Settled Payments History
                                    </h4>
                                    <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
                                        <table className="w-full text-sm text-left text-gray-500">
                                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-3 font-bold">Date / Category</th>
                                                    <th className="px-4 py-3 font-bold">Total</th>
                                                    <th className="px-4 py-3 font-bold text-gray-500 text-center">Platform Charges</th>
                                                    <th className="px-4 py-3 font-bold text-green-700 text-right">Settled Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {selectedDoctor.paidTransactions.map((tx, idx) => (
                                                    <tr key={idx} className="bg-white hover:bg-green-50/30 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <div className="font-semibold text-gray-900">{tx.date}</div>
                                                            <div className="text-[10px] text-gray-400 font-medium uppercase">{tx.supportCategoryName || "General Support"}</div>
                                                            <div className="text-[9px] text-gray-300 font-mono mt-0.5">{tx.transactionCode}</div>
                                                        </td>
                                                        <td className="px-4 py-3 font-medium text-gray-700">₹{tx.totalAmount.toFixed(2)}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="text-gray-500 font-bold">-₹{tx.platformChargeAmount.toFixed(2)}</div>
                                                            <div className="text-[10px] text-gray-400 italic">({tx.platformPercentage}%)</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="text-green-700 font-black text-base">₹{tx.payoutAmount.toFixed(2)}</div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="flex justify-between items-center">
                    <Button 
                        color="success" 
                        onClick={handleGeneratePDF}
                        className="bg-[#52b69a] hover:bg-black font-bold"
                    >
                        <FileText size={18} className="mr-2" /> Generate PDF Statement
                    </Button>
                    <Button color="gray" onClick={() => setIsModalOpen(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};


export default DoctorTransaction;
