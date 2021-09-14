import { createSlice } from "@reduxjs/toolkit";

export const slice = createSlice({
  name: "user",
  initialState: {
    clientId: "",
    clientSecret: "",
    email: "",
    glossary: {},
    glossaryId: "",
    isServerOn: false,
    name: "",
    projectId: "",
    signed: "",
    tokens: {
      accessToken: "",
      idToken: "",
      refreshToken: "",
    },
    translations: [],
  },
  reducers: {
    updateUser: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateUser } = slice.actions;

export default slice.reducer;
