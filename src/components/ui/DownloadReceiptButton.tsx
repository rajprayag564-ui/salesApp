'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';

import { ReceiptDocument, type ReceiptOrder } from './ReceiptDocument';

export function DownloadReceiptButton({ order }: { order: ReceiptOrder }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);

    try {
      const blob = await pdf(<ReceiptDocument order={order} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${order.id.slice(0, 8)}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      className="rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-xs font-semibold text-orange-300 transition hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {downloading ? 'Generating...' : 'Download Receipt'}
    </button>
  );
}