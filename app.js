/**
 * CFO Tycoon - Ana Oyun Mantığı (App.js) - Dark Mode Edition
 */

// --- GLOBAL STATE ---
const GameState = {
    mode: 'sandbox', // 'sandbox' | 'career'
    difficulty: 'easy', // 'easy' | 'hard'
    companyName: 'Girişimci A.Ş.',
    money: 0,
    score: 0,
    turn: 1,
    title: 'Startup',
    multiplier: 1,
    accounts: [], 
    achievements: [],
    currentScenario: null,
    journalEntry: [],
    manualScenariosQueue: [], // YENİ: Manuel senaryo sırası
    helpUsed: false
};

// --- LEADERBOARD HELPER ---
const Leaderboard = {
    key: 'cfo_tycoon_highscores_v1',
    // Artık turn bilgisini de alıyor
    save: (name, score, turn) => {
        let scores = Leaderboard.get();
        // formatTurnDate fonksiyonunu kullanarak "1y 3a" gibi formatlı kaydediyoruz
        const turnStr = formatTurnDate(turn);
        scores.push({ 
            name, 
            score, 
            turnStr, 
            date: new Date().toLocaleDateString('tr-TR') 
        });
        scores.sort((a, b) => b.score - a.score);
        scores = scores.slice(0, 10); // İlk 10
        localStorage.setItem(Leaderboard.key, JSON.stringify(scores));
    },
    get: () => {
        const data = localStorage.getItem(Leaderboard.key);
        return data ? JSON.parse(data) : [];
    }
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    // SweetAlert2 Dark Theme ayarı
    const style = document.createElement('style');
    style.innerHTML = `
        .swal2-popup { background: #1e293b !important; color: #e2e8f0 !important; border: 1px solid #334155; }
        .swal2-title { color: #e2e8f0 !important; }
        .swal2-content, .swal2-html-container { color: #cbd5e1 !important; }
        .swal2-confirm { background-color: #059669 !important; /* emerald-600 */ }
        .swal2-deny { background-color: #dc2626 !important; /* red-600 */ }
        .swal2-cancel { background-color: #475569 !important; /* slate-600 */ }
        .swal2-input { background-color: #334155 !important; color: white !important; }
    `;
    document.head.appendChild(style);

    initApp();

    // TUTAR INPUT FORMATLAMA (Nokta koyma)
    const amountInput = document.getElementById('amountInput');
    amountInput.addEventListener('input', function(e) {
        let value = this.value.replace(/[^0-9]/g, '');
        if (value) {
            this.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        } else {
            this.value = "";
        }
    });
});

function initApp() {
    Swal.fire({
        title: 'CFO Tycoon\'a Hoşgeldiniz',
        text: 'Oyun modunu seçiniz.',
        icon: 'info',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Kariyer Modu',
        denyButtonText: 'Serbest Mod (Sandbox)',
        cancelButtonText: 'Manuel Mod (Senaryo Yaz)', // YENİ BUTON
        confirmButtonColor: '#059669', // Emerald
        denyButtonColor: '#d97706',    // Amber
        cancelButtonColor: '#3b82f6',  // Blue
        allowOutsideClick: false
    }).then((result) => {
        if (result.isConfirmed) {
            startCareerSetup();
        } else if (result.isDenied) {
            playIntro(() => startGame('sandbox', 'easy'));
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            // Manuel Mod Seçildi
            openManualInput();
        }
    });
}

function startCareerSetup() {
    Swal.fire({
        title: 'Zorluk Seviyesi',
        text: 'Mali tabloları kendin mi hesaplayacaksın?',
        icon: 'question',
        showDenyButton: true,
        confirmButtonText: 'Kolay (Stajyer) - Otomatik Raporlar',
        denyButtonText: 'Zor (CFO) - Manuel Hesaplama',
        allowOutsideClick: false
    }).then(async (result) => {
        const diff = result.isDenied ? 'hard' : 'easy';
        
        const { value: companyName } = await Swal.fire({
            title: 'Şirketine İsim Ver',
            input: 'text',
            inputLabel: 'Şirket Adı (İsteğe Bağlı)',
            inputPlaceholder: 'Örn: Teknoloji A.Ş.',
            showCancelButton: true,
            confirmButtonText: 'Başla',
            cancelButtonText: 'Atla (Varsayılan)',
            inputValidator: (value) => {
                if (value.length > 20) return 'Şirket ismi çok uzun!';
            }
        });

        GameState.companyName = companyName || 'Girişimci A.Ş.';
        playIntro(() => startGame('career', diff));
    });
}

