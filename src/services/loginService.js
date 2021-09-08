export const login = async (user) => {
  return (
    await fetch(`${process.env.SERVER_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.tokens.access_token}`,
        "Client-Id": user.clientId,
      },
      body: JSON.stringify({
        email: user.email,
      }),
    })
  ).json();
};

export const signup = async (
  { email, name, glossary, clientId, tokens },
  keywords,
) => {
  return (
    await fetch(`${process.env.SERVER_URL}/users/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokens.access_token}`,
        "Client-Id": clientId,
      },
      body: JSON.stringify({ email, name, keywords, glossary }),
    })
  ).json();
};
