import React, { useEffect } from "react";
import { Modal, Button, TextInput, Label, Select } from "flowbite-react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { getRbacRoleList, getRbacUserList, updateRbacUser, getRbacUserById } from "../../Reducer/RbacSlice";
import { toast } from "react-toastify";

const UpdateUserModal = ({ openModal, setOpenModal, userId }) => {
    const dispatch = useDispatch();
    const { rbacRoleList, selectedUser, loading } = useSelector((state) => state?.rbac);
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        if (openModal && userId) {
            dispatch(getRbacRoleList());
            dispatch(getRbacUserById(userId));
        }
    }, [openModal, userId, dispatch]);

    useEffect(() => {
        if (selectedUser) {
            setValue("firstName", selectedUser.firstName);
            setValue("lastName", selectedUser.lastName);
            setValue("username", selectedUser.username);
            setValue("email", selectedUser.email);
            setValue("mobile", selectedUser.mobile);
            setValue("roleId", selectedUser.roleId);
            setValue("status", selectedUser.status);
        }
    }, [selectedUser, setValue]);

    const handleClose = () => {
        setOpenModal(false);
        reset();
    };

    const onSubmit = (data) => {
        // Even if disabled, some browsers might send values, 
        // but it's safe to send them since the backend will likely ignore or validate them.
        dispatch(updateRbacUser({ id: userId, userData: data })).then((res) => {
            if (res?.payload?.statusCode === 200) {
                toast.success(res?.payload?.message || "User updated successfully");
                dispatch(getRbacUserList());
                handleClose();
            } else {
                toast.error(res?.payload?.message || "Failed to update user");
            }
        });
    };

    return (
        <Modal show={openModal} onClose={handleClose} size="md">
            <Modal.Header>Update User</Modal.Header>
            <Modal.Body>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="firstName" value="First Name" />
                            </div>
                            <TextInput
                                id="firstName"
                                required
                                {...register("firstName", { required: true })}
                            />
                        </div>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="lastName" value="Last Name" />
                            </div>
                            <TextInput
                                id="lastName"
                                required
                                {...register("lastName", { required: true })}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="username" value="Username (Permanent)" />
                        </div>
                        <TextInput
                            id="username"
                            disabled={true}
                            className="bg-gray-100"
                            {...register("username")}
                        />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="email" value="Email (Permanent)" />
                        </div>
                        <TextInput
                            id="email"
                            type="email"
                            disabled={true}
                            className="bg-gray-100"
                            {...register("email")}
                        />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="password" value="Change Password (Optional)" />
                        </div>
                        <TextInput
                            id="password"
                            type="password"
                            placeholder="Type new password to change"
                            {...register("password")}
                        />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="mobile" value="Mobile Number" />
                        </div>
                        <TextInput
                            id="mobile"
                            required
                            {...register("mobile", { required: true })}
                        />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="roleId" value="Role" />
                        </div>
                        <Select id="roleId" required {...register("roleId", { required: true })}>
                            <option value="">Select Role</option>
                            {rbacRoleList?.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.roleName}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="status" value="Status" />
                        </div>
                        <Select id="status" required {...register("status", { required: true })}>
                            <option value={1}>Active</option>
                            <option value={0}>Inactive</option>
                        </Select>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button color="gray" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-[#52b69a] hover:bg-black">
                            {loading ? "Updating..." : "Update User"}
                        </Button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    );
};

export default UpdateUserModal;
