import { styled } from "@stitches/react";

const ContainerStyled = styled("div", {
  display: "flex",
  padding: "10px",
  borderRadius: "10px",
  backgroundColor: "white",

  variants: {
    flex: {
      column: {
        flexDirection: "column",
      },
      row: {
        flexDirection: "row",
      },
    },

    size: {
      big: {
        width: "400px",
        height: "fit-content",
      },
      medium: {
        width: "300px",
        height: "600px",
      },
      small: {
        width: "200px",
        height: "400px",
      },
    },

    justify: {
      start: { justifyContent: "flex-start" },
      end: { justifyContent: "flex-end" },
      center: { justifyContent: "center" },
      spaceBetween: { justifyContent: "space-between" },
      spaceAround: { justifyContent: "space-around" },
      spaceEvenly: { justifyContent: "space-evenly" },
    },

    alignContent: {
      start: { alignContent: "flex-start" },
    },

    align: {
      start: { alignSelf: "flex-start" },
      end: { alignSelf: "flex-end" },
      center: { alignSelf: "center" },
      spaceBetween: { alignSelf: "space-between" },
      spaceAround: { alignSelf: "space-around" },
      itemCenter: { alignItems: "center" },
    },

    border: {
      black: {
        border: "1px solid $black",
      },
    },
  },
});

export default ContainerStyled;
