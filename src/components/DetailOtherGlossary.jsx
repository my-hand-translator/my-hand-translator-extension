import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { styled } from "@stitches/react";

import GlossaryList from "./GlossaryList";
import Button from "./shared/Button";
import ContainerStyled from "./shared/Container";
import TabContainer from "./shared/TabContainer";
import Title from "./shared/Title";
import SubTitle from "./shared/SubTitle";
import ErrorStyled from "./shared/Error";

import chromeStore from "../utils/chromeStore";
import { convertObjectToCsv } from "../utils/convert";
import {
  createGlossaryFromGoogleTranslation,
  getGlossaryFromServer,
  updateCsvFromGoogleStorage,
  updateGlossaryFromServer,
} from "../services/glossaryService";

const GlossaryListWrap = styled("div", {
  flex: 1,
});

function DetailOtherGlossary() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMassage, setErrorMassage] = useState(null);
  const [myGlossary, setMyGlossary] = useState(null);
  const [otherGlossary, setOtherGlossary] = useState(null);
  const [hasServiceAccess, setHasServiceAccess] = useState(null);
  const [user, setUser] = useState(null);

  const { userId: otherEmail } = useParams();
  const userId = otherEmail.split("@")[0];

  useEffect(() => {
    (async () => {
      try {
        const userData = await chromeStore.get("userData");
        const {
          email: myEmail,
          isServerOn,
          tokens: { accessToken },
        } = userData;

        setUser(userData);
        setHasServiceAccess(isServerOn);

        if (isServerOn) {
          const myGlossaryData = await getGlossaryFromServer(
            { userId: myEmail, accessToken },
            setErrorMassage,
          );

          const otherGlossaryData = await getGlossaryFromServer(
            { userId: otherEmail, accessToken },
            setErrorMassage,
          );

          setMyGlossary(myGlossaryData);
          setOtherGlossary(otherGlossaryData);
        }
      } catch (error) {
        setErrorMassage(error.message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleAddGlossary = (text, translation) => {
    setMyGlossary({
      ...myGlossary,
      [text]: translation,
    });
  };

  const handleDeleteGlossary = (text) => {
    const newGlossary = { ...myGlossary };

    delete newGlossary[text];

    setMyGlossary(newGlossary);
  };

  const mergeGlossary = () => {
    const newMyGlossary = { ...myGlossary };
    const newOtherGlossary = { ...otherGlossary };

    Object.assign(newMyGlossary, newOtherGlossary);

    setMyGlossary(newMyGlossary);
  };

  const applyGlossary = async () => {
    setIsLoading(true);

    const {
      projectId,
      bucketId,
      tokens: { accessToken },
    } = user;
    const glossaryId = await chromeStore.get("glossaryId");
    const myGlossayToCsv = convertObjectToCsv(myGlossary);

    await updateCsvFromGoogleStorage(
      { csv: myGlossayToCsv, bucketId, accessToken },
      errorMassage,
    );

    await createGlossaryFromGoogleTranslation(
      { projectId, accessToken, bucketId },
      setErrorMassage,
    );

    await updateGlossaryFromServer(
      { glossaryId, glossary: myGlossary, accessToken },
      errorMassage,
    );

    const newUserData = {
      ...user,
      tokens: {
        ...user.tokens,
      },
      glossaryId,
      glossary: myGlossary,
      bucketId,
    };

    await chromeStore.set("userData", newUserData);
    setIsLoading(false);
  };

  if (!hasServiceAccess) {
    return (
      <TabContainer>
        <ErrorStyled>해당 서비스는 서버 연결이 필요합니다.</ErrorStyled>
      </TabContainer>
    );
  }

  if (isLoading) {
    return <TabContainer>로딩 중...</TabContainer>;
  }

  return (
    <TabContainer>
      <ContainerStyled justify="spaceBetween">
        <Title>다른 사람의 용어집</Title>
        <div>
          <Button
            size="midium"
            css={{ margin: "10px" }}
            onClick={mergeGlossary}
          >
            병합하기
          </Button>
          <Button
            size="midium"
            css={{ margin: "10px" }}
            onClick={applyGlossary}
          >
            적용하기
          </Button>
        </div>
      </ContainerStyled>

      <ErrorStyled css={{ height: "16px" }}>{errorMassage}</ErrorStyled>

      <ContainerStyled justify="spaceBetween">
        <GlossaryListWrap>
          <SubTitle align="center">내 용어집</SubTitle>
          <GlossaryList
            glossaries={myGlossary}
            buttonText="삭제"
            onButtonClick={handleDeleteGlossary}
          />
        </GlossaryListWrap>

        <GlossaryListWrap>
          <SubTitle align="center">{userId}의 용어집</SubTitle>
          <GlossaryList
            glossaries={otherGlossary}
            buttonText="추가"
            onButtonClick={handleAddGlossary}
          />
        </GlossaryListWrap>
      </ContainerStyled>
    </TabContainer>
  );
}

export default DetailOtherGlossary;
