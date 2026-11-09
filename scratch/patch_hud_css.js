const fs = require('fs');
let css = fs.readFileSync('public/css/hudLevel.css', 'utf8');

const target = `.level-up-claim-btn:active {
  transform: translateY(1px);
}`;

const stylesToAdd = `.level-up-claim-btn:active {
  transform: translateY(1px);
}

/* --- YENİ SEVİYE İLE AÇILAN ÖZELLİKLER (LEVEL UNLOCKS) --- */
.level-up-unlocked-section {
  width: 100%;
  margin-bottom: 20px;
  background: linear-gradient(180deg, rgba(234, 179, 8, 0.12) 0%, rgba(202, 138, 4, 0.05) 100%);
  border: 1.5px solid rgba(234, 179, 8, 0.45);
  border-radius: 16px;
  padding: 12px 14px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35), inset 0 0 15px rgba(234, 179, 8, 0.1);
  animation: levelPopScale 0.35s ease;
}

.level-up-unlocked-title {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.9px;
  color: #facc15;
  text-transform: uppercase;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-shadow: 0 0 10px rgba(250, 204, 21, 0.4);
}

.level-up-unlocked-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 180px;
  overflow-y: auto;
}

.level-up-unlocked-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(234, 179, 8, 0.25);
  border-radius: 12px;
  padding: 8px 12px;
  text-align: left;
  transition: transform 0.15s ease;
}

.level-up-unlocked-item:hover {
  transform: translateX(2px);
  border-color: rgba(234, 179, 8, 0.5);
}

.unlocked-item-icon {
  font-size: 22px;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(234, 179, 8, 0.18);
  border: 1px solid rgba(234, 179, 8, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.unlocked-item-info {
  flex: 1;
  min-width: 0;
}

.unlocked-item-name {
  font-size: 13px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.2px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.unlocked-item-desc {
  font-size: 11px;
  color: #cbd5e1;
  margin-top: 2px;
  line-height: 1.3;
}

.unlocked-item-tag {
  font-size: 9.5px;
  font-weight: 900;
  color: #000000;
  background: #facc15;
  padding: 2px 7px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  box-shadow: 0 2px 6px rgba(234, 179, 8, 0.4);
}`;

const isCRLF = css.includes('\r\n');
const normCss = css.replace(/\r\n/g, '\n');
const normTarget = target.replace(/\r\n/g, '\n');

if (normCss.includes(normTarget)) {
    const updated = normCss.replace(normTarget, stylesToAdd.replace(/\r\n/g, '\n'));
    fs.writeFileSync('public/css/hudLevel.css', isCRLF ? updated.replace(/\n/g, '\r\n') : updated);
    console.log("Successfully updated public/css/hudLevel.css!");
} else {
    console.error("Target not found in hudLevel.css!");
}

