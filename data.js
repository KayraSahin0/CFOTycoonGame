/**
 * CFO Tycoon - Veri Yapıları ve Senaryo Motoru
 * Kaynak: Tek Düzen Hesap Planı 
 */

// Hesap Planı (Chart of Accounts)
// Type: 'A' (Asset/Varlık), 'L' (Liability/Kaynak), 'E' (Equity/Özkaynak), 'I' (Income/Gelir), 'X' (Expense/Gider)
// Group: Raporlama için gruplama anahtarı
const INITIAL_ACCOUNTS = [
    // --- 1. DÖNEN VARLIKLAR [cite: 1] ---
    { code: '100', name: 'Kasa', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 }, // [cite: 3]
    { code: '101', name: 'Alınan Çekler', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 }, // [cite: 4]
    { code: '102', name: 'Bankalar', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 }, // [cite: 5]
    { code: '103', name: 'Verilen Çekler ve Ödeme Emirleri (-)', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 }, // [cite: 6]
    { code: '110', name: 'Hisse Senetleri', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 }, // [cite: 9]
    { code: '120', name: 'Alıcılar', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 }, // [cite: 15]
    { code: '121', name: 'Alacak Senetleri', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 }, // [cite: 16]
    { code: '153', name: 'Ticari Mallar', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 }, // [cite: 72]
    { code: '190', name: 'Devreden KDV', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 }, // [cite: 84]
    { code: '191', name: 'İndirilecek KDV', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 }, // [cite: 85]
    { code: '195', name: 'İş Avansları', type: 'A', group: 'assets_current', balance: 0, dr: 0, cr: 0 }, // [cite: 88]

    // --- 2. DURAN VARLIKLAR [cite: 21] ---
    { code: '252', name: 'Binalar', type: 'A', group: 'assets_fixed', balance: 0, dr: 0, cr: 0 }, // [cite: 104]
    { code: '254', name: 'Taşıtlar', type: 'A', group: 'assets_fixed', balance: 0, dr: 0, cr: 0 }, // [cite: 106]
    { code: '255', name: 'Demirbaşlar', type: 'A', group: 'assets_fixed', balance: 0, dr: 0, cr: 0 }, // [cite: 107]
    { code: '257', name: 'Birikmiş Amortismanlar (-)', type: 'A', group: 'assets_fixed', balance: 0, dr: 0, cr: 0 }, // [cite: 109]

    // --- 3. KISA VADELİ YABANCI KAYNAKLAR [cite: 37] ---
    { code: '300', name: 'Banka Kredileri', type: 'L', group: 'liab_short', balance: 0, dr: 0, cr: 0 }, // [cite: 39]
    { code: '320', name: 'Satıcılar', type: 'L', group: 'liab_short', balance: 0, dr: 0, cr: 0 }, // [cite: 46]
    { code: '321', name: 'Borç Senetleri', type: 'L', group: 'liab_short', balance: 0, dr: 0, cr: 0 }, // [cite: 47]
    { code: '335', name: 'Personele Borçlar', type: 'L', group: 'liab_short', balance: 0, dr: 0, cr: 0 }, // [cite: 142]
    { code: '360', name: 'Ödenecek Vergi ve Fonlar', type: 'L', group: 'liab_short', balance: 0, dr: 0, cr: 0 }, // [cite: 152]
    { code: '361', name: 'Ödenecek Sosyal Güv. Kesintileri', type: 'L', group: 'liab_short', balance: 0, dr: 0, cr: 0 }, // [cite: 153]
    { code: '391', name: 'Hesaplanan KDV', type: 'L', group: 'liab_short', balance: 0, dr: 0, cr: 0 }, // [cite: 167]

    // --- 4. UZUN VADELİ YABANCI KAYNAKLAR [cite: 172] ---
    { code: '400', name: 'Banka Kredileri (Uzun)', type: 'L', group: 'liab_long', balance: 0, dr: 0, cr: 0 }, // [cite: 174]

    // --- 5. ÖZKAYNAKLAR [cite: 207] ---
    { code: '500', name: 'Sermaye', type: 'E', group: 'equity', balance: 0, dr: 0, cr: 0 }, // [cite: 209]
    { code: '590', name: 'Dönem Net Karı', type: 'E', group: 'equity', balance: 0, dr: 0, cr: 0 }, // [cite: 231]

    // --- 6. GELİR TABLOSU HESAPLARI [cite: 233] ---
    { code: '600', name: 'Yurt İçi Satışlar', type: 'I', group: 'income', balance: 0, dr: 0, cr: 0 }, // [cite: 235]
    { code: '602', name: 'Diğer Gelirler', type: 'I', group: 'income', balance: 0, dr: 0, cr: 0 }, // [cite: 237]
    { code: '621', name: 'Satılan Malın Maliyeti (-)', type: 'X', group: 'expense', balance: 0, dr: 0, cr: 0 }, // [cite: 242]
    { code: '642', name: 'Faiz Gelirleri', type: 'I', group: 'income', balance: 0, dr: 0, cr: 0 }, // [cite: 249]
    { code: '657', name: 'Reeskont Faiz Giderleri (-)', type: 'X', group: 'expense', balance: 0, dr: 0, cr: 0 }, // [cite: 261]

    // --- 7. MALİYET HESAPLARI (7/A) [cite: 272] ---
    { code: '760', name: 'Pazarlama, Satış ve Dağ. Giderleri', type: 'X', group: 'expense', balance: 0, dr: 0, cr: 0 }, // [cite: 295]
    { code: '770', name: 'Genel Yönetim Giderleri', type: 'X', group: 'expense', balance: 0, dr: 0, cr: 0 }, // [cite: 299]
    { code: '780', name: 'Finansman Giderleri', type: 'X', group: 'expense', balance: 0, dr: 0, cr: 0 }, // [cite: 303]
];

