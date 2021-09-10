export const getTranslations = async (user, params) => {
  const response = await fetch(
    `${process.env.SERVER_URL}/translations/${user.email}?${params}`,
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

  return data.data;
};

export const createTranslationParam = (page, limit) => {
  const params = {
    page,
    limit,
  };

  return new URLSearchParams(params).toString();
};

export const combineTranslations = (storageTranslations, serverTranslations) => {
  const combinedTranslations = serverTranslations;
  const uniqueNanoIds = new Set();

  combinedTranslations.forEach((combinedTranslation) => {
    uniqueNanoIds.add(combinedTranslation.nanoId);
  });

  storageTranslations.forEach((storageTranslation) => {
    if (!uniqueNanoIds.has(storageTranslation.nanoId)) {
      combinedTranslations.push(storageTranslation);
    }
  });

  return combinedTranslations;
}