function startGame(mode, difficulty) {
    GameState.mode = mode;
    GameState.difficulty = difficulty;
    GameState.accounts = JSON.parse(JSON.stringify(INITIAL_ACCOUNTS)); // Deep copy
    GameState.achievements = JSON.parse(JSON.stringify(ACHIEVEMENTS));
    GameState.turn = 1;
    GameState.score = 0;
    GameState.journalEntry = [];

    if (mode === 'sandbox') {
        const cashAcc = GameState.accounts.find(a => a.code === '100');
        const capitalAcc = GameState.accounts.find(a => a.code === '500');
        cashAcc.balance = 50000; cashAcc.dr = 50000;
        capitalAcc.balance = 50000; capitalAcc.cr = 50000;
        GameState.money = 50000;
        GameState.companyName = "Sandbox Kralı";
    } else {
        GameState.money = 0;
    }

    updateUI();
    generateNewTurn();
    
    // Select doldur
    const accountSelect = document.getElementById('accountSelect');
    accountSelect.innerHTML = '<option value="">Hesap Seçin...</option>';
    GameState.accounts.sort((a,b) => a.code.localeCompare(b.code));
    GameState.accounts.forEach(acc => {
        const option = document.createElement('option');
        option.value = acc.code;
        option.text = `${acc.code} - ${acc.name}`;
        accountSelect.appendChild(option);
    });
}

// --- GAME LOOP & LOGIC ---

function generateNewTurn() {
    GameState.helpUsed = false;
    
    // Unvan güncelle
    const equity = calculateGroupTotal('equity') + calculateNetIncome();
    if (GameState.mode === 'career') {
        if (equity > 1000000) { GameState.title = "Holding"; GameState.multiplier = 10; }
        else if (equity > 250000) { GameState.title = "A.Ş."; GameState.multiplier = 5; }
        else if (equity > 50000) { GameState.title = "KOBİ"; GameState.multiplier = 2; }
        else { GameState.title = "Startup"; GameState.multiplier = 1; }
    }

    // --- ZORUNLU BAŞLANGIÇ SENARYOSU (Turn 1 & Career) ---
    if (GameState.turn === 1 && GameState.mode === 'career') {
        GameState.currentScenario = ScenarioEngine.startupScenario;
    } else {
        GameState.currentScenario = ScenarioEngine.generate(GameState.turn, GameState.multiplier, GameState.title, GameState.accounts);
    }

    // --- SENARYO SEÇİMİ ---
    if (GameState.mode === 'manual') {
        // Manuel modda sıradaki senaryoyu al
        if (GameState.manualScenariosQueue.length > 0) {
            // İlk elemanı al ve listeden çıkar (shift)
            GameState.currentScenario = GameState.manualScenariosQueue.shift();
        } else {
            // Senaryolar bitti
            Swal.fire({
                title: 'Tebrikler!',
                text: 'Yazdığınız tüm senaryoları başarıyla tamamladınız.',
                icon: 'success',
                confirmButtonText: 'Ana Menüye Dön'
            }).then(() => location.reload());
            return;
        }
    } 
    else if (GameState.turn === 1 && GameState.mode === 'career') {
        GameState.currentScenario = ScenarioEngine.startupScenario;
    } else {
        GameState.currentScenario = ScenarioEngine.generate(GameState.turn, GameState.multiplier, GameState.title, GameState.accounts);
    }
    
    // UI Güncelle
    document.getElementById('scenarioText').innerText = GameState.currentScenario.text;
    document.getElementById('turnBadge').innerText = formatTurnDate(GameState.turn);
    document.getElementById('titleBadge').innerText = GameState.title;
    document.getElementById('scoreBadge').innerText = GameState.score;
    document.getElementById('companyNameDisplay').innerText = GameState.companyName;
    
    GameState.journalEntry = [];
    renderJournalTable();
}

function addToJournal() {
    const accCode = document.getElementById('accountSelect').value;
    
    // Checkbox durumu: Checked = Alacak (Credit), Unchecked = Borç (Debit)
    const isCredit = document.getElementById('entryTypeToggle').checked;
    const type = isCredit ? 'credit' : 'debit';
    
    // Noktaları temizle ve sayıya çevir
    let rawAmount = document.getElementById('amountInput').value;
    rawAmount = rawAmount.replace(/\./g, '');
    const amount = parseFloat(rawAmount);

    if (!accCode || isNaN(amount) || amount <= 0) {
        Swal.fire('Hata', 'Lütfen geçerli bir hesap ve tutar giriniz.', 'error');
        return;
    }

    const account = GameState.accounts.find(a => a.code === accCode);
    
    GameState.journalEntry.push({
        code: account.code,
        name: account.name,
        type: type,
        amount: amount
    });

    renderJournalTable();
    document.getElementById('amountInput').value = '';
    document.getElementById('accountSelect').focus();
}

