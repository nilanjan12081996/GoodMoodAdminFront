import React, { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useDispatch, useSelector } from "react-redux";
import { getRbacUserList } from "../../Reducer/RbacSlice";
import { Button } from "flowbite-react";
import AddUserModal from "./AddUserModal";
import UpdateUserModal from "./UpdateUserModal";
import PermissionModal from "./PermissionModal";
import { UserPlus, ShieldCheck, Edit3 } from "lucide-react";

const ManageUsers = () => {
    const dispatch = useDispatch();
    const { rbacUserList, loading } = useSelector((state) => state?.rbac);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openUpdateModal, setOpenUpdateModal] = useState(false);
    const [openPermissionModal, setOpenPermissionModal] = useState(false);
    const [selectedAdminId, setSelectedAdminId] = useState(null);

    useEffect(() => {
        dispatch(getRbacUserList());
    }, [dispatch]);

    const handleOpenPermissions = (id) => {
        setSelectedAdminId(id);
        setOpenPermissionModal(true);
    };

    const handleOpenUpdate = (id) => {
        setSelectedAdminId(id);
        setOpenUpdateModal(true);
    };

    const rowData = useMemo(() => {
        return rbacUserList || [];
    }, [rbacUserList]);

    const columnDefs = useMemo(() => [
        {
            headerName: "Full Name",
            valueGetter: (params) => `${params.data.firstName} ${params.data.lastName}`,
            sortable: true,
            filter: true,
            flex: 1
        },
        {
            field: "username",
            headerName: "Username",
            sortable: true,
            filter: true,
            flex: 1
        },
        {
            field: "email",
            headerName: "Email",
            sortable: true,
            filter: true,
            flex: 1
        },
        {
            field: "mobile",
            headerName: "Mobile",
            sortable: true,
            filter: true,
            flex: 1
        },
        {
            field: "roleName",
            headerName: "Role",
            sortable: true,
            filter: true,
            flex: 1,
            cellRenderer: (params) => (
                <div className="flex items-center h-full">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                        {params.value}
                    </span>
                </div>
            )
        },
        {
            field: "status",
            headerName: "Status",
            sortable: true,
            filter: true,
            width: 120,
            cellRenderer: (params) => {
                const isActive = params.value === 1;
                return (
                    <div className="flex items-center h-full">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                );
            }
        },
        {
            headerName: "Actions",
            field: "actions",
            width: 250,
            cellRenderer: (params) => (
                <div className="flex items-center h-full gap-2">
                    <Button
                        size="xs"
                        onClick={() => handleOpenUpdate(params.data.id)}
                        className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1"
                    >
                        <Edit3 size={14} /> Edit
                    </Button>
                    <Button
                        size="xs"
                        onClick={() => handleOpenPermissions(params.data.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                    >
                        <ShieldCheck size={14} /> Action
                    </Button>
                </div>
            )
        }
    ], []);

    return (
        <div className="wrapper_area my-0 mx-auto p-6 rounded-xl bg-white shadow-sm">
            <div className="h-full">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Manage Users (RBAC)</h2>
                        <p className="text-gray-500 text-sm mt-1">Add and manage administrative users and their roles</p>
                    </div>
                    <Button 
                        onClick={() => setOpenAddModal(true)}
                        className="bg-[#52b69a] hover:bg-black text-white"
                    >
                        <UserPlus size={18} className="mr-2" /> Add User
                    </Button>
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
                        overlayLoadingTemplate='<span class="ag-overlay-loading-center">Fetching users...</span>'
                        overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No users found</span>'
                    />
                </div>
            </div>

            {openAddModal && (
                <AddUserModal openModal={openAddModal} setOpenModal={setOpenAddModal} />
            )}

            {openUpdateModal && (
                <UpdateUserModal
                    openModal={openUpdateModal}
                    setOpenModal={setOpenUpdateModal}
                    userId={selectedAdminId}
                />
            )}

            {openPermissionModal && (
                <PermissionModal
                    openModal={openPermissionModal}
                    setOpenModal={setOpenPermissionModal}
                    adminId={selectedAdminId}
                />
            )}
        </div>
    );
};

export default ManageUsers;