import axios from "axios";

export const commonAPI = async (httpRequest, url, reqBody, reqHeader) => {
  const reqConfig = {
    method: httpRequest,
    url,
    data: reqBody,
    headers: reqHeader ? reqHeader : { "Content-Type": "application/json" },
  };

  try {
    const res = await axios(reqConfig);
    return res.data;  // <-- Return only the data payload from response
  } catch (err) {
    // You might want to throw here or handle differently, but for now:
    console.error('API error:', err);
    return null;  // or throw err;
  }
};
