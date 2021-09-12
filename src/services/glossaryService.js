const getGlossaries = async (user, page, limit, keyword = "") => {
  const response = await fetch(
    `${process.env.SERVER_URL}/glossaries/?keywords=${keyword}&page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.tokens.idToken}`,
      },
    },
  );

  const data = await response.json();

  if (data.result === "error") {
    throw data;
  }

  return data.data;
};

export default getGlossaries;
