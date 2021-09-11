import endPoints from "../constants/server";

const { USERS, LOGIN, SIGNUP, GLOSSARY, GLOSSARIES, TRANSLATIONS } = endPoints;

export const login = async (user) => {
  const response = await fetch(`${process.env.SERVER_URL}${USERS}${LOGIN}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.tokens.idToken}`,
      "Client-Id": user.clientId,
    },
    body: JSON.stringify({
      email: user.email,
    }),
  });

  return response.json();
};

export const signup = async (
  { email, name, glossary, clientId, tokens },
  keywords,
) => {
  const response = await fetch(`${process.env.SERVER_URL}${USERS}${SIGNUP}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokens.idToken}`,
      "Client-Id": clientId,
    },
    body: JSON.stringify({ email, name, keywords, glossary }),
  });

  return response.json();
};

export const getGlossary = async ({ email, tokens }) => {
  const response = await fetch(
    `${process.env.SERVER_URL}${USERS}/${email}${GLOSSARY}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokens.idToken}`,
      },
    },
  );

  return response.json();
};

export const editGlossary = async ({ tokens, glossaryId, glossary }) => {
  const response = await fetch(
    `${process.env.SERVER_URL}${GLOSSARIES}/${glossaryId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokens.idToken}`,
      },
      body: JSON.stringify({ glossary }),
    },
  );

  return response.json();
};

export const addTranslations = async ({ tokens, email, translations }) => {
  const response = await fetch(`${process.env.SERVER_URL}${TRANSLATIONS}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokens.idToken}`,
    },
    body: JSON.stringify({ email, translations }),
  });

  return response.json();
};
