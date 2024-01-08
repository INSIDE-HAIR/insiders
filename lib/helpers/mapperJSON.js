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
                .replace(".pdf", "")
                .replace(".jpg", "")
                .replace(".mp4", "")
                .replace(".png", "");

              const name = `${prefix} ${id}`;
              const category = item.name.split("/")[0];
              const groupName = item.groupName;
              const order = item.order;
              const copy = item.copy;

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
                  groupName,
                  order,
                  copy,
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
      {}
    );
  } else {
    // Handle the case where the necessary data does not exist
    console.error(
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
    console.error("cards is not an array");
    return /* Algún valor predeterminado o manejo de error */;
  }

  return cards.map((card) => {
    const { id, name, files, groupName, order, copy } = card;
    const convertedFiles = {};
    const categoryList = [];
    // Iterate over the card's file categories
    for (const category in files) {
      const link = files[category];
      // Convert each link using the Google Drive function
      const { preview, imgEmbed, download } = convertGoogleDriveLink(link);
      convertedFiles[category] = { preview, imgEmbed, download };
      categoryList.push(category);
    }

    return {
      id,
      name,
      groupName,
      order,
      copy,
      imgEmbed: convertedFiles[categoryList[0]].imgEmbed,
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
  "Cartelería:"
);

const dataJanuaryStoppersCards = processMonthData(
  json2024Data,
  "january",
  "physicalContent",
  "stoppers",
  "Stopper:"
);

const dataJanuaryTestsCards = processMonthData(
  json2024Data,
  "january",
  "physicalContent",
  "tests",
  "Test:"
);

const dataJanuaryCardsCards = processMonthData(
  json2024Data,
  "january",
  "physicalContent",
  "cards",
  "Tarjeta:"
);

const dataJanuaryActionPostsCards = processMonthData(
  json2024Data,
  "january",
  "digitalContent",
  "actionPosts",
  "Post A:"
);

const dataJanuaryActionStoriesCards = processMonthData(
  json2024Data,
  "january",
  "digitalContent",
  "actionStories",
  "Story A:"
);

const dataJanuaryMonthlyContentPlan = processMonthData(
  json2024Data,
  "january",
  "digitalContent",
  "monthlyContentPlan",
  "Post M:"
);

const dataJanuarySmsAndWhatsApp = processMonthData(
  json2024Data,
  "january",
  "digitalContent",
  "smsAndWhatsApp",
  "SMS & WApp:"
);

const dataJanuaryValueStories = processMonthData(
  json2024Data,
  "january",
  "digitalContent",
  "valueStories",
  "Story V:"
);

const dataJanuaryVideos = processMonthData(
  json2024Data,
  "january",
  "digitalContent",
  "videos",
  "Video:"
);

const marketingSalonJanuary2024 = {
  postersCardsES: dataJanuaryPostersCards.postersCardsES,
  postersCardsCA: dataJanuaryPostersCards.postersCardsCA,
  stoppersCardsES: dataJanuaryStoppersCards.stoppersCardsES,
  stoppersCardsCA: dataJanuaryStoppersCards.stoppersCardsCA,
  testsCardsES: dataJanuaryTestsCards.testsCardsES,
  testsCardsCA: dataJanuaryTestsCards.testsCardsCA,
  cardsCardsES: dataJanuaryCardsCards.cardsCardsES,
  cardsCardsCA: dataJanuaryCardsCards.cardsCardsCA,
  actionPostsCardsES: dataJanuaryActionPostsCards.actionPostsCardsES,
  actionPostsCardsCA: dataJanuaryActionPostsCards.actionPostsCardsCA,
  actionStoriesCardsES: dataJanuaryActionStoriesCards.actionStoriesCardsES,
  actionStoriesCardsCA: dataJanuaryActionStoriesCards.actionStoriesCardsCA,
  monthlyContentPlanCardsES:
    dataJanuaryMonthlyContentPlan.monthlyContentPlanCardsES,
  smsAndWhatsAppCardsES: dataJanuarySmsAndWhatsApp.smsAndWhatsAppCardsES,
  valueStoriesCardsES: dataJanuaryValueStories.valueStoriesCardsES,
  videosCardsES: dataJanuaryVideos.videosCardsES,
  videosCardsCA: dataJanuaryVideos.videosCardsCA,
};

const marketingSalonFebruary2024 = {
  postersCardsES: null,
  postersCardsCA: null,
  stoppersCardsES: null,
  stoppersCardsCA: null,
  testsCardsES: null,
  testsCardsCA: null,
  cardsCardsES: null,
  cardsCardsCA: null,
  actionPostsCardsES: null,
  actionPostsCardsCA: null,
  actionStoriesCardsES: null,
  actionStoriesCardsCA: null,
  monthlyContentPlanCardsES: null,
  smsAndWhatsAppCardsES: null,
  valueStoriesCardsES: null,
  videosCardsES: null,
  videosCardsCA: null,
};

const postersCardsES = dataJanuaryPostersCards.postersCardsES;
const postersCardsCA = dataJanuaryPostersCards.postersCardsCA;

const stoppersCardsES = dataJanuaryStoppersCards.stoppersCardsES;
const stoppersCardsCA = dataJanuaryStoppersCards.stoppersCardsCA;

const testsCardsES = dataJanuaryTestsCards.testsCardsES;
const testsCardsCA = dataJanuaryTestsCards.testsCardsCA;

const cardsCardsES = dataJanuaryCardsCards.cardsCardsES;
const cardsCardsCA = dataJanuaryCardsCards.cardsCardsCA;

const actionPostsCardsES = dataJanuaryActionPostsCards.actionPostsCardsES;
const actionPostsCardsCA = dataJanuaryActionPostsCards.actionPostsCardsCA;

const actionStoriesCardsES = dataJanuaryActionStoriesCards.actionStoriesCardsES;
const actionStoriesCardsCA = dataJanuaryActionStoriesCards.actionStoriesCardsCA;

const monthlyContentPlanCardsES =
  dataJanuaryMonthlyContentPlan.monthlyContentPlanCardsES;

const smsAndWhatsAppCardsES = dataJanuarySmsAndWhatsApp.smsAndWhatsAppCardsES;

const valueStoriesCardsES = dataJanuaryValueStories.valueStoriesCardsES;

const videosCardsES = dataJanuaryVideos.videosCardsES;
const videosCardsCA = dataJanuaryVideos.videosCardsCA;

export {
  marketingSalonJanuary2024,
  marketingSalonFebruary2024,
  postersCardsES,
  postersCardsCA,
  stoppersCardsES,
  stoppersCardsCA,
  testsCardsES,
  testsCardsCA,
  cardsCardsES,
  cardsCardsCA,
  actionPostsCardsES,
  actionPostsCardsCA,
  actionStoriesCardsES,
  actionStoriesCardsCA,
  monthlyContentPlanCardsES,
  smsAndWhatsAppCardsES,
  valueStoriesCardsES,
  videosCardsES,
  videosCardsCA,
};
