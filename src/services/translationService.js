export const getTranslations = async (user, params) => {
  const response = await fetch(
    `${process.env.SERVER_URL}/users/${user.email}?${params}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.tokens.access_token}`,
        "Client-Id": user.clientId,
      },
    },
  );

  const data = await response.json();

  if (data.result === "error") {
    throw data;
  }

  return data;
};

export const createTranslationParam = (page, limit) => {
  const params = {
    page,
    limit,
  };

  return new URLSearchParams(params).toString();
};
