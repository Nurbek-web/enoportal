import type { DealDocument, Deal, Client, Tanker } from '@/lib/types';
import {
  generateInvoiceHtml,
  generateSpecificationHtml,
  generateWaybillHtml,
  generateTaxInvoiceHtml,
  generateActHtml,
} from './document-templates';

export function openDealDocument(
  doc: DealDocument,
  deal: Deal,
  client: Client | undefined,
  tanker: Tanker | undefined,
): void {
  let html: string;

  switch (doc.type) {
    case 'invoice':
      html = generateInvoiceHtml(deal, doc, client);
      break;
    case 'specification':
      html = generateSpecificationHtml(deal, doc, client);
      break;
    case 'waybill':
      html = generateWaybillHtml(deal, doc, client, tanker);
      break;
    case 'tax_invoice':
      html = generateTaxInvoiceHtml(deal, doc, client);
      break;
    case 'act':
      html = generateActHtml(deal, doc, client);
      break;
    default:
      return;
  }

  const tab = window.open('', '_blank');
  if (!tab) return;
  tab.document.open();
  tab.document.write(html);
  tab.document.close();
}
