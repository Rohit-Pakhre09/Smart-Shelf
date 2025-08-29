import { configureStore } from "@reduxjs/toolkit";
import booksReducer from "../modules/booksSlice";

export const store = configureStore({
  reducer: {
    books: booksReducer,
  },
});
