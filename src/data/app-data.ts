import type { InvoiceStatus } from "@/data/dashboard";
export type { InvoiceStatus } from "@/data/dashboard";

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  invoices: number;
  total: number;
};

export type InvoiceLine = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceRecord = {
  number: string;
  clientId: string;
  client: string;
  date: string;
  due: string;
  amount: number;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  notes: string;
};

export const clients: Client[] = [];

export const invoiceRecords: InvoiceRecord[] = [];

export const formatXof = (amount: number) => `${Math.round(amount).toLocaleString("fr-FR")} FCFA`;
export const statusStyles: Record<InvoiceStatus, string> = { Payee: "bg-[#e1f3e6] text-[#2d7b4c]", Envoyee: "bg-[#e4eef8] text-[#3c6c91]", "En retard": "bg-[#fbe4e0] text-[#b25247]", Brouillon: "bg-[#eef0ec] text-[#6f7972]" };
