import jsonData from "@/db/marketing-salon/campaign/2024/january.json";

// Mapping data from the updated JSON
const mappedDataPosters = Object.keys(
  jsonData.january.physicalContent.posters
).reduce((result, lang) => {
  const cards = jsonData.january.physicalContent.posters[lang].reduce(
    (acc, item) => {
      // Extracting relevant information from the item
      const id = item.name.split("/")[1].split("_")[1].replace(".pdf", "");
      const name = `Card ${id}`;
      const category = item.name.split("/")[0];

      // If the object with the name already exists, simply add the new category
      const existingCard = acc.find((card) => card.name === name);
      if (existingCard) {
        // Ensure files property exists
        existingCard.files = existingCard.files || {};
        existingCard.files[category] = item.url;
      } else {
        // If it doesn't exist, create a new card object
        const newCard = {
          id,
          name,
          files: { [category]: item.url },
        };
        acc.push(newCard);
      }

      return acc;
    },
    []
  );

  // Add the cards to the result object
  result[`postersCards${lang.toUpperCase()}`] = cards;
  return result;
}, {});

console.log(mappedDataPosters);

// Function to convert Google Drive links
function convertGoogleDriveLink(link) {
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

// Convert links for the mapped data
const postersCardsES = convertLinks(mappedDataPosters.postersCardsES);
console.log("cardsES", postersCardsES);

const postersCardsCA = convertLinks(mappedDataPosters.postersCardsCA);
console.log("cardsCA", postersCardsCA);

export { postersCardsES, postersCardsCA };
