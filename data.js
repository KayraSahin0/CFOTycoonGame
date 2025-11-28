/**
 * CFO Tycoon - Veri Yapıları ve Senaryo Motoru
 * Kaynak: Tek Düzen Hesap Planı
 */

// Başarımlar Listesi
const ACHIEVEMENTS = [
    { id: 'first_profit', title: 'İlk Kar', desc: 'Dönem net karı pozitif olan bir ayı tamamla.', icon: 'fa-seedling', unlocked: false },
    { id: 'profit_10k', title: 'Küçük Adımlar', desc: 'Bir ayda 10.000 TL üzeri net kar et.', icon: 'fa-coins', unlocked: false },
    { id: 'profit_100k', title: 'Para Basıyor', desc: 'Bir ayda 100.000 TL üzeri net kar et.', icon: 'fa-money-bill-wave', unlocked: false },
    { id: 'title_kobi', title: 'KOBİ Olduk!', desc: 'Şirketi KOBİ seviyesine yükselt (50k+ Özkaynak).', icon: 'fa-building', unlocked: false },
    { id: 'title_corp', title: 'Kurumsallaşma', desc: 'Şirketi A.Ş. seviyesine yükselt (250k+ Özkaynak).', icon: 'fa-city', unlocked: false },
    { id: 'title_holding', title: 'Zirve', desc: 'Şirketi Holding seviyesine yükselt (1M+ Özkaynak).', icon: 'fa-globe', unlocked: false },
    { id: 'bankruptcy', title: 'Dibe Vuruş', desc: 'Şirketi iflas ettir.', icon: 'fa-skull', unlocked: false }
];

// Hesap Planı (Chart of Accounts)
const INITIAL_ACCOUNTS = [
    // --- 1. DÖNEN VARLIKLAR ---
    { code: '100', name: 'Kasa', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 },
    { code: '101', name: 'Alınan Çekler', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 },
    { code: '102', name: 'Bankalar', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 },
    { code: '103', name: 'Verilen Çekler ve Ödeme Emirleri (-)', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 },
    { code: '110', name: 'Hisse Senetleri', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 },
    { code: '120', name: 'Alıcılar', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 },
    { code: '121', name: 'Alacak Senetleri', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 },
    { code: '153', name: 'Ticari Mallar', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 },
    { code: '159', name: 'Verilen Sipariş Avansları', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 }, 
    { code: '190', name: 'Devreden KDV', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 },
    { code: '191', name: 'İndirilecek KDV', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 },
    { code: '195', name: 'İş Avansları', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 },

    // --- 2. DURAN VARLIKLAR ---
    { code: '252', name: 'Binalar', type: 'A', group: 'assets_fixed', balance: 0, dr: 0, cr: 0 },
    { code: '254', name: 'Taşıtlar', type: 'A', group: 'assets_fixed', balance: 0, dr: 0, cr: 0 },
    { code: '255', name: 'Demirbaşlar', type: 'A', group: 'assets_fixed', balance: 0, dr: 0, cr: 0 },
    { code: '257', name: 'Birikmiş Amortismanlar (-)', type: 'A', group: 'assets_fixed', balance: 0, dr: 0, cr: 0 },

    // --- 3. KISA VADELİ YABANCI KAYNAKLAR ---
    { code: '300', name: 'Banka Kredileri', type: 'L', group: 'liab_short', balance: 0, dr: 0, cr: 0 },
    { code: '320', name: 'Satıcılar', type: 'L', group: 'liab_short', balance: 0, dr: 0, cr: 0 },
    { code: '321', name: 'Borç Senetleri', type: 'L', group: 'liab_short', balance: 0, dr: 0, cr: 0 },
    { code: '335', name: 'Personele Borçlar', type: 'L', group: 'liab_short', balance: 0, dr: 0, cr: 0 },
    { code: '340', name: 'Alınan Sipariş Avansları', type: 'L', group: 'liab_short', balance: 0, dr: 0, cr: 0 }, 
    { code: '360', name: 'Ödenecek Vergi ve Fonlar', type: 'L', group: 'liab_short', balance: 0, dr: 0, cr: 0 },
    { code: '361', name: 'Ödenecek Sosyal Güv. Kesintileri', type: 'L', group: 'liab_short', balance: 0, dr: 0, cr: 0 },
    { code: '391', name: 'Hesaplanan KDV', type: 'L', group: 'liab_short', balance: 0, dr: 0, cr: 0 },

    // --- 4. UZUN VADELİ YABANCI KAYNAKLAR ---
    { code: '400', name: 'Banka Kredileri (Uzun)', type: 'L', group: 'liab_long', balance: 0, dr: 0, cr: 0 },

    // --- 5. ÖZKAYNAKLAR ---
    { code: '500', name: 'Sermaye', type: 'E', group: 'equity', balance: 0, dr: 0, cr: 0 },
    { code: '590', name: 'Dönem Net Karı', type: 'E', group: 'equity', balance: 0, dr: 0, cr: 0 },

    // --- 6. GELİR TABLOSU HESAPLARI ---
    { code: '600', name: 'Yurt İçi Satışlar', type: 'I', group: 'income', balance: 0, dr: 0, cr: 0 },
    { code: '602', name: 'Diğer Gelirler', type: 'I', group: 'income', balance: 0, dr: 0, cr: 0 },
    { code: '621', name: 'Satılan Malın Maliyeti (-)', type: 'X', group: 'expense', balance: 0, dr: 0, cr: 0 },
    { code: '642', name: 'Faiz Gelirleri', type: 'I', group: 'income', balance: 0, dr: 0, cr: 0 },
    { code: '657', name: 'Reeskont Faiz Giderleri (-)', type: 'X', group: 'expense', balance: 0, dr: 0, cr: 0 },

    // --- 7. MALİYET HESAPLARI (7/A) ---
    { code: '760', name: 'Pazarlama, Satış ve Dağ. Giderleri', type: 'X', group: 'expense', balance: 0, dr: 0, cr: 0 }, 
    { code: '770', name: 'Genel Yönetim Giderleri', type: 'X', group: 'expense', balance: 0, dr: 0, cr: 0 },
    { code: '780', name: 'Finansman Giderleri', type: 'X', group: 'expense', balance: 0, dr: 0, cr: 0 },
];

