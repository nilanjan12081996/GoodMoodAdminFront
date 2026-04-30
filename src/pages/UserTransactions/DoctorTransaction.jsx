import React, { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useDispatch, useSelector } from "react-redux";
import { getAllDoctorTransactionTotals } from "../../Reducer/DoctorTransactionSlice";
import { getDoctor } from "../../Reducer/DoctorSlice";
import { Eye, IndianRupee, ArrowLeft } from "lucide-react";
import { Button, Modal } from "flowbite-react";
import { useNavigate } from "react-router-dom";

const DoctorTransaction = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { doctorTotals, loading } = useSelector((state) => state?.doctorTransaction);
    const { doctorsDetails } = useSelector((state) => state?.doctors);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        dispatch(getAllDoctorTransactionTotals());
        dispatch(getDoctor());
    }, [dispatch]);

    // Merge doctor details with totals if needed, or just use totals
    const rowData = useMemo(() => {
        if (!doctorTotals) return [];
        
        return doctorTotals.map(total => {
            const doctor = doctorsDetails?.data?.find(d => d.id === total.doctorId);
            return {
                ...total,
                doctorName: total.doctorName || (doctor ? `${doctor.firstName} ${doctor.lastName}` : `Doctor ID: ${total.doctorId}`),
                unpaidAmount: total.unpaidAmount || 0,
                unpaidTransactionCount: total.unpaidTransactionCount || 0,
                paidAmount: total.paidAmount || 0,
                paidTransactionCount: total.paidTransactionCount || 0
            };
        });
    }, [doctorTotals, doctorsDetails]);

    const columnDefs = useMemo(() => [
        {
            field: "doctorName",
            headerName: "Doctor Name",
            sortable: true,
            filter: true,
            flex: 1.5
        },
        {
            field: "unpaidTransactionCount",
            headerName: "Unpaid Appointments",
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
            headerName: "Actions",
            width: 150,
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
                            <h2 className="text-2xl font-bold text-gray-800">Doctors Revenue</h2>
                            <p className="text-gray-500 text-sm mt-1">Manage pending and completed settlements</p>
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
                        defaultColDef={{
                            resizable: true,
                        }}
                        overlayLoadingTemplate='<span class="ag-overlay-loading-center">Fetching data...</span>'
                        overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No records found</span>'
                    />
                </div>
            </div>

            {/* Doctor Detail Modal */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
                <Modal.Header>
                    Transaction Details: {selectedDoctor?.doctorName}
                </Modal.Header>
                <Modal.Body>
                    <div className="space-y-6 p-2">
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
                                    <span className="text-xs text-gray-500 uppercase font-semibold">Appointments</span>
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
                                    <span className="text-xs text-gray-500 uppercase font-semibold">Appointments</span>
                                    <span className="text-xl font-bold text-gray-800">{selectedDoctor?.paidTransactionCount}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 uppercase font-semibold">Total Settled</span>
                                    <span className="text-xl font-bold text-green-700">₹{selectedDoctor?.paidAmount?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Overall Section */}
                        <div className="p-4 bg-gray-50 rounded-xl flex justify-between items-center border border-gray-100">
                            <span className="font-semibold text-gray-700">Total Combined Revenue</span>
                            <span className="text-2xl font-black text-gray-900">
                                ₹{((selectedDoctor?.unpaidAmount || 0) + (selectedDoctor?.paidAmount || 0)).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="flex justify-end">
                    <Button color="gray" onClick={() => setIsModalOpen(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};


export default DoctorTransaction;
