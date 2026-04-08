import type { DealDocument, DealStatus, DocumentStatus } from '@/lib/types';
import { deals } from './sales';

const PIPELINE_ORDER: DealStatus[] = [
  'client_request',
  'terms_negotiation',
  'awaiting_payment',
  'paid',
  'approved_for_shipment',
  'shipped',
  'documents_done',
  'invoice_accepted',
  'deal_closed',
];

function pipelineIndex(status: DealStatus): number {
  return PIPELINE_ORDER.indexOf(status);
}

function isPaidOrLater(status: DealStatus): boolean {
  return pipelineIndex(status) >= pipelineIndex('paid');
}

function isShippedOrLater(status: DealStatus): boolean {
  return pipelineIndex(status) >= pipelineIndex('shipped');
}

function docStatus(status: DealStatus, docStage: 'payment' | 'shipment'): DocumentStatus {
  const idx = pipelineIndex(status);
  if (docStage === 'payment') {
    if (idx >= pipelineIndex('invoice_accepted')) return 'sent';
    if (idx >= pipelineIndex('documents_done')) return 'signed';
    return 'formed';
  }
  // shipment docs
  if (idx >= pipelineIndex('invoice_accepted')) return 'sent';
  if (idx >= pipelineIndex('documents_done')) return 'signed';
  return 'formed';
}

function dealNumSuffix(dealId: string): string {
  return dealId.replace('deal-', '');
}

function offsetDate(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

const allDocuments: DealDocument[] = [];

deals.forEach((deal) => {
  const suffix = dealNumSuffix(deal.id);

  if (isPaidOrLater(deal.status)) {
    const payStage = docStatus(deal.status, 'payment');

    allDocuments.push({
      id: `doc-inv-${suffix}`,
      dealId: deal.id,
      type: 'invoice',
      number: `СЧ-2026-${suffix}`,
      date: offsetDate(deal.date, 1),
      status: payStage,
    });

    allDocuments.push({
      id: `doc-spec-${suffix}`,
      dealId: deal.id,
      type: 'specification',
      number: `СП-2026-${suffix}`,
      date: offsetDate(deal.date, 1),
      status: payStage,
    });
  }

  if (isShippedOrLater(deal.status)) {
    const shipStage = docStatus(deal.status, 'shipment');

    allDocuments.push({
      id: `doc-ttn-${suffix}`,
      dealId: deal.id,
      type: 'waybill',
      number: `ТТН-2026-${suffix}`,
      date: offsetDate(deal.date, 3),
      status: shipStage,
    });

    allDocuments.push({
      id: `doc-sf-${suffix}`,
      dealId: deal.id,
      type: 'tax_invoice',
      number: `СФ-2026-${suffix}`,
      date: offsetDate(deal.date, 3),
      status: shipStage,
    });

    allDocuments.push({
      id: `doc-act-${suffix}`,
      dealId: deal.id,
      type: 'act',
      number: `АКТ-2026-${suffix}`,
      date: offsetDate(deal.date, 4),
      status: shipStage,
    });
  }
});

export const dealDocuments: DealDocument[] = allDocuments;

export function getDocumentsForDeal(dealId: string): DealDocument[] {
  return dealDocuments.filter((d) => d.dealId === dealId);
}
