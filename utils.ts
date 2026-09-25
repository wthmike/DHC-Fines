import { FINE_AMOUNTS } from './constants';
import { PlayerSessionState } from './types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (timestamp: number): string => {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(timestamp));
};

export interface FineBreakdown {
  generalFinesCount: number;
  generalFinesSubtotal: number;
  generalFinesCapped: number;
  isGeneralCapped: boolean;
  cardsSubtotal: number;
  dotdAmount: number;
  itemAmount: number;
  grossTotal: number;
  motmDiscount: number;
  preU18Subtotal: number;
  u18Discount: number;
  finalTotal: number;
}

export const calculatePlayerFines = (state: Partial<PlayerSessionState>): FineBreakdown => {
  const generalCount = state.generalFines || 0;
  const rawGeneral = generalCount * FINE_AMOUNTS.GENERAL_FINE;
  const generalFinesCapped = Math.min(rawGeneral, FINE_AMOUNTS.GENERAL_FINE_CAP);
  const isGeneralCapped = rawGeneral > FINE_AMOUNTS.GENERAL_FINE_CAP;

  const green = (state.greenCards || 0) * FINE_AMOUNTS.GREEN_CARD;
  const yellow = (state.yellowCards || 0) * FINE_AMOUNTS.YELLOW_CARD;
  const red = (state.redCards || 0) * FINE_AMOUNTS.RED_CARD;
  const cardsSubtotal = green + yellow + red;

  const dotdAmount = state.isDotd ? FINE_AMOUNTS.DOTD : 0;
  const itemAmount = state.itemBrought === false ? FINE_AMOUNTS.ITEM_FINE : 0;

  const grossTotal = generalFinesCapped + cardsSubtotal + dotdAmount + itemAmount;
  const motmDiscount = state.isMotm ? Math.min(grossTotal, FINE_AMOUNTS.MOTM_DISCOUNT) : 0;
  const preU18Subtotal = Math.max(0, grossTotal - motmDiscount);

  let u18Discount = 0;
  let finalTotal = preU18Subtotal;

  if (state.isU18) {
    // 1/2 price fines for U18s
    finalTotal = Math.round(preU18Subtotal * FINE_AMOUNTS.U18_DISCOUNT_RATE * 100) / 100;
    u18Discount = preU18Subtotal - finalTotal;
  }

  return {
    generalFinesCount: generalCount,
    generalFinesSubtotal: rawGeneral,
    generalFinesCapped,
    isGeneralCapped,
    cardsSubtotal,
    dotdAmount,
    itemAmount,
    grossTotal,
    motmDiscount,
    preU18Subtotal,
    u18Discount,
    finalTotal
  };
};
