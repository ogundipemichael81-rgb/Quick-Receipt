import React, { useState } from 'react';
import { CompanySettings, ReceiptItem, TransactionDetails, PaymentMethod } from '../types';
import { Plus, Trash2, Building2, ChevronDown, ChevronUp, Briefcase } from 'lucide-react';

interface InputFormProps {
  settings: CompanySettings;
  setSettings: (s: CompanySettings) => void;
  transaction: TransactionDetails;
  setTransaction: (t: TransactionDetails) => void;
  items: ReceiptItem[];
  setItems: (i: ReceiptItem[]) => void;
}

const InputForm: React.FC<InputFormProps> = ({
  settings,
  setSettings,
  transaction,
  setTransaction,
  items,
  setItems,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    const newItem: ReceiptItem = {
      id: Date.now().toString(),
      description: 'New Item',
      quantity: 1,
      unitPrice: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof ReceiptItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      
      {/* Company Settings Accordion */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                <Building2 size={20} />
            </div>
            <div className="text-left">
                <h2 className="font-semibold text-gray-800">Company Settings</h2>
                <p className="text-xs text-gray-500">Logo, address & contact info</p>
            </div>
          </div>
          {isSettingsOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
        </button>

        {isSettingsOpen && (
          <div className="p-4 space-y-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Ex: Acme Corp"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="+1 234..."
                />
                </div>
                <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Logo</label>
                <label className="flex items-center justify-center w-full p-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <span className="text-xs text-gray-500 truncate">{settings.logoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </label>
                </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none h-20 resize-none"
                placeholder="Street address, City, Zip..."
              />
            </div>
             <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Footer Message</label>
              <input
                type="text"
                value={settings.footerMessage}
                onChange={(e) => setSettings({ ...settings, footerMessage: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Thank you message..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Transaction Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                <Briefcase size={20} />
            </div>
            <h2 className="font-semibold text-gray-800">Transaction Info</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Customer Name</label>
            <input
              type="text"
              value={transaction.customerName}
              onChange={(e) => setTransaction({ ...transaction, customerName: e.target.value })}
              className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Ex: John Doe"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={transaction.date}
              onChange={(e) => setTransaction({ ...transaction, date: e.target.value })}
              className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
             <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method</label>
             <select
                value={transaction.paymentMethod}
                onChange={(e) => setTransaction({ ...transaction, paymentMethod: e.target.value as PaymentMethod })}
                className="w-full p-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
             >
                 {Object.values(PaymentMethod).map(method => (
                     <option key={method} value={method}>{method}</option>
                 ))}
             </select>
          </div>
           <div>
             <label className="block text-xs font-medium text-gray-700 mb-1">Currency Code</label>
             <input
                type="text"
                value={transaction.currency}
                onChange={(e) => setTransaction({ ...transaction, currency: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="USD, EUR, GBP..."
             />
          </div>
        </div>
      </div>

      {/* Items Manager */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
         <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Items</h2>
            <button
                onClick={addItem}
                className="flex items-center gap-1 text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
            >
                <Plus size={16} /> Add Item
            </button>
         </div>

         <div className="space-y-3">
             {items.length === 0 && (
                 <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                     No items added yet. Click "Add Item" to start.
                 </div>
             )}
            {items.map((item, index) => (
                <div key={item.id} className="flex gap-2 items-start animate-in fade-in duration-300">
                    <div className="flex-1 space-y-2">
                        <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            placeholder="Description"
                            className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                        <div className="flex gap-2">
                            <div className="relative w-24">
                                <label className="absolute -top-1.5 left-2 bg-white px-1 text-[10px] text-gray-500">Qty</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                    className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div className="relative flex-1">
                                <label className="absolute -top-1.5 left-2 bg-white px-1 text-[10px] text-gray-500">Price</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.unitPrice}
                                    onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                    className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg mt-1 transition-colors"
                        title="Remove Item"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default InputForm;
