import type { Deal, DealDocument, Client, Tanker } from '@/lib/types';
import { BASE_LABELS } from '@/lib/constants';

// ─── Formatters (browser-safe, no server imports) ───────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('ru-RU').replace(/,/g, ' ');
}

function fmtCurrency(n: number): string {
  return fmt(Math.round(n)) + ' сум';
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const BASE_CSS = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Times New Roman',Times,serif;font-size:11pt;color:#111;background:#fff;padding:24px 32px}
  @media print{
    body{padding:0}
    .no-print{display:none!important}
    @page{margin:15mm 20mm}
  }
  .save-btn{
    position:fixed;top:16px;right:16px;z-index:999;
    background:#1d4ed8;color:#fff;border:none;border-radius:8px;
    padding:10px 22px;font-size:13px;font-family:sans-serif;
    cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.18);
    transition:background .15s;
  }
  .save-btn:hover{background:#1e40af}
  h1{font-size:14pt;font-weight:bold;text-align:center;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
  h2{font-size:12pt;font-weight:bold;margin-bottom:8px}
  .doc-meta{text-align:center;font-size:10pt;color:#555;margin-bottom:20px}
  .header-block{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #111;padding-bottom:10px;margin-bottom:16px}
  .company-name{font-size:13pt;font-weight:bold}
  .company-sub{font-size:9pt;color:#444;margin-top:3px}
  .stamp-box{border:1px solid #999;padding:6px 14px;font-size:9pt;text-align:center;color:#555}
  table{width:100%;border-collapse:collapse;margin:12px 0;font-size:10pt}
  th{background:#f0f0f0;font-weight:bold;border:1px solid #999;padding:6px 8px;text-align:left}
  td{border:1px solid #999;padding:5px 8px;vertical-align:top}
  .right{text-align:right}
  .center{text-align:center}
  .total-row td{font-weight:bold;background:#f9f9f9}
  .parties{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:20px}
  .party-block{font-size:10pt}
  .party-label{font-weight:bold;margin-bottom:6px;font-size:10pt}
  .sig-line{border-bottom:1px solid #333;margin-top:28px;margin-bottom:4px}
  .sig-sub{font-size:9pt;color:#555}
  .info-grid{display:grid;grid-template-columns:160px 1fr;gap:4px 10px;margin:12px 0;font-size:10pt}
  .info-label{font-weight:bold;color:#333}
  .section-title{font-size:10pt;font-weight:bold;text-transform:uppercase;letter-spacing:.4px;margin:14px 0 6px;color:#333}
  .total-block{text-align:right;margin:8px 0;font-size:11pt}
  .total-block .total-sum{font-size:13pt;font-weight:bold}
  .notice{font-size:9pt;color:#555;margin-top:8px;font-style:italic}
  .bank-grid{display:grid;grid-template-columns:160px 1fr;gap:3px 10px;margin:8px 0;font-size:9.5pt;border:1px solid #ccc;padding:8px}
  .bank-title{font-size:9.5pt;font-weight:bold;margin-bottom:4px}
`;

// ─── Shared base layout ───────────────────────────────────────────────────────

function baseLayout(title: string, number: string, date: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title} ${number}</title>
  <style>${BASE_CSS}</style>
</head>
<body>
<button class="save-btn no-print" onclick="window.print()">Сохранить PDF</button>
${bodyHtml}
</body>
</html>`;
}

// ─── ENO header fragment ──────────────────────────────────────────────────────

function enoHeader(): string {
  return `
  <div class="header-block">
    <div>
      <div class="company-name">ТОО «Etive Neft Oil»</div>
      <div class="company-sub">Республика Узбекистан, г. Ташкент</div>
      <div class="company-sub">ул. Амир Темур, 107Б, офис 12</div>
      <div class="company-sub">Тел: +998 71 200-10-00 | enoportal@eno.uz</div>
      <div class="company-sub">ИНН: 307 485 619 | ОКЭД: 46710</div>
    </div>
    <div class="stamp-box">
      Оригинал документа<br/>сформирован автоматически<br/>системой ENO Portal
    </div>
  </div>`;
}

// ─── 1. Счёт на оплату (Invoice) ─────────────────────────────────────────────

export function generateInvoiceHtml(deal: Deal, doc: DealDocument, client: Client | undefined): string {
  const clientName = client?.companyName ?? 'Не указан';
  const contact = client?.contactPerson ?? '—';
  const phone = client?.phone ?? '—';
  const base = BASE_LABELS[deal.base] ?? deal.base;

  const body = `
  ${enoHeader()}

  <h1>Счёт на оплату</h1>
  <div class="doc-meta">№ ${doc.number} &nbsp;от&nbsp; ${fmtDate(doc.date)}</div>

  <div class="section-title">Реквизиты сторон</div>
  <div class="info-grid">
    <span class="info-label">Поставщик:</span><span>ТОО «Etive Neft Oil»</span>
    <span class="info-label">ИНН поставщика:</span><span>307 485 619</span>
    <span class="info-label">Покупатель:</span><span>${clientName}</span>
    <span class="info-label">Контактное лицо:</span><span>${contact}</span>
    <span class="info-label">Телефон:</span><span>${phone}</span>
    <span class="info-label">База отгрузки:</span><span>${base}</span>
  </div>

  <div class="section-title">Перечень товаров/услуг</div>
  <table>
    <thead>
      <tr>
        <th class="center" style="width:32px">№</th>
        <th>Наименование</th>
        <th class="center">Ед. изм.</th>
        <th class="right">Кол-во</th>
        <th class="right">Масса (т)</th>
        <th class="right">Цена за ед.</th>
        <th class="right">Сумма</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="center">1</td>
        <td>Топливо ${deal.fuelType} (нефтепродукт)</td>
        <td class="center">литр</td>
        <td class="right">${fmt(deal.volume)}</td>
        <td class="right">${deal.mass.toFixed(2)}</td>
        <td class="right">${fmt(deal.pricePerLiter)}</td>
        <td class="right">${fmtCurrency(deal.totalAmount)}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="6" class="right">Итого к оплате:</td>
        <td class="right">${fmtCurrency(deal.totalAmount)}</td>
      </tr>
    </tfoot>
  </table>

  <div class="total-block">
    Итого: <span class="total-sum">${fmtCurrency(deal.totalAmount)}</span>
  </div>
  <p class="notice">НДС не облагается (статья 243 НК РУз)</p>

  <div class="section-title">Банковские реквизиты поставщика</div>
  <div class="bank-grid">
    <span class="bank-title" style="grid-column:1/-1">ТОО «Etive Neft Oil»</span>
    <span class="info-label">Банк:</span><span>АО «Узпромстройбанк», г. Ташкент</span>
    <span class="info-label">р/с:</span><span>20208000200419500001</span>
    <span class="info-label">МФО:</span><span>00873</span>
    <span class="info-label">ИНН:</span><span>307 485 619</span>
  </div>

  <div class="parties">
    <div class="party-block">
      <div class="party-label">Поставщик:</div>
      <div>ТОО «Etive Neft Oil»</div>
      <div class="sig-line"></div>
      <div class="sig-sub">Директор / подпись &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; М.П.</div>
    </div>
    <div class="party-block">
      <div class="party-label">Покупатель:</div>
      <div>${clientName}</div>
      <div class="sig-line"></div>
      <div class="sig-sub">${contact} / подпись &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; М.П.</div>
    </div>
  </div>`;

  return baseLayout('Счёт на оплату', doc.number, fmtDate(doc.date), body);
}

// ─── 2. Спецификация (Specification) ─────────────────────────────────────────

export function generateSpecificationHtml(deal: Deal, doc: DealDocument, client: Client | undefined): string {
  const clientName = client?.companyName ?? 'Не указан';
  const contact = client?.contactPerson ?? '—';
  const base = BASE_LABELS[deal.base] ?? deal.base;

  const body = `
  ${enoHeader()}

  <h1>Спецификация к договору поставки</h1>
  <div class="doc-meta">№ ${doc.number} &nbsp;от&nbsp; ${fmtDate(doc.date)}</div>

  <div class="info-grid">
    <span class="info-label">Поставщик:</span><span>ТОО «Etive Neft Oil»</span>
    <span class="info-label">Покупатель:</span><span>${clientName}</span>
    <span class="info-label">Контактное лицо:</span><span>${contact}</span>
    <span class="info-label">База поставки:</span><span>${base}</span>
    <span class="info-label">Дата спецификации:</span><span>${fmtDate(doc.date)}</span>
  </div>

  <div class="section-title">Параметры поставки</div>
  <table>
    <thead>
      <tr>
        <th>Показатель</th>
        <th>Значение</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Наименование продукта</td><td>Моторное топливо ${deal.fuelType}</td></tr>
      <tr><td>ГОСТ / ТУ</td><td>${deal.fuelType === 'AI-95' ? 'ГОСТ 32513-2013 (АИ-95-К5)' : 'ГОСТ 32513-2013 (АИ-92-К5)'}</td></tr>
      <tr><td>Объём поставки</td><td>${fmt(deal.volume)} л</td></tr>
      <tr><td>Масса нетто</td><td>${deal.mass.toFixed(2)} т</td></tr>
      <tr><td>Плотность</td><td>${deal.fuelType === 'AI-95' ? '0,750' : '0,740'} г/см³ (при +20°C)</td></tr>
      <tr><td>Цена за литр (без НДС)</td><td>${fmt(deal.pricePerLiter)} сум</td></tr>
      <tr><td>Стоимость партии</td><td>${fmtCurrency(deal.totalAmount)}</td></tr>
      <tr><td>Условия поставки</td><td>${deal.deliveryType === 'delivery' ? 'Доставка автоцистерной (бензовоз)' : 'Самовывоз с базы поставщика'}</td></tr>
      <tr><td>Форма оплаты</td><td>Безналичный расчёт</td></tr>
      <tr><td>Срок оплаты</td><td>В течение 3 банковских дней с даты счёта</td></tr>
    </tbody>
  </table>

  <div class="section-title">Требования к качеству</div>
  <table>
    <thead>
      <tr>
        <th>Показатель качества</th>
        <th>Норма по ГОСТ</th>
        <th>Фактическое значение</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Октановое число (ИМ)</td><td>не менее ${deal.fuelType === 'AI-95' ? '95,0' : '92,0'}</td><td>${deal.fuelType === 'AI-95' ? '95,4' : '92,3'}</td></tr>
      <tr><td>Содержание серы</td><td>не более 10 мг/кг</td><td>7,2 мг/кг</td></tr>
      <tr><td>Давление насыщ. паров</td><td>45–80 кПа</td><td>62 кПа</td></tr>
      <tr><td>Фракционный состав (10%)</td><td>не выше 70°C</td><td>65°C</td></tr>
    </tbody>
  </table>

  <div class="parties">
    <div class="party-block">
      <div class="party-label">Поставщик:</div>
      <div>ТОО «Etive Neft Oil»</div>
      <div class="sig-line"></div>
      <div class="sig-sub">Директор / подпись &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; М.П.</div>
    </div>
    <div class="party-block">
      <div class="party-label">Покупатель:</div>
      <div>${clientName}</div>
      <div class="sig-line"></div>
      <div class="sig-sub">${contact} / подпись &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; М.П.</div>
    </div>
  </div>`;

  return baseLayout('Спецификация', doc.number, fmtDate(doc.date), body);
}

// ─── 3. ТТН (Waybill) ────────────────────────────────────────────────────────

export function generateWaybillHtml(
  deal: Deal,
  doc: DealDocument,
  client: Client | undefined,
  tanker: Tanker | undefined,
): string {
  const clientName = client?.companyName ?? 'Не указан';
  const contact = client?.contactPerson ?? '—';
  const base = BASE_LABELS[deal.base] ?? deal.base;
  const plate = tanker?.plateNumber ?? 'Самовывоз';
  const driver = tanker?.driverName ?? '—';
  const driverPhone = tanker?.driverPhone ?? '—';
  const capacity = tanker ? `${fmt(tanker.capacity)} л` : '—';

  const body = `
  ${enoHeader()}

  <h1>Товарно-транспортная накладная</h1>
  <div class="doc-meta">№ ${doc.number} &nbsp;от&nbsp; ${fmtDate(doc.date)}</div>

  <div class="section-title">Транспортный раздел</div>
  <div class="info-grid">
    <span class="info-label">Автомобиль (гос. №):</span><span>${plate}</span>
    <span class="info-label">Водитель:</span><span>${driver}</span>
    <span class="info-label">Тел. водителя:</span><span>${driverPhone}</span>
    <span class="info-label">Ёмкость цистерны:</span><span>${capacity}</span>
    <span class="info-label">Маршрут:</span><span>${base} → г. Ташкент (место разгрузки)</span>
    <span class="info-label">Дата отгрузки:</span><span>${fmtDate(doc.date)}</span>
  </div>

  <div class="section-title">Грузоотправитель / Грузополучатель</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:8px 0">
    <div class="info-grid" style="margin:0">
      <span class="info-label">Отправитель:</span><span>ТОО «Etive Neft Oil»</span>
      <span class="info-label">Адрес:</span><span>г. Ташкент, ул. Амир Темур, 107Б</span>
      <span class="info-label">База:</span><span>${base}</span>
    </div>
    <div class="info-grid" style="margin:0">
      <span class="info-label">Получатель:</span><span>${clientName}</span>
      <span class="info-label">Контакт:</span><span>${contact}</span>
      <span class="info-label">Телефон:</span><span>${client?.phone ?? '—'}</span>
    </div>
  </div>

  <div class="section-title">Товарный раздел</div>
  <table>
    <thead>
      <tr>
        <th class="center">№</th>
        <th>Наименование груза</th>
        <th class="center">Ед. изм.</th>
        <th class="right">Количество</th>
        <th class="right">Масса (т)</th>
        <th class="right">Цена за ед.</th>
        <th class="right">Сумма</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="center">1</td>
        <td>Топливо ${deal.fuelType} (нефтепродукт, класс 5)</td>
        <td class="center">л</td>
        <td class="right">${fmt(deal.volume)}</td>
        <td class="right">${deal.mass.toFixed(2)}</td>
        <td class="right">${fmt(deal.pricePerLiter)}</td>
        <td class="right">${fmtCurrency(deal.totalAmount)}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="3" class="right">Итого:</td>
        <td class="right">${fmt(deal.volume)} л</td>
        <td class="right">${deal.mass.toFixed(2)} т</td>
        <td></td>
        <td class="right">${fmtCurrency(deal.totalAmount)}</td>
      </tr>
    </tfoot>
  </table>

  <div class="parties">
    <div class="party-block">
      <div class="party-label">Сдал (поставщик):</div>
      <div>ТОО «Etive Neft Oil»</div>
      <div class="sig-line"></div>
      <div class="sig-sub">Ответственный / подпись</div>
    </div>
    <div class="party-block">
      <div class="party-label">Принял (водитель):</div>
      <div>${driver}</div>
      <div class="sig-line"></div>
      <div class="sig-sub">Водитель / подпись</div>
    </div>
  </div>
  <div class="parties" style="margin-top:16px">
    <div class="party-block">
      <div class="party-label">Получил (покупатель):</div>
      <div>${clientName}</div>
      <div class="sig-line"></div>
      <div class="sig-sub">${contact} / подпись &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; М.П.</div>
    </div>
    <div></div>
  </div>`;

  return baseLayout('ТТН', doc.number, fmtDate(doc.date), body);
}

// ─── 4. Счёт-фактура (Tax Invoice) ───────────────────────────────────────────

export function generateTaxInvoiceHtml(deal: Deal, doc: DealDocument, client: Client | undefined): string {
  const clientName = client?.companyName ?? 'Не указан';
  const contact = client?.contactPerson ?? '—';

  const body = `
  ${enoHeader()}

  <h1>Счёт-фактура</h1>
  <div class="doc-meta">№ ${doc.number} &nbsp;от&nbsp; ${fmtDate(doc.date)}</div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:12px 0">
    <div>
      <div class="section-title" style="margin-top:0">Продавец</div>
      <div class="info-grid" style="margin:0">
        <span class="info-label">Наименование:</span><span>ТОО «Etive Neft Oil»</span>
        <span class="info-label">ИНН:</span><span>307 485 619</span>
        <span class="info-label">Адрес:</span><span>г. Ташкент, ул. Амир Темур, 107Б</span>
        <span class="info-label">Тел:</span><span>+998 71 200-10-00</span>
        <span class="info-label">р/с:</span><span>20208000200419500001</span>
        <span class="info-label">Банк:</span><span>АО «Узпромстройбанк»</span>
      </div>
    </div>
    <div>
      <div class="section-title" style="margin-top:0">Покупатель</div>
      <div class="info-grid" style="margin:0">
        <span class="info-label">Наименование:</span><span>${clientName}</span>
        <span class="info-label">Контактное лицо:</span><span>${contact}</span>
        <span class="info-label">Телефон:</span><span>${client?.phone ?? '—'}</span>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="center" style="width:30px">№</th>
        <th>Наименование товара/услуги</th>
        <th class="center">Ед.</th>
        <th class="right">Кол-во</th>
        <th class="right">Цена без НДС</th>
        <th class="right">Стоимость без НДС</th>
        <th class="right">НДС</th>
        <th class="right">Стоимость с НДС</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="center">1</td>
        <td>Топливо ${deal.fuelType}</td>
        <td class="center">л</td>
        <td class="right">${fmt(deal.volume)}</td>
        <td class="right">${fmt(deal.pricePerLiter)}</td>
        <td class="right">${fmtCurrency(deal.totalAmount)}</td>
        <td class="right">0</td>
        <td class="right">${fmtCurrency(deal.totalAmount)}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="5" class="right">Итого:</td>
        <td class="right">${fmtCurrency(deal.totalAmount)}</td>
        <td class="right">0</td>
        <td class="right">${fmtCurrency(deal.totalAmount)}</td>
      </tr>
    </tfoot>
  </table>

  <p class="notice">НДС не облагается на основании ст. 243 НК Республики Узбекистан.</p>
  <div class="total-block" style="margin-top:16px">
    Всего к оплате: <span class="total-sum">${fmtCurrency(deal.totalAmount)}</span>
  </div>

  <div class="parties">
    <div class="party-block">
      <div class="party-label">Руководитель поставщика:</div>
      <div>ТОО «Etive Neft Oil»</div>
      <div class="sig-line"></div>
      <div class="sig-sub">Директор / подпись &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; М.П.</div>
    </div>
    <div class="party-block">
      <div class="party-label">Покупатель / Получатель:</div>
      <div>${clientName}</div>
      <div class="sig-line"></div>
      <div class="sig-sub">${contact} / подпись &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; М.П.</div>
    </div>
  </div>`;

  return baseLayout('Счёт-фактура', doc.number, fmtDate(doc.date), body);
}

// ─── 5. Акт выполненных работ (Acceptance Act) ───────────────────────────────

export function generateActHtml(deal: Deal, doc: DealDocument, client: Client | undefined): string {
  const clientName = client?.companyName ?? 'Не указан';
  const contact = client?.contactPerson ?? '—';
  const base = BASE_LABELS[deal.base] ?? deal.base;

  const body = `
  ${enoHeader()}

  <h1>Акт выполненных работ (поставки)</h1>
  <div class="doc-meta">№ ${doc.number} &nbsp;от&nbsp; ${fmtDate(doc.date)}</div>

  <p style="font-size:10pt;margin:12px 0">
    ТОО «Etive Neft Oil», именуемое в дальнейшем <strong>«Поставщик»</strong>, в лице Директора,
    с одной стороны, и <strong>${clientName}</strong>, в лице ${contact}, именуемое в дальнейшем
    <strong>«Покупатель»</strong>, с другой стороны, составили настоящий акт о нижеследующем:
  </p>

  <p style="font-size:10pt;margin:8px 0">
    Поставщик произвёл поставку нефтепродуктов Покупателю в полном объёме и надлежащего качества.
    Покупатель претензий к объёму, качеству и срокам поставки не имеет.
  </p>

  <div class="section-title">Перечень поставленных товаров</div>
  <table>
    <thead>
      <tr>
        <th class="center">№</th>
        <th>Наименование</th>
        <th class="center">Ед.</th>
        <th class="right">Кол-во</th>
        <th class="right">Масса (т)</th>
        <th class="right">Цена за ед.</th>
        <th class="right">Сумма</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="center">1</td>
        <td>Топливо ${deal.fuelType}, база ${base}</td>
        <td class="center">л</td>
        <td class="right">${fmt(deal.volume)}</td>
        <td class="right">${deal.mass.toFixed(2)}</td>
        <td class="right">${fmt(deal.pricePerLiter)}</td>
        <td class="right">${fmtCurrency(deal.totalAmount)}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="3" class="right">Итого:</td>
        <td class="right">${fmt(deal.volume)} л</td>
        <td class="right">${deal.mass.toFixed(2)} т</td>
        <td></td>
        <td class="right">${fmtCurrency(deal.totalAmount)}</td>
      </tr>
    </tfoot>
  </table>

  <div class="total-block">
    Итоговая сумма акта: <span class="total-sum">${fmtCurrency(deal.totalAmount)}</span>
  </div>
  <p class="notice">НДС не облагается (ст. 243 НК РУз). Стороны взаимных претензий не имеют.</p>

  <div class="parties">
    <div class="party-block">
      <div class="party-label">Поставщик:</div>
      <div>ТОО «Etive Neft Oil»</div>
      <div class="sig-line"></div>
      <div class="sig-sub">Директор / подпись &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; М.П.</div>
    </div>
    <div class="party-block">
      <div class="party-label">Покупатель:</div>
      <div>${clientName}</div>
      <div class="sig-line"></div>
      <div class="sig-sub">${contact} / подпись &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; М.П.</div>
    </div>
  </div>`;

  return baseLayout('Акт выполненных работ', doc.number, fmtDate(doc.date), body);
}
