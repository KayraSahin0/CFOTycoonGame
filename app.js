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
    currentScenario: null,
    journalEntry: [],
    helpUsed: false
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
});

function initApp() {
    Swal.fire({
        title: 'CFO Tycoon\'a Hoşgeldiniz',
        text: 'Şirketinizin finansal kaderini belirleyin.',
        icon: 'info',
        confirmButtonText: 'Kariyer Modu',
        showDenyButton: true,
        denyButtonText: 'Serbest Mod (Sandbox)',
        allowOutsideClick: false
    }).then((result) => {
        if (result.isConfirmed) {
            startCareerSetup();
        } else if (result.isDenied) {
            startGame('sandbox', 'easy');
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
        
        // Şirket İsmi Sorma Adımı
        const { value: companyName } = await Swal.fire({
            title: 'Şirketine İsim Ver',
            input: 'text',
            inputLabel: 'Şirket Adı (İsteğe Bağlı)',
            inputPlaceholder: 'Örn: Teknoloji A.Ş.',
            showCancelButton: true,
            confirmButtonText: 'Başla',
            cancelButtonText: 'Atla (Varsayılan)',
            inputValidator: (value) => {
                if (value.length > 20) {
                  return 'Şirket ismi çok uzun!';
                }
            }
        });

        GameState.companyName = companyName || 'Girişimci A.Ş.';
        startGame('career', diff);
    });
}

function startGame(mode, difficulty) {
    GameState.mode = mode;
    GameState.difficulty = difficulty;
    GameState.accounts = JSON.parse(JSON.stringify(INITIAL_ACCOUNTS)); // Deep copy
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
        // Company Name zaten set edildi
    }

    updateUI();
    generateNewTurn();
    
    // Select doldur - Sıralı olsun
    const accountSelect = document.getElementById('accountSelect');
    accountSelect.innerHTML = '<option value="">Hesap Seçin...</option>';
    
    // Hesapları koda göre sırala
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

    GameState.currentScenario = ScenarioEngine.generate(GameState.turn, GameState.multiplier);
    
    // UI Güncelle
    document.getElementById('scenarioText').innerText = GameState.currentScenario.text;
    document.getElementById('turnBadge').innerText = `Ay: ${GameState.turn}`;
    document.getElementById('titleBadge').innerText = GameState.title;
    document.getElementById('scoreBadge').innerText = GameState.score;
    document.getElementById('companyNameDisplay').innerText = GameState.companyName;
    
    GameState.journalEntry = [];
    renderJournalTable();
}

