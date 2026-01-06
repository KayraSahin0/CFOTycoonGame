/**
 * CFO Tycoon - Veri Yapıları ve Senaryo Motoru
 * Dosya: data.js
 */

// --- BAŞARIMLAR LİSTESİ (22 ADET) ---
const ACHIEVEMENTS = [
    // KARLILIK
    { id: 'first_profit', title: 'İlk Kar', desc: 'Dönem net karı pozitif olan bir ayı tamamla.', icon: 'fa-seedling', unlocked: false },
    { id: 'profit_10k', title: 'Küçük Adımlar', desc: 'Bir ayda 10.000 TL üzeri net kar et.', icon: 'fa-coins', unlocked: false },
    { id: 'profit_100k', title: 'Para Basıyor', desc: 'Bir ayda 100.000 TL üzeri net kar et.', icon: 'fa-money-bill-wave', unlocked: false },
    
    // UNVANLAR
    { id: 'title_kobi', title: 'KOBİ Olduk!', desc: 'Şirketi KOBİ seviyesine yükselt (50k+ Özkaynak).', icon: 'fa-building', unlocked: false },
    { id: 'title_corp', title: 'Kurumsallaşma', desc: 'Şirketi A.Ş. seviyesine yükselt (250k+ Özkaynak).', icon: 'fa-city', unlocked: false },
    { id: 'title_holding', title: 'Zirve', desc: 'Şirketi Holding seviyesine yükselt (1M+ Özkaynak).', icon: 'fa-globe', unlocked: false },
    
    // DAYANIKLILIK
    { id: 'survivor_1y', title: '1. Yıl Kutlaması', desc: 'İflas etmeden 12. ayı tamamla.', icon: 'fa-cake-candles', unlocked: false },
    { id: 'survivor_3y', title: 'İstikrar Abidesi', desc: '36. ayı (3 Yıl) geride bırak.', icon: 'fa-calendar-check', unlocked: false },
    { id: 'survivor_5y', title: 'Çınar Ağacı', desc: '60. ayı (5 Yıl) tamamla.', icon: 'fa-tree', unlocked: false },

    // VARLIK YÖNETİMİ
    { id: 'cash_king', title: 'Nakit Kralı', desc: 'Kasa hesabında (100) 100.000 TL biriktir.', icon: 'fa-sack-dollar', unlocked: false },
    { id: 'bank_magnate', title: 'Banker', desc: 'Banka hesabında (102) 500.000 TL biriktir.', icon: 'fa-vault', unlocked: false },
    { id: 'fleet_owner', title: 'Filo Sahibi', desc: 'Taşıtlar hesabını (254) 500.000 TL üzerine çıkar.', icon: 'fa-truck-fast', unlocked: false },
    { id: 'inventory_master', title: 'Stokçu', desc: 'Depoda (153) 250.000 TL değerinde mal bulundur.', icon: 'fa-boxes-stacked', unlocked: false },
    
    // FİNANSAL YAPI
    { id: 'equity_giant', title: 'Sermaye Devi', desc: 'Özkaynakları 2.000.000 TL üzerine çıkar.', icon: 'fa-mountain', unlocked: false },
    { id: 'debt_free', title: 'Borçsuz Yaşam', desc: 'Hiçbir kısa veya uzun vadeli borcun kalmasın (5. aydan sonra).', icon: 'fa-handshake-slash', unlocked: false },
    
    // SKOR
    { id: 'score_rookie', title: 'Gelecek Vaat Ediyor', desc: 'Toplam 5.000 puana ulaş.', icon: 'fa-star-half-stroke', unlocked: false },
    { id: 'score_pro', title: 'Profesyonel CFO', desc: 'Toplam 25.000 puana ulaş.', icon: 'fa-star', unlocked: false },
    { id: 'score_legend', title: 'Efsane', desc: 'Toplam 100.000 puana ulaş.', icon: 'fa-crown', unlocked: false },
    
    // DİĞER
    { id: 'charity', title: 'Vergisini Ödeyen', desc: 'Ödenecek vergi borçlarını (360) sıfırla.', icon: 'fa-file-invoice', unlocked: false },
    { id: 'investor', title: 'Yatırımcı', desc: 'Duran varlık toplamı dönen varlıkları geçsin.', icon: 'fa-chart-line', unlocked: false },
    { id: 'bankruptcy', title: 'Dibe Vuruş', desc: 'Şirketi iflas ettir.', icon: 'fa-skull', unlocked: false }
];