// Senaryo Şablonları ve Doğrulama Mantığı
const ScenarioEngine = {
    // Şablonları kategorize edelim
    templates: {
        positive: ['sale_cash', 'sale_check', 'interest_income', 'capital_increase'], // Özkaynak artırıcı (Gelir/Sermaye)
        negative: ['expense_rent', 'salary_accrual', 'tax_payment', 'marketing_expense'], // Özkaynak azaltıcı (Gider)
        neutral: ['purchase_credit', 'purchase_note', 'bank_loan_long', 'buy_vehicle', 'customer_collection', 'received_advance', 'given_advance'] // Bilanço değişimi
    },

    getWeightedRandomTemplate: (title) => {
        // 1. Unvana göre Pozitif Senaryo Aralığını belirle
        let minPos, maxPos;

        if (title === 'Startup') {
            minPos = 0.50; maxPos = 0.65;
        } else if (title === 'KOBİ') {
            minPos = 0.40; maxPos = 0.50;
        } else if (title === 'A.Ş.') {
            minPos = 0.30; maxPos = 0.40;
        } else { // Holding ve üzeri
            minPos = 0.10; maxPos = 0.30;
        }

        // 2. Bu aralıkta rastgele bir Pozitif olasılığı seç
        const probPositive = Math.random() * (maxPos - minPos) + minPos;
        
        // 3. Kalan olasılığı (%100 - Pozitif) hesapla
        const remaining = 1 - probPositive;
        
        // 4. Kalan kısmı Negatif ve Nötr arasında rastgele dağıt
        // Rastgeleliği bozmamak için kalanın rastgele bir parçasını negatife veriyoruz.
        const probNegative = remaining * Math.random(); 
        // Geri kalanı da nötre kalıyor
        // (Böylece toplam her zaman 1.0 eder)
        
        // 5. Kategori Seçimi
        const rand = Math.random();
        let selectedCategory = 'neutral';

        if (rand < probPositive) {
            selectedCategory = 'positive';
        } else if (rand < probPositive + probNegative) {
            selectedCategory = 'negative';
        } else {
            selectedCategory = 'neutral';
        }

        // Seçilen kategoriden rastgele bir şablon döndür
        const categoryList = ScenarioEngine.templates[selectedCategory];
        return categoryList[Math.floor(Math.random() * categoryList.length)];
    },

    generate: (turn, multiplier, title) => {
        // Ağırlıklı rastgele seçim fonksiyonunu kullan
        const type = ScenarioEngine.getWeightedRandomTemplate(title);
        
        // Tutar belirleme
        let baseAmount = Math.round((Math.random() * 5000 + 1000) * multiplier / 100) * 100;
        let costAmount = Math.round(baseAmount * 0.6); // %60 maliyet
        let vatAmount = baseAmount * 0.20; // KDV %20
        let totalAmount = baseAmount + vatAmount;

        let scenarioData = {
            id: Date.now(),
            text: '',
            correctEntries: [] 
        };

        switch (type) {
            case 'sale_cash': 
                scenarioData.text = `Müşteriye ${formatDataMoney(baseAmount)} TL + KDV (%20) tutarında mal satıldı. Bedeli PEŞİN (Nakit) tahsil edildi. (Maliyet: ${formatDataMoney(costAmount)} TL)`;
                scenarioData.correctEntries = [
                    { code: '100', type: 'debit', amount: totalAmount }, 
                    { code: '600', type: 'credit', amount: baseAmount }, 
                    { code: '391', type: 'credit', amount: vatAmount },  
                    { code: '621', type: 'debit', amount: costAmount },  
                    { code: '153', type: 'credit', amount: costAmount }  
                ];
                break;
            
            case 'sale_check':
                scenarioData.text = `Müşteriye ${formatDataMoney(baseAmount)} TL + KDV (%20) tutarında mal satıldı. Karşılığında ÇEK alındı. (Maliyet kaydını bu seferlik yapmayın)`;
                scenarioData.correctEntries = [
                    { code: '101', type: 'debit', amount: totalAmount },
                    { code: '600', type: 'credit', amount: baseAmount },
                    { code: '391', type: 'credit', amount: vatAmount }
                ];
                break;

            case 'purchase_credit': 
                scenarioData.text = `Satıcıdan ${formatDataMoney(baseAmount)} TL + KDV (%20) tutarında ticari mal alındı. Ödeme VADELİ (Veresiye).`;
                scenarioData.correctEntries = [
                    { code: '153', type: 'debit', amount: baseAmount },
                    { code: '191', type: 'debit', amount: vatAmount },
                    { code: '320', type: 'credit', amount: totalAmount }
                ];
                break;
            
            case 'purchase_note': 
                scenarioData.text = `Satıcıdan ${formatDataMoney(baseAmount)} TL + KDV (%20) tutarında mal alındı. Karşılığında SENET verildi.`;
                scenarioData.correctEntries = [
                    { code: '153', type: 'debit', amount: baseAmount },
                    { code: '191', type: 'debit', amount: vatAmount },
                    { code: '321', type: 'credit', amount: totalAmount }
                ];
                break;

            case 'expense_rent': 
                scenarioData.text = `Yönetim binası kirası olan ${formatDataMoney(baseAmount)} TL + KDV (%20) banka hesabından ödendi.`;
                scenarioData.correctEntries = [
                    { code: '770', type: 'debit', amount: baseAmount },
                    { code: '191', type: 'debit', amount: vatAmount },
                    { code: '102', type: 'credit', amount: totalAmount }
                ];
                break;
            
            case 'salary_accrual': 
                scenarioData.text = `Personel maaş tahakkuku yapıldı. Brüt Ücret: ${formatDataMoney(baseAmount)} TL. (Henüz ödenmedi, borçlanıldı).`;
                scenarioData.correctEntries = [
                    { code: '770', type: 'debit', amount: baseAmount },
                    { code: '335', type: 'credit', amount: baseAmount }
                ];
                break;

            case 'bank_loan_long':
                scenarioData.text = `Bankadan yatırım amaçlı ${formatDataMoney(baseAmount * 10)} TL tutarında UZUN VADELİ kredi çekildi ve hesaba geçti.`;
                scenarioData.correctEntries = [
                    { code: '102', type: 'debit', amount: baseAmount * 10 },
                    { code: '400', type: 'credit', amount: baseAmount * 10 }
                ];
                break;

            case 'tax_payment':
                scenarioData.text = `Geçen aydan tahakkuk eden ${formatDataMoney(baseAmount)} TL tutarındaki Vergi borcu bankadan ödendi.`;
                scenarioData.correctEntries = [
                    { code: '360', type: 'debit', amount: baseAmount },
                    { code: '102', type: 'credit', amount: baseAmount }
                ];
                break;
            
            case 'buy_vehicle':
                let vehiclePrice = baseAmount * 5;
                let vehicleVat = vehiclePrice * 0.20;
                let vehicleTotal = vehiclePrice + vehicleVat;
                scenarioData.text = `Şirkete ${formatDataMoney(vehiclePrice)} TL + KDV bedelle yeni bir araç (Taşıt) alındı. Bedeli bankadan ödendi.`;
                scenarioData.correctEntries = [
                    { code: '254', type: 'debit', amount: vehiclePrice },
                    { code: '191', type: 'debit', amount: vehicleVat },
                    { code: '102', type: 'credit', amount: vehicleTotal }
                ];
                break;

            case 'interest_income':
                scenarioData.text = `Banka mevduat hesabına ${formatDataMoney(baseAmount / 2)} TL net faiz tahakkuk etti.`;
                scenarioData.correctEntries = [
                    { code: '102', type: 'debit', amount: baseAmount / 2 },
                    { code: '642', type: 'credit', amount: baseAmount / 2 }
                ];
                break;

            case 'customer_collection': 
                scenarioData.text = `Müşterilerden (Alıcılar) olan alacağın ${formatDataMoney(baseAmount)} TL kısmı NAKİT tahsil edildi.`;
                scenarioData.correctEntries = [
                    { code: '100', type: 'debit', amount: baseAmount },
                    { code: '120', type: 'credit', amount: baseAmount }
                ];
                break;
            
            case 'capital_increase': 
                scenarioData.text = `Ortaklar şirkete ${formatDataMoney(baseAmount * 2)} TL nakit sermaye ilave etti (Banka hesabına).`;
                scenarioData.correctEntries = [
                    { code: '102', type: 'debit', amount: baseAmount * 2 },
                    { code: '500', type: 'credit', amount: baseAmount * 2 }
                ];
                break;

            case 'marketing_expense': 
                scenarioData.text = `Reklam ajansına ${formatDataMoney(baseAmount)} TL + KDV tutarında pazarlama hizmet bedeli bankadan ödendi.`;
                scenarioData.correctEntries = [
                    { code: '760', type: 'debit', amount: baseAmount },
                    { code: '191', type: 'debit', amount: vatAmount },
                    { code: '102', type: 'credit', amount: totalAmount }
                ];
                break;

            case 'received_advance': 
                scenarioData.text = `Bir müşteriden gelecek sipariş için ${formatDataMoney(baseAmount)} TL nakit sipariş avansı alındı.`;
                scenarioData.correctEntries = [
                    { code: '100', type: 'debit', amount: baseAmount },
                    { code: '340', type: 'credit', amount: baseAmount }
                ];
                break;
            
            case 'given_advance': 
                scenarioData.text = `Hammadde alımı için satıcı firmaya ${formatDataMoney(baseAmount)} TL tutarında sipariş avansı bankadan gönderildi.`;
                scenarioData.correctEntries = [
                    { code: '159', type: 'debit', amount: baseAmount },
                    { code: '102', type: 'credit', amount: baseAmount }
                ];
                break;
        }

        return scenarioData;
    }
};

function formatDataMoney(val) {
    return new Intl.NumberFormat('tr-TR').format(val);
}