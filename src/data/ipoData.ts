export type IPOStatus = 'upcoming' | 'open' | 'closed' | 'listed';

export interface IPO {
  id: string;
  name: string;
  exchange: 'NSE' | 'BSE' | 'NSE & BSE';
  priceBandLow: number;
  priceBandHigh: number;
  gmp: number;
  lotSize: number;
  openDate: string;
  closeDate: string;
  listingDate?: string;
  status: IPOStatus;
  subscriptionRetail?: number;
  subscriptionHNI?: number;
  subscriptionQIB?: number;
  subscriptionTotal?: number;
  listingPrice?: number;
  listingGain?: number;
  companyDescription?: string;
  revenue?: number;
  profit?: number;
  ipoObjective?: string;
  gmpHistory?: { date: string; gmp: number }[];
  subscriptionHistory?: { date: string; retail: number; hni: number; qib: number }[];
}

export const mockIPOs: IPO[] = [
  {
    id: 'denta-water',
    name: 'Denta Water & Infra Solutions',
    exchange: 'NSE & BSE',
    priceBandLow: 279,
    priceBandHigh: 294,
    gmp: 45,
    lotSize: 50,
    openDate: '2026-02-22',
    closeDate: '2026-02-25',
    status: 'open',
    subscriptionRetail: 4.2,
    subscriptionHNI: 2.8,
    subscriptionQIB: 6.1,
    subscriptionTotal: 4.37,
    companyDescription: 'Denta Water & Infra Solutions Ltd is engaged in the business of water treatment and infrastructure development projects across India.',
    revenue: 485,
    profit: 62,
    ipoObjective: 'Funding working capital requirements, capital expenditure, and general corporate purposes.',
    gmpHistory: [
      { date: '2026-02-18', gmp: 20 }, { date: '2026-02-19', gmp: 28 },
      { date: '2026-02-20', gmp: 35 }, { date: '2026-02-21', gmp: 38 },
      { date: '2026-02-22', gmp: 42 }, { date: '2026-02-23', gmp: 40 },
      { date: '2026-02-24', gmp: 45 },
    ],
    subscriptionHistory: [
      { date: 'Day 1', retail: 1.2, hni: 0.5, qib: 0.8 },
      { date: 'Day 2', retail: 2.8, hni: 1.4, qib: 3.2 },
      { date: 'Day 3', retail: 4.2, hni: 2.8, qib: 6.1 },
    ],
  },
  {
    id: 'hexaware-tech',
    name: 'Hexaware Technologies',
    exchange: 'NSE & BSE',
    priceBandLow: 674,
    priceBandHigh: 708,
    gmp: 120,
    lotSize: 21,
    openDate: '2026-02-28',
    closeDate: '2026-03-03',
    status: 'upcoming',
    companyDescription: 'Hexaware Technologies is a leading IT services company providing digital transformation, cloud, and automation services.',
    revenue: 8450,
    profit: 1120,
    ipoObjective: 'Offer for sale by existing shareholders. No fresh issue of equity shares.',
    gmpHistory: [
      { date: '2026-02-20', gmp: 80 }, { date: '2026-02-21', gmp: 95 },
      { date: '2026-02-22', gmp: 105 }, { date: '2026-02-23', gmp: 110 },
      { date: '2026-02-24', gmp: 115 }, { date: '2026-02-25', gmp: 120 },
    ],
  },
  {
    id: 'quality-power',
    name: 'Quality Power Electrical',
    exchange: 'NSE & BSE',
    priceBandLow: 401,
    priceBandHigh: 425,
    gmp: -12,
    lotSize: 35,
    openDate: '2026-02-14',
    closeDate: '2026-02-18',
    listingDate: '2026-02-21',
    status: 'listed',
    subscriptionRetail: 1.8,
    subscriptionHNI: 0.9,
    subscriptionQIB: 3.2,
    subscriptionTotal: 1.97,
    listingPrice: 410,
    listingGain: -3.53,
    companyDescription: 'Quality Power Electrical Equipments Ltd is engaged in the manufacture of power and distribution transformers.',
    revenue: 1250,
    profit: 145,
    ipoObjective: 'Capital expenditure for expansion, debt repayment, and working capital.',
    gmpHistory: [
      { date: '2026-02-10', gmp: 15 }, { date: '2026-02-12', gmp: 8 },
      { date: '2026-02-14', gmp: 2 }, { date: '2026-02-16', gmp: -5 },
      { date: '2026-02-18', gmp: -10 }, { date: '2026-02-20', gmp: -12 },
    ],
  },
  {
    id: 'bajaj-housing',
    name: 'Bajaj Housing Finance',
    exchange: 'NSE & BSE',
    priceBandLow: 66,
    priceBandHigh: 70,
    gmp: 52,
    lotSize: 214,
    openDate: '2026-02-10',
    closeDate: '2026-02-13',
    listingDate: '2026-02-18',
    status: 'listed',
    subscriptionRetail: 7.4,
    subscriptionHNI: 12.6,
    subscriptionQIB: 28.3,
    subscriptionTotal: 16.1,
    listingPrice: 135,
    listingGain: 92.86,
    companyDescription: 'Bajaj Housing Finance Limited is one of the leading housing finance companies in India, offering home loans and mortgage products.',
    revenue: 7850,
    profit: 1680,
    ipoObjective: 'Augmenting capital base to meet future business requirements.',
    gmpHistory: [
      { date: '2026-02-05', gmp: 30 }, { date: '2026-02-07', gmp: 38 },
      { date: '2026-02-09', gmp: 42 }, { date: '2026-02-11', gmp: 48 },
      { date: '2026-02-13', gmp: 50 }, { date: '2026-02-16', gmp: 52 },
    ],
  },
  {
    id: 'ather-energy',
    name: 'Ather Energy',
    exchange: 'NSE & BSE',
    priceBandLow: 304,
    priceBandHigh: 321,
    gmp: 68,
    lotSize: 46,
    openDate: '2026-03-05',
    closeDate: '2026-03-08',
    status: 'upcoming',
    companyDescription: 'Ather Energy is a leading electric two-wheeler manufacturer in India with a focus on smart electric scooters.',
    revenue: 1890,
    profit: -220,
    ipoObjective: 'Expansion of manufacturing capacity, R&D, marketing, and general corporate purposes.',
    gmpHistory: [
      { date: '2026-02-22', gmp: 45 }, { date: '2026-02-24', gmp: 55 },
      { date: '2026-02-26', gmp: 68 },
    ],
  },
  {
    id: 'sai-life',
    name: 'Sai Life Sciences',
    exchange: 'NSE',
    priceBandLow: 522,
    priceBandHigh: 549,
    gmp: 30,
    lotSize: 27,
    openDate: '2026-02-19',
    closeDate: '2026-02-22',
    status: 'closed',
    subscriptionRetail: 3.1,
    subscriptionHNI: 5.2,
    subscriptionQIB: 18.7,
    subscriptionTotal: 9.0,
    companyDescription: 'Sai Life Sciences Limited provides contract research and manufacturing services to pharmaceutical and biotech companies.',
    revenue: 2100,
    profit: 310,
    ipoObjective: 'Repayment of borrowings and general corporate purposes.',
    gmpHistory: [
      { date: '2026-02-15', gmp: 18 }, { date: '2026-02-17', gmp: 22 },
      { date: '2026-02-19', gmp: 28 }, { date: '2026-02-21', gmp: 30 },
    ],
    subscriptionHistory: [
      { date: 'Day 1', retail: 0.8, hni: 1.1, qib: 4.2 },
      { date: 'Day 2', retail: 1.9, hni: 3.0, qib: 10.5 },
      { date: 'Day 3', retail: 3.1, hni: 5.2, qib: 18.7 },
    ],
  },
];

export function getIPOById(id: string): IPO | undefined {
  return mockIPOs.find(ipo => ipo.id === id);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function formatCrore(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')} Cr`;
}
