const SELLER_INFO = {
  name: 'Om sai furniture and electronics',
  addressLines: ['Near HP petrol pump Maniyari Dheng', 'Sitamarhi'],
  stateLine: 'State Name : Bihar, Code : 10',
  gstin: 'GSTIN/UIN: 10HOAPS1935B1ZG',
  contact: 'Phone: 9661789040 | Email: omsaifurnelectro@gmail.com',
  bank: {
    holder: 'OM SAI FURNITURE AND ELECTRONICS',
    name: 'STATE BANK OF INDIA',
    account: '43172569447',
    branchIfsc: 'BAIRGAINA, SITAMARHI, BIHAR | IFSC SBIN0002906',
  },
  jurisdiction: 'SUBJECT TO LOCAL JURISDICTION',
};
const STORAGE_KEY = 'om-sai-invoice-number';
const RUPEE = '\u20B9';

document.addEventListener('DOMContentLoaded', () => {
  cacheElements();
  renderSeller();
  initInvoiceNumber();
  setDefaultDate();
  bindEvents();
  addRow();
  recalcTotals();
});

let els = {};

function cacheElements() {
  els = {
    invoiceNumber: document.getElementById('invoice-number'),
    invoiceDate: document.getElementById('invoice-date'),
    paymentMode: document.getElementById('payment-mode'),
    deliveryNote: document.getElementById('delivery-note'),
    itemsBody: document.getElementById('items-body'),
    totalQty: document.getElementById('total-qty'),
    grandTotal: document.getElementById('grand-total'),
    netTotal: document.getElementById('net-total'),
    discountRow: document.getElementById('discount-row'),
    discountAmountDisplay: document.getElementById('discount-amount-display'),
    amountWords: document.getElementById('amount-words-value'),
    addRowBtn: document.getElementById('add-row-btn'),
    pdfBtn: document.getElementById('pdf-btn'),
    resetBtn: document.getElementById('reset-btn'),
    discountToggle: document.getElementById('discount-toggle'),
    discountAmount: document.getElementById('discount-amount'),
    sellerName: document.getElementById('seller-name'),
    sellerNameSmall: document.getElementById('seller-name-small'),
    sellerAddress: document.getElementById('seller-address'),
    sellerContact: document.getElementById('seller-contact'),
    sellerState: document.getElementById('seller-state'),
    sellerGstin: document.getElementById('seller-gstin'),
    jurisdiction: document.getElementById('jurisdiction-text'),
    remarks: document.getElementById('remarks'),
    bank: {
      holder: document.getElementById('bank-holder'),
      name: document.getElementById('bank-name'),
      account: document.getElementById('bank-account'),
      branchIfsc: document.getElementById('bank-branch-ifsc'),
    },
    buyerFields: {
      name: document.getElementById('buyer-name'),
      address: document.getElementById('buyer-address'),
      state: document.getElementById('buyer-state'),
      stateCode: document.getElementById('buyer-state-code'),
      phone: document.getElementById('buyer-phone'),
      order: document.getElementById('buyer-order'),
    },
  };
}

function initInvoiceNumber() {
  const stored = Number(localStorage.getItem(STORAGE_KEY)) || 0;
  const next = stored + 1;
  els.invoiceNumber.value = next.toString().padStart(4, '0');
  if (els.remarks) {
    els.remarks.value = next.toString();
  }
}

function renderSeller() {
  els.sellerName.textContent = SELLER_INFO.name;
  els.sellerNameSmall.textContent = SELLER_INFO.name;
  els.sellerAddress.innerHTML = SELLER_INFO.addressLines.join('<br />');
  els.sellerState.textContent = SELLER_INFO.stateLine;
  els.sellerGstin.textContent = SELLER_INFO.gstin;
  els.sellerContact.textContent = SELLER_INFO.contact;
  els.jurisdiction.textContent = SELLER_INFO.jurisdiction;
  renderBankDetails();
}

function renderBankDetails() {
  els.bank.holder.value = SELLER_INFO.bank.holder || '';
  els.bank.name.value = SELLER_INFO.bank.name || '';
  els.bank.account.value = SELLER_INFO.bank.account || '';
  els.bank.branchIfsc.value = SELLER_INFO.bank.branchIfsc || '';
}

function setDefaultDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  els.invoiceDate.value = `${yyyy}-${mm}-${dd}`;
}

function bindEvents() {
  els.addRowBtn.addEventListener('click', addRow);
  els.itemsBody.addEventListener('input', onItemChange);
  els.itemsBody.addEventListener('click', onRowDelete);
  els.resetBtn.addEventListener('click', resetForm);
  els.pdfBtn.addEventListener('click', generatePdf);
  els.discountToggle.addEventListener('change', recalcTotals);
  els.discountAmount.addEventListener('input', recalcTotals);
}