// --- HESAP PLANI (Chart of Accounts) ---
const INITIAL_ACCOUNTS = [
    // 1. DÖNEN VARLIKLAR
    { code: '100', name: 'Kasa', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 },
    { code: '101', name: 'Alınan Çekler', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 },
    { code: '102', name: 'Bankalar', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 },
    { code: '103', name: 'Verilen Çekler (-)', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 },
    { code: '110', name: 'Hisse Senetleri', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 },
    { code: '120', name: 'Alıcılar', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 },
    { code: '121', name: 'Alacak Senetleri', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 },
    { code: '153', name: 'Ticari Mallar', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 },
    { code: '159', name: 'Verilen Sipariş Avansları', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 }, 
    { code: '180', name: 'Gelecek Aylara Ait Giderler', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 },
    { code: '190', name: 'Devreden KDV', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 },
    { code: '191', name: 'İndirilecek KDV', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 },
    { code: '195', name: 'İş Avansları', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 },

    // 2. DURAN VARLIKLAR
    { code: '252', name: 'Binalar', type: 'A', group: 'assets_fixed', balance: 0, dr: 0, cr: 0 },
    { code: '254', name: 'Taşıtlar', type: 'A', group: 'assets_fixed', balance: 0, dr: 0, cr: 0 },
    { code: '255', name: 'Demirbaşlar', type: 'A', group: 'assets_fixed', balance: 0, dr: 0, cr: 0 },
    { code: '257', name: 'Birikmiş Amortismanlar (-)', type: 'A', group: 'assets_fixed', balance: 0, dr: 0, cr: 0 },

    // 3. KISA VADELİ YABANCI KAYNAKLAR
    { code: '300', name: 'Banka Kredileri', type: 'L', group: 'liab_short', balance: 0, dr: 0, cr: 0 },
    { code: '320', name: 'Satıcılar', type: 'L', group: 'liab_short', balance: 0, dr: 0, cr: 0 },
    { code: '321', name: 'Borç Senetleri', type: 'L', group: 'liab_short', balance: 0, dr: 0, cr: 0 },
    { code: '335', name: 'Personele Borçlar', type: 'L', group: 'liab_short', balance: 0, dr: 0, cr: 0 },
    { code: '340', name: 'Alınan Sipariş Avansları', type: 'L', group: 'liab_short', balance: 0, dr: 0, cr: 0 }, 
    { code: '360', name: 'Ödenecek Vergi ve Fonlar', type: 'L', group: 'liab_short', balance: 0, dr: 0, cr: 0 },
    { code: '361', name: 'Ödenecek Sosyal Güv. Kesintileri', type: 'L', group: 'liab_short', balance: 0, dr: 0, cr: 0 },
    { code: '391', name: 'Hesaplanan KDV', type: 'L', group: 'liab_short', balance: 0, dr: 0, cr: 0 },

    // 4. UZUN VADELİ YABANCI KAYNAKLAR
    { code: '400', name: 'Banka Kredileri (Uzun)', type: 'L', group: 'liab_long', balance: 0, dr: 0, cr: 0 },

    // 5. ÖZKAYNAKLAR
    { code: '500', name: 'Sermaye', type: 'E', group: 'equity', balance: 0, dr: 0, cr: 0 },
    { code: '590', name: 'Dönem Net Karı', type: 'E', group: 'equity', balance: 0, dr: 0, cr: 0 },

    // 6. GELİR TABLOSU HESAPLARI
    { code: '600', name: 'Yurt İçi Satışlar', type: 'I', group: 'income', balance: 0, dr: 0, cr: 0 },
    { code: '602', name: 'Diğer Gelirler', type: 'I', group: 'income', balance: 0, dr: 0, cr: 0 },
    { code: '621', name: 'Satılan Malın Maliyeti (-)', type: 'X', group: 'expense', balance: 0, dr: 0, cr: 0 },
    { code: '631', name: 'Pazarlama Satış ve Dağ. Gider (-)', type: 'X', group: 'expense', balance: 0, dr: 0, cr: 0 },
    { code: '642', name: 'Faiz Gelirleri', type: 'I', group: 'income', balance: 0, dr: 0, cr: 0 },
    { code: '657', name: 'Reeskont Faiz Giderleri (-)', type: 'X', group: 'expense', balance: 0, dr: 0, cr: 0 },

    // 7. MALİYET HESAPLARI
    { code: '760', name: 'Pazarlama, Satış ve Dağ. Giderleri', type: 'X', group: 'expense', balance: 0, dr: 0, cr: 0 }, 
    { code: '770', name: 'Genel Yönetim Giderleri', type: 'X', group: 'expense', balance: 0, dr: 0, cr: 0 },
    { code: '780', name: 'Finansman Giderleri', type: 'X', group: 'expense', balance: 0, dr: 0, cr: 0 },
];

