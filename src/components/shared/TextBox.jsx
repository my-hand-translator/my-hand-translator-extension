import { styled } from "@stitches/react";

const TextBox = styled("p", {
  color: "$black",
  padding: "10px",
  fontSize: "20px",
  borderRadius: "10px",

  variants: {
    color: {
      blue: { color: "$blue" },
      lightBlue: { color: "$lightBlue" },
      apricot: { color: "$apricot" },
      white: { color: "$white" },
    },

    fontSize: {
      big: { fontSize: "30px" },
      small: { fontSize: "10px" },
    },

    border: {
      black: {
        border: "1px solid $black",
      },
    },
  },
});

export default TextBox;