function addRow() {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td class="text-right sl-no"></td>
    <td><input type="text" class="desc" placeholder="Item description" /></td>
    <td><input type="text" class="hsn" value="9403" /></td>
    <td><input type="number" min="0" step="1" class="qty text-right" value="0" /></td>
    <td><input type="number" min="0" step="0.01" class="rate text-right" value="0" /></td>
    <td class="text-center">PCS</td>
    <td class="text-right amount">0.00</td>
    <td class="text-center pdf-hidden"><button class="secondary small delete-row" title="Remove row">✕</button></td>
  `;
  els.itemsBody.appendChild(row);
  refreshSlNos();
}

function onItemChange(event) {
  const target = event.target;
  if (!target.classList.contains('qty') && !target.classList.contains('rate')) return;
  const row = target.closest('tr');
  updateRowAmount(row);
  recalcTotals();
}

function onRowDelete(event) {
  if (!event.target.classList.contains('delete-row')) return;
  event.preventDefault();
  const row = event.target.closest('tr');
  row.remove();
  refreshSlNos();
  recalcTotals();
}

function updateRowAmount(row) {
  const qty = parseFloat(row.querySelector('.qty').value) || 0;
  const rate = parseFloat(row.querySelector('.rate').value) || 0;
  const amt = qty * rate;
  row.querySelector('.amount').textContent = amt.toFixed(2);
}

function refreshSlNos() {
  const rows = els.itemsBody.querySelectorAll('tr');
  rows.forEach((row, idx) => {
    row.querySelector('.sl-no').textContent = idx + 1;
  });
}

function recalcTotals() {
  const rows = els.itemsBody.querySelectorAll('tr');
  let totalQty = 0;
  let grandTotal = 0;

  rows.forEach((row) => {
    const qty = parseFloat(row.querySelector('.qty').value) || 0;
    const rate = parseFloat(row.querySelector('.rate').value) || 0;
    totalQty += qty;
    grandTotal += qty * rate;
    row.querySelector('.amount').textContent = (qty * rate).toFixed(2);
  });

  els.totalQty.textContent = `${totalQty} PCS`;
  els.grandTotal.textContent = `${RUPEE} ${grandTotal.toFixed(2)}`;

  const discountActive = Boolean(els.discountToggle.checked && (parseFloat(els.discountAmount.value) || 0) > 0);
  const discountValue = discountActive ? Math.min(parseFloat(els.discountAmount.value) || 0, grandTotal) : 0;
  const netTotal = grandTotal - discountValue;

  if (discountActive) {
    els.discountRow.classList.remove('hidden-row');
    els.discountAmountDisplay.textContent = `${RUPEE} ${discountValue.toFixed(2)}`;
  } else {
    els.discountRow.classList.add('hidden-row');
    els.discountAmountDisplay.textContent = `${RUPEE} 0.00`;
  }

  els.netTotal.textContent = `${RUPEE} ${netTotal.toFixed(2)}`;

  const words = convertToIndianWords(netTotal);
  els.amountWords.textContent = `INR ${words.toUpperCase()} ONLY`;
}

function resetForm() {
  els.itemsBody.innerHTML = '';
  addRow();
  Object.values(els.buyerFields).forEach((field) => (field.value = ''));
  els.paymentMode.value = '';
  els.deliveryNote.value = '';
  els.remarks.value = '';
  els.discountToggle.checked = false;
  els.discountAmount.value = '';
  setDefaultDate();
  initInvoiceNumber();
  recalcTotals();
}

function generatePdf() {
  const currentNumber = els.invoiceNumber.value;
  const filename = `Invoice_${currentNumber}.pdf`;
  const element = document.getElementById('invoice');

  const opt = {
    margin: 8,
    filename,
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all'] },
  };

  document.body.classList.add('pdf-export');
  html2pdf()
    .from(element)
    .set(opt)
    .save()
    .then(() => {
      const current = Number(localStorage.getItem(STORAGE_KEY)) || 0;
      localStorage.setItem(STORAGE_KEY, current + 1);
      initInvoiceNumber();
    })
    .finally(() => {
      document.body.classList.remove('pdf-export');
    });
}

function convertToIndianWords(amount) {
  const whole = Math.floor(amount);
  if (whole === 0) return 'Zero';

  const units = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const formatHundred = (num) => {
    let str = '';
    const hundred = Math.floor(num / 100);
    const rem = num % 100;
    if (hundred > 0) {
      str += `${units[hundred]} Hundred`;
      if (rem > 0) str += ' ';
    }
    if (rem > 0) {
      if (rem < 20) {
        str += units[rem];
      } else {
        str += `${tens[Math.floor(rem / 10)]}${rem % 10 ? ' ' + units[rem % 10] : ''}`;
      }
    }
    return str;
  };

  const crore = Math.floor(whole / 10000000);
  const lakh = Math.floor((whole % 10000000) / 100000);
  const thousand = Math.floor((whole % 100000) / 1000);
  const hundred = whole % 1000;

  const parts = [];
  if (crore) parts.push(`${formatHundred(crore)} Crore`);
  if (lakh) parts.push(`${formatHundred(lakh)} Lakh`);
  if (thousand) parts.push(`${formatHundred(thousand)} Thousand`);
  if (hundred) parts.push(formatHundred(hundred));

  return parts.join(' ').trim();
}

