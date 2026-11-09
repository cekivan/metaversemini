const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// 1. levelUpOverlay: add unlocked section
const oldRewardsBox = `        <div class="level-up-rewards-box">
          <div class="level-reward-item reward-money">
            <span class="reward-icon">💵</span>
            <span class="reward-val" id="levelUpRewardMoney">+2.000 TL</span>
          </div>
          <div class="level-reward-item reward-diamond">
            <span class="reward-icon">💎</span>
            <span class="reward-val" id="levelUpRewardDiamonds">+2 Elmas</span>
          </div>
        </div>

        <button id="levelUpClaimBtn" class="level-up-claim-btn">HARİKA, DEVAM ET</button>`;

const newRewardsBox = `        <div class="level-up-rewards-box">
          <div class="level-reward-item reward-money">
            <span class="reward-icon">💵</span>
            <span class="reward-val" id="levelUpRewardMoney">+2.000 TL</span>
          </div>
          <div class="level-reward-item reward-diamond">
            <span class="reward-icon">💎</span>
            <span class="reward-val" id="levelUpRewardDiamonds">+2 Elmas</span>
          </div>
        </div>

        <!-- Açılan Yenilikler Bölümü (Level Unlocks) -->
        <div id="levelUpUnlockedSection" class="level-up-unlocked-section" style="display: none;">
          <div class="level-up-unlocked-title">🔓 YENİ ÖZELLİKLER AÇILDI!</div>
          <div id="levelUpUnlockedBox" class="level-up-unlocked-box"></div>
        </div>

        <button id="levelUpClaimBtn" class="level-up-claim-btn">HARİKA, DEVAM ET</button>`;

// 2. vipClubEntryModal: free entry, Level 2 required
const oldVipModal = `    <!-- VİP CLUB GİRİŞ ONAYI MODALI (1000 TL Ücretli Geçiş) -->
    <div id="vipClubEntryModal" onclick="if(event.target===this)closeVipClubEntryModal()" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(10, 10, 15, 0.88); backdrop-filter: blur(12px); z-index: 10080; justify-content: center; align-items: center;">
        <div style="background: linear-gradient(145deg, #18181b, #09090b); border: 2px solid #eab308; border-radius: 24px; width: 92%; max-width: 480px; padding: 26px 28px; box-shadow: 0 25px 60px rgba(234, 179, 8, 0.25); color: white; display: flex; flex-direction: column; gap: 16px; text-align: center;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 10px; text-align: left;">
                    <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(234, 179, 8, 0.15); border: 1.5px solid #eab308; display: flex; align-items: center; justify-content: center; font-size: 24px;">🚪</div>
                    <div>
                        <div style="font-size: 19px; font-weight: 900; color: #facc15; letter-spacing: 0.5px;">VİP CLUB GİRİŞİ</div>
                        <div style="font-size: 11.5px; color: #94a3b8;">Yeraltı Kulübü & Gizli Karaborsa</div>
                    </div>
                </div>
                <button type="button" onclick="closeVipClubEntryModal()" style="background: transparent; border: none; color: #94a3b8; font-size: 22px; cursor: pointer;">✕</button>
            </div>

            <div style="background: rgba(24, 24, 27, 0.8); border: 1px dashed rgba(234, 179, 8, 0.4); border-radius: 16px; padding: 18px 20px; display: flex; flex-direction: column; gap: 8px;">
                <div style="font-size: 13.5px; color: #cbd5e1; line-height: 1.5;">
                    Bu mekan salaş ve tenha bir yeraltı kulübüdür. İçeride <strong style="color: #facc15;">Tekinsiz Tekin</strong> özel ve yasaklı karaborsa eşyalarını satmaktadır.
                </div>
                <div style="margin-top: 8px; padding: 10px 14px; background: rgba(234, 179, 8, 0.12); border-radius: 12px; border: 1px solid rgba(234, 179, 8, 0.3); font-size: 15px; font-weight: 800; color: #fef08a;">
                    💰 Giriş Ücreti: 1.000 TL
                </div>
            </div>

            <div style="display: flex; gap: 12px; margin-top: 6px;">
                <button type="button" onclick="confirmEnterVipClub()" style="flex: 1; padding: 13px; background: linear-gradient(135deg, #eab308, #ca8a04); border: none; border-radius: 12px; color: black; font-size: 14px; font-weight: 900; cursor: pointer; box-shadow: 0 4px 15px rgba(234, 179, 8, 0.35); transition: transform 0.15s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                    1.000 TL Öde & İçeri Gir
                </button>
                <button type="button" onclick="closeVipClubEntryModal()" style="flex: 1; padding: 13px; background: rgba(39, 39, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 12px; color: #cbd5e1; font-size: 13.5px; font-weight: 700; cursor: pointer;">
                    Vazgeç
                </button>
            </div>
        </div>
    </div>`;

