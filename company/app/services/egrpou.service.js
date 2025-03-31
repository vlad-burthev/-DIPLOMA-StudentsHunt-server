import axios from "axios";
import { configDotenv } from "dotenv";

configDotenv();

export async function checkEGRPOUCode(egrpou) {
  try {
    // Validate EGRPOU format
    if (!/^\d{8}$/.test(egrpou)) {
      throw new Error("Invalid EGRPOU code format");
    }

    // Make request to EGRPOU API
    const response = await axios.get(
      `${process.env.EGRPOU_API_URL}/api/v1/companies/${egrpou}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.EGRPOU_API_KEY}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.data || response.data.error) {
      throw new Error(response.data?.error || "Failed to validate EGRPOU code");
    }

    // Log the raw response data
    console.log(
      "Raw EGRPOU API response:",
      JSON.stringify(response.data, null, 2)
    );

    // Parse date string to Date object
    const parseDate = (dateString) => {
      console.log("Original date string:", dateString);

      // If no date provided, use current date
      if (!dateString) {
        console.log("No date provided, using current date");
        return new Date();
      }

      // Try to parse the date string
      let date;
      try {
        // First try DD.MM.YYYY format since that's what the API returns
        if (dateString.includes(".")) {
          console.log("Parsing DD.MM.YYYY format");
          const [day, month, year] = dateString.split(".");
          date = new Date(year, month - 1, day);
        } else {
          // Try parsing as ISO string
          date = new Date(dateString);
        }

        // If still invalid, use current date
        if (isNaN(date.getTime())) {
          console.log(
            "Invalid date after parsing attempts, using current date"
          );
          date = new Date();
        }
      } catch (error) {
        console.error("Error parsing date:", error);
        date = new Date();
      }

      console.log("Parsed date:", date);
      return date;
    };

    // Format and return company data
    const formattedData = {
      egrpou: response.data.egrpou,
      name: response.data.name,
      name_short: response.data.name_short,
      address: response.data.address,
      director: response.data.director,
      kved: response.data.kved,
      inn: response.data.inn,
      inn_date: parseDate(response.data.inn_date),
      last_update: new Date(),
    };

    console.log(
      "Final formatted company data:",
      JSON.stringify(formattedData, null, 2)
    );
    return formattedData;
  } catch (error) {
    if (error.response) {
      // Handle API errors
      switch (error.response.status) {
        case 404:
          throw new Error("Company not found in EGRPOU registry");
        case 401:
          throw new Error("Invalid EGRPOU API credentials");
        case 429:
          throw new Error("Too many requests to EGRPOU API");
        default:
          throw new Error("Failed to validate EGRPOU code");
      }
    }
    throw error;
  }
}

export async function validateEGRPOUCode(egrpou) {
  try {
    await checkEGRPOUCode(egrpou);
    return true;
  } catch (error) {
    return false;
  }
}
