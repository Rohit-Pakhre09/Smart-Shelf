import { configureStore } from "@reduxjs/toolkit";
import booksReducer from "../modules/booksSlice";
import membersReducer from "../modules/MemberSlice";
import finesReducer from "../modules/finesSlice";

export const store = configureStore({
  reducer: {
    books: booksReducer,
    members: membersReducer,
    fines: finesReducer,
  },
});