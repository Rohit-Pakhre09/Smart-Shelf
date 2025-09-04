import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const booksUrl = "https://smart-shelf-server-ykc7.onrender.com/books";
const issuedBooksUrl =
  "https://smart-shelf-server-ykc7.onrender.com/issuedBooks";

export const fetchBooks = createAsyncThunk(
  "books/fetchBooks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(booksUrl);
      return response.data;
    } catch (error) {
      console.error(
        "Fetch books error:",
        error.response?.data || error.message
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
      const response = await axios.get(issuedBooksUrl);
      return response.data;
    } catch (error) {
      console.error(
        "Fetch issued books error:",
        error.response?.data || error.message
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
      const bookWithId = { id: uuidv4(), ...bookData };
      const response = await axios.post(booksUrl, bookWithId, {
        headers: { "Content-Type": "application/json" },
      });
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
          ([ value]) => value != null && value !== ""
        )
      );
      const response = await axios.patch(`${booksUrl}/${id}`, cleanedBook, {
        headers: { "Content-Type": "application/json" },
      });
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
      await axios.delete(`${booksUrl}/${id}`);
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
      // Send issuance request
      const issueResponse = await axios.post(
        issuedBooksUrl,
        {
          ...issueData,
          bookId,
          copyId,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Update book copy availability
      const bookResponse = await axios.get(`${booksUrl}/${bookId}`);
      const book = bookResponse.data;
      const updatedCopies = book.copies.map((copy) =>
        copy.id === copyId ? { ...copy, availability: "issued" } : copy
      );
      const updatedBookResponse = await axios.patch(
        `${booksUrl}/${bookId}`,
        { copies: updatedCopies },
        { headers: { "Content-Type": "application/json" } }
      );

      return {
        issuedBook: issueResponse.data,
        updatedBook: updatedBookResponse.data,
      };
    } catch (error) {
      console.error(
        "Issue book API error:",
        error.response?.data || error.message
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
        state.issuedBooks.push(action.payload.issuedBook);
        const bookIndex = state.books.findIndex(
          (book) => book.id === action.payload.updatedBook.id
        );
        if (bookIndex !== -1) {
          state.books[bookIndex] = action.payload.updatedBook;
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