function useHelp() {
    if(!GameState.currentScenario) return;

    Swal.fire({
        title: 'Yardım Al',
        text: 'Bu turun doğru kaydını görmek istiyor musunuz? Bunu yaparsanız bu turdan PUAN KAZANAMAZSINIZ.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Evet, Göster',
        cancelButtonText: 'İptal'
    }).then((result) => {
        if (result.isConfirmed) {
            GameState.helpUsed = true;
            GameState.journalEntry = [];
            
            GameState.currentScenario.correctEntries.forEach(correct => {
                const acc = GameState.accounts.find(a => a.code === correct.code);
                if(acc) {
                    GameState.journalEntry.push({
                        code: correct.code,
                        name: acc.name,
                        type: correct.type,
                        amount: correct.amount
                    });
                }
            });

            renderJournalTable();
            Swal.fire('Yardım Kullanıldı', 'Doğru kayıtlar yüklendi. İnceleyip kaydedebilirsiniz.', 'info');
        }
    });
}

function renderJournalTable() {
    const tbody = document.getElementById('journalTableBody');
    tbody.innerHTML = '';
    
    let totalDr = 0;
    let totalCr = 0;

    GameState.journalEntry.forEach((entry, index) => {
        const tr = document.createElement('tr');
        tr.className = "entry-row border-b border-slate-700 text-sm hover:bg-slate-800 transition-colors";
        
        tr.innerHTML = `
            <td class="p-2 pl-3 font-mono text-slate-400">${entry.code}</td>
            <td class="p-2 text-slate-200">${entry.name}</td>
            <td class="p-2 text-right text-emerald-400 font-medium font-mono">${entry.type === 'debit' ? formatMoney(entry.amount) : ''}</td>
            <td class="p-2 text-right text-blue-400 font-medium font-mono">${entry.type === 'credit' ? formatMoney(entry.amount) : ''}</td>
            <td class="p-2 text-center">
                <button onclick="removeEntry(${index})" class="text-red-400 hover:text-red-300 transition p-1">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);

        if (entry.type === 'debit') totalDr += entry.amount;
        else totalCr += entry.amount;
    });

    document.getElementById('totalDr').innerText = formatMoney(totalDr);
    document.getElementById('totalCr').innerText = formatMoney(totalCr);
    
    const balanceIndicator = document.getElementById('balanceIndicator');
    const isBalanced = Math.abs(totalDr - totalCr) < 0.1 && totalDr > 0;
    const saveBtn = document.getElementById('saveButton');
    
    if (isBalanced) {
        balanceIndicator.innerHTML = '<span class="text-emerald-400 flex items-center"><i class="fa-solid fa-check-circle mr-1"></i> Denk</span>';
        if (!saveBtn.classList.contains('success-locked')) {
             saveBtn.disabled = false;
        }
    } else {
        balanceIndicator.innerHTML = '<span class="text-red-400 flex items-center"><i class="fa-solid fa-circle-exclamation mr-1"></i> Denk Değil</span>';
        saveBtn.disabled = true;
    }
}

function removeEntry(index) {
    GameState.journalEntry.splice(index, 1);
    renderJournalTable();
}

// --- MODAL & UI FUNCTIONS ---
function openHowToPlay() {
    const modal = document.getElementById('howToPlayModal');
    modal.classList.remove('hidden');
    modal.querySelector('div').classList.add('animate__zoomIn');
}
function closeHowToPlay() { document.getElementById('howToPlayModal').classList.add('hidden'); }

function openAchievements() {
    const modal = document.getElementById('achievementsModal');
    const list = document.getElementById('achievementsList');
    list.innerHTML = '';

    GameState.achievements.forEach(ach => {
        const item = document.createElement('div');
        item.className = `p-3 mb-2 rounded border flex items-center ${ach.unlocked ? 'bg-slate-800 border-yellow-600' : 'bg-slate-900 border-slate-700 opacity-60'}`;
        item.innerHTML = `
            <div class="text-2xl mr-4 ${ach.unlocked ? 'text-yellow-500' : 'text-slate-600'}"><i class="fa-solid ${ach.icon}"></i></div>
            <div><h4 class="font-bold ${ach.unlocked ? 'text-white' : 'text-slate-500'}">${ach.title}</h4><p class="text-xs text-slate-400">${ach.desc}</p></div>
            ${ach.unlocked ? '<div class="ml-auto text-yellow-500"><i class="fa-solid fa-check"></i></div>' : ''}
        `;
        list.appendChild(item);
    });
    modal.classList.remove('hidden');
    modal.querySelector('div').classList.add('animate__zoomIn');
}
function closeAchievements() { document.getElementById('achievementsModal').classList.add('hidden'); }

function openLeaderboard() {
    const modal = document.getElementById('leaderboardModal');
    const tbody = document.getElementById('leaderboardList');
    const msg = document.getElementById('noScoreMsg');
    
    tbody.innerHTML = '';
    const scores = Leaderboard.get();

    if (scores.length === 0) {
        msg.classList.remove('hidden');
    } else {
        msg.classList.add('hidden');
        scores.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.className = index < 3 ? 'bg-slate-700/30' : 'border-b border-slate-700/50 hover:bg-slate-700/20';
            
            let rankIcon = `#${index + 1}`;
            if(index === 0) rankIcon = '<i class="fa-solid fa-trophy text-yellow-500"></i>';
            if(index === 1) rankIcon = '<i class="fa-solid fa-medal text-gray-400"></i>';
            if(index === 2) rankIcon = '<i class="fa-solid fa-medal text-amber-700"></i>';

            // GÜNCELLENEN KISIM: item.turnStr eklendi
            tr.innerHTML = `
                <td class="px-6 py-4 font-bold text-slate-300">${rankIcon}</td>
                <td class="px-6 py-4 font-medium text-white">
                    ${item.name}
                    <div class="flex gap-2 text-xs text-slate-500 font-normal mt-0.5">
                        <span><i class="fa-regular fa-calendar mr-1"></i>${item.date || ''}</span>
                        <span class="text-blue-400">• ${item.turnStr || 'Yeni'}</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-right font-mono text-emerald-400 font-bold">${formatMoney(item.score).replace('₺', '')}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    modal.classList.remove('hidden');
    modal.querySelector('div').classList.add('animate__zoomIn');
}
function closeLeaderboard() { document.getElementById('leaderboardModal').classList.add('hidden'); }

// --- AMORTİSMAN MODALI İŞLEMLERİ ---
function openDepreciationModal() {
    const modal = document.getElementById('depreciationModal');
    modal.classList.remove('hidden');
    document.getElementById('depResultDisplay').innerText = "0,00 ₺";
    document.getElementById('depAssetValue').value = "";
}
function closeDepreciationModal() { document.getElementById('depreciationModal').classList.add('hidden'); }

function calculateDepreciation() {
    const value = parseFloat(document.getElementById('depAssetValue').value);
    const life = parseFloat(document.getElementById('depLife').value);
    const method = document.getElementById('depMethod').value;
    if (!value || !life || life <= 0) { Swal.fire('Eksik Bilgi', 'Lütfen varlık değeri ve ömrünü giriniz.', 'warning'); return; }
    let rate = 1 / life;
    if (method === 'accelerated') rate *= 2; 
    const result = Math.round(value * rate);
    document.getElementById('depResultDisplay').innerText = formatMoney(result);
}

// --- BAŞARIM SİSTEMİ ---
function checkAchievements() {
    const netIncome = calculateNetIncome();
    const equity = calculateGroupTotal('equity') + netIncome;
    const assetsFixed = calculateGroupTotal('assets_fixed');
    const getBal = (code) => { const acc = GameState.accounts.find(a => a.code === code); return acc ? acc.balance : 0; };
    const unlock = (id) => {
        const ach = GameState.achievements.find(a => a.id === id);
        if (ach && !ach.unlocked) {
            ach.unlocked = true;
            Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: 'Başarım Kazanıldı!', text: ach.title, showConfirmButton: false, timer: 3000, background: '#1e293b', color: '#fff' });
        }
    };

    if (netIncome > 0) unlock('first_profit');
    if (netIncome > 10000) unlock('profit_10k');
    if (netIncome > 100000) unlock('profit_100k');
    if (GameState.title === 'KOBİ' || GameState.title === 'A.Ş.' || GameState.title === 'Holding') unlock('title_kobi');
    if (GameState.title === 'A.Ş.' || GameState.title === 'Holding') unlock('title_corp');
    if (GameState.title === 'Holding') unlock('title_holding');
    if (GameState.turn >= 12) unlock('survivor_1y');
    if (GameState.turn >= 36) unlock('survivor_3y');
    if (GameState.turn >= 60) unlock('survivor_5y');
    if (getBal('100') >= 100000) unlock('cash_king');
    if (getBal('102') >= 500000) unlock('bank_magnate');
    if (getBal('254') >= 500000) unlock('fleet_owner');
    if (getBal('153') >= 250000) unlock('inventory_master');
    if (equity >= 2000000) unlock('equity_giant');
    const totalDebt = calculateGroupTotal('liab_short') + calculateGroupTotal('liab_long');
    if (totalDebt === 0 && GameState.turn > 5) unlock('debt_free');
    if (GameState.score >= 5000) unlock('score_rookie');
    if (GameState.score >= 25000) unlock('score_pro');
    if (GameState.score >= 100000) unlock('score_legend');
    if (getBal('360') === 0 && GameState.turn > 3) unlock('charity');
    if (assetsFixed > calculateGroupTotal('assets_current') && assetsFixed > 0) unlock('investor');
}

// --- DOĞRULAMA VE KAYIT ---
function saveTransaction() {
    const validationResult = validateTransactionContent();
    if (!validationResult.isValid) {
        Swal.fire({ title: 'Hatalı Kayıt', html: `Yaptığınız kayıt senaryo ile uyuşmuyor.<br><br><small class="text-slate-400">${validationResult.message}</small>`, icon: 'error', confirmButtonText: 'Tekrar Dene' });
        return; 
    }

    if (!GameState.helpUsed) {
        GameState.score += 100 * GameState.multiplier;
        document.getElementById('scoreBadge').innerText = GameState.score;
        Swal.fire({ icon: 'success', title: 'Doğru Kayıt!', text: `+${100 * GameState.multiplier} Puan kazandınız.`, timer: 1500, showConfirmButton: false });
    }

    const saveBtn = document.getElementById('saveButton');
    saveBtn.disabled = true;
    saveBtn.classList.add('success-locked');
    saveBtn.innerHTML = '<i class="fa-solid fa-check mr-2"></i> Kaydedildi';

    GameState.journalEntry.forEach(entry => {
        const acc = GameState.accounts.find(a => a.code === entry.code);
        if (entry.type === 'debit') {
            acc.dr += entry.amount;
            if (acc.type === 'A' || acc.type === 'X') acc.balance += entry.amount; else acc.balance -= entry.amount;
        } else {
            acc.cr += entry.amount;
            if (acc.type === 'L' || acc.type === 'E' || acc.type === 'I') acc.balance += entry.amount; else acc.balance -= entry.amount;
        }
    });

    checkAchievements();

    const cash = GameState.accounts.find(a => a.code === '100').balance;
    const banks = GameState.accounts.find(a => a.code === '102').balance;
    if (cash + banks < -50000 && GameState.mode === 'career') {
        const ach = GameState.achievements.find(a => a.id === 'bankruptcy');
        if(ach && !ach.unlocked) { ach.unlocked = true; }

        // GÜNCELLEME: Turn bilgisini de gönderiyoruz
        Leaderboard.save(GameState.companyName, GameState.score, GameState.turn);

        Swal.fire('İFLAS!', 'Nakit akışını yönetemediniz. Şirket battı.', 'error').then(() => location.reload());
        return;
    }

    updateUI();

    if (GameState.difficulty === 'hard') {
        if(GameState.helpUsed) {
             Swal.fire('Bilgi', 'Yardım kullandığınız için raporlar otomatik oluşturuldu.', 'info');
             document.getElementById('validateReportsBtn').classList.add('hidden');
             document.getElementById('nextTurnBtn').classList.remove('hidden');
             renderReports(false);
        } else {
             if (!GameState.helpUsed) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Defterler işlendi. Raporları doğrulayın.', showConfirmButton: false, timer: 3000 });
            document.getElementById('validateReportsBtn').classList.remove('hidden');
            document.getElementById('nextTurnBtn').classList.add('hidden');
            renderReports(true); 
        }
    } else {
        document.getElementById('validateReportsBtn').classList.add('hidden');
        document.getElementById('nextTurnBtn').classList.remove('hidden');
        renderReports(false);
    }
}

function validateTransactionContent() {
    const userEntries = GameState.journalEntry;
    const correctEntries = GameState.currentScenario.correctEntries;
    if (userEntries.length !== correctEntries.length) return { isValid: false, message: "Eksik veya fazla satır girdiniz." };
    const sortedUser = [...userEntries].sort((a, b) => a.code.localeCompare(b.code) || a.amount - b.amount);
    const sortedCorrect = [...correctEntries].sort((a, b) => a.code.localeCompare(b.code) || a.amount - b.amount);
    for (let i = 0; i < sortedCorrect.length; i++) {
        const u = sortedUser[i]; const c = sortedCorrect[i];
        if (u.code !== c.code) return { isValid: false, message: `Beklenen hesap: ${c.code}, Sizin girdiğiniz: ${u.code}` };
        if (u.type !== c.type) return { isValid: false, message: `${u.code} hesabı ${c.type === 'debit' ? 'Borç' : 'Alacak'} çalışmalı.` };
        if (Math.abs(u.amount - c.amount) > 1) return { isValid: false, message: `${u.code} hesabı için tutar hatalı.` };
    }
    return { isValid: true };
}

// --- REPORTING ---
function calculateGroupTotal(groupName) { return GameState.accounts.filter(a => a.group === groupName).reduce((sum, acc) => sum + acc.balance, 0); }
function calculateNetIncome() { return calculateGroupTotal('income') - calculateGroupTotal('expense'); }

function renderReports(isInputMode) {
    const createRow = (label, value) => {
        let valHtml = isInputMode ? `<input type="number" class="hard-mode-input" data-target="${Math.round(value)}" placeholder="?">` : `<span class="report-value ${value < 0 ? 'text-red-400' : 'text-emerald-400'}">${formatMoney(value)}</span>`;
        return `<div class="report-row"><span class="report-label">${label}</span>${valHtml}</div>`;
    };

    const currentAssets = calculateGroupTotal('assets_current');
    const fixedAssets = calculateGroupTotal('assets_fixed');
    const totalAssets = currentAssets + fixedAssets;
    const shortLiab = calculateGroupTotal('liab_short');
    const longLiab = calculateGroupTotal('liab_long');
    const equity = calculateGroupTotal('equity');
    const netIncome = calculateNetIncome(); 
    const totalLiabEquity = shortLiab + longLiab + equity + netIncome;

    let bs = createRow('Dönen Varlıklar', currentAssets) + createRow('Duran Varlıklar', fixedAssets) + `<div class="report-total"><span>TOPLAM VARLIKLAR</span><span>${isInputMode ? '---' : formatMoney(totalAssets)}</span></div><div class="h-6"></div>`; 
    bs += createRow('Kısa Vadeli Y.K.', shortLiab) + createRow('Uzun Vadeli Y.K.', longLiab) + createRow('Özkaynaklar', equity) + createRow('Dönem Net Karı', netIncome) + `<div class="report-total"><span>TOPLAM KAYNAKLAR</span><span>${isInputMode ? '---' : formatMoney(totalLiabEquity)}</span></div>`;
    document.getElementById('balanceSheetContent').innerHTML = bs;

    const grossSales = calculateGroupTotal('income');
    const expenses = calculateGroupTotal('expense');
    let isHtml = createRow('Brüt Satışlar', grossSales) + createRow('Giderler (-)', expenses) + `<div class="report-total !text-emerald-400 !border-emerald-900/50"><span>NET KAR/ZARAR</span><span>${isInputMode ? '---' : formatMoney(netIncome)}</span></div>`;
    document.getElementById('incomeStatementContent').innerHTML = isHtml;
}

function validateHardMode() {
    const inputs = document.querySelectorAll('.hard-mode-input');
    let allCorrect = true;
    inputs.forEach(input => {
        const userVal = parseFloat(input.value); const targetVal = parseFloat(input.getAttribute('data-target'));
        const tolerance = Math.abs(targetVal * 0.01) + 1; 
        if (!isNaN(userVal) && Math.abs(userVal - targetVal) <= tolerance) { input.classList.remove('error'); input.classList.add('success'); input.disabled = true; } 
        else { input.classList.add('error'); allCorrect = false; }
    });
    if (allCorrect) {
        Swal.fire('Tebrikler CFO!', 'Mali tablolar doğrulandı. Bir sonraki aya geçiliyor.', 'success');
        document.getElementById('validateReportsBtn').classList.add('hidden');
        document.getElementById('nextTurnBtn').classList.remove('hidden');
    } else { Swal.fire('Hata', 'Hesaplamalarda yanlışlık var.', 'error'); }
}

// --- HELPERS ---
function updateUI() { renderLedger(); }

function renderLedger() {
    const container = document.getElementById('ledgerContainer');
    container.innerHTML = '';
    const activeAccounts = GameState.accounts.filter(a => a.dr > 0 || a.cr > 0 || a.balance !== 0);
    if(activeAccounts.length === 0) { container.innerHTML = '<div class="text-slate-500 text-center w-full mt-10 italic">Henüz kayıt yok.</div>'; return; }

    activeAccounts.forEach(acc => {
        const div = document.createElement('div');
        div.className = "t-account-card masonry-item animate__animated animate__fadeIn";
        const balanceColor = acc.balance < 0 ? 'text-red-400' : 'text-emerald-400';
        div.innerHTML = `
            <div class="t-account"><div class="t-header">${acc.code} - ${acc.name}</div>
                <div class="t-body"><div class="t-debit">${acc.dr > 0 ? formatMoney(acc.dr) : '-'}</div><div class="t-credit">${acc.cr > 0 ? formatMoney(acc.cr) : '-'}</div></div>
                <div class="t-footer ${balanceColor}"><span>Bakiye:</span><span>${formatMoney(acc.balance)}</span></div>
            </div>`;
        container.appendChild(div);
    });
}

function nextTurn() {
    GameState.turn++;
    const saveBtn = document.getElementById('saveButton');
    saveBtn.classList.remove('success-locked');
    saveBtn.disabled = true; 
    saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk mr-2"></i> KONTROL ET & KAYDET';

    generateNewTurn();
    document.getElementById('nextTurnBtn').classList.add('hidden');
    document.querySelectorAll('input').forEach(i => i.value = '');
    document.getElementById('entryTypeToggle').checked = false;

    if(GameState.difficulty === 'hard') {
         document.getElementById('balanceSheetContent').innerHTML = '<div class="text-sm text-slate-500 italic">Veri bekleniyor...</div>';
         document.getElementById('incomeStatementContent').innerHTML = '<div class="text-sm text-slate-500 italic">Veri bekleniyor...</div>';
    } else { renderReports(false); }
}

function formatMoney(amount) { return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2 }).format(amount); }

function formatTurnDate(turn) {
    if (turn <= 12) return `Ay: ${turn}`;
    const years = Math.floor(turn / 12);
    const months = turn % 12;
    return `${years}y ${months}a`;
}

function switchHelpTab(tabName) {
    document.getElementById('tabContent-gameplay').classList.add('hidden');
    document.getElementById('tabContent-financials').classList.add('hidden');
    const inactiveClass = "flex-1 py-3 text-sm font-bold text-slate-500 border-b-2 border-transparent hover:text-slate-300 transition hover:bg-slate-800/30";
    document.getElementById('tabBtn-gameplay').className = inactiveClass;
    document.getElementById('tabBtn-financials').className = inactiveClass;
    document.getElementById('tabContent-' + tabName).classList.remove('hidden');
    const activeClass = "flex-1 py-3 text-sm font-bold text-emerald-400 border-b-2 border-emerald-400 transition bg-slate-800/50";
    document.getElementById('tabBtn-' + tabName).className = activeClass;
}

// --- OYUNU BİTİRME ---
function finishGame() {
    Swal.fire({
        title: 'Şirketi Kapatıyor musun?',
        html: `Mevcut Puanın: <strong class="text-emerald-400">${formatMoney(GameState.score)}</strong><br>
               Süre: <strong class="text-blue-400">${formatTurnDate(GameState.turn)}</strong><br><br>
               Bu işlem oyunu sonlandırır ve skorunu liderlik tablosuna kaydeder.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Evet, Kapat ve Kaydet',
        cancelButtonText: 'İptal'
    }).then((result) => {
        if (result.isConfirmed) {
            // Skoru Kaydet
            Leaderboard.save(GameState.companyName, GameState.score, GameState.turn);
            
            // Başarılı Mesajı ve Reload
            Swal.fire({
                title: 'Oyun Bitti!',
                text: 'Skorunuz başarıyla kaydedildi.',
                icon: 'success',
                confirmButtonText: 'Liderlik Tablosunu Gör'
            }).then(() => {
                // Liderlik tablosunu açıp sayfayı yenilemek yerine,
                // direkt sayfayı yenileyip temiz bir başlangıç sunabiliriz 
                // ya da sadece tabloyu açabiliriz. Genelde oyun bittiği için reload iyidir.
                location.reload();
            });
        }
    });
}