// --- SENARYO MOTORU ---
const ScenarioEngine = {
    // 1. ZORUNLU BAŞLANGIÇ SENARYOSU (Kariyer Modu)
    startupScenario: {
        id: 'startup_init',
        text: "ŞİRKET KURULUŞU: Resmî işlemler tamamlandı. Ortaklar taahhüt ettikleri 500.000 TL sermayeyi banka hesabına yatırdı. Ayrıca operasyonlar için peşin 100.000 TL değerinde Demirbaş (Ofis malzemesi, bilgisayar vb.) satın alındı.",
        correctEntries: [
            { code: '102', type: 'debit', amount: 500000 }, // Sermaye ödemesi
            { code: '500', type: 'credit', amount: 500000 },
            { code: '255', type: 'debit', amount: 100000 }, // Demirbaş alımı
            { code: '191', type: 'debit', amount: 20000 },  // KDV
            { code: '102', type: 'credit', amount: 120000 } // Ödeme
        ]
    },

    // 2. AMORTİSMAN SENARYOLARI
    generateDepreciation: (assetsValue) => {
        const isAccelerated = Math.random() > 0.5;
        const methodText = isAccelerated ? "HIZLANDIRILMIŞ (Azalan Bakiyeler)" : "NORMAL";
        const life = [4, 5, 10][Math.floor(Math.random() * 3)]; // 4, 5 veya 10 yıl
        
        // Basit hesap (Hızlandırılmış ise 2 katı)
        let rate = 1 / life;
        if (isAccelerated) rate *= 2;
        
        const expenseAmount = Math.round(assetsValue * rate);

        return {
            id: 'dep_' + Date.now(),
            text: `DÖNEM SONU İŞLEMİ: Şirket aktifindeki ${formatDataMoney(assetsValue)} TL değerindeki demirbaşlar için ${life} Yıl ömürlü ve ${methodText} yöntem ile amortisman ayırınız. (Tutarı hesaplamak için Amortisman Tablosunu kullanın).`,
            correctEntries: [
                { code: '770', type: 'debit', amount: expenseAmount },
                { code: '257', type: 'credit', amount: expenseAmount }
            ]
        };
    },

    // 3. GENEL SENARYO HAVUZU (Çeşitlendirilmiş)
    templates: [
        // --- SATIŞ & GELİR ---
        {
            id: 'sale_cash',
            text: (amt) => `Müşteriye ${formatDataMoney(amt)} TL tutarında mal satıldı. Ayrıca %20 KDV (${formatDataMoney(amt*0.2)}) hesaplandı. Toplam tutar PEŞİN (Nakit) tahsil edildi. (Maliyet: ${formatDataMoney(Math.round(amt*0.6))})`,
            logic: (amt) => [
                { code: '100', type: 'debit', amount: amt * 1.2 }, 
                { code: '600', type: 'credit', amount: amt }, 
                { code: '391', type: 'credit', amount: amt * 0.2 },  
                { code: '621', type: 'debit', amount: Math.round(amt*0.6) },  
                { code: '153', type: 'credit', amount: Math.round(amt*0.6) }  
            ]
        },
        {
            id: 'sale_credit_card',
            text: (amt) => `Müşterilere kredi kartı ile (POS) ${formatDataMoney(amt)} TL mal satışı yapıldı. %20 KDV (${formatDataMoney(amt*0.2)}) dahil toplam tutar banka hesabına geçti. (Maliyet ihmal)`,
            logic: (amt) => [
                { code: '102', type: 'debit', amount: amt * 1.2 },
                { code: '600', type: 'credit', amount: amt },
                { code: '391', type: 'credit', amount: amt * 0.2 }
            ]
        },
        {
            id: 'service_revenue',
            text: (amt) => `Danışmanlık hizmeti verildi ve ${formatDataMoney(amt)} TL + %20 KDV tutarında fatura kesildi. Toplam bedel PEŞİN (Kasa) tahsil edildi.`,
            logic: (amt) => [
                { code: '100', type: 'debit', amount: amt * 1.2 },
                { code: '600', type: 'credit', amount: amt },
                { code: '391', type: 'credit', amount: amt * 0.2 }
            ]
        },
        {
            id: 'interest_income',
            text: (amt) => `Banka mevduat hesabına ${formatDataMoney(amt)} TL net faiz tahakkuk etti.`,
            logic: (amt) => [
                { code: '102', type: 'debit', amount: amt },
                { code: '642', type: 'credit', amount: amt }
            ]
        },
        
        // --- GİDERLER & OPERASYON ---
        {
            id: 'insurance_policy',
            text: (amt) => `İşyeri için 1 yıllık sigorta poliçesi düzenlendi. ${formatDataMoney(amt)} TL bedel bankadan peşin ödendi. (Tamamı Gider yazılacak)`,
            logic: (amt) => [
                { code: '770', type: 'debit', amount: amt },
                { code: '102', type: 'credit', amount: amt }
            ]
        },
        {
            id: 'vehicle_fuel',
            text: (amt) => `Şirket araçları için ${formatDataMoney(amt)} TL yakıt alındı. %20 KDV (${formatDataMoney(amt*0.2)}) ile birlikte toplam ödeme şirket kredi kartı (Banka Kredisi) ile yapıldı.`,
            logic: (amt) => [
                { code: '631', type: 'debit', amount: amt }, 
                { code: '191', type: 'debit', amount: amt * 0.2 },
                { code: '300', type: 'credit', amount: amt * 1.2 }
            ]
        },
        {
            id: 'repair_maint',
            text: (amt) => `Arızalanan sunucular için ${formatDataMoney(amt)} TL + KDV bakım ücreti servise NAKİT ödendi.`,
            logic: (amt) => [
                { code: '770', type: 'debit', amount: amt },
                { code: '191', type: 'debit', amount: amt * 0.2 },
                { code: '100', type: 'credit', amount: amt * 1.2 }
            ]
        },
        {
            id: 'purchase_credit', 
            text: (amt) => `Satıcıdan ${formatDataMoney(amt)} TL tutarında ticari mal alındı. %20 KDV hariçtir. Toplam tutar (Mal + KDV) VADELİ (Veresiye) olarak borçlanıldı.`,
            logic: (amt) => [
                { code: '153', type: 'debit', amount: amt },
                { code: '191', type: 'debit', amount: amt * 0.2 },
                { code: '320', type: 'credit', amount: amt * 1.2 }
            ]
        },

        {
            id: 'prepaid_expense',
            text: (amt) => `Gelecek 3 ayı kapsayan ofis kirası olarak toplam ${formatDataMoney(amt)} TL peşin ödendi. (Gelecek Aylara Ait Giderler hesabını kullanın). KDV ihmal.`,
            logic: (amt) => [
                { code: '180', type: 'debit', amount: amt },
                { code: '100', type: 'credit', amount: amount }
            ]
        },

        // --- FİNANSAL İŞLEMLER ---
        {
            id: 'bank_loan_payment',
            text: (amt) => `Banka kredisinin ${formatDataMoney(amt)} TL anapara ve ${formatDataMoney(amt * 0.1)} TL faiz kısmı hesaptan ödendi.`,
            logic: (amt) => [
                { code: '300', type: 'debit', amount: amt },
                { code: '780', type: 'debit', amount: amt * 0.1 },
                { code: '102', type: 'credit', amount: amt * 1.1 }
            ]
        },
        {
            id: 'tax_payment_sgk',
            text: (amt) => `Geçen aya ait ${formatDataMoney(amt)} TL SGK prim borcu bankadan ödendi.`,
            logic: (amt) => [
                { code: '361', type: 'debit', amount: amt },
                { code: '102', type: 'credit', amount: amt }
            ]
        }
    ],

    generate: (turn, multiplier, title, accounts) => {
        // Not: Turn 1 (Career) kontrolünü app.js içinde yapıyoruz, 
        // burası standart senaryo üretimi için.

        // AMORTİSMAN KONTROLÜ (Demirbaş varsa %15 ihtimal)
        const fixedAssets = accounts ? accounts.find(a => a.code === '255').balance : 0;
        if (fixedAssets > 0 && Math.random() < 0.15) {
            return ScenarioEngine.generateDepreciation(fixedAssets);
        }

        // STANDART RASTGELE SENARYO
        const templates = ScenarioEngine.templates;
        const selected = templates[Math.floor(Math.random() * templates.length)];
        
        let baseAmount = Math.round((Math.random() * 8000 + 2000) * multiplier / 100) * 100;
        
        return {
            id: selected.id + '_' + Date.now(),
            text: selected.text(baseAmount),
            correctEntries: selected.logic(baseAmount)
        };
    }
};

function formatDataMoney(val) {
    return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2 }).format(val);
}