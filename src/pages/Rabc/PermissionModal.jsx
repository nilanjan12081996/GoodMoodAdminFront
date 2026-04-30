import React, { useEffect, useState } from "react";
import { Modal, Button, Checkbox, Label } from "flowbite-react";
import { useDispatch, useSelector } from "react-redux";
import { 
    getPermissionSidebarList, 
    getAdminPermissions, 
    saveAdminPermissions 
} from "../../Reducer/RbacSlice";
import { toast } from "react-toastify";

const PermissionModal = ({ openModal, setOpenModal, adminId }) => {
    const dispatch = useDispatch();
    const { permissionSidebarList, adminPermissions, loading } = useSelector((state) => state?.rbac);
    const [selectedPermissions, setSelectedPermissions] = useState({});
    const [inheritedPermissions, setInheritedPermissions] = useState({});

    useEffect(() => {
        if (openModal && adminId) {
            dispatch(getPermissionSidebarList());
            dispatch(getAdminPermissions(adminId));
        }
    }, [openModal, adminId, dispatch]);

    // Pre-populate permissions when adminPermissions are fetched
    useEffect(() => {
        if (adminPermissions) {
            const initialPermissions = {};
            const inherited = {};
            adminPermissions.forEach(p => {
                const key = `${p.sidebarType}_${p.sidebarId}`;
                initialPermissions[key] = true;
                if (p.isInherited) {
                    inherited[key] = true;
                }
            });
            setSelectedPermissions(initialPermissions);
            setInheritedPermissions(inherited);
        }
    }, [adminPermissions]);

    const handleMasterChange = (master, isChecked) => {
        const newPermissions = { ...selectedPermissions };
        newPermissions[`MASTER_${master.id}`] = isChecked;

        // If user selects master sidebar, all subsidebar select by default
        // If uncheck the master sidebar, all subsidebar will uncheck
        if (master.subsidebar) {
            master.subsidebar.forEach(sub => {
                // Don't change inherited sub-permissions
                if (!inheritedPermissions[`SUB_${sub.id}`]) {
                    newPermissions[`SUB_${sub.id}`] = isChecked;
                }
            });
        }
        setSelectedPermissions(newPermissions);
    };

    const handleSubChange = (masterId, subId, isChecked) => {
        // If master sidebar is not selected, no sub sidebar can be selected
        if (!selectedPermissions[`MASTER_${masterId}`]) {
            toast.warn("Please select the Master Sidebar first");
            return;
        }

        const newPermissions = { ...selectedPermissions };
        newPermissions[`SUB_${subId}`] = isChecked;
        setSelectedPermissions(newPermissions);
    };

    const handleSave = () => {
        const permissions = [];
        Object.entries(selectedPermissions).forEach(([key, isChecked]) => {
            // Only add to payload if it's checked AND NOT an inherited permission
            if (isChecked && !inheritedPermissions[key]) {
                const [type, id] = key.split("_");
                permissions.push({
                    sidebarId: parseInt(id),
                    sidebarType: type // 'MASTER' or 'SUB'
                });
            }
        });

        const payload = {
            adminId: adminId,
            permissions: permissions
        };

        dispatch(saveAdminPermissions(payload)).then((res) => {
            if (res?.payload?.statusCode === 200) {
                toast.success(res?.payload?.message);
                setOpenModal(false);
                setSelectedPermissions({});
                setInheritedPermissions({});
            } else {
                toast.error(res?.payload?.message || "Failed to save permissions");
            }
        });
    };

    const handleClose = () => {
        setOpenModal(false);
        setSelectedPermissions({});
        setInheritedPermissions({});
    };

    return (
        <Modal show={openModal} onClose={handleClose} size="lg">
            <Modal.Header>Manage Sidebar Permissions</Modal.Header>
            <Modal.Body className="max-h-[70vh] overflow-y-auto">
                <div className="space-y-6">
                    {permissionSidebarList?.map((master) => {
                        const isMasterInherited = !!inheritedPermissions[`MASTER_${master.id}`];
                        const isMasterSelected = !!selectedPermissions[`MASTER_${master.id}`];
                        
                        return (
                            <div key={master.id} className="border-b pb-4 last:border-b-0">
                                <div className="flex items-center gap-3 mb-3">
                                    <Checkbox
                                        id={`master-${master.id}`}
                                        checked={isMasterSelected}
                                        disabled={isMasterInherited}
                                        onChange={(e) => handleMasterChange(master, e.target.checked)}
                                        className="cursor-pointer disabled:cursor-not-allowed"
                                    />
                                    <Label
                                        htmlFor={`master-${master.id}`}
                                        className={`text-lg font-bold cursor-pointer flex items-center ${isMasterInherited ? "text-gray-400" : "text-gray-900"}`}
                                    >
                                        {master.sidebarName} 
                                        {isMasterInherited && (
                                            <span className="ml-2 px-2 py-0.5 text-[10px] bg-blue-50 text-blue-600 rounded-full border border-blue-100 font-medium">
                                                Inherited from Role
                                            </span>
                                        )}
                                    </Label>
                                </div>

                                {master.subsidebar && master.subsidebar.length > 0 && (
                                    <div className="ml-8 grid grid-cols-2 gap-3">
                                        {master.subsidebar.map((sub) => {
                                            const isSubInherited = !!inheritedPermissions[`SUB_${sub.id}`];
                                            const isSubSelected = !!selectedPermissions[`SUB_${sub.id}`];
                                            const isDisabled = isSubInherited || !isMasterSelected;

                                            return (
                                                <div key={sub.id} className="flex items-center gap-3">
                                                    <Checkbox
                                                        id={`sub-${sub.id}`}
                                                        checked={isSubSelected}
                                                        disabled={isDisabled}
                                                        onChange={(e) => handleSubChange(master.id, sub.id, e.target.checked)}
                                                        className="cursor-pointer disabled:cursor-not-allowed"
                                                    />
                                                    <Label
                                                        htmlFor={`sub-${sub.id}`}
                                                        className={`text-sm cursor-pointer flex items-center ${isDisabled ? "text-gray-400" : "text-gray-700"}`}
                                                    >
                                                        {sub.subSidebarName}
                                                        {isSubInherited && (
                                                            <span className="ml-1 text-[9px] text-blue-500 font-medium bg-blue-50 px-1 rounded border border-blue-100">
                                                                Inherited
                                                            </span>
                                                        )}
                                                    </Label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className="flex justify-end w-full gap-3">
                    <Button color="gray" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        disabled={loading}
                        className="bg-[#52b69a] hover:bg-black"
                        onClick={handleSave}
                    >
                        {loading ? "Saving..." : "Save Permissions"}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default PermissionModal;
