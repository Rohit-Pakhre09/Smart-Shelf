
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const membersUrl = "https://smart-shelf-server-qm2u.onrender.com/members";

//  Fetch all members
export const fetchMembers = createAsyncThunk(
    "members/fetchMembers",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(membersUrl);
            return response.data;
        } catch (error) {
            console.error("Fetch Members error:", error.response?.data || error.message);
            return rejectWithValue(
                error.response?.data?.message || "Error fetching Members"
            );
        }
    }
);

//  Add member
export const addMembers = createAsyncThunk(
    "members/addMembers",
    async (MemberData, { rejectWithValue }) => {
        try {
            const MemberWithId = { id: uuidv4(), ...MemberData };
            const response = await axios.post(membersUrl, MemberWithId, {
                headers: { "Content-Type": "application/json" },
            });
            return response.data;
        } catch (error) {
            console.error("Add Members error:", error.response?.data || error.message);
            return rejectWithValue(
                error.response?.data?.message || "Error adding Members"
            );
        }
    }
);

// Delete member
export const deleteMember = createAsyncThunk(
    "members/deleteMembers",
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`${membersUrl}/${id}`);
            return id;
        } catch (error) {
            console.error("Delete Members error:", error.response?.data || error.message);
            return rejectWithValue(
                error.response?.data?.message || "Error deleting Members"
            );
        }
    }
);

//  Update member
export const updateMember = createAsyncThunk(
    "members/updateMember",
    async ({ id, updatedData }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${membersUrl}/${id}`, updatedData, {
                headers: { "Content-Type": "application/json" },
            });
            return response.data;
        } catch (error) {
            console.error("Update Member error:", error.response?.data || error.message);
            return rejectWithValue(
                error.response?.data?.message || "Error updating Member"
            );
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
            //  Fetch
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

            //  Add
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

            //  Delete
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
            
            // update
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
