import React from "react";
import { NavLink } from "react-router-dom";

import { styled } from "../../../config/stitches.config";
import ContainerStyled from "../Container";

import TabContainer from "../TabContainer";

function Header() {
  return (
    <header>
      <TabContainer justify="spaceBetween">
        <ContainerStyled
          className="header-content"
          flex="row"
          justify="spaceBetween"
          align="itemCenter"
          css={{
            height: "80px",
          }}
        >
          <div className="logo">My Hand</div>

          <Nav>
            <NavLink to="/options.html" exact activeClassName="selected">
              Options
            </NavLink>
            <NavLink to="/my-glossary" activeClassName="selected">
              내 용어집 편집
            </NavLink>
            <NavLink to="/my-translations" activeClassName="selected">
              My Translations
            </NavLink>
            <NavLink to="/other-glossaries" activeClassName="selected">
              Other Glossaries
            </NavLink>
          </Nav>
        </ContainerStyled>
      </TabContainer>
    </header>
  );
}

const Nav = styled("nav", {
  "& a": {
    marginLeft: "10px",
    marginRight: "10px",
    textDecoration: "none",
    color: "$blue",
  },
  "& .selected": {
    color: "$apricot",
  },
});

export default Header;
