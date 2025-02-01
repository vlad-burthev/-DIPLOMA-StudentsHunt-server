import iconv from "iconv-lite";
import * as xml2js from "xml2js";

export const checkEGRPOUCode = async (egrpouCode) => {
  try {
    const response = await fetch(
      `https://adm.tools/action/gov/api/?egrpou=${egrpouCode}`
    );

    if (!response.ok) {
      return new Error("ЄДРПОУ не знайдено");
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const xmlData = iconv.decode(buffer, "windows-1251");

    const jsonData = await xml2js.parseStringPromise(xmlData, {
      explicitArray: false,
      trim: true,
    });

    if (jsonData.error) {
      return new Error(jsonData.error);
    }

    return {
      egrpou: jsonData.export.company.$.egrpou,
      name: jsonData.export.company.$.name,
      name_short: jsonData.export.company.$.name_short,
      address: jsonData.export.company.$.address,
      director: jsonData.export.company.$.director,
      kved: jsonData.export.company.$.kved,
      inn: jsonData.export.company.$.inn,
      inn_date: jsonData.export.company.$.inn_date,
      last_update: jsonData.export.company.$.last_update,
    };
  } catch (error) {
    return new Error(error.message);
  }
};