const newVipModal = `    <!-- VİP CLUB GİRİŞ ONAYI MODALI (Seviye 2+ Ücretsiz Geçiş) -->
    <div id="vipClubEntryModal" onclick="if(event.target===this)closeVipClubEntryModal()" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(10, 10, 15, 0.88); backdrop-filter: blur(12px); z-index: 10080; justify-content: center; align-items: center;">
        <div style="background: linear-gradient(145deg, #18181b, #09090b); border: 2px solid #eab308; border-radius: 24px; width: 92%; max-width: 480px; padding: 26px 28px; box-shadow: 0 25px 60px rgba(234, 179, 8, 0.25); color: white; display: flex; flex-direction: column; gap: 16px; text-align: center;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 10px; text-align: left;">
                    <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(234, 179, 8, 0.15); border: 1.5px solid #eab308; display: flex; align-items: center; justify-content: center; font-size: 24px;">🚪</div>
                    <div>
                        <div style="font-size: 19px; font-weight: 900; color: #facc15; letter-spacing: 0.5px;">VİP CLUB GİRİŞİ</div>
                        <div style="font-size: 11.5px; color: #94a3b8;">Yeraltı Kulübü & Gizli Karaborsa</div>
                    </div>
                </div>
                <button type="button" onclick="closeVipClubEntryModal()" style="background: transparent; border: none; color: #94a3b8; font-size: 22px; cursor: pointer;">✕</button>
            </div>

            <div style="background: rgba(24, 24, 27, 0.8); border: 1px dashed rgba(234, 179, 8, 0.4); border-radius: 16px; padding: 18px 20px; display: flex; flex-direction: column; gap: 8px;">
                <div style="font-size: 13.5px; color: #cbd5e1; line-height: 1.5;">
                    Bu mekan salaş ve tenha bir yeraltı kulübüdür. İçeride <strong style="color: #facc15;">Tekinsiz Tekin</strong> özel ve yasaklı karaborsa eşyalarını satmaktadır.
                </div>
                <div style="margin-top: 8px; padding: 10px 14px; background: rgba(34, 197, 94, 0.15); border-radius: 12px; border: 1px solid rgba(34, 197, 94, 0.4); font-size: 14.5px; font-weight: 800; color: #86efac;">
                    ✨ Giriş Şartı: En Az Seviye 2 (Giriş Ücretsiz!)
                </div>
            </div>

            <div style="display: flex; gap: 12px; margin-top: 6px;">
                <button type="button" onclick="confirmEnterVipClub()" style="flex: 1; padding: 13px; background: linear-gradient(135deg, #eab308, #ca8a04); border: none; border-radius: 12px; color: black; font-size: 14px; font-weight: 900; cursor: pointer; box-shadow: 0 4px 15px rgba(234, 179, 8, 0.35); transition: transform 0.15s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                    Kulübe Gir (Ücretsiz)
                </button>
                <button type="button" onclick="closeVipClubEntryModal()" style="flex: 1; padding: 13px; background: rgba(39, 39, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 12px; color: #cbd5e1; font-size: 13.5px; font-weight: 700; cursor: pointer;">
                    Vazgeç
                </button>
            </div>
        </div>
    </div>`;

