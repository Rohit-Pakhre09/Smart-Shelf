import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const FINES_API_URL = "https://smart-shelf-server-ykc7.onrender.com/fines";
const FALLBACK_API_URL = "https://smart-shelf-server-ykc7.onrender.com/api/fines";
const LOCAL_STORAGE_KEY = "fines";

// Retry function to handle server errors
const retry = async (fn, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
};

const loadFromLocalStorage = () => {
    try {
        const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (serializedState === null) {
            return mockFines;
        }
        return JSON.parse(serializedState);
    } catch (e) {
        console.error("Could not load fines from localStorage", e);
        return mockFines;
    }
};

const saveToLocalStorage = (fines) => {
    try {
        const serializedState = JSON.stringify(fines);
        localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
    } catch (e) {
        console.error("Could not save fines to localStorage", e);
    }
};

// Mock data matching the provided form data and API structure
const mockFines = [
    {
        id: "F001",
        memberId: "M001",
        bookId: "B2-C2",
        amount: "500",
        status: "unpaid",
        reason: "Late return",
        calculatedOn: "2025-08-16",
        paymentMethod: "",
        paymentDate: "",
    },
    {
        id: "F002",
        memberId: "M002",
        bookId: "B4-C1",
        amount: "20",
        status: "paid",
        reason: "Late return",
        calculatedOn: "2025-08-06",
        paymentMethod: "UPI",
        paymentDate: "2025-08-08",
    },
    {
        id: "F003",
        memberId: "M004",
        bookId: "B9-C1",
        amount: "30",
        status: "unpaid",
        reason: "Overdue",
        calculatedOn: "2025-08-25",
        paymentMethod: "",
        paymentDate: "",
    },
];

// Async thunk to fetch fines
export const fetchFines = createAsyncThunk(
    "fines/fetchFines",
    async (_, { rejectWithValue }) => {
        try {
            let url = FINES_API_URL;
            let response = await retry(() =>
                fetch(url, {
                    headers: { "Content-Type": "application/json" },
                })
            );
            if (!response.ok) {
                url = FALLBACK_API_URL;
                response = await retry(() =>
                    fetch(url, {
                        headers: { "Content-Type": "application/json" },
                    })
                );
            }
            if (!response.ok) {
                throw new Error(`Failed to fetch fines from both endpoints (Status: ${response.status})`);
            }
            const data = await response.json();
            if (!Array.isArray(data) || !data.every((fine) => "id" in fine)) {
                throw new Error("Invalid API response format: Expected an array of fines with id");
            }
            // Ensure amount is a string and normalize fields
            const normalizedData = data.map((fine) => ({
                ...fine,
                bookId: fine.bookId || fine.id,
                id: fine.id,
                amount: String(fine.amount),
                paymentMethod: fine.paymentMethod || "",
                paymentDate: fine.paymentDate || "",
            }));
            saveToLocalStorage(normalizedData);
            return normalizedData;
        } catch (error) {
            console.warn(`API fetch error: ${error.message} (URL: ${FINES_API_URL} or fallback). Using local data`);
            return loadFromLocalStorage();
        }
    }
);

// Async thunk to edit a fine
export const editFine = createAsyncThunk(
    "fines/editFine",
    async ({ id, updates, customApiUrl }, { rejectWithValue, getState }) => {
        try {
            // Exclude id from payload and ensure amount is a string
            const { id: _, ...updatesToSend } = updates;
            updatesToSend.amount = String(updatesToSend.amount);
            console.log(`Attempting to update fine ${id} with payload:`, updatesToSend);

            let url = customApiUrl || FINES_API_URL;
            let response = await retry(() =>
                fetch(`${url}/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatesToSend),
                })
            );

            if (!response.ok) {
                url = FALLBACK_API_URL;
                response = await retry(() =>
                    fetch(`${url}/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(updatesToSend),
                    })
                );
            }

            if (!response.ok) {
                const errorText = await response.text().catch(() => "No response body");
                throw new Error(`Failed to update fine (Status: ${response.status}, Response: ${errorText})`);
            }

            const data = await response.json();
            if (!data.id) {
                throw new Error("Invalid API response: Expected updated fine with id");
            }
            console.log(`Successfully updated fine ${id}:`, data);
            const normalizedData = {
                ...data,
                bookId: data.bookId || data.id,
                amount: String(data.amount),
                paymentMethod: data.paymentMethod || "",
                paymentDate: data.paymentDate || "",
            };
            // Update local storage with the new state
            const { fines } = getState().fines;
            const updatedFines = fines.map((fine) =>
                fine.id === normalizedData.id ? normalizedData : fine
            );
            saveToLocalStorage(updatedFines);
            return normalizedData;
        } catch (error) {
            console.error(`API edit error: ${error.message}. Simulating update with local data`);
            const { fines } = getState().fines;
            const existingFine = fines.find((fine) => fine.id === id);
            if (!existingFine) {
                return rejectWithValue(`Fine ID "${id}" not found in local data`);
            }
            const updatedFine = { ...existingFine, ...updates, amount: String(updates.amount) };
            // Update local storage
            const updatedFines = fines.map((fine) =>
                fine.id === id ? updatedFine : fine
            );
            saveToLocalStorage(updatedFines);
            return { ...updatedFine, _localUpdate: true };
        }
    }
);

