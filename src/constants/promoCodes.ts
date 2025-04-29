export interface PromoCode {
  code: string;
  discount: number; // percentage
}

export const PROMO_CODES: PromoCode[] = [
  { code: "WELCOME10", discount: 10 },
  { code: "BUMI25", discount: 25 },
];
