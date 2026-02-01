import React, { forwardRef } from 'react';
import { CompanySettings, ReceiptItem, TransactionDetails } from '../types';

interface ReceiptPreviewProps {
  settings: CompanySettings;
  transaction: TransactionDetails;
  items: ReceiptItem[];
  total: number;
}

// Using forwardRef to allow the parent to capture this DOM element for PDF generation
const ReceiptPreview = forwardRef<HTMLDivElement, ReceiptPreviewProps>(
  ({ settings, transaction, items, total }, ref) => {
    
    const formatCurrency = (amount: number) => {
      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: transaction.currency || 'USD',
        }).format(amount);
      } catch (e) {
        // Graceful fallback for invalid/partial currency codes (e.g. user typing "US")
        return `${transaction.currency || ''} ${amount.toFixed(2)}`;
      }
    };

    return (
      <div className="flex justify-center p-4 bg-gray-100/50 min-h-full items-start overflow-y-auto no-scrollbar">
        <div
          ref={ref}
          id="receipt-container"
          className="bg-white w-[350px] min-h-[500px] shadow-2xl relative font-mono text-sm text-gray-800 leading-relaxed"
          style={{
             // jagged edge effect using css background patterns or simple border styling
             borderTop: '8px solid #374151' 
          }}
        >
            <div className="p-6 flex flex-col items-center">
                {/* Header */}
                <div className="text-center mb-6 w-full">
                    {settings.logoUrl && (
                        <img 
                            src={settings.logoUrl} 
                            alt="Logo" 
                            className="h-16 w-16 mx-auto mb-2 object-contain grayscale"
                        />
                    )}
                    <h1 className="text-xl font-bold uppercase tracking-widest mb-1">
                        {settings.name || 'Company Name'}
                    </h1>
                    <p className="text-xs text-gray-500 whitespace-pre-wrap">
                        {settings.address || '123 Business Rd, City, Country'}
                    </p>
                    <p className="text-xs text-gray-500">
                        {settings.phone || '+1 234 567 890'}
                    </p>
                </div>

                {/* Divider */}
                <div className="w-full border-b-2 border-dashed border-gray-300 mb-6"></div>

                {/* Transaction Info */}
                <div className="w-full mb-6 text-xs space-y-1">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span>{transaction.date}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Customer:</span>
                        <span className="font-semibold">{transaction.customerName || 'Walk-in Customer'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Method:</span>
                        <span>{transaction.paymentMethod}</span>
                    </div>
                    {/* Fake Receipt Number for aesthetics */}
                    <div className="flex justify-between">
                        <span className="text-gray-500">Receipt #:</span>
                        <span>{Math.floor(Math.random() * 100000).toString().padStart(6, '0')}</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full border-b-2 border-dashed border-gray-300 mb-6"></div>

                {/* Items */}
                <div className="w-full mb-6">
                    <div className="flex justify-between text-xs font-bold mb-2 uppercase text-gray-600">
                        <span className="flex-1 text-left">Item</span>
                        <span className="w-12 text-center">Qty</span>
                        <span className="w-20 text-right">Price</span>
                    </div>
                    <div className="space-y-2">
                        {items.length === 0 && (
                             <p className="text-center text-gray-400 italic py-4">No items added</p>
                        )}
                        {items.map((item) => (
                            <div key={item.id} className="flex justify-between text-xs items-start">
                                <span className="flex-1 text-left pr-2">{item.description}</span>
                                <span className="w-12 text-center text-gray-500">x{item.quantity}</span>
                                <span className="w-20 text-right font-medium">
                                    {formatCurrency(item.quantity * item.unitPrice)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full border-b-2 border-dashed border-gray-300 mb-6"></div>

                {/* Totals */}
                <div className="w-full mb-8">
                    <div className="flex justify-between items-center text-xl font-bold">
                        <span>TOTAL</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="w-full text-center">
                    <p className="text-sm font-medium mb-2">Thank You!</p>
                    <p className="text-xs text-gray-500 italic max-w-[200px] mx-auto">
                        {settings.footerMessage || 'We hope to see you again soon.'}
                    </p>
                </div>
                
                {/* Barcode Mockup */}
                <div className="mt-8 mb-4">
                    <div className="h-10 w-48 bg-gray-800 opacity-20 mx-auto" 
                         style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, black 2px, black 4px)' }}>
                    </div>
                    <p className="text-[10px] text-center text-gray-400 mt-1">1234 5678 9012</p>
                </div>

            </div>
        </div>
      </div>
    );
  }
);

ReceiptPreview.displayName = 'ReceiptPreview';

export default ReceiptPreview;