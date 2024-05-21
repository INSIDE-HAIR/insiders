interface HoldedContact {
  id: string;
  customId: string;
  name: string;
  code: string;
  vatnumber: string;
  tradeName: string | number;
  email: string;
  mobile: string;
  phone: string;
  type: string;
  iban: string;
  swift: string;
  groupId: string;
  clientRecord: number | Record<string, any>;
  supplierRecord: number;
  billAddress: {
    address: string;
    city: string;
    postalCode: string;
    province: string;
    country: string;
    countryCode: string | null;
    info: string;
  };
  customFields: Array<{
    field: string;
    value: string | number | Date | null;
  }>;
  defaults: {
    salesChannel: number;
    expensesAccount: number;
    dueDays: number;
    paymentDay: number;
    paymentMethod: number;
    discount: number;
    language: string;
    currency: string;
    salesTax: any[];
    purchasesTax: any[];
    accumulateInForm347: string;
  };
  socialNetworks: {
    facebook: string;
    twitter: string;
    instagram: string;
    google: string;
    linkedin: string;
    pinterest: string;
    foursquare: string;
    youtube: string;
    vimeo: string;
    wordpress: string;
    website: string;
  };
  tags: string[];
  notes: any[];
  contactPersons: any[];
  shippingAddresses: any[];
  isperson: number;
  createdAt: number;
  updatedAt: number;
  updatedHash: string;
}