import React, { useEffect, useMemo, useState, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useDispatch, useSelector } from "react-redux";
import { getAllTransactions, searchTransactions } from "../../Reducer/TransactionHistorySlice";
import { formatDate } from "../../utils/FormatData";
import { Search, Users } from "lucide-react";
import { Button } from "flowbite-react";
import debounce from "lodash.debounce";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

const TransactionUser = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams(); // Sidebar ID from URL
    const { transactionHistory, loading, message, error } = useSelector((state) => state?.transactionHistory);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        dispatch(getAllTransactions());
    }, [dispatch]);


    useEffect(() => {
        if (message) {
            if (error) {
                toast.error(message);
            } else {
                toast.success(message);
            }
        }
    }, [message, error]);

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((query) => {
            if (query.trim() === "") {
                dispatch(getAllTransactions());
            } else {
                dispatch(searchTransactions(query));
            }
        }, 500),
        [dispatch]
    );

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };



    const rowData = useMemo(() => {
        return transactionHistory || [];
    }, [transactionHistory]);

    const columnDefs = useMemo(() => [
        {
            field: "transactionId",
            headerName: "Order ID",
            sortable: true,
            filter: true,
            flex: 1
        },
        {
            field: "transactionCode",
            headerName: "Payment ID",
            sortable: true,
            filter: true,
            flex: 1
        },
        {
            field: "userName",
            headerName: "User Name",
            sortable: true,
            filter: true,
            flex: 1
        },
        {
            field: "doctorName",
            headerName: "Expert Name",
            sortable: true,
            filter: true,
            flex: 1
        },
        {
            field: "transactionPrice",
            headerName: "Amount",
            sortable: true,
            filter: true,
            flex: 0.8,
            valueFormatter: (params) => {
                return params.value ? `₹${params.value.toFixed(2)}` : "₹0.00";
            }
        },
        {
            field: "transactionStatus",
            headerName: "Status",
            sortable: true,
            filter: true,
            flex: 0.8,
            cellRenderer: (params) => {
                const status = params.value;
                let bgColor = "bg-gray-100 text-gray-800";
                if (status === "SUCCESS") bgColor = "bg-green-100 text-green-800";
                if (status === "PENDING") bgColor = "bg-yellow-100 text-yellow-800";
                if (status === "FAILED") bgColor = "bg-red-100 text-red-800";
                
                return (
                    <div className="flex items-center h-full">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bgColor}`}>
                            {status}
                        </span>
                    </div>
                );
            }
        },
        {
            field: "isPaid",
            headerName: "Settlement",
            sortable: true,
            filter: true,
            width: 150,
            cellRenderer: (params) => {
                const isPaid = params.value === 1;
                return (
                    <div className="flex items-center h-full">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isPaid ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}>
                            {isPaid ? "Paid" : "Pending"}
                        </span>
                    </div>
                );
            }
        },
        {
            field: "createdAt",
            headerName: "Date",
            sortable: true,
            filter: true,
            flex: 1,
            valueFormatter: (params) => {
                return params.value ? formatDate(params.value) : "N/A";
            }
        }
    ], []);

    return (
        <div className="wrapper_area my-0 mx-auto p-6 rounded-xl bg-white shadow-sm">
            <ToastContainer />
            <div className="h-full">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>
                        <p className="text-gray-500 text-sm mt-1">View and manage all system-wide transactions</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button color="gray" onClick={() => navigate(-1)}>Back</Button>
                        <Button 
                            onClick={() => navigate(`/DoctorTransaction/${id}`)}
                            className="bg-[#52b69a] hover:bg-black text-white"
                        >
                            <Users size={18} className="mr-2" /> Experts Transaction
                        </Button>

                        <div className="relative w-72">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#52b69a] focus:border-[#52b69a] sm:text-sm transition duration-150 ease-in-out"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
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
                        overlayLoadingTemplate='<span class="ag-overlay-loading-center">Fetching transactions...</span>'
                        overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No transactions found</span>'
                    />
                </div>
            </div>
        </div>
    );
};

export default TransactionUser;