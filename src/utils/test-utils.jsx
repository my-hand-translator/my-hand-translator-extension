// test-utils.jsx
import React from "react";
import { render as rtlRender } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

import userReducer from "../features/user/userSlice";

function render(
  ui,
  {
    preloadedState,
    store = configureStore({ reducer: { user: userReducer }, preloadedState }),
    ...renderOptions
  } = {},
) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

export * from "@testing-library/react";

const user = {
  clientId: "950605617290-fja07ouuq9tqihnksf0ac4jd50kpu3q4.apps.googleusercontent.com",
  translations: [{
    nanoId: "qWYBIfLPMsjP1LHNRqlFW",
    origin: "react",
    translated: "리액트",
    url: "vanilla"
  }],
  isServerOn: false,
  tokens: {
    idToken: "asdnoifqjeirnqoer"
  },
  email: "aidencoders@gmail.com"
};

export { render, user };
