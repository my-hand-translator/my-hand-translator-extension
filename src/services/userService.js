import { URLS } from "../constants/user";

export const login = async (user) => {
  const response = await fetch(process.env.SERVER_URL + URLS.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.tokens.access_token}`,
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
  const response = await fetch(process.env.SERVER_URL + URLS.SIGNUP, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokens.access_token}`,
      "Client-Id": clientId,
    },
    body: JSON.stringify({ email, name, keywords, glossary }),
  });

  return response.json();
};