// 3. tekinsizTekinModal header: diamonds and level
const oldTekinHeader = `                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="background: rgba(39, 39, 42, 0.8); border: 1.5px solid #ca8a04; border-radius: 12px; padding: 6px 14px; text-align: right;">
                        <div style="font-size: 10px; color: #a1a1aa; font-weight: 700; text-transform: uppercase;">Mevcut Paran</div>
                        <div id="tekinShopUserMoney" style="font-size: 15px; font-weight: 900; color: #fef08a;">0 TL</div>
                    </div>
                    <button type="button" onclick="closeTekinsizTekinModal()" style="background: rgba(39, 39, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 10px; width: 34px; height: 34px; color: #d4d4d8; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
                </div>`;

const newTekinHeader = `                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="background: rgba(39, 39, 42, 0.8); border: 1.5px solid #ca8a04; border-radius: 12px; padding: 6px 12px; text-align: right;">
                        <div style="font-size: 10px; color: #a1a1aa; font-weight: 700; text-transform: uppercase;">Seviye</div>
                        <div id="tekinShopUserLevel" style="font-size: 14px; font-weight: 900; color: #60a5fa;">Lv 1</div>
                    </div>
                    <div style="background: rgba(39, 39, 42, 0.8); border: 1.5px solid #38bdf8; border-radius: 12px; padding: 6px 12px; text-align: right;">
                        <div style="font-size: 10px; color: #38bdf8; font-weight: 700; text-transform: uppercase;">Elmas</div>
                        <div id="tekinShopUserDiamonds" style="font-size: 14px; font-weight: 900; color: #bae6fd;">0 💎</div>
                    </div>
                    <div style="background: rgba(39, 39, 42, 0.8); border: 1.5px solid #ca8a04; border-radius: 12px; padding: 6px 14px; text-align: right;">
                        <div style="font-size: 10px; color: #a1a1aa; font-weight: 700; text-transform: uppercase;">Mevcut Paran</div>
                        <div id="tekinShopUserMoney" style="font-size: 14px; font-weight: 900; color: #fef08a;">0 TL</div>
                    </div>
                    <button type="button" onclick="closeTekinsizTekinModal()" style="background: rgba(39, 39, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 10px; width: 34px; height: 34px; color: #d4d4d8; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
                </div>`;

const isCRLF = html.includes('\r\n');
const normHtml = html.replace(/\r\n/g, '\n');

let updated = normHtml;
if (normHtml.includes(oldRewardsBox.replace(/\r\n/g, '\n'))) {
    updated = updated.replace(oldRewardsBox.replace(/\r\n/g, '\n'), newRewardsBox.replace(/\r\n/g, '\n'));
    console.log("1. Level Up rewards box updated!");
} else {
    console.error("1. Level Up rewards box NOT found!");
}

if (normHtml.includes(oldVipModal.replace(/\r\n/g, '\n'))) {
    updated = updated.replace(oldVipModal.replace(/\r\n/g, '\n'), newVipModal.replace(/\r\n/g, '\n'));
    console.log("2. VIP Club modal updated!");
} else {
    console.error("2. VIP Club modal NOT found!");
}

if (normHtml.includes(oldTekinHeader.replace(/\r\n/g, '\n'))) {
    updated = updated.replace(oldTekinHeader.replace(/\r\n/g, '\n'), newTekinHeader.replace(/\r\n/g, '\n'));
    console.log("3. Tekin modal header updated!");
} else {
    console.error("3. Tekin modal header NOT found!");
}

fs.writeFileSync('public/index.html', isCRLF ? updated.replace(/\n/g, '\r\n') : updated);
console.log("Done updating public/index.html!");