// Senaryo Şablonları ve Doğrulama Mantığı
const ScenarioEngine = {
    generate: (turn, multiplier) => {
        // PDF'teki hesaplara dayalı genişletilmiş senaryolar
        const templates = [
            'sale_cash', 'sale_check', 'purchase_credit', 'purchase_note', 
            'expense_rent', 'salary_accrual', 'bank_loan_long', 'tax_payment',
            'buy_vehicle', 'interest_income', 'customer_collection'
        ];
        
        const type = templates[Math.floor(Math.random() * templates.length)];
        
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
            case 'sale_cash': // [cite: 3, 235, 167, 242, 72]
                scenarioData.text = `Müşteriye ${formatDataMoney(baseAmount)} TL + KDV (%20) tutarında mal satıldı. Bedeli PEŞİN (Nakit) tahsil edildi. (Maliyet: ${formatDataMoney(costAmount)} TL)`;
                scenarioData.correctEntries = [
                    { code: '100', type: 'debit', amount: totalAmount }, 
                    { code: '600', type: 'credit', amount: baseAmount }, 
                    { code: '391', type: 'credit', amount: vatAmount },  
                    { code: '621', type: 'debit', amount: costAmount },  
                    { code: '153', type: 'credit', amount: costAmount }  
                ];
                break;
            
            case 'sale_check': // [cite: 4, 235, 167] - 101 Alınan Çekler Kullanımı
                scenarioData.text = `Müşteriye ${formatDataMoney(baseAmount)} TL + KDV (%20) tutarında mal satıldı. Karşılığında ÇEK alındı. (Maliyet kaydı ihmal edilebilir, sadece satış)`;
                scenarioData.correctEntries = [
                    { code: '101', type: 'debit', amount: totalAmount },
                    { code: '600', type: 'credit', amount: baseAmount },
                    { code: '391', type: 'credit', amount: vatAmount }
                ];
                break;

            case 'purchase_credit': // [cite: 72, 85, 46]
                scenarioData.text = `Satıcıdan ${formatDataMoney(baseAmount)} TL + KDV (%20) tutarında ticari mal alındı. Ödeme VADELİ (Veresiye).`;
                scenarioData.correctEntries = [
                    { code: '153', type: 'debit', amount: baseAmount },
                    { code: '191', type: 'debit', amount: vatAmount },
                    { code: '320', type: 'credit', amount: totalAmount }
                ];
                break;
            
            case 'purchase_note': // [cite: 72, 85, 47] - 321 Borç Senetleri Kullanımı
                scenarioData.text = `Satıcıdan ${formatDataMoney(baseAmount)} TL + KDV (%20) tutarında mal alındı. Karşılığında SENET verildi.`;
                scenarioData.correctEntries = [
                    { code: '153', type: 'debit', amount: baseAmount },
                    { code: '191', type: 'debit', amount: vatAmount },
                    { code: '321', type: 'credit', amount: totalAmount }
                ];
                break;

            case 'expense_rent': // [cite: 299, 85, 5]
                scenarioData.text = `Yönetim binası kirası olan ${formatDataMoney(baseAmount)} TL + KDV (%20) banka hesabından ödendi.`;
                scenarioData.correctEntries = [
                    { code: '770', type: 'debit', amount: baseAmount },
                    { code: '191', type: 'debit', amount: vatAmount },
                    { code: '102', type: 'credit', amount: totalAmount }
                ];
                break;
            
            case 'salary_accrual': // [cite: 299, 142] - Maaş Tahakkuku (Basitleştirilmiş)
                // SGK ve Vergi hesaplarını detaylandırmak yerine brüt üzerinden basit tahakkuk
                scenarioData.text = `Personel maaş tahakkuku yapıldı. Brüt Ücret: ${formatDataMoney(baseAmount)} TL. (Henüz ödenmedi, borçlanıldı).`;
                scenarioData.correctEntries = [
                    { code: '770', type: 'debit', amount: baseAmount },
                    { code: '335', type: 'credit', amount: baseAmount }
                ];
                break;

            case 'bank_loan_long': // [cite: 5, 174] - Uzun Vadeli Kredi
                scenarioData.text = `Bankadan yatırım amaçlı ${formatDataMoney(baseAmount * 10)} TL tutarında UZUN VADELİ kredi çekildi ve hesaba geçti.`;
                scenarioData.correctEntries = [
                    { code: '102', type: 'debit', amount: baseAmount * 10 },
                    { code: '400', type: 'credit', amount: baseAmount * 10 }
                ];
                break;

            case 'tax_payment': // [cite: 152, 5] - Vergi Ödemesi
                scenarioData.text = `Geçen aydan tahakkuk eden ${formatDataMoney(baseAmount)} TL tutarındaki Vergi borcu bankadan ödendi.`;
                scenarioData.correctEntries = [
                    { code: '360', type: 'debit', amount: baseAmount },
                    { code: '102', type: 'credit', amount: baseAmount }
                ];
                break;
            
            case 'buy_vehicle': // [cite: 106, 85, 5] - Taşıt Alımı
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

            case 'interest_income': // [cite: 5, 249] - Faiz Geliri
                scenarioData.text = `Banka mevduat hesabına ${formatDataMoney(baseAmount / 2)} TL net faiz tahakkuk etti.`;
                scenarioData.correctEntries = [
                    { code: '102', type: 'debit', amount: baseAmount / 2 },
                    { code: '642', type: 'credit', amount: baseAmount / 2 }
                ];
                break;

            case 'customer_collection': // [cite: 15, 3] - Alıcılardan Tahsilat
                scenarioData.text = `Müşterilerden (Alıcılar) olan alacağın ${formatDataMoney(baseAmount)} TL kısmı NAKİT tahsil edildi.`;
                scenarioData.correctEntries = [
                    { code: '100', type: 'debit', amount: baseAmount },
                    { code: '120', type: 'credit', amount: baseAmount }
                ];
                break;
        }

        return scenarioData;
    }
};

function formatDataMoney(val) {
    return new Intl.NumberFormat('tr-TR').format(val);
}