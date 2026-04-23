import React, { useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useDispatch, useSelector } from "react-redux";
import { getAllTransactions } from "../../Reducer/TransactionHistorySlice";
import { formatDate } from "../../utils/FormatData";

const TransactionUser = () => {
    const dispatch = useDispatch();
    const { transactionHistory, loading } = useSelector((state) => state?.transactionHistory);

    useEffect(() => {
        dispatch(getAllTransactions());
    }, [dispatch]);

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
            headerName: "Doctor Name",
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
            <div className="h-full">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>
                        <p className="text-gray-500 text-sm mt-1">View and manage all system-wide transactions</p>
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