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
  clientSecret: "FW9CBr-RnGTkZY5GvUlf1rIy",
  projectId: "translate-324702",
  translations: [{
    nanoId: "qWYBIfLPMsjP1LHNRqlFW",
    origin: "react",
    translated: "리액트",
    url: "vanilla"
  }],
  glossary: {
    react: "리액트"
  },
  glossaryId: "6141bd1c2a11e5b51320bac1",
  isServerOn: false,
  name: "aidencoders",
  tokens: {
    idToken: "asdnoifqjeirnqoer",
    accessToken: "ya29.a0ARr",
    refreshToken: "1//0elaLJegEVwTVCgYIARA",
  },
  email: "aidencoders@gmail.com"
};

export { render, user };
