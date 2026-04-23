import React, { useEffect } from "react";
import { Modal, Button, TextInput, Label, Select } from "flowbite-react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { addRbacUser, getRbacRoleList, getRbacUserList } from "../../Reducer/RbacSlice";
import { toast } from "react-toastify";

const AddUserModal = ({ openModal, setOpenModal }) => {
    const dispatch = useDispatch();
    const { rbacRoleList, loading } = useSelector((state) => state?.rbac);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        dispatch(getRbacRoleList());
    }, [dispatch]);

    const handleClose = () => {
        setOpenModal(false);
        reset();
    };

    const onSubmit = (data) => {
        dispatch(addRbacUser(data)).then((res) => {
            if (res?.payload?.statusCode === 200) {
                toast.success(res?.payload?.message || "User added successfully");
                dispatch(getRbacUserList());
                handleClose();
            } else {
                toast.error(res?.payload?.message || "Failed to add user");
            }
        });
    };

    return (
        <Modal show={openModal} onClose={handleClose} size="md">
            <Modal.Header>Add New User</Modal.Header>
            <Modal.Body>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="firstName" value="First Name" />
                            </div>
                            <TextInput
                                id="firstName"
                                placeholder="John"
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
                                placeholder="Doe"
                                required
                                {...register("lastName", { required: true })}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="username" value="Username" />
                        </div>
                        <TextInput
                            id="username"
                            placeholder="johndoe123"
                            required
                            {...register("username", { required: true })}
                        />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="email" value="Email" />
                        </div>
                        <TextInput
                            id="email"
                            type="email"
                            placeholder="name@company.com"
                            required
                            {...register("email", { required: true })}
                        />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="password" value="Password" />
                        </div>
                        <TextInput
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            {...register("password", { required: true })}
                        />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="mobile" value="Mobile Number" />
                        </div>
                        <TextInput
                            id="mobile"
                            placeholder="1234567890"
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
                    <div className="flex justify-end gap-2 mt-4">
                        <Button color="gray" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-[#52b69a] hover:bg-black">
                            {loading ? "Adding..." : "Add User"}
                        </Button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    );
};

export default AddUserModal;
