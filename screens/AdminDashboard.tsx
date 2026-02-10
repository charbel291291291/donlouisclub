
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminSettings, MenuItem, Offer, UserProfile } from '../types';
import { 
  Palette, Smartphone, Layout, Type, UtensilsCrossed, 
  Bell, Shield, Eye, ChevronLeft, Save, Check, Music, 
  Zap, Grid, Image as ImageIcon, Plus, Trash2, Users, Search, RefreshCw
} from 'lucide-react';
import { playSound } from '../utils/sound';
import { supabase } from '../supabaseClient';

interface AdminDashboardProps {
  settings: AdminSettings;
  onUpdateSettings: (s: AdminSettings) => void;
  onExit: () => void;
}

const SectionCard = ({ icon: Icon, title, desc, onClick, color = "text-white" }: any) => (
  <motion.button
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => { playSound('click'); onClick(); }}
    className="bg-[#121212] border border-white/5 p-6 rounded-[2rem] text-left relative overflow-hidden group h-full flex flex-col justify-between"
  >
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
      <Icon size={64} />
    </div>
    <div className={`w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <h3 className="text-lg font-serif text-white mb-1">{title}</h3>
      <p className="text-[10px] text-zinc-500 uppercase tracking-wide">{desc}</p>
    </div>
  </motion.button>
);

const Toggle = ({ label, value, onChange }: any) => (
  <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
    <span className="text-sm font-medium text-zinc-300">{label}</span>
    <button
      onClick={() => { playSound('click'); onChange(!value); }}
      className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${value ? 'bg-[#BF953F]' : 'bg-zinc-800'}`}
    >
      <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${value ? 'left-6' : 'left-1'}`} />
    </button>
  </div>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ settings, onUpdateSettings, onExit }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  // Local states for CRUD operations
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [editingOffer, setEditingOffer] = useState<Partial<Offer> | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  // --- Customer Fetching ---
  useEffect(() => {
    if (activeSection === 'customers') {
      fetchCustomers();
    }
  }, [activeSection]);

  const fetchCustomers = async () => {
    setIsLoadingCustomers(true);
    const { data } = await supabase.from('members').select('*').order('last_visit_date', { ascending: false }).limit(50);
    if (data) setCustomers(data);
    setIsLoadingCustomers(false);
  };

  const handleDeleteCustomer = async (id: string) => {
    if (confirm("Are you sure? This cannot be undone easily.")) {
      await supabase.from('members').delete().eq('member_id', id);
      fetchCustomers();
    }
  };

  const renderEditor = () => {
    switch(activeSection) {
      // --- MENU EDITOR ---
      case 'menu':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Signature Items</h3>
               <button 
                 onClick={() => setEditingItem({ id: Math.random().toString(36).substr(2, 9), price: '0.00' })}
                 className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-[10px] font-bold uppercase hover:bg-white/20"
               >
                 <Plus size={14} /> Add Item
               </button>
            </div>

            {editingItem ? (
               <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/10 space-y-4">
                  <h4 className="text-white font-serif mb-4">Edit Item</h4>
                  <input placeholder="Name (EN)" value={editingItem.nameEn || ''} onChange={e => setEditingItem({...editingItem, nameEn: e.target.value})} className="w-full bg-black p-3 rounded-lg border border-white/10 text-white text-sm" />
                  <input placeholder="Name (AR)" value={editingItem.nameAr || ''} onChange={e => setEditingItem({...editingItem, nameAr: e.target.value})} className="w-full bg-black p-3 rounded-lg border border-white/10 text-white text-sm" />
                  <input placeholder="Price" value={editingItem.price || ''} onChange={e => setEditingItem({...editingItem, price: e.target.value})} className="w-full bg-black p-3 rounded-lg border border-white/10 text-white text-sm" />
                  <input placeholder="Image URL" value={editingItem.image || ''} onChange={e => setEditingItem({...editingItem, image: e.target.value})} className="w-full bg-black p-3 rounded-lg border border-white/10 text-white text-sm" />
                  <textarea placeholder="Description (EN)" value={editingItem.descEn || ''} onChange={e => setEditingItem({...editingItem, descEn: e.target.value})} className="w-full bg-black p-3 rounded-lg border border-white/10 text-white text-sm h-20" />
                  
                  <div className="flex gap-2 pt-4">
                     <button onClick={() => setEditingItem(null)} className="flex-1 py-3 bg-white/5 rounded-xl text-zinc-400 text-xs font-bold uppercase">Cancel</button>
                     <button 
                       onClick={() => {
                         const newItems = settings.menuItems.some(i => i.id === editingItem.id) 
                            ? settings.menuItems.map(i => i.id === editingItem.id ? editingItem as MenuItem : i)
                            : [...settings.menuItems, editingItem as MenuItem];
                         onUpdateSettings({ ...settings, menuItems: newItems });
                         setEditingItem(null);
                       }}
                       className="flex-1 py-3 bg-[#BF953F] rounded-xl text-black text-xs font-bold uppercase"
                     >
                       Save Item
                     </button>
                  </div>
               </div>
            ) : (
               <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                 {settings.menuItems.map((item) => (
                   <div key={item.id} className="flex items-center gap-3 p-3 bg-[#0A0A0A] border border-white/5 rounded-xl group">
                      <img src={item.image} className="w-10 h-10 rounded-lg object-cover bg-zinc-800" />
                      <div className="flex-1 min-w-0">
                         <p className="text-sm font-serif text-white truncate">{item.nameEn}</p>
                         <p className="text-[9px] text-zinc-500">${item.price}</p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => setEditingItem(item)} className="p-2 bg-white/10 rounded-full text-white"><Eye size={14} /></button>
                         <button 
                            onClick={() => {
                               if(confirm('Delete item?')) {
                                  onUpdateSettings({ ...settings, menuItems: settings.menuItems.filter(i => i.id !== item.id) });
                               }
                            }}
                            className="p-2 bg-red-900/20 text-red-500 rounded-full"
                         >
                            <Trash2 size={14} />
                         </button>
                      </div>
                   </div>
                 ))}
               </div>
            )}
            
            {!editingItem && (
               <div className="p-4 bg-[#BF953F]/10 border border-[#BF953F]/20 rounded-xl mt-6">
                  <p className="text-[10px] text-[#BF953F] uppercase tracking-widest font-bold mb-2">Active Spotlight</p>
                  <select 
                    value={settings.bestMenuItemId}
                    onChange={(e) => onUpdateSettings({ ...settings, bestMenuItemId: e.target.value })}
                    className="w-full bg-black text-white p-2 rounded-lg border border-white/10 outline-none font-serif"
                  >
                    {settings.menuItems.map(item => (
                      <option key={item.id} value={item.id}>{item.nameEn}</option>
                    ))}
                  </select>
               </div>
            )}
          </div>
        );

      // --- OFFERS EDITOR ---
      case 'offers':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Active Promotions</h3>
               <button 
                 onClick={() => setEditingOffer({ id: 'o' + Date.now(), type: 'weekly' })}
                 className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-[10px] font-bold uppercase hover:bg-white/20"
               >
                 <Plus size={14} /> Add Offer
               </button>
            </div>

            {editingOffer ? (
               <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/10 space-y-4">
                  <h4 className="text-white font-serif mb-4">Edit Offer</h4>
                  <input placeholder="Title (EN)" value={editingOffer.titleEn || ''} onChange={e => setEditingOffer({...editingOffer, titleEn: e.target.value})} className="w-full bg-black p-3 rounded-lg border border-white/10 text-white text-sm" />
                  <input placeholder="Title (AR)" value={editingOffer.titleAr || ''} onChange={e => setEditingOffer({...editingOffer, titleAr: e.target.value})} className="w-full bg-black p-3 rounded-lg border border-white/10 text-white text-sm" />
                  <input placeholder="Expiry Text" value={editingOffer.expiry || ''} onChange={e => setEditingOffer({...editingOffer, expiry: e.target.value})} className="w-full bg-black p-3 rounded-lg border border-white/10 text-white text-sm" />
                  <select 
                     value={editingOffer.type || 'weekly'} 
                     onChange={e => setEditingOffer({...editingOffer, type: e.target.value as any})}
                     className="w-full bg-black p-3 rounded-lg border border-white/10 text-white text-sm"
                  >
                     <option value="weekly">Weekly</option>
                     <option value="latenight">Late Night</option>
                     <option value="student">Student</option>
                  </select>

                  <div className="flex gap-2 pt-4">
                     <button onClick={() => setEditingOffer(null)} className="flex-1 py-3 bg-white/5 rounded-xl text-zinc-400 text-xs font-bold uppercase">Cancel</button>
                     <button 
                       onClick={() => {
                         const newOffers = settings.offers.some(o => o.id === editingOffer.id)
                            ? settings.offers.map(o => o.id === editingOffer.id ? editingOffer as Offer : o)
                            : [...settings.offers, editingOffer as Offer];
                         onUpdateSettings({ ...settings, offers: newOffers });
                         setEditingOffer(null);
                       }}
                       className="flex-1 py-3 bg-[#BF953F] rounded-xl text-black text-xs font-bold uppercase"
                     >
                       Save Offer
                     </button>
                  </div>
               </div>
            ) : (
               <div className="space-y-2">
                 {settings.offers.map((offer) => {
                   const isActive = settings.activeOfferIds.includes(offer.id);
                   return (
                     <div key={offer.id} className={`flex items-center gap-3 p-4 border rounded-xl ${isActive ? 'bg-[#BF953F]/10 border-[#BF953F]/30' : 'bg-[#0A0A0A] border-white/5'}`}>
                        <div onClick={() => {
                           const newIds = isActive 
                              ? settings.activeOfferIds.filter(id => id !== offer.id)
                              : [...settings.activeOfferIds, offer.id];
                           onUpdateSettings({ ...settings, activeOfferIds: newIds });
                        }} className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer ${isActive ? 'bg-[#BF953F] border-[#BF953F] text-black' : 'border-zinc-700'}`}>
                           {isActive && <Check size={12} strokeWidth={4} />}
                        </div>
                        <div className="flex-1 cursor-pointer" onClick={() => setEditingOffer(offer)}>
                           <p className="text-sm font-serif text-white">{offer.titleEn}</p>
                           <p className="text-[9px] text-zinc-500">{offer.expiry}</p>
                        </div>
                        <button onClick={() => {
                           if(confirm('Delete offer?')) {
                              onUpdateSettings({ 
                                 ...settings, 
                                 offers: settings.offers.filter(o => o.id !== offer.id),
                                 activeOfferIds: settings.activeOfferIds.filter(id => id !== offer.id)
                              });
                           }
                        }} className="p-2 text-zinc-600 hover:text-red-500"><Trash2 size={16} /></button>
                     </div>
                   );
                 })}
               </div>
            )}
          </div>
        );

      // --- CUSTOMERS ---
      case 'customers':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-[#0A0A0A] border border-white/10 rounded-xl p-3 mb-4">
               <Search size={16} className="text-zinc-500" />
               <input 
                  placeholder="Search members..." 
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                  className="bg-transparent text-white text-sm outline-none w-full"
               />
            </div>

            {isLoadingCustomers ? (
               <div className="text-center py-10 text-zinc-500 text-xs">Loading members...</div>
            ) : (
               <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {customers.filter(c => c.first_name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch)).map(customer => (
                     <div key={customer.member_id} className="flex justify-between items-center p-3 bg-[#0A0A0A] border border-white/5 rounded-xl">
                        <div>
                           <p className="text-white font-bold text-sm">{customer.first_name}</p>
                           <p className="text-zinc-500 text-[10px]">{customer.phone} • {customer.member_id}</p>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="text-right">
                              <p className="text-[#BF953F] font-bold text-sm">{customer.points} pts</p>
                              <p className="text-zinc-600 text-[9px]">{customer.visits_in_cycle}/5 Cycle</p>
                           </div>
                           <button onClick={() => handleDeleteCustomer(customer.member_id)} className="p-2 bg-red-900/10 text-red-500 rounded-lg"><Trash2 size={14} /></button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
          </div>
        );

      // --- BRAND / SPLASH / UI (Existing logic adapted) ---
      case 'brand':
        return (
          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Brand Signature Color</h3>
              <div className="grid grid-cols-4 gap-3">
                 {['#BF953F', '#D4AF37', '#E5E4E2', '#C0C0C0', '#CD7F32', '#B87333', '#E63946', '#2A9D8F'].map(color => (
                   <button
                    key={color}
                    onClick={() => onUpdateSettings({ ...settings, brand: { ...settings.brand, primaryColor: color } })}
                    className={`h-12 rounded-xl border-2 transition-transform ${settings.brand.primaryColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                   />
                 ))}
              </div>
            </section>
            
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Background Tone</h3>
              <div className="grid grid-cols-2 gap-3">
                 <button 
                   onClick={() => onUpdateSettings({ ...settings, brand: { ...settings.brand, bgTone: '#030303' } })}
                   className={`p-4 rounded-xl border ${settings.brand.bgTone === '#030303' ? 'bg-[#030303] border-[#BF953F]' : 'bg-[#030303] border-white/10'}`}
                 >
                    <div className="text-white text-sm font-bold">Obsidian</div>
                 </button>
                 <button 
                   onClick={() => onUpdateSettings({ ...settings, brand: { ...settings.brand, bgTone: '#0F172A' } })}
                   className={`p-4 rounded-xl border ${settings.brand.bgTone === '#0F172A' ? 'bg-[#0F172A] border-[#BF953F]' : 'bg-[#0F172A] border-white/10'}`}
                 >
                    <div className="text-white text-sm font-bold">Midnight</div>
                 </button>
              </div>
            </section>
          </div>
        );

      case 'splash':
        return (
          <div className="space-y-6">
             <section>
                <div className="mb-4">
                  <Toggle 
                      label="Enable Animations" 
                      value={settings.splash.animate ?? true} 
                      onChange={(v: boolean) => onUpdateSettings({ ...settings, splash: { ...settings.splash, animate: v } })}
                  />
                </div>

                <div className={`grid grid-cols-1 gap-3 transition-opacity duration-300 ${!(settings.splash.animate ?? true) ? 'opacity-50 pointer-events-none' : ''}`}>
                  {['fade', 'glow', 'cinematic'].map((style: any) => (
                    <button
                      key={style}
                      onClick={() => onUpdateSettings({ ...settings, splash: { ...settings.splash, animationStyle: style } })}
                      className={`p-4 rounded-xl border flex items-center justify-between ${
                        settings.splash.animationStyle === style ? 'bg-white/10 border-[#BF953F] text-[#BF953F]' : 'bg-black/20 border-white/5 text-zinc-500'
                      }`}
                    >
                      <span className="capitalize font-serif">{style} Reveal</span>
                      {settings.splash.animationStyle === style && <Check size={16} />}
                    </button>
                  ))}
                </div>
             </section>

             <div className="group">
                <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Background Image URL</label>
                <input 
                    type="text"
                    value={settings.splash.backgroundImage || ''}
                    onChange={(e) => onUpdateSettings({ ...settings, splash: { ...settings.splash, backgroundImage: e.target.value } })}
                    placeholder="https://..."
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl p-4 text-white font-sans text-xs focus:border-[#BF953F] outline-none"
                />
             </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="p-6 bg-[#0A0A0A] rounded-2xl border border-red-900/20 flex flex-col items-center text-center">
               <Shield size={32} className="text-red-500 mb-4" />
               <h3 className="text-white font-serif text-lg mb-1">Cashier Access</h3>
               <p className="text-zinc-500 text-[10px] mb-6">Staff PIN Code</p>
               
               <div className="text-3xl font-mono text-white tracking-[0.5em] mb-6">
                 {settings.cashierPin}
               </div>
               
               <button 
                 onClick={() => {
                    const n = prompt("Enter New 4-Digit PIN");
                    if(n && n.length===4) onUpdateSettings({ ...settings, cashierPin: n });
                 }}
                 className="px-6 py-3 bg-white text-black rounded-xl text-[10px] font-bold uppercase tracking-widest"
               >
                 Change PIN
               </button>
            </div>
          </div>
        );
      
      default: return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-black text-white pb-32">
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 pt-12 pb-4 flex items-center justify-between">
         {activeSection ? (
            <button onClick={() => { setActiveSection(null); setEditingItem(null); setEditingOffer(null); }} className="flex items-center gap-2 text-zinc-400 hover:text-white">
              <ChevronLeft size={20} />
              <span className="text-xs font-bold uppercase tracking-widest">Back</span>
            </button>
         ) : (
            <div>
              <p className="text-[#BF953F] text-[9px] uppercase tracking-[0.3em] font-black mb-1">Command Center</p>
              <h1 className="text-2xl font-serif text-white">App Settings</h1>
            </div>
         )}
         
         {!activeSection && (
           <button onClick={onExit} className="px-4 py-2 bg-white/5 rounded-full text-xs font-bold text-zinc-400">
             Exit
           </button>
         )}
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeSection ? (
            <motion.div 
              key="editor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {renderEditor()}
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-2 gap-4"
            >
              <SectionCard 
                icon={UtensilsCrossed} title="Menu" desc="Edit Items" 
                color="text-orange-400"
                onClick={() => setActiveSection('menu')} 
              />
              <SectionCard 
                icon={Zap} title="Offers" desc="Promotions" 
                color="text-yellow-400"
                onClick={() => setActiveSection('offers')} 
              />
              <SectionCard 
                icon={Users} title="Members" desc="Database" 
                color="text-blue-400"
                onClick={() => setActiveSection('customers')} 
              />
              <SectionCard 
                icon={Palette} title="Brand" desc="Look & Feel" 
                color="text-[#BF953F]"
                onClick={() => setActiveSection('brand')} 
              />
              <SectionCard 
                icon={Smartphone} title="Splash" desc="Entry FX" 
                color="text-purple-400"
                onClick={() => setActiveSection('splash')} 
              />
              <SectionCard 
                icon={Shield} title="Security" desc="PIN Code" 
                color="text-red-400"
                onClick={() => setActiveSection('security')} 
              />
              
              <div className="col-span-2 pt-4">
                 <button 
                   onClick={onExit}
                   className="w-full p-4 bg-gradient-to-r from-[#BF953F] to-[#8A6E2F] rounded-2xl flex items-center justify-center gap-2 text-black font-bold uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(191,149,63,0.3)]"
                 >
                    <Eye size={16} /> Live Preview App
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
};

export default AdminDashboard;
