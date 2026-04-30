import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";

export const addRbacUser = createAsyncThunk(
    'addRbacUser',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post(`goodmood/rbac/add-user`, userData);
            if (response?.data?.statusCode === 200) {
                return response?.data;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getRbacUserList = createAsyncThunk(
    'getRbacUserList',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`goodmood/rbac/user-list`);
            if (response?.data?.statusCode === 200) {
                return response?.data;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getRbacRoleList = createAsyncThunk(
    'getRbacRoleList',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`goodmood/rbac/role-list`);
            if (response?.data?.statusCode === 200) {
                return response?.data;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getPermissionSidebarList = createAsyncThunk(
    'getPermissionSidebarList',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`goodmood/permissions/sidebar-list`);
            if (response?.data?.statusCode === 200) {
                return response?.data;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getMasterSidebarList = createAsyncThunk(
    'getMasterSidebarList',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`goodmood/permissions/master-sidebar-list`);
            if (response?.data?.statusCode === 200) {
                return response?.data;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const saveRoleSidebar = createAsyncThunk(
    'saveRoleSidebar',
    async (saveData, { rejectWithValue }) => {
        try {
            const response = await api.post(`goodmood/permissions/save-role-sidebar`, saveData);
            if (response?.data?.statusCode === 200) {
                return response?.data;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getRoleSidebarAccess = createAsyncThunk(
    'getRoleSidebarAccess',
    async (roleId, { rejectWithValue }) => {
        try {
            const response = await api.get(`goodmood/permissions/role-sidebar-access/${roleId}`);
            if (response?.data?.statusCode === 200) {
                return response?.data;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const saveAdminPermissions = createAsyncThunk(
    'saveAdminPermissions',
    async (permissionData, { rejectWithValue }) => {
        try {
            const response = await api.post(`goodmood/permissions/save-access`, permissionData);
            if (response?.data?.statusCode === 200) {
                return response?.data;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getAdminPermissions = createAsyncThunk(
    'getAdminPermissions',
    async (adminId, { rejectWithValue }) => {
        try {
            const response = await api.get(`goodmood/permissions/access-list/${adminId}`);
            if (response?.data?.statusCode === 200) {
                return response?.data;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getRbacUserById = createAsyncThunk(
    'getRbacUserById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`goodmood/rbac/user/${id}`);
            if (response?.data?.statusCode === 200) {
                return response?.data;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateRbacUser = createAsyncThunk(
    'updateRbacUser',
    async ({ id, userData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`goodmood/rbac/update-user/${id}`, userData);
            if (response?.data?.statusCode === 200) {
                return response?.data;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createRbacRole = createAsyncThunk(
    'createRbacRole',
    async (roleData, { rejectWithValue }) => {
        try {
            const response = await api.post(`/goodmood/roles/create`, roleData);
            if (response?.data?.statusCode === 200) {
                return response?.data;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    loading: false,
    error: false,
    message: "",
    rbacUserList: [],
    rbacRoleList: [],
    permissionSidebarList: [],
    masterSidebarList: [],
    adminPermissions: [],
    roleSidebarAccess: [],
    saveSidebarLoading: false,
    saveSidebarSuccess: false,
    selectedUser: null,
    createRoleLoading: false,
    createRoleSuccess: false,
    roleError: null
};

const RbacSlice = createSlice({
    name: "rbac",
    initialState,
    reducers: {
        clearRbacMessage: (state) => {
            state.message = "";
            state.error = false;
        },
        resetCreateRoleState: (state) => {
            state.createRoleLoading = false;
            state.createRoleSuccess = false;
            state.roleError = null;
        },
        resetSaveSidebarState: (state) => {
            state.saveSidebarLoading = false;
            state.saveSidebarSuccess = false;
            state.error = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Add User
            .addCase(addRbacUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(addRbacUser.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.message = payload.message;
                state.error = false;
            })
            .addCase(addRbacUser.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = true;
                state.message = payload?.message || "Failed to add user";
            })
            // Get User List
            .addCase(getRbacUserList.pending, (state) => {
                state.loading = true;
            })
            .addCase(getRbacUserList.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.rbacUserList = payload.data;
                state.error = false;
            })
            .addCase(getRbacUserList.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = true;
                state.message = payload?.message || "Failed to fetch user list";
            })
            // Get Role List
            .addCase(getRbacRoleList.pending, (state) => {
                state.loading = true;
            })
            .addCase(getRbacRoleList.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.rbacRoleList = payload.data;
                state.error = false;
            })
            .addCase(getRbacRoleList.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = true;
                state.message = payload?.message || "Failed to fetch roles";
            })
            // Sidebar List
            .addCase(getPermissionSidebarList.pending, (state) => {
                state.loading = true;
            })
            .addCase(getPermissionSidebarList.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.permissionSidebarList = payload.data;
            })
            .addCase(getPermissionSidebarList.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = true;
            })
            // Master Sidebar List
            .addCase(getMasterSidebarList.pending, (state) => {
                state.loading = true;
            })
            .addCase(getMasterSidebarList.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.masterSidebarList = payload.data;
            })
            .addCase(getMasterSidebarList.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = true;
            })
            // Save Role Sidebar
            .addCase(saveRoleSidebar.pending, (state) => {
                state.saveSidebarLoading = true;
            })
            .addCase(saveRoleSidebar.fulfilled, (state, { payload }) => {
                state.saveSidebarLoading = false;
                state.saveSidebarSuccess = true;
                state.message = payload.message;
            })
            .addCase(saveRoleSidebar.rejected, (state, { payload }) => {
                state.saveSidebarLoading = false;
                state.error = true;
                state.message = payload?.message || "Failed to save sidebar mapping";
            })
            // Get Role Sidebar Access
            .addCase(getRoleSidebarAccess.pending, (state) => {
                state.loading = true;
            })
            .addCase(getRoleSidebarAccess.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.roleSidebarAccess = payload.data;
            })
            .addCase(getRoleSidebarAccess.rejected, (state) => {
                state.loading = false;
            })
            // Save Admin Permissions
            .addCase(saveAdminPermissions.pending, (state) => {
                state.loading = true;
            })
            .addCase(saveAdminPermissions.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.message = payload.message;
            })
            .addCase(saveAdminPermissions.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = true;
                state.message = payload?.message || "Failed to save permissions";
            })
            // Get Admin Permissions
            .addCase(getAdminPermissions.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAdminPermissions.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.adminPermissions = payload.data;
            })
            .addCase(getAdminPermissions.rejected, (state) => {
                state.loading = false;
            })
            // Get RBAC User By Id
            .addCase(getRbacUserById.pending, (state) => {
                state.loading = true;
            })
            .addCase(getRbacUserById.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.selectedUser = payload.data;
            })
            .addCase(getRbacUserById.rejected, (state) => {
                state.loading = false;
            })
            // Update RBAC User
            .addCase(updateRbacUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateRbacUser.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.message = payload.message;
                state.error = false;
            })
            .addCase(updateRbacUser.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = true;
                state.message = payload?.message || "Failed to update user";
            })
            // Create Role
            .addCase(createRbacRole.pending, (state) => {
                state.createRoleLoading = true;
            })
            .addCase(createRbacRole.fulfilled, (state, { payload }) => {
                state.createRoleLoading = false;
                state.createRoleSuccess = true;
                state.message = payload.message;
            })
            .addCase(createRbacRole.rejected, (state, { payload }) => {
                state.createRoleLoading = false;
                state.createRoleSuccess = false;
                state.roleError = payload?.message || "Failed to create role";
            });
    }
});

export const { clearRbacMessage, resetCreateRoleState, resetSaveSidebarState } = RbacSlice.actions;
export default RbacSlice.reducer;