// --- INTRO VIDEO FONKSİYONU (YENİ) ---
function playIntro(onCompleteCallback) {
    const container = document.getElementById('introVideoContainer');
    const video = document.getElementById('introVideo');

    if (!container || !video) {
        // Video yoksa direkt oyunu başlat
        if (onCompleteCallback) onCompleteCallback();
        return;
    }

    // 1. Videoyu Göster
    container.classList.remove('hidden');
    
    // 2. Videoyu Hazırla
    video.currentTime = 0;
    video.volume = 0.5; // Ses seviyesi %50
    video.muted = false; // Sesli oynatmayı dene

    // 3. Oynat ve Bitince Callback Çalıştır
    const finishIntro = () => {
        // Tekrar çalışmasını önle
        video.onended = null;
        video.pause();
        
        // Efektli kapanış
        container.classList.add('animate__animated', 'animate__fadeOut');
        
        // Animasyon bitince gizle ve oyunu başlat
        setTimeout(() => {
            container.classList.add('hidden');
            container.classList.remove('animate__animated', 'animate__fadeOut');
            if (onCompleteCallback) onCompleteCallback();
        }, 500); // 0.5sn fade out süresi
    };

    video.onended = finishIntro;
    
    // Skip fonksiyonunu global yap (Buton için)
    window.skipIntro = finishIntro;

    // Oynatmayı dene (Tarayıcı politikaları bazen sesi engelleyebilir)
    video.play().catch(error => {
        console.log("Otomatik oynatma engellendi, sessiz deneniyor:", error);
        video.muted = true;
        video.play();
    });
}

