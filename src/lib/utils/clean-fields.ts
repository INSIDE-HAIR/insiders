import { dataBaseTranslation } from "@/db/constants";

export const cleanFieldName = (field: string): string => {
  const accentsMap: { [key: string]: string } = {
    á: "a",
    é: "e",
    í: "i",
    ó: "o",
    ú: "u",
    Á: "A",
    É: "E",
    Í: "I",
    Ó: "O",
    Ú: "U",
    ñ: "n",
    Ñ: "N",
    "&": "Y",
    "+": "",
    º: "",
    " ": "",
    "-": "",
  };
  return field.replace(/[áéíóúÁÉÍÓÚñÑ&+º\s-]/g, (match) => accentsMap[match]);
};

export const transformHoldedData = (
  data: any,
  existingHoldedData: any = null
) => {
  const transformedCustomFields = data.customFields
    ? data.customFields.map((field: any) => ({
        field: field.field,
        value: field.value,
      }))
    : [];

  return {
    holdedId: data.id,
    customId: data.customId || null,
    name: data.name || "",
    code: data.code || "",
    vatnumber: data.vatnumber || "",
    tradeName: data.tradeName ? String(data.tradeName) : "",
    email: data.email || "",
    mobile: data.mobile?.toString() || "",
    phone: data.phone?.toString() || "",
    type: data.type || "",
    iban: data.iban || "",
    swift: data.swift || "",
    groupId: data.groupId || "",
    clientRecord: data.clientRecord
      ? { connect: { id: data.clientRecord.id } }
      : undefined,
    supplierRecord: data.supplierRecord
      ? { connect: { id: data.supplierRecord.id } }
      : undefined,
    billAddress: data.billAddress
      ? existingHoldedData && existingHoldedData.billAddress
        ? {
            update: {
              address: data.billAddress.address || "",
              city: data.billAddress.city || "",
              postalCode: data.billAddress.postalCode
                ? parseInt(data.billAddress.postalCode, 10)
                : 0,
              province: data.billAddress.province || "",
              country: data.billAddress.country || "",
              countryCode: data.billAddress.countryCode || "",
              info: data.billAddress.info || "",
            },
          }
        : {
            create: {
              address: data.billAddress.address || "",
              city: data.billAddress.city || "",
              postalCode: data.billAddress.postalCode
                ? parseInt(data.billAddress.postalCode, 10)
                : 0,
              province: data.billAddress.province || "",
              country: data.billAddress.country || "",
              countryCode: data.billAddress.countryCode || "",
              info: data.billAddress.info || "",
            },
          }
      : undefined,
    defaults: data.defaults
      ? existingHoldedData && existingHoldedData.defaults
        ? {
            update: {
              salesChannel: data.defaults.salesChannel || 0,
              expensesAccount: data.defaults.expensesAccount || 0,
              dueDays: data.defaults.dueDays || 0,
              paymentDay: data.defaults.paymentDay || 0,
              paymentMethod: data.defaults.paymentMethod || 0,
              discount: data.defaults.discount || 0,
              language: data.defaults.language || "es",
              currency: data.defaults.currency || "eur",
              salesTax: data.defaults.salesTax || [],
              purchasesTax: data.defaults.purchasesTax || [],
              accumulateInForm347: data.defaults.accumulateInForm347 || "yes",
            },
          }
        : {
            create: {
              salesChannel: data.defaults.salesChannel || 0,
              expensesAccount: data.defaults.expensesAccount || 0,
              dueDays: data.defaults.dueDays || 0,
              paymentDay: data.defaults.paymentDay || 0,
              paymentMethod: data.defaults.paymentMethod || 0,
              discount: data.defaults.discount || 0,
              language: data.defaults.language || "es",
              currency: data.defaults.currency || "eur",
              salesTax: data.defaults.salesTax || [],
              purchasesTax: data.defaults.purchasesTax || [],
              accumulateInForm347: data.defaults.accumulateInForm347 || "yes",
            },
          }
      : undefined,
    socialNetworks: data.socialNetworks
      ? existingHoldedData && existingHoldedData.socialNetworks
        ? {
            update: {
              facebook: data.socialNetworks.facebook || "",
              twitter: data.socialNetworks.twitter || "",
              instagram: data.socialNetworks.instagram || "",
              google: data.socialNetworks.google || "",
              linkedin: data.socialNetworks.linkedin || "",
              pinterest: data.socialNetworks.pinterest || "",
              foursquare: data.socialNetworks.foursquare || "",
              youtube: data.socialNetworks.youtube || "",
              vimeo: data.socialNetworks.vimeo || "",
              wordpress: data.socialNetworks.wordpress || "",
              website: data.socialNetworks.website || "",
            },
          }
        : {
            create: {
              facebook: data.socialNetworks.facebook || "",
              twitter: data.socialNetworks.twitter || "",
              instagram: data.socialNetworks.instagram || "",
              google: data.socialNetworks.google || "",
              linkedin: data.socialNetworks.linkedin || "",
              pinterest: data.socialNetworks.pinterest || "",
              foursquare: data.socialNetworks.foursquare || "",
              youtube: data.socialNetworks.youtube || "",
              vimeo: data.socialNetworks.vimeo || "",
              wordpress: data.socialNetworks.wordpress || "",
              website: data.socialNetworks.website || "",
            },
          }
      : undefined,
    tags: data.tags || [],
    notes: data.notes
      ? {
          create: data.notes.map((note: any) => ({
            noteId: note.noteId || "",
            name: note.name || "",
            description: note.description || "",
            color: note.color || "",
            updatedAt: note.updatedAt ? parseInt(note.updatedAt, 10) : 0,
          })),
        }
      : undefined,
    contactPersons: data.contactPersons
      ? {
          create: data.contactPersons.map((person: any) => ({
            personId: person.personId,
            name: person.name || "",
            job: person.job || "",
            phone: person.phone?.toString() || "",
            email: person.email || "",
            sendDocuments: person.sendDocuments ? 1 : 0,
          })),
        }
      : undefined,
    shippingAddresses: data.shippingAddresses || [],
    isPerson: data.isPerson === 1,
    createdAt: data.createdAt ? new Date(data.createdAt * 1000) : new Date(),
    updatedAt: data.updatedAt ? new Date(data.updatedAt * 1000) : new Date(),
    updatedHash: data.updatedHash || "",
    customFields: {
      create: transformedCustomFields,
    },
  };
};
