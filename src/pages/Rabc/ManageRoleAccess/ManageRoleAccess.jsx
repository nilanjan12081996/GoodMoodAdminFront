import React, { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useDispatch, useSelector } from "react-redux";
import { 
    getRbacRoleList, 
    createRbacRole, 
    resetCreateRoleState,
    getRoleSidebarAccess,
    saveRoleSidebar,
    resetSaveSidebarState
} from "../../../Reducer/RbacSlice";
import { Button, Modal, Checkbox, Label, TextInput } from "flowbite-react";
import { ShieldAlert, ShieldCheck, Edit3, Plus, Save, X } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

const ManageRoleAccess = () => {
    const dispatch = useDispatch();
    const { 
        rbacRoleList, 
        roleSidebarAccess,
        createRoleLoading, 
        createRoleSuccess, 
        saveSidebarLoading,
        saveSidebarSuccess,
        roleError 
    } = useSelector((state) => state?.rbac);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    
    const [formData, setFormData] = useState({
        roleName: "",
        roleShortName: "",
    });

    useEffect(() => {
        dispatch(getRbacRoleList());
    }, [dispatch]);

    useEffect(() => {
        if (createRoleSuccess) {
            toast.success("Role created successfully");
            setIsCreateModalOpen(false);
            setFormData({ roleName: "", roleShortName: "" });
            dispatch(getRbacRoleList());
            dispatch(resetCreateRoleState());
        }
        if (roleError && isCreateModalOpen) {
            toast.error(roleError);
            dispatch(resetCreateRoleState());
        }
    }, [createRoleSuccess, roleError, dispatch, isCreateModalOpen]);

    useEffect(() => {
        if (saveSidebarSuccess) {
            toast.success("Permissions updated successfully");
            setIsModalOpen(false);
            dispatch(resetSaveSidebarState());
        }
    }, [saveSidebarSuccess, dispatch]);

    useEffect(() => {
        if (roleSidebarAccess?.length > 0) {
            const accessIds = roleSidebarAccess
                .filter(sidebar => sidebar.hasAccess)
                .map(sidebar => sidebar.id);
            setSelectedPermissions(accessIds);
        } else {
            setSelectedPermissions([]);
        }
    }, [roleSidebarAccess]);

    const handleOpenPermissions = (role) => {
        setSelectedRole(role);
        dispatch(getRoleSidebarAccess(role.id));
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateRole = (e) => {
        e.preventDefault();
        if (!formData.roleName || !formData.roleShortName) {
            toast.error("Please fill all fields");
            return;
        }
        dispatch(createRbacRole(formData));
    };

    const handlePermissionChange = (sidebarId) => {
        setSelectedPermissions(prev => {
            if (prev.includes(sidebarId)) {
                return prev.filter(id => id !== sidebarId);
            } else {
                return [...prev, sidebarId];
            }
        });
    };

    const handleSavePermissions = () => {
        if (!selectedRole) return;
        dispatch(saveRoleSidebar({
            roleId: selectedRole.id,
            sidebarIds: selectedPermissions
        }));
    };

    const rowData = useMemo(() => {
        return rbacRoleList || [];
    }, [rbacRoleList]);

    const columnDefs = useMemo(() => [
        {
            field: "roleName",
            headerName: "Role Name",
            sortable: true,
            filter: true,
            flex: 1,
            cellRenderer: (params) => (
                <div className="flex items-center h-full">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {params.value}
                    </span>
                </div>
            )
        },
        {
            headerName: "Actions",
            field: "actions",
            width: 250,
            cellRenderer: (params) => (
                <div className="flex items-center h-full gap-2">
                    <Button
                        size="xs"
                        className="bg-[#52b69a] hover:bg-black text-white flex items-center gap-1"
                    >
                        <Edit3 size={14} className="mr-1" /> Edit
                    </Button>
                    <Button
                        size="xs"
                        onClick={() => handleOpenPermissions(params.data)}
                        className="bg-[#52b69a] hover:bg-black text-white flex items-center gap-1"
                    >
                        <ShieldCheck size={14} className="mr-1" /> Permissions
                    </Button>
                </div>
            )
        }
    ], []);

    return (
        <div className="wrapper_area my-0 mx-auto p-6 rounded-xl bg-white shadow-sm">
            <ToastContainer />
            <div className="h-full">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Manage Role Access</h2>
                        <p className="text-gray-500 text-sm mt-1">Configure and manage roles and their associated permissions</p>
                    </div>
                    <Button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-[#52b69a] hover:bg-black text-white"
                    >
                        <Plus size={18} className="mr-2" /> Create Role
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
                        overlayLoadingTemplate='<span class="ag-overlay-loading-center">Fetching roles...</span>'
                        overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No roles found</span>'
                    />
                </div>
            </div>

            {/* Create Role Modal */}
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} size="md">
                <Modal.Header className="border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Plus className="text-[#52b69a]" size={24} />
                        <span className="text-xl font-bold text-gray-800">Create New Role</span>
                    </div>
                </Modal.Header>
                <Modal.Body className="p-6">
                    <form onSubmit={handleCreateRole} className="space-y-4">
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="roleName" value="Role Name" />
                            </div>
                            <TextInput
                                id="roleName"
                                name="roleName"
                                placeholder="e.g. ADMINISTRATOR"
                                value={formData.roleName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="roleShortName" value="Role Short Name" />
                            </div>
                            <TextInput
                                id="roleShortName"
                                name="roleShortName"
                                placeholder="e.g. ADMIN"
                                value={formData.roleShortName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer className="border-t border-gray-100 flex justify-end gap-3 p-4">
                    <Button 
                        color="gray" 
                        onClick={() => setIsCreateModalOpen(false)}
                        className="hover:bg-gray-100 border-gray-300"
                    >
                        <X size={18} className="mr-2" /> Cancel
                    </Button>
                    <Button 
                        onClick={handleCreateRole}
                        disabled={createRoleLoading}
                        className="bg-[#52b69a] hover:bg-black text-white"
                    >
                        {createRoleLoading ? "Creating..." : "Create Role"}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Permissions Modal */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
                <Modal.Header className="border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="text-[#52b69a]" size={24} />
                        <div>
                            <span className="text-xl font-bold text-gray-800">Role Permissions</span>
                            <p className="text-xs font-normal text-gray-500 mt-1">Managing access for <span className="font-semibold text-blue-600">{selectedRole?.roleName}</span></p>
                        </div>
                    </div>
                </Modal.Header>
                <Modal.Body className="p-6">
                    <div className="space-y-4">
                        <p className="text-sm font-medium text-gray-700 mb-4">Select Master Sidebar Access:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {roleSidebarAccess && roleSidebarAccess.length > 0 ? (
                                roleSidebarAccess.map((sidebar) => (
                                    <div 
                                        key={sidebar.id} 
                                        className={`relative flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                            selectedPermissions.includes(sidebar.id) 
                                            ? 'border-[#52b69a] bg-green-50' 
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <Checkbox 
                                            id={`sidebar-${sidebar.id}`} 
                                            checked={selectedPermissions.includes(sidebar.id)}
                                            onChange={() => handlePermissionChange(sidebar.id)}
                                            className="text-[#52b69a] focus:ring-[#52b69a] cursor-pointer z-10"
                                        />
                                        <Label 
                                            htmlFor={`sidebar-${sidebar.id}`}
                                            className="flex-1 cursor-pointer font-medium text-gray-700 select-none before:absolute before:inset-0"
                                        >
                                            {sidebar.sidebarName}
                                        </Label>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 text-center py-4 text-gray-500 italic">
                                    No master sidebars available.
                                </div>
                            )}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-t border-gray-100 flex justify-end gap-3 p-4">
                    <Button 
                        color="gray" 
                        onClick={() => setIsModalOpen(false)}
                        className="hover:bg-gray-100 border-gray-300"
                    >
                        <X size={18} className="mr-2" /> Cancel
                    </Button>
                    <Button 
                        onClick={handleSavePermissions}
                        disabled={saveSidebarLoading}
                        className="bg-[#52b69a] hover:bg-black text-white"
                    >
                        {saveSidebarLoading ? "Saving..." : "Save Changes"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ManageRoleAccess;