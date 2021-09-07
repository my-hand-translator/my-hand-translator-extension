import { styled } from "../config/stitches.config";

const ButtonStyled = styled("button", {
  color: "white",
  fontWeight: "bold",
  fontSize: "1rem",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
  border: "none",
  outline: "none",
  borderRadius: "4px",
  background: "$lightBlue",

  variants: {
    size: {
      small: {
        width: "60px",
        height: "30px",
      },
      middle: {
        width: "130px",
        height: "60px",
      },
    },
  },
});

export default ButtonStyled;
