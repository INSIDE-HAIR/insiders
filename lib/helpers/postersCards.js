import json2024Data from "@/db/marketing-salon/campaign/2024.json";

// Función para mapear datos de un mes específico
function mapDataForMonth(data, month, contentType, content, prefix) {
  if (
    data &&
    data[month] &&
    data[month][contentType] &&
    data[month][contentType][content]
  ) {
    return Object.keys(data[month][contentType][content]).reduce(
      (result, lang) => {
        // Check if the data for the specific language is an array
        if (Array.isArray(data[month][contentType][content][lang])) {
          const items = data[month][contentType][content][lang].reduce(
            (acc, item) => {
              // Extracting relevant information from the item
              const id = item.name
                .split("/")[1]
                .split("_")[1]
                .replace(".pdf", "");
              const name = `${prefix} ${id}`;
              const category = item.name.split("/")[0];

              // Adjusting for different property names in stoppers
              const urlProperty = content === "stoppers" ? "url" : "id";

              // If the object with the name already exists, simply add the new category
              const existingItem = acc.find((item) => item.name === name);
              if (existingItem) {
                // Ensure files property exists
                existingItem.files = existingItem.files || {};
                existingItem.files[category] = item.url;
              } else {
                // If it doesn't exist, create a new item object
                const newItem = {
                  id,
                  name,
                  files: { [category]: item.url },
                };
                acc.push(newItem);
              }

              return acc;
            },
            []
          );
          result[`${content}Cards${lang.toUpperCase()}`] = items;
        } else {
          // Handle the case where the data is not an array
          console.info(
            `Data for ${month}, ${contentType}, ${content}, ${lang} is not an array`
          );
        }

        return result;
      },
      {
        [`${content}CardsPreviewImageForAll`]: {
          active: true,
          content: data[month][contentType][content]["previewImageForAll"],
        },
      }
    );
  } else  {
    // Handle the case where the necessary data does not exist
    console.info(
      `Data for ${month}, ${contentType}, ${content} does not exist`
    );
    return {};
  }
}
function convertGoogleDriveLink(link) {
  // Ensure that link is defined before trying to match
  if (!link) {
    console.error("Link is undefined or null");
    return null;
  }

  // Try to extract the file ID from the regular link
  const fileIdFromLinkMatch = link.match(/\/d\/(.+?)\//);

  // Try to extract the file ID from the download link
  const fileIdFromDownloadMatch = link.match(/\/uc\?id=(.+?)&export=download/);

  // Try to extract the file ID from the image link
  const fileIdFromImageMatch = link.match(/\/d\/(.+)$/);

  // Get the file ID, prioritizing regular link over download link and image link
  const fileId = fileIdFromLinkMatch
    ? fileIdFromLinkMatch[1]
    : fileIdFromDownloadMatch
    ? fileIdFromDownloadMatch[1]
    : fileIdFromImageMatch
    ? fileIdFromImageMatch[1]
    : null;

  // Construct different types of links
  const previewLink = `https://drive.google.com/file/d/${fileId}/view?usp=drivesdk`;
  const imgEmbedLink = `https://lh3.googleusercontent.com/d/${fileId}`;
  const downloadLink = `https://drive.google.com/uc?id=${fileId}&export=download`;

  return {
    preview: previewLink,
    imgEmbed: imgEmbedLink,
    download: downloadLink,
  };
}

// Function to convert links for all cards
function convertLinks(cards) {

  if (!Array.isArray(cards)) {
    console.error('cards is not an array');
    return /* Algún valor predeterminado o manejo de error */;
  }

  return cards.map((card) => {
    const { id, name, files } = card;
    const convertedFiles = {};

    // Iterate over the card's file categories
    for (const category in files) {
      const link = files[category];
      // Convert each link using the Google Drive function
      const { preview, imgEmbed, download } = convertGoogleDriveLink(link);
      convertedFiles[category] = { preview, imgEmbed, download };
    }

    return {
      id,
      name,
      files: convertedFiles,
    };
  });
}

// Función principal para obtener datos mapeados y convertir enlaces
function processMonthData(data, month, contentType, content, prefix) {
  const mappedData = mapDataForMonth(data, month, contentType, content, prefix);
  const langCodes = Object.keys(mappedData);

  const convertedData = {};
  for (const langCode of langCodes) {
    convertedData[langCode] = convertLinks(mappedData[langCode]);
  }

  return convertedData;
}

// Convert links for the mapped data
const dataJanuaryPostersCards = processMonthData(
  json2024Data,
  "january",
  "physicalContent",
  "posters",
  "Posters"
);

const dataJanuaryStoppersCards = processMonthData(
  json2024Data,
  "january",
  "physicalContent",
  "stoppers",
  "Stopper"
);

const dataJanuaryCardsCards = processMonthData(
  json2024Data,
  "january",
  "physicalContent",
  "cards",
  "Cards"
);

const dataJanuaryActionPostAndStoriesCards = processMonthData(
  json2024Data,
  "january",
  "digitalContent",
  "actionPostAndStories",
  "ActionPostAndStories"
);

const postersCardsES = dataJanuaryPostersCards.postersCardsES;
const postersCardsCA = dataJanuaryPostersCards.postersCardsCA;

const stoppersCardsES = dataJanuaryStoppersCards.stoppersCardsES;
const stoppersCardsCA = dataJanuaryStoppersCards.stoppersCardsCA;

const cardsCardsES = dataJanuaryCardsCards.cardsCardsES;
const cardsCardsCA = dataJanuaryCardsCards.cardsCardsCA;

const actionPostAndStoriesCardsES = dataJanuaryActionPostAndStoriesCards.actionPostAndStoriesCardsES;
const actionPostAndStoriesCardsCA = dataJanuaryActionPostAndStoriesCards.actionPostAndStoriesCardsCA;

console.log(actionPostAndStoriesCardsES);


export {
  postersCardsES,
  postersCardsCA,
  stoppersCardsES,
  stoppersCardsCA,
  cardsCardsES,
  cardsCardsCA,
};
