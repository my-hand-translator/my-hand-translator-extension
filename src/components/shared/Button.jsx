import { styled } from "../../config/stitches.config";

const Button = styled("button", {
  border: "none",

  color: "white",
  fontWeight: "bold",
  fontSize: "1rem",

  backgroundColor: "$lightBlue",

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

    bgColor: {
      blue: { backgroundColor: "$blue" },
      lightBlue: { backgroundColor: "$lightBlue" },
      apricot: { backgroundColor: "$apricot" },
      white: { backgroundColor: "$white" },
    },

    fontColor: {
      blue: { color: "$blue" },
      lightBlue: { color: "$lightBlue" },
      apricot: { color: "$apricot" },
      white: { color: "$white" },
    },

    active: {
      true: { background: "$lightBlue" },
      false: { background: "$black" },
    },
  },
});

export default Button;