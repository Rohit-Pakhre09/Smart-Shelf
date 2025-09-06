import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const membersUrl = "https://smart-shelf-server-qm2u.onrender.com/members";

// Fetch all members
export const fetchMembers = createAsyncThunk(
    "members/fetchMembers",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(membersUrl);
            return response.data;
        } catch (error) {
            console.error("Fetch Members error:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
            return rejectWithValue(error.response?.data?.message || "Error fetching Members");
        }
    }
);

// Add member
export const addMembers = createAsyncThunk(
    "members/addMembers",
    async (MemberData, { rejectWithValue }, retries = 3) => {
        try {
            const response = await axios.post(membersUrl, MemberData, {
                headers: { "Content-Type": "application/json" },
            });
            return response.data;
        } catch (error) {
            console.error("Add Members error:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
            if (error.response?.status >= 500 && retries > 0) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                return addMembers(MemberData, { rejectWithValue }, retries - 1);
            }
            return rejectWithValue(error.response?.data?.message || "Error adding Members");
        }
    }
);

// Delete member
export const deleteMember = createAsyncThunk(
    "members/deleteMembers",
    async (id, { rejectWithValue }, retries = 3) => {
        try {
            await axios.delete(`${membersUrl}/${id}`);
            return id;
        } catch (error) {
            console.error("Delete Members error:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
            if (error.response?.status >= 500 && retries > 0) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                return deleteMember(id, { rejectWithValue }, retries - 1);
            }
            return rejectWithValue(error.response?.data?.message || "Error deleting Members");
        }
    }
);

// Update member
export const updateMember = createAsyncThunk(
    "members/updateMember",
    async ({ id, updatedData }, { rejectWithValue }, retries = 3) => {
        try {
            const response = await axios.put(`${membersUrl}/${id}`, updatedData, {
                headers: { "Content-Type": "application/json" },
            });
            return response.data;
        } catch (error) {
            console.error("Update Member error:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
            if (error.response?.status >= 500 && retries > 0) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                return updateMember({ id, updatedData }, { rejectWithValue }, retries - 1);
            }
            return rejectWithValue(error.response?.data?.message || "Error updating Member");
        }
    }
);

const initialState = {
    members: [],
    loading: false,
    error: null,
};

const MemberSlice = createSlice({
    name: "members",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchMembers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMembers.fulfilled, (state, action) => {
                state.loading = false;
                state.members = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchMembers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add
            .addCase(addMembers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addMembers.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload && typeof action.payload === "object") {
                    state.members.push(action.payload);
                } else {
                    state.error = "Invalid response from server";
                }
            })
            .addCase(addMembers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete
            .addCase(deleteMember.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteMember.fulfilled, (state, action) => {
                state.loading = false;
                state.members = state.members.filter((m) => m.id !== action.payload);
            })
            .addCase(deleteMember.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update
            .addCase(updateMember.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateMember.fulfilled, (state, action) => {
                state.loading = false;
                state.members = state.members.map((m) =>
                    m.id === action.payload.id ? action.payload : m
                );
            })
            .addCase(updateMember.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = MemberSlice.actions;
export default MemberSlice.reducer;