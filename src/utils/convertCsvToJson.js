const convertCsvToJson = (csv) => {
  const result = {};
  const pairs = csv.split("\r\n");

  for (let i = 0; i < pairs.length - 1; i += 1) {
    const [text, translation] = pairs[i].split(",");
    result[text] = translation;
  }

  return result;
};

export default convertCsvToJson;
