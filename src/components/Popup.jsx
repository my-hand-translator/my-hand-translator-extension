import React, { useEffect, useState } from "react";

import Login from "./Login";
import ErrorStyled from "./Error";
import { styled } from "../config/stitches.config";

const LoginStyled = styled("div", {
  width: "40em",
  height: "33em",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
});

export default function Popup() {
  const [error, setError] = useState();

  useEffect(() => {
    chrome.storage.sync.get(["tokens"], (result) => {
      if (chrome.runtime.lastError) {
        setError(chrome.runtime.lastError.message);
      }

      console.log(result.tokens);
    });
  }, []);

  return (
    <LoginStyled>
      <Login />
      {error && <ErrorStyled>{error}</ErrorStyled>}
    </LoginStyled>
  );
}
