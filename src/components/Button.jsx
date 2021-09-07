import { styled } from "../config/stitches.config";

const ButtonStyled = styled("button", {
  border: "none",

  color: "white",
  fontWeight: "bold",
  fontSize: "1rem",

  background: "$lightBlue",

  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
  outline: "none",
  borderRadius: "0.5em",

  variants: {
    size: {
      small: {
        width: "5em",
        height: "2em",
      },
      middle: {
        width: "10em",
        height: "4em",
      },
    },
  },
});

export default ButtonStyled;