function addToJournal() {
    const accCode = document.getElementById('accountSelect').value;
    const type = document.getElementById('entryType').value;
    const amount = parseFloat(document.getElementById('amountInput').value);

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

// --- MODAL FUNCTIONS (NASIL OYNANIR) ---
function openHowToPlay() {
    const modal = document.getElementById('howToPlayModal');
    modal.classList.remove('hidden');
    // Animasyonu tetikle
    const content = modal.querySelector('div');
    content.classList.add('animate__zoomIn');
}

function closeHowToPlay() {
    const modal = document.getElementById('howToPlayModal');
    modal.classList.add('hidden');
}


// --- DOĞRULAMA VE KAYIT ---

function saveTransaction() {
    // 1. İÇERİK KONTROLÜ
    const validationResult = validateTransactionContent();
    if (!validationResult.isValid) {
        Swal.fire({
            title: 'Hatalı Kayıt',
            html: `Yaptığınız kayıt senaryo ile uyuşmuyor.<br><br>
                   <small class="text-slate-400">${validationResult.message}</small>`,
            icon: 'error',
            confirmButtonText: 'Tekrar Dene'
        });
        return; 
    }

    // 2. Skoru Güncelle ve BUTONU KİLİTLE
    if (!GameState.helpUsed) {
        GameState.score += 100 * GameState.multiplier;
        document.getElementById('scoreBadge').innerText = GameState.score;
        
        Swal.fire({
            icon: 'success',
            title: 'Doğru Kayıt!',
            text: `+${100 * GameState.multiplier} Puan kazandınız.`,
            timer: 1500,
            showConfirmButton: false
        });
    }

    // BUTON KİLİTLEME
    const saveBtn = document.getElementById('saveButton');
    saveBtn.disabled = true;
    saveBtn.classList.add('success-locked');
    saveBtn.innerHTML = '<i class="fa-solid fa-check mr-2"></i> Kaydedildi';

    // 3. Hesapları Güncelle (T-Cetvelleri)
    GameState.journalEntry.forEach(entry => {
        const acc = GameState.accounts.find(a => a.code === entry.code);
        
        if (entry.type === 'debit') {
            acc.dr += entry.amount;
            if (acc.type === 'A' || acc.type === 'X') acc.balance += entry.amount;
            else acc.balance -= entry.amount;
        } else {
            acc.cr += entry.amount;
            if (acc.type === 'L' || acc.type === 'E' || acc.type === 'I') acc.balance += entry.amount;
            else acc.balance -= entry.amount;
        }
    });

    // 4. İflas Kontrolü
    const cash = GameState.accounts.find(a => a.code === '100').balance;
    const banks = GameState.accounts.find(a => a.code === '102').balance;
    if (cash + banks < -50000 && GameState.mode === 'career') {
        Swal.fire('İFLAS!', 'Nakit akışını yönetemediniz. Şirket battı.', 'error').then(() => location.reload());
        return;
    }

    // 5. UI Güncelleme
    updateUI();

    if (GameState.difficulty === 'hard') {
        if(GameState.helpUsed) {
             Swal.fire('Bilgi', 'Yardım kullandığınız için raporlar otomatik oluşturuldu.', 'info');
             document.getElementById('validateReportsBtn').classList.add('hidden');
             document.getElementById('nextTurnBtn').classList.remove('hidden');
             renderReports(false);
        } else {
             if (!GameState.helpUsed) {
                Swal.fire({
                    toast: true, position: 'top-end', icon: 'success', 
                    title: 'Defterler işlendi. Raporları doğrulayın.',
                    showConfirmButton: false, timer: 3000
                });
            }
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

    if (userEntries.length !== correctEntries.length) {
        return { isValid: false, message: "Eksik veya fazla satır girdiniz." };
    }

    const sortedUser = [...userEntries].sort((a, b) => a.code.localeCompare(b.code) || a.amount - b.amount);
    const sortedCorrect = [...correctEntries].sort((a, b) => a.code.localeCompare(b.code) || a.amount - b.amount);

    for (let i = 0; i < sortedCorrect.length; i++) {
        const u = sortedUser[i];
        const c = sortedCorrect[i];

        if (u.code !== c.code) {
            return { isValid: false, message: `Beklenen hesap: ${c.code}, Sizin girdiğiniz: ${u.code}` };
        }
        if (u.type !== c.type) {
            return { isValid: false, message: `${u.code} hesabı ${c.type === 'debit' ? 'Borç' : 'Alacak'} çalışmalı.` };
        }
        if (Math.abs(u.amount - c.amount) > 1) {
            return { isValid: false, message: `${u.code} hesabı için tutar hatalı. (Beklenen: ~${formatMoney(c.amount)})` };
        }
    }

    return { isValid: true };
}

// --- REPORTING & VALIDATION ---

function calculateGroupTotal(groupName) {
    return GameState.accounts
        .filter(a => a.group === groupName)
        .reduce((sum, acc) => sum + acc.balance, 0);
}

function calculateNetIncome() {
    const income = calculateGroupTotal('income');
    const expense = calculateGroupTotal('expense');
    return income - expense;
}

function renderReports(isInputMode) {
    const createRow = (label, value) => {
        let valHtml = '';
        if (isInputMode) {
            valHtml = `<input type="number" class="hard-mode-input" data-target="${Math.round(value)}" placeholder="?">`;
        } else {
            valHtml = `<span class="report-value ${value < 0 ? 'text-red-400' : 'text-emerald-400'}">${formatMoney(value)}</span>`;
        }
        return `
            <div class="report-row">
                <span class="report-label">${label}</span>
                ${valHtml}
            </div>
        `;
    };

    // --- Bilanço ---
    const currentAssets = calculateGroupTotal('assets_current');
    const fixedAssets = calculateGroupTotal('assets_fixed');
    const totalAssets = currentAssets + fixedAssets;

    const shortLiab = calculateGroupTotal('liab_short');
    const longLiab = calculateGroupTotal('liab_long');
    const equity = calculateGroupTotal('equity');
    const netIncome = calculateNetIncome(); 
    const totalLiabEquity = shortLiab + longLiab + equity + netIncome;

    let balanceSheetHTML = '';
    balanceSheetHTML += createRow('Dönen Varlıklar', currentAssets);
    balanceSheetHTML += createRow('Duran Varlıklar', fixedAssets);
    balanceSheetHTML += `<div class="report-total"><span>TOPLAM VARLIKLAR</span><span>${isInputMode ? '---' : formatMoney(totalAssets)}</span></div>`;
    
    balanceSheetHTML += '<div class="h-6"></div>'; 
    
    balanceSheetHTML += createRow('Kısa Vadeli Y.K.', shortLiab);
    balanceSheetHTML += createRow('Uzun Vadeli Y.K.', longLiab);
    balanceSheetHTML += createRow('Özkaynaklar', equity);
    balanceSheetHTML += createRow('Dönem Net Karı', netIncome);
    balanceSheetHTML += `<div class="report-total"><span>TOPLAM KAYNAKLAR</span><span>${isInputMode ? '---' : formatMoney(totalLiabEquity)}</span></div>`;

    document.getElementById('balanceSheetContent').innerHTML = balanceSheetHTML;

    // --- Gelir Tablosu ---
    const grossSales = calculateGroupTotal('income');
    const expenses = calculateGroupTotal('expense');
    
    let incomeStatementHTML = '';
    incomeStatementHTML += createRow('Brüt Satışlar', grossSales);
    incomeStatementHTML += createRow('Giderler (-)', expenses); 
    incomeStatementHTML += `<div class="report-total !text-emerald-400 !border-emerald-900/50"><span>NET KAR/ZARAR</span><span>${isInputMode ? '---' : formatMoney(netIncome)}</span></div>`;

    document.getElementById('incomeStatementContent').innerHTML = incomeStatementHTML;
}

function validateHardMode() {
    const inputs = document.querySelectorAll('.hard-mode-input');
    let allCorrect = true;

    inputs.forEach(input => {
        const userVal = parseFloat(input.value);
        const targetVal = parseFloat(input.getAttribute('data-target'));
        const tolerance = Math.abs(targetVal * 0.01) + 1; 
        
        if (!isNaN(userVal) && Math.abs(userVal - targetVal) <= tolerance) {
            input.classList.remove('error');
            input.classList.add('success');
            input.disabled = true; 
        } else {
            input.classList.add('error');
            allCorrect = false;
        }
    });

    if (allCorrect) {
        Swal.fire('Tebrikler CFO!', 'Mali tablolar doğrulandı. Bir sonraki aya geçiliyor.', 'success');
        document.getElementById('validateReportsBtn').classList.add('hidden');
        document.getElementById('nextTurnBtn').classList.remove('hidden');
    } else {
        Swal.fire('Hata', 'Hesaplamalarda yanlışlık var. T-Cetvellerini kontrol edip tekrar dene.', 'error');
    }
}

// --- HELPERS ---

function updateUI() {
    renderLedger();
}

function renderLedger() {
    const container = document.getElementById('ledgerContainer');
    container.innerHTML = '';

    const activeAccounts = GameState.accounts.filter(a => a.dr > 0 || a.cr > 0 || a.balance !== 0);

    if(activeAccounts.length === 0) {
        container.innerHTML = '<div class="text-slate-500 text-center w-full mt-10 italic">Henüz kayıt yok.</div>';
        return;
    }

    activeAccounts.forEach(acc => {
        const div = document.createElement('div');
        div.className = "t-account-card masonry-item animate__animated animate__fadeIn";
        
        const balanceColor = acc.balance < 0 ? 'text-red-400' : 'text-emerald-400';

        div.innerHTML = `
            <div class="t-account">
                <div class="t-header">${acc.code} - ${acc.name}</div>
                <div class="t-body">
                    <div class="t-debit">${acc.dr > 0 ? formatMoney(acc.dr) : '-'}</div>
                    <div class="t-credit">${acc.cr > 0 ? formatMoney(acc.cr) : '-'}</div>
                </div>
                <div class="t-footer ${balanceColor}">
                    <span>Bakiye:</span>
                    <span>${formatMoney(acc.balance)}</span>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function nextTurn() {
    GameState.turn++;
    const saveBtn = document.getElementById('saveButton');
    saveBtn.classList.remove('success-locked');
    saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk mr-2"></i> KONTROL ET & KAYDET';

    generateNewTurn();
    document.getElementById('nextTurnBtn').classList.add('hidden');
    document.querySelectorAll('input').forEach(i => i.value = '');
    
    if(GameState.difficulty === 'hard') {
         document.getElementById('balanceSheetContent').innerHTML = '<div class="text-sm text-slate-500 italic">Veri bekleniyor...</div>';
         document.getElementById('incomeStatementContent').innerHTML = '<div class="text-sm text-slate-500 italic">Veri bekleniyor...</div>';
    } else {
         renderReports(false);
    }
}

function formatMoney(amount) {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
}

// Global functions
window.addToJournal = addToJournal;
window.removeEntry = removeEntry;
window.saveTransaction = saveTransaction;
window.validateHardMode = validateHardMode;
window.nextTurn = nextTurn;
window.useHelp = useHelp;
window.openHowToPlay = openHowToPlay;
window.closeHowToPlay = closeHowToPlay;