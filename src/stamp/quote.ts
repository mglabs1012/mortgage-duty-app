/** Client details printed on the estimate. */
export type QuoteDetails = {
  client: string;
  mobile: string;
  firstParty: string;
  secondParty: string;
  property: string;
  preparedBy: string;
};

export const EMPTY_QUOTE: QuoteDetails = {
  client: "",
  mobile: "",
  firstParty: "",
  secondParty: "",
  property: "",
  preparedBy: "",
};
