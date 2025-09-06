import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const booksUrl = "https://smart-shelf-server-ykc7.onrender.com/books";
const issuedBooksUrl = "https://smart-shelf-server-qm2u.onrender.com/issuedBooks";

// Retry function to handle Render cold starts
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

export const fetchBooks = createAsyncThunk(
  "books/fetchBooks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await retry(() => axios.get(booksUrl));
      return response.data;
    } catch (error) {
      console.error(
        "Fetch books error:",
        error.response?.data || error.message,
        error.response?.status
      );
      return rejectWithValue(
        error.response?.data?.message || "Error fetching books"
      );
    }
  }
);

export const fetchIssuedBooks = createAsyncThunk(
  "books/fetchIssuedBooks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await retry(() => axios.get(issuedBooksUrl));
      return response.data;
    } catch (error) {
      console.error(
        "Fetch issued books error:",
        error.response?.data || error.message,
        error.response?.status
      );
      return rejectWithValue(
        error.response?.data?.message || "Error fetching issued books"
      );
    }
  }
);

export const addBook = createAsyncThunk(
  "books/addBook",
  async (bookData, { rejectWithValue }) => {
    try {
      // Remove id from payload to let json-server generate it
      const { id, ...cleanedBookData } = bookData;
      const response = await retry(() =>
        axios.post(booksUrl, cleanedBookData, {
          headers: { "Content-Type": "application/json" },
        })
      );
      return response.data;
    } catch (error) {
      console.error("Add book error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Error adding book"
      );
    }
  }
);

export const updateBook = createAsyncThunk(
  "books/updateBook",
  async ({ id, updatedBook }, { rejectWithValue }) => {
    try {
      if (!id) throw new Error("Book ID is undefined");
      const cleanedBook = Object.fromEntries(
        Object.entries(updatedBook).filter(
          ([_, value]) => value != null && value !== ""
        )
      );
      const response = await retry(() =>
        axios.patch(`${booksUrl}/${id}`, cleanedBook, {
          headers: { "Content-Type": "application/json" },
        })
      );
      return response.data;
    } catch (error) {
      console.error(
        "Update book error:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.message || "Error updating book"
      );
    }
  }
);

export const deleteBook = createAsyncThunk(
  "books/deleteBook",
  async (id, { rejectWithValue }) => {
    try {
      await retry(() => axios.delete(`${booksUrl}/${id}`));
      return id;
    } catch (error) {
      console.error(
        "Delete book error:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.message || "Error deleting book"
      );
    }
  }
);

export const issueBook = createAsyncThunk(
  "books/issueBook",
  async ({ bookId, copyId, issueData }, { rejectWithValue }) => {
    try {
      // Ensure issueData does not include an id to let json-server generate it
      const { id, ...cleanedIssueData } = issueData;
      // Send issuance request
      const issueResponse = await retry(() =>
        axios.post(
          issuedBooksUrl,
          {
            bookId,
            copyId,
            memberId: cleanedIssueData.memberId,
            issuedBy: cleanedIssueData.issuedBy,
            issueDate: cleanedIssueData.issueDate,
            dueDate: cleanedIssueData.dueDate,
            returnDate: null,
            status: cleanedIssueData.status,
            renewals: cleanedIssueData.renewals,
          },
          { headers: { "Content-Type": "application/json" } }
        )
      );

      // Update book copy availability
      const bookResponse = await retry(() => axios.get(`${booksUrl}/${bookId}`));
      const book = bookResponse.data;
      if (!book.copies || !book.copies.find((c) => c.id === copyId)) {
        throw new Error("Invalid copy ID or book not found.");
      }
      const updatedCopies = book.copies.map((copy) =>
        copy.id === copyId ? { ...copy, availability: "issued" } : copy
      );
      const updatedBookResponse = await retry(() =>
        axios.patch(
          `${booksUrl}/${bookId}`,
          { copies: updatedCopies },
          { headers: { "Content-Type": "application/json" } }
        )
      );

      return {
        issuedBook: issueResponse.data,
        updatedBook: updatedBookResponse.data,
      };
    } catch (error) {
      console.error(
        "Issue book API error:",
        error.response?.data || error.message,
        error.response?.status
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to issue book"
      );
    }
  }
);

const initialState = {
  books: [],
  issuedBooks: [],
  loading: false,
  error: null,
};

const booksSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchIssuedBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIssuedBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.issuedBooks = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchIssuedBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBook.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === "object") {
          state.books.push(action.payload);
        } else {
          state.error = "Invalid response from server";
        }
      })
      .addCase(addBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.books.findIndex(
          (book) => book.id === action.payload.id
        );
        if (index !== -1) {
          state.books[index] = action.payload;
        } else {
          state.error = "Book not found in state";
        }
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.loading = false;
        state.books = state.books.filter((book) => book.id !== action.payload);
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(issueBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(issueBook.fulfilled, (state, action) => {
        state.loading = false;
        const { issuedBook, updatedBook } = action.payload;
        // Add the issued book to the issuedBooks state
        state.issuedBooks.push(issuedBook);
        // Update the book in the books state with the updated copies
        const bookIndex = state.books.findIndex(
          (book) => book.id === updatedBook.id
        );
        if (bookIndex !== -1) {
          state.books[bookIndex] = updatedBook;
        } else {
          state.error = "Book not found in state after issuing";
        }
      })
      .addCase(issueBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = booksSlice.actions;
export default booksSlice.reducer;