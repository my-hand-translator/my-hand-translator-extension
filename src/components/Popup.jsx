import React from "react";
import Login from "./Login";
import { styled } from "../config/stitches.config";

const LoginStyled = styled("div", {
  width: "400px",
  height: "500px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
});

export default function Popup() {
  return (
    <LoginStyled>
      <Login />
    </LoginStyled>
  );
}
