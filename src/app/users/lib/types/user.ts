// src/lib/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  customId: string;
  code: string;
  vatnumber: string;
  tradeName: string;
  mobile: string;
  phone: string;
  type: string;
  billAddress: {
    address: string;
    city: string;
    postalCode: string;
    province: string;
    country: string;
    countryCode: string | null;
    info: string;
  };
  customFields: {
    field: string;
    value: string;
  }[];
  createdAt: number;
  updatedAt: number;
}