// --- MANUEL MOD VE METİN ANALİZİ ---

function openManualInput() {
    document.getElementById('manualInputModal').classList.remove('hidden');
}

function closeManualInput() {
    document.getElementById('manualInputModal').classList.add('hidden');
}

function processManualScenarios() {
    const text = document.getElementById('manualScenarioText').value;
    if (!text.trim()) {
        Swal.fire('Hata', 'Lütfen en az bir senaryo yazınız.', 'error');
        return;
    }

    // Yükleniyor efekti
    Swal.fire({
        title: 'Senaryolar Analiz Ediliyor...',
        html: 'Yapay zeka motoru metni işliyor.',
        timer: 1500,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
        }
    }).then(() => {
        // Analiz Başlat
        const scenarios = parseUserText(text);
        
        if (scenarios.length === 0) {
            Swal.fire('Hata', 'Geçerli bir senaryo tespit edilemedi. Lütfen tutar ve anahtar kelime (sermaye, mal, satış vb.) kullandığınızdan emin olun.', 'error');
            return;
        }

        GameState.manualScenariosQueue = scenarios;
        closeManualInput();
        
        // Oyunu Başlat
        playIntro(() => startGame('manual', 'hard')); // Manuel mod genelde zordur
    });
}

// BASİT NLP (DOĞAL DİL İŞLEME) MOTORU
function parseUserText(text) {
    const lines = text.split(/\n|\r\n/).filter(line => line.trim().length > 5);
    const parsedScenarios = [];

    lines.forEach((line, index) => {
        // 1. Tutarı Bul (Sayıları ayıkla, noktaları temizle)
        // Regex: Sayısal değerleri bulur (örn: 500.000, 1000 vb.)
        const numbers = line.match(/(\d{1,3}(\.\d{3})*|\d+)/g);
        let amount = 0;
        if (numbers) {
            // En büyük sayıyı ana tutar olarak al (Genelde doğrudur)
            // Noktaları silip sayıya çevir
            amount = parseFloat(numbers[0].replace(/\./g, ''));
        }

        if (amount === 0) return; // Tutar yoksa geç

        const l = line.toLowerCase();
        let entries = [];

        // 2. Anahtar Kelime Analizi ve Muhasebe Eşleşmesi
        
        // --- KURULUŞ & SERMAYE ---
        if (l.includes('sermaye') || l.includes('kurdu') || l.includes('başla')) {
            entries.push({ code: '500', type: 'credit', amount: amount });
            // Karşı bacak: Nakit mi Banka mı?
            if (l.includes('banka')) entries.push({ code: '102', type: 'debit', amount: amount });
            else entries.push({ code: '100', type: 'debit', amount: amount }); // Varsayılan Kasa
        }
        
        // --- MAL ALIŞI ---
        else if (l.includes('mal') && (l.includes('al') || l.includes('giriş'))) {
            entries.push({ code: '153', type: 'debit', amount: amount });
            entries.push({ code: '191', type: 'debit', amount: amount * 0.2 }); // %20 KDV varsayımı
            const total = amount * 1.2;
            
            if (l.includes('veresiye') || l.includes('borç')) entries.push({ code: '320', type: 'credit', amount: total });
            else if (l.includes('banka') || l.includes('havale')) entries.push({ code: '102', type: 'credit', amount: total });
            else entries.push({ code: '100', type: 'credit', amount: total });
        }

        // --- SATIŞ ---
        else if (l.includes('satış') || l.includes('sattı')) {
            entries.push({ code: '600', type: 'credit', amount: amount });
            entries.push({ code: '391', type: 'credit', amount: amount * 0.2 });
            const total = amount * 1.2;

            if (l.includes('veresiye')) entries.push({ code: '120', type: 'debit', amount: total });
            else if (l.includes('kredi kart')) entries.push({ code: '102', type: 'debit', amount: total }); // Kredi kartı genelde bankaya geçer
            else if (l.includes('banka')) entries.push({ code: '102', type: 'debit', amount: total });
            else entries.push({ code: '100', type: 'debit', amount: total });
        }

        // --- BANKAYA YATIRMA / ÇEKME ---
        else if (l.includes('banka') && l.includes('yatır')) {
            entries.push({ code: '102', type: 'debit', amount: amount });
            entries.push({ code: '100', type: 'credit', amount: amount });
        }
        else if (l.includes('banka') && l.includes('çek')) {
            entries.push({ code: '100', type: 'debit', amount: amount });
            entries.push({ code: '102', type: 'credit', amount: amount });
        }

        // --- GİDER (Kira, Elektrik vb.) ---
        else if (l.includes('gider') || l.includes('kira') || l.includes('fatura') || l.includes('öde')) {
            entries.push({ code: '770', type: 'debit', amount: amount });
            // KDV ihtimali? Basitlik için KDV'siz veya KDV dahil varsayalım,
            // ama genelde gider + KDV olur. Şimdilik düz mantık:
            if(l.includes('banka')) entries.push({ code: '102', type: 'credit', amount: amount });
            else entries.push({ code: '100', type: 'credit', amount: amount });
        }

        // Eğer geçerli bir kayıt oluştuysa listeye ekle
        if (entries.length > 0) {
            parsedScenarios.push({
                id: `manual_${index}`,
                text: line.trim(), // Kullanıcının yazdığı metni olduğu gibi göster
                correctEntries: entries
            });
        }
    });

    return parsedScenarios;
}

// Global'e ekle
window.openManualInput = openManualInput;
window.closeManualInput = closeManualInput;
window.processManualScenarios = processManualScenarios;

// Global'e ekle
window.finishGame = finishGame;

// Global functions
window.addToJournal = addToJournal;
window.removeEntry = removeEntry;
window.saveTransaction = saveTransaction;
window.validateHardMode = validateHardMode;
window.nextTurn = nextTurn;
window.useHelp = useHelp;
window.openHowToPlay = openHowToPlay;
window.closeHowToPlay = closeHowToPlay;
window.openAchievements = openAchievements;
window.closeAchievements = closeAchievements;
window.openLeaderboard = openLeaderboard;
window.closeLeaderboard = closeLeaderboard;
window.openDepreciationModal = openDepreciationModal;
window.closeDepreciationModal = closeDepreciationModal;
window.calculateDepreciation = calculateDepreciation;
window.switchHelpTab = switchHelpTab;