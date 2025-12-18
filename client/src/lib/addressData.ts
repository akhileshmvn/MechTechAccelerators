export type AddressRecord = {
  Address: string;
  City: string;
  State: string;
  Zip: string;
};

let addressCache: AddressRecord[] | null = null;

const parseAddressScript = (text: string): AddressRecord[] => {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Invalid address data format');
  }

  return JSON.parse(text.slice(start, end + 1));
};

export const loadAddresses = async (): Promise<AddressRecord[]> => {
  if (addressCache) {
    return addressCache;
  }

  const response = await fetch('/addresses_embedded.js');
  if (!response.ok) {
    throw new Error('Failed to load address data');
  }

  const scriptText = await response.text();
  addressCache = parseAddressScript(scriptText);
  return addressCache;
};
