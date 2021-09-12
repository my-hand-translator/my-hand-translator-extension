import React from "react";
import { useParams } from "react-router-dom";
import { styled } from "@stitches/react";

import GlossaryList from "./GlossaryList";
import Button from "./shared/Button";
import ContainerStyled from "./shared/Container";
import TabContainer from "./shared/TabContainer";
import Title from "./shared/Title";
import SubTitle from "./shared/SubTitle";

const GlossaryListWrap = styled("GlossaryListWrap", {
  flex: 1,
});

function OtherGlossary() {
  const { userId } = useParams();

  return (
    <TabContainer>
      <ContainerStyled justify="spaceBetween">
        <Title>다른 사람의 용어집</Title>
        <Button size="midium">병합하기</Button>
      </ContainerStyled>

      <ContainerStyled justify="spaceBetween">
        <GlossaryListWrap>
          <SubTitle align="center">내 용어집</SubTitle>
          <GlossaryList
            glossaries={{ asdf: "asdf" }}
            buttonText="삭제"
            onButtonClick={() => {}}
          />
        </GlossaryListWrap>

        <GlossaryListWrap>
          <SubTitle align="center">{userId}의 용어집</SubTitle>
          <GlossaryList
            glossaries={{ asdf: "asdf" }}
            buttonText="추가"
            onButtonClick={() => {}}
          />
        </GlossaryListWrap>
      </ContainerStyled>
    </TabContainer>
  );
}

export default OtherGlossary;
