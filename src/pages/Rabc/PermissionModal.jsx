import React, { useEffect, useState } from "react";
import { Modal, Button, Checkbox, Label } from "flowbite-react";
import { useDispatch, useSelector } from "react-redux";
import { getAdminPermissions, getPermissionSidebarList, saveAdminPermissions } from "../../Reducer/RbacSlice";
import { toast } from "react-toastify";

const PermissionModal = ({ openModal, setOpenModal, adminId }) => {
    const dispatch = useDispatch();
    const { permissionSidebarList, adminPermissions, loading } = useSelector((state) => state?.rbac);
    const [selectedPermissions, setSelectedPermissions] = useState({});

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
            adminPermissions.forEach(p => {
                initialPermissions[`${p.sidebarType}_${p.sidebarId}`] = true;
            });
            setSelectedPermissions(initialPermissions);
        }
    }, [adminPermissions]);

    const handleMasterChange = (master, isChecked) => {
        const newPermissions = { ...selectedPermissions };
        newPermissions[`MASTER_${master.id}`] = isChecked;

        // If user selects master sidebar, all subsidebar select by default
        // If uncheck the master sidebar, all subsidebar will uncheck
        if (master.subsidebar) {
            master.subsidebar.forEach(sub => {
                newPermissions[`SUB_${sub.id}`] = isChecked;
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
            if (isChecked) {
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
            } else {
                toast.error(res?.payload?.message || "Failed to save permissions");
            }
        });
    };

    return (
        <Modal show={openModal} onClose={() => setOpenModal(false)} size="lg">
            <Modal.Header>Manage Sidebar Permissions</Modal.Header>
            <Modal.Body className="max-h-[70vh] overflow-y-auto">
                <div className="space-y-6">
                    {permissionSidebarList?.map((master) => (
                        <div key={master.id} className="border-b pb-4 last:border-b-0">
                            <div className="flex items-center gap-3 mb-3">
                                <Checkbox
                                    id={`master-${master.id}`}
                                    checked={!!selectedPermissions[`MASTER_${master.id}`]}
                                    onChange={(e) => handleMasterChange(master, e.target.checked)}
                                />
                                <Label
                                    htmlFor={`master-${master.id}`}
                                    className="text-lg font-bold text-gray-900 cursor-pointer"
                                >
                                    {master.sidebarName}
                                </Label>
                            </div>

                            {master.subsidebar && master.subsidebar.length > 0 && (
                                <div className="ml-8 grid grid-cols-2 gap-3">
                                    {master.subsidebar.map((sub) => (
                                        <div key={sub.id} className="flex items-center gap-3">
                                            <Checkbox
                                                id={`sub-${sub.id}`}
                                                checked={!!selectedPermissions[`SUB_${sub.id}`]}
                                                disabled={!selectedPermissions[`MASTER_${master.id}`]}
                                                onChange={(e) => handleSubChange(master.id, sub.id, e.target.checked)}
                                            />
                                            <Label
                                                htmlFor={`sub-${sub.id}`}
                                                className={`text-sm cursor-pointer ${!selectedPermissions[`MASTER_${master.id}`] ? "text-gray-400" : "text-gray-700"}`}
                                            >
                                                {sub.subSidebarName}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className="flex justify-end w-full gap-3">
                    <Button color="gray" onClick={() => setOpenModal(false)}>
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
