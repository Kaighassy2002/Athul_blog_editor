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
    return res; 
  } catch (err) {
    
    console.error('API error:', err);
    throw err;  // or throw err;
  }
};
