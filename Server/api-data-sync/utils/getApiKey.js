//
// Function to retreive API key

import dotenv from "dotenv";

// Load environment variables from the .env file
dotenv.config();

// Function to get the API key from the .env file
export const getApiKey = () => {
  return process.env.API_KEY;
};
