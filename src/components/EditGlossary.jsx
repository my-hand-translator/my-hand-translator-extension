import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";

import Button from "./shared/Button";
import Title from "./shared/Title";
import SubTitle from "./shared/SubTitle";
import ErrorStyled from "./shared/Error";
import ContainerStyled from "./shared/Container";
import TabContainer from "./shared/TabContainer";

import { PROJECT_API, STORAGE_API, STORAGE_UPLOAD_API } from "../constants/url";
import chromStore from "../utils/chromStore";
import fetchData, { createAuthHeader } from "../utils/fetchData";
import { refreshAndGetNewTokens } from "../services/translationService";

const GLOSSARY_NAME = "my-glossary";

const initWordsToAdd = {
  text: "",
  translation: "",
};

function EditGlossary() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMassage, setErrorMassage] = useState(null);
  const [user, setUser] = useState(null);
  const [glossary, setGlossary] = useState({});
  const [hasBucket, setHasBucket] = useState(null);
  const [bucketId, setBucketId] = useState(null);
  const [wordsToAdd, setWordsToAdd] = useState(initWordsToAdd);

  const focus = useRef(null);
  const history = useHistory();

  // 크롬 스토리지의 유저데이터 가져오기
  useEffect(() => {
    (async () => {
      try {
        const userData = await chromStore.get("userData");

        console.log(userData);

        setBucketId(userData.email.replace(/@|\./gi, ""));
        setUser(userData);
      } catch (error) {
        setIsLoading(false);
        setErrorMassage(error);
      }
    })();
  }, []);

  // 버킷에 있는 csv파일 읽어온 후 있으면 glossary 업데이트. && 서버가 켜있을 때 용어집 가져오기
  useEffect(() => {
    if (user) {
      const { isServerOn, email } = user;

      (async () => {
        try {
          const {
            tokens: { accessToken },
          } = user;

          const authHeader = createAuthHeader(accessToken);
          const response = await fetch(
            `${STORAGE_API}/${bucketId}/o/${GLOSSARY_NAME}.csv?alt=media`,
            {
              headers: { ...authHeader },
            },
          );

          console.log(response);

          if (response.ok) {
            setHasBucket(true);

            const bucketGlossayData = await response.text();

            const convertJson = (csv) => {
              const result = {};
              const pairs = csv.split("\r\n");

              for (let i = 0; i < pairs.length - 1; i += 1) {
                const [text, translation] = pairs[i].split(",");
                result[text] = translation;
              }

              return result;
            };

            const convertedGlossay = convertJson(bucketGlossayData);

            if (isServerOn) {
              const { data, result } = await fetchData(
                `${process.env.SERVER_URL}/users/${email}/glossary`,
              );

              if (result !== "ok") {
                return errorMassage(result.error.message);
              }

              if (data) {
                Object.assign(convertedGlossay, data);
              }
            }

            setGlossary(convertedGlossay);
            return setIsLoading(false);
          }

          const result = await response.text();

          if (result === "The specified bucket does not exist.") {
            setHasBucket(false);
          }
        } catch (error) {
          setIsLoading(false);
          return errorMassage(error.message);
        }
      })();
    }
  }, [user]);

  const handleWordsChange = (event) => {
    const { name, value } = event.target;

    setErrorMassage(null);

    setWordsToAdd({
      ...wordsToAdd,
      [name]: value,
    });
  };

  const handleAddGlossary = (event) => {
    event.preventDefault();

    const { text, translation } = wordsToAdd;

    if (!text || !text.trim()) {
      return setErrorMassage("원문 단어을 입력해 주세요");
    }

    if (!translation || !translation.trim()) {
      return setErrorMassage("번역 할 단어를 입력해 주세요");
    }

    if (glossary[text] === translation) {
      return setErrorMassage("이미 등록되어 있습니다.");
    }

    setGlossary({
      ...glossary,
      [text]: translation,
    });

    setWordsToAdd(initWordsToAdd);

    return focus.current.focus();
  };

  const handleDeleteGlossary = (text) => {
    const copyGlossary = { ...glossary };

    delete copyGlossary[text];

    setGlossary(copyGlossary);
  };

  const handleEditGlossary = async () => {
    setIsLoading(true);

    const {
      tokens: { accessToken },
    } = user;
    const authHeader = createAuthHeader(accessToken);

    console.log(accessToken, authHeader);

    // 버킷이 없을 경우 버킷 생성
    if (!hasBucket) {
      const data = {
        name: bucketId,
        location: "asia-northeast3",
        storageClass: "Standard",
        iamConfiguration: {
          uniformBucketLevelAccess: {
            enabled: true,
          },
        },
      };

      try {
        const responseData = await fetchData(
          `${STORAGE_API}?project=${user.projectId}`,
          "POST",
          authHeader,
          data,
        );

        const { error } = responseData;

        if (error) {
          setErrorMassage(error.message);
        }
      } catch (error) {
        setErrorMassage(error.message);
      }
    }

    // 편집한 용어집을 버킷에 csv파일로 업로드
    let csv = "";
    const glossaryKeys = Object.keys(glossary);

    for (let i = 0; i < glossaryKeys.length; i += 1) {
      const key = glossaryKeys[i];

      csv += `${key},${glossary[key]}\r\n`;
    }

    try {
      await fetch(
        `${STORAGE_UPLOAD_API}/${bucketId}/o?uploadType=media&name=${GLOSSARY_NAME}.csv`,
        {
          method: "POST",
          headers: {
            ...authHeader,
            "Content-Type": "text/plain; charset=utf-8",
          },
          body: csv,
        },
      );
    } catch (error) {
      setErrorMassage(error.message);
    }

    // 용어집 삭제 후 생성
    try {
      if (user.glossary) {
        const responseData = await fetchData(
          `${PROJECT_API}/${user.projectId}/locations/us-central1/glossaries/${GLOSSARY_NAME}`,
          "DELETE",
          authHeader,
        );

        console.log(responseData);
      }

      const data = {
        name: `projects/${user.projectId}/locations/us-central1/glossaries/${GLOSSARY_NAME}`,
        languagePair: {
          sourceLanguageCode: "en",
          targetLanguageCode: "ko",
        },
        inputConfig: {
          gcsSource: {
            inputUri: `gs://${bucketId}/${GLOSSARY_NAME}.csv`,
          },
        },
      };

      const responseData = await fetchData(
        `${PROJECT_API}/${user.projectId}/locations/us-central1/glossaries`,
        "POST",
        authHeader,
        data,
      );

      console.log(responseData);
    } catch (error) {
      setErrorMassage(error.message);
    }

    // 서버를 켰을 때 서버에 저장
    if (user.isServerOn) {
      const glossaryId = await chromStore.get("glossaryId");

      console.log("asdfasfsa", glossaryId);

      const { result, error } = await fetchData(
        `${process.env.SERVER_URL}/glossaries/${glossaryId}`,
        "PATCH",
        {},
        { glossary },
      );

      if (result === "error") {
        setErrorMassage(error.message);
      }
    }

    // 크롬 스토리지에 업데이트
    try {
      const newUserData = {
        ...user,
        tokens: {
          ...user.tokens,
        },
        glossary,
        bucketId,
      };

      const result = await chromStore.set("userData", newUserData);
      console.log(result);
    } catch (error) {
      setErrorMassage(error);
    }

    setIsLoading(false);
    // history.push("/");
  };

  if (isLoading) {
    return <TabContainer>로딩 중...</TabContainer>;
  }

  return (
    <TabContainer>
      <ContainerStyled justify="spaceBetween">
        <Title>{user.glossary ? "용어집 편집" : "용어집 생성"}</Title>
        <Button size="midium" onClick={handleEditGlossary}>
          제출
        </Button>
      </ContainerStyled>

      <SubTitle>좌측 단어는 우측 단어로 번역됩니다.</SubTitle>

      <ErrorStyled css={{ height: "16px" }}>{errorMassage}</ErrorStyled>

      <form onSubmit={handleAddGlossary}>
        <ContainerStyled justify="spaceEvenly" align="itemCenter">
          <input
            ref={focus}
            type="text"
            name="text"
            value={wordsToAdd.text}
            onChange={handleWordsChange}
          />
          <p>{"->"}</p>
          <input
            type="text"
            name="translation"
            value={wordsToAdd.translation}
            onChange={handleWordsChange}
          />
          <Button type="submit" size="small">
            추가
          </Button>
        </ContainerStyled>
      </form>

      {glossary &&
        Object.keys(glossary).map((text) => {
          return (
            <ContainerStyled id={text} justify="spaceEvenly" align="itemCenter">
              <div name="text">{text} </div>
              <p>{"->"}</p>
              <div name="translation">{glossary[text]} </div>
              <Button size="small" onClick={() => handleDeleteGlossary(text)}>
                삭제
              </Button>
            </ContainerStyled>
          );
        })}
    </TabContainer>
  );
}

export default EditGlossary;
