//
// Fethes the data

import fetch from "node-fetch";
import { getApiKey } from "./getApiKey.js";

export const fetchData = async (endpoint) => {
  const myKey = getApiKey();
  const baseUrl = "https://api.clashroyale.com/v1";
  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${myKey}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error(`Error fetching data: ${error}`);
    return null;
  }
};
