import { styled } from "@stitches/react";

const SubTitle = styled("h3", {
  color: "$black",
  fontSize: "15px",
  marginBottom: "10px",

  variants: {
    color: {
      blue: { color: "$blue" },
      lightBlue: { color: "$lightBlue" },
      apricot: { color: "$apricot" },
      white: { color: "$white" },
    },

    align: {
      center: { textAlign: "center" },
    },
  },
});

export default SubTitle;
