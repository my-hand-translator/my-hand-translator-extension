export const createAuthHeader = (token, clientId) => {
  const authHeader = {
    Authorization: `Bearer ${token}`,
  };

  if (clientId) {
    authHeader["Client-Id"] = clientId;
  }

  return authHeader;
};

const fetchData = (url, method = "GET", headers = {}, data = {}) => {
  const options = {
    method,
    mode: "cors",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (method !== "GET") {
    options.body = JSON.stringify(data);
  }

  return fetch(url, options).then((response) => response.json());
};

export default fetchData;