// Async thunk to mark a fine as paid
export const markAsPaid = createAsyncThunk(
    "fines/markAsPaid",
    async ({ id, updates, customApiUrl }, { rejectWithValue, getState }) => {
        try {
            console.log(`Attempting to mark fine ${id} as paid with payload:`, updates);

            let url = customApiUrl || FINES_API_URL;
            let response = await retry(() =>
                fetch(`${url}/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updates),
                })
            );

            if (!response.ok) {
                url = FALLBACK_API_URL;
                response = await retry(() =>
                    fetch(`${url}/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(updates),
                    })
                );
            }

            if (!response.ok) {
                const errorText = await response.text().catch(() => "No response body");
                throw new Error(`Failed to mark fine as paid (Status: ${response.status}, Response: ${errorText})`);
            }

            const data = await response.json();
            if (!data.id) {
                throw new Error("Invalid API response: Expected updated fine with id");
            }
            console.log(`Successfully marked fine ${id} as paid:`, data);
            const normalizedData = {
                ...data,
                amount: String(data.amount),
                paymentMethod: data.paymentMethod || "",
                paymentDate: data.paymentDate || "",
            };
            // Update local storage with the new state
            const { fines } = getState().fines;
            const updatedFines = fines.map((fine) =>
                fine.id === normalizedData.id ? normalizedData : fine
            );
            saveToLocalStorage(updatedFines);
            return normalizedData;
        } catch (error) {
            console.error(`API mark as paid error: ${error.message}. Simulating update with local data`);
            const { fines } = getState().fines;
            const existingFine = fines.find((fine) => fine.id === id);
            if (!existingFine) {
                return rejectWithValue(`Fine ID "${id}" not found in local data`);
            }
            const updatedFine = { ...existingFine, ...updates };
            // Update local storage
            const updatedFines = fines.map((fine) =>
                fine.id === id ? updatedFine : fine
            );
            saveToLocalStorage(updatedFines);
            return { ...updatedFine, _localUpdate: true };
        }
    }
);

const finesSlice = createSlice({
    name: "fines",
    initialState: {
        fines: loadFromLocalStorage(),
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Fines
            .addCase(fetchFines.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFines.fulfilled, (state, action) => {
                state.loading = false;
                state.fines = action.payload;
                saveToLocalStorage(state.fines);
            })
            .addCase(fetchFines.rejected, (state, action) => {
                state.loading = false;
                state.error = "Failed to fetch fines. Using local data.";
                state.fines = loadFromLocalStorage();
            })
            // Edit Fine
            .addCase(editFine.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(editFine.fulfilled, (state, action) => {
                state.loading = false;
                const updatedFine = action.payload;
                state.fines = state.fines.map((fine) =>
                    fine.id === updatedFine.id ? updatedFine : fine
                );
                saveToLocalStorage(state.fines);
                if (updatedFine._localUpdate) {
                    state.error = "Changes applied locally but not saved to server. Check API endpoint or try a custom URL.";
                }
            })
            .addCase(editFine.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to update fine. Using local update.";
            })
            // Mark as Paid
            .addCase(markAsPaid.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(markAsPaid.fulfilled, (state, action) => {
                state.loading = false;
                const updatedFine = action.payload;
                state.fines = state.fines.map((fine) =>
                    fine.id === updatedFine.id ? updatedFine : fine
                );
                saveToLocalStorage(state.fines);
                if (updatedFine._localUpdate) {
                    state.error = "Changes applied locally but not saved to server. Check API endpoint or try a custom URL.";
                }
            })
            .addCase(markAsPaid.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to mark fine as paid. Using local update.";
            });
    },
});

export default finesSlice.reducer;