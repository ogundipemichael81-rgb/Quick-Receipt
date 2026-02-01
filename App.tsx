import React, { useState, useRef, useMemo } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Share2, Eye, X, CheckCircle2 } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { CompanySettings, ReceiptItem, TransactionDetails, PaymentMethod } from './types';
import InputForm from './components/InputForm';
import ReceiptPreview from './components/ReceiptPreview';

const App: React.FC = () => {
  // --- State ---
  const [settings, setSettings] = useLocalStorage<CompanySettings>('receipt_settings', {
    name: '',
    address: '',
    phone: '',
    logoUrl: null,
    footerMessage: 'Thank you for your business!',
  });

  const [transaction, setTransaction] = useState<TransactionDetails>({
    customerName: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: PaymentMethod.CASH,
    currency: 'USD'
  });

  const [items, setItems] = useState<ReceiptItem[]>([
    { id: '1', description: 'Product A', quantity: 1, unitPrice: 0 }
  ]);

  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dedicated ref for the off-screen receipt used for PDF generation
  const printRef = useRef<HTMLDivElement>(null);

  // --- Derived State ---
  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }, [items]);

  // --- Handlers ---

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const generatePDF = async (): Promise<File | null> => {
    if (!printRef.current) {
        console.error("Print ref not found");
        return null;
    }
    setIsGenerating(true);

    try {
      // Small delay to ensure rendering updates
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(printRef.current, {
        scale: 2, // Higher quality
        useCORS: true, // Handle external images if any
        backgroundColor: '#ffffff',
        logging: false,
        // Ensure we capture even if it's off-screen
        windowWidth: 1200, 
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200] // Thermal printer width approx
      });

      // Calculate aspect ratio to fit width
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const fileName = `Receipt-${(transaction.customerName || 'Customer').replace(/\s+/g, '-')}-${transaction.date}.pdf`;
      pdf.save(fileName);

      setIsGenerating(false);
      return new File([pdf.output('blob')], fileName, { type: 'application/pdf' });
    } catch (error) {
      console.error('PDF Generation failed', error);
      setIsGenerating(false);
      showToast("Error generating PDF");
      return null;
    }
  };

  const handleWhatsAppShare = async () => {
    // 1. Generate and download PDF for user
    const file = await generatePDF();
    if (!file) return;

    // 2. Prepare message
    let formattedTotal;
    try {
        formattedTotal = new Intl.NumberFormat('en-US', { style: 'currency', currency: transaction.currency }).format(totalAmount);
    } catch {
        formattedTotal = `${transaction.currency} ${totalAmount.toFixed(2)}`;
    }

    const companyName = settings.name || 'our company';
    const message = `Hello ${transaction.customerName}, here is your receipt for ${formattedTotal} from ${companyName}. Please find the attached PDF.`;
    
    // 3. Open WhatsApp
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // 4. Show instruction
    showToast("PDF Downloaded! Please attach it to your WhatsApp message.");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans md:overflow-hidden relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
           <CheckCircle2 size={18} className="text-emerald-400" />
           <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1.5 rounded-md">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1Z"/><path d="M14 8H8"/><path d="M16 12H8"/><path d="M13 16H8"/></svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">QuickReceipt</h1>
        </div>
        
        {/* Desktop Actions */}
        <div className="hidden md:flex gap-3">
             <button 
                onClick={() => generatePDF()}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
             >
                <Download size={16} />
                {isGenerating ? 'Saving...' : 'Download PDF'}
             </button>
             <button 
                onClick={handleWhatsAppShare}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors text-sm shadow-sm"
             >
                <Share2 size={16} />
                Share WhatsApp
             </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="md:grid md:grid-cols-[1fr_400px] lg:grid-cols-[1fr_450px] h-[calc(100vh-65px)]">
        
        {/* Left: Input Form (Scrollable) */}
        <div className="p-4 md:p-8 overflow-y-auto h-full pb-28 md:pb-8">
            <div className="max-w-2xl mx-auto">
                <InputForm 
                    settings={settings}
                    setSettings={setSettings}
                    transaction={transaction}
                    setTransaction={setTransaction}
                    items={items}
                    setItems={setItems}
                />
            </div>
        </div>

        {/* Right: Preview (Desktop) */}
        <div className="hidden md:block bg-gray-200/50 border-l border-gray-200 h-full overflow-hidden relative">
            <div className="absolute inset-0 overflow-y-auto p-8 flex justify-center">
                 {/* Visual only, no ref attached */}
                 <ReceiptPreview 
                    settings={settings}
                    transaction={transaction}
                    items={items}
                    total={totalAmount}
                 />
            </div>
        </div>

      </main>

      {/* Mobile Sticky Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
            onClick={() => setShowPreviewMobile(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-semibold shadow-lg active:scale-95 transition-transform"
        >
            <Eye size={18} />
            Preview Receipt
        </button>
      </div>

      {/* Mobile Preview Modal */}
      {showPreviewMobile && (
        <div className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 text-white">
                <h2 className="text-lg font-semibold">Receipt Preview</h2>
                <button 
                    onClick={() => setShowPreviewMobile(false)}
                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Scrollable Preview Area */}
            <div className="flex-1 overflow-y-auto p-4 flex justify-center bg-gray-100/10">
                 {/* Visual only, no ref attached */}
                 <div className="block">
                     <ReceiptPreview 
                        settings={settings}
                        transaction={transaction}
                        items={items}
                        total={totalAmount}
                     />
                 </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-white border-t border-gray-200 flex gap-3 pb-8">
                <button 
                    onClick={generatePDF}
                    disabled={isGenerating}
                    className="flex-1 flex flex-col items-center justify-center gap-1 bg-gray-100 py-3 rounded-xl font-medium text-gray-800 active:bg-gray-200"
                >
                    <Download size={20} />
                    <span className="text-xs">Save PDF</span>
                </button>
                 <button 
                    onClick={handleWhatsAppShare}
                    disabled={isGenerating}
                    className="flex-[2] flex flex-col items-center justify-center gap-1 bg-emerald-600 py-3 rounded-xl font-medium text-white active:bg-emerald-700 shadow-emerald-200 shadow-lg"
                >
                    <Share2 size={20} />
                    <span className="text-xs">Share WhatsApp</span>
                </button>
            </div>
        </div>
      )}
      
      {/* 
        Dedicated Hidden Container for PDF Generation
        - Always rendered (conditionally rendering refs causes issues)
        - Positioned off-screen (left: -9999px) instead of visibility:hidden or display:none
          to ensure html2canvas can capture it.
      */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
           <ReceiptPreview 
                ref={printRef}
                settings={settings}
                transaction={transaction}
                items={items}
                total={totalAmount}
            />
      </div>

    </div>
  );
};

export default App;