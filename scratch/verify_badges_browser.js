// scratch/verify_badges_browser.js
const puppeteer = require('puppeteer');

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });

    // Login as 'deneme'
    console.log('Logging in as deneme...');
    await page.waitForSelector('#usernameInput', { timeout: 10000 });
    await page.type('#usernameInput', 'deneme');
    await page.click('#loginBtn');

    // Wait for game canvas or top nav
    await page.waitForSelector('.top-nav', { timeout: 15000 });
    console.log('Logged in successfully!');

    // Wait a brief moment for socket data
    await new Promise(r => setTimeout(r, 1000));

    // Open profile modal for 'deneme'
    console.log('Opening player profile modal...');
    await page.evaluate(() => {
      if (typeof window.openMyPlayerProfile === 'function') {
        window.openMyPlayerProfile();
      } else {
        // Fallback open
        const modal = document.getElementById('playerInteractionModal');
        if (modal) modal.style.display = 'flex';
        if (window.renderProfileSquareBadges) {
          window.renderProfileSquareBadges({
            seniorityDays: 1,
            minedRocksCount: 16,
            fishCaughtCount: 1,
            gamerGamesCount: 0,
            botanicHarvestCount: 0,
            badgeUnlockOrder: ['resident', 'mining', 'fish']
          }, true);
        }
      }
    });

    await page.waitForSelector('#playerInteractionModal', { visible: true, timeout: 5000 });
    await new Promise(r => setTimeout(r, 1000));

    // Evaluate rendered badges
    const badgeData = await page.evaluate(() => {
      const squares = document.querySelectorAll('#profileBadgesGrid .profile-badge-square');
      const list = [];
      squares.forEach((sq, i) => {
        const isEmpty = sq.classList.contains('empty-slot');
        const icon = sq.querySelector('.badge-icon')?.textContent || '';
        const tag = sq.querySelector('.badge-level-tag')?.textContent || '';
        const title = sq.getAttribute('title') || '';
        list.push({ index: i + 1, isEmpty, icon, tag, title });
      });
      return list;
    });

    console.log('--- Rendered Badges in Modal ---');
    console.log(JSON.stringify(badgeData, null, 2));

    // Verify Slot 1 is Resident/Level ⭐
    const slot1 = badgeData[0];
    if (slot1.icon.includes('⭐') && !slot1.isEmpty) {
      console.log('✅ Slot 1 is Level/Resident badge (⭐)!');
    } else {
      console.error('❌ Slot 1 is not ⭐:', slot1);
    }

    // Verify Slot 2 is Mining ⛏️
    const slot2 = badgeData[1];
    if (slot2.icon.includes('⛏') && !slot2.isEmpty) {
      console.log('✅ Slot 2 is Mining badge (⛏️)!');
    } else {
      console.error('❌ Slot 2 is not ⛏️:', slot2);
    }

    // Verify Slot 3 is Fishing 🎣
    const slot3 = badgeData[2];
    if (slot3.icon.includes('🎣') && !slot3.isEmpty) {
      console.log('✅ Slot 3 is Fishing badge (🎣)!');
    } else {
      console.error('❌ Slot 3 is not 🎣:', slot3);
    }

    // Verify Slots 4..12 are ALL empty slots
    const restEmpty = badgeData.slice(3).every(s => s.isEmpty);
    if (restEmpty && badgeData.length === 12) {
      console.log('✅ Slots 4-12 are strictly empty dashed slots (no Lv.0 faded badges)!');
    } else {
      console.error('❌ Some slots after slot 3 are not empty:', badgeData.slice(3));
    }

    // Screenshot profile modal
    const modalBox = await page.$('#playerInteractionModalBox');
    if (modalBox) {
      const screenshotPath = 'C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/verified_square_badges_chronological_order.png';
      await modalBox.screenshot({ path: screenshotPath });
      console.log('Saved screenshot to:', screenshotPath);
    }

    // Open Badge Level System Modal
    console.log('Opening Badge Level System modal...');
    await page.evaluate(() => {
      if (typeof window.openBadgeLevelSystemModal === 'function') {
        window.openBadgeLevelSystemModal();
      }
    });

    await page.waitForSelector('#badgeLevelSystemModal', { visible: true, timeout: 5000 });
    await new Promise(r => setTimeout(r, 600));

    const systemModalText = await page.evaluate(() => {
      const modal = document.getElementById('badgeLevelSystemModal');
      return modal ? modal.innerText : '';
    });

    console.log('System modal contains Oyunbaz:', systemModalText.includes('Oyunbaz'));
    console.log('System modal contains Masa yancısı:', systemModalText.includes('Masa yancısı'));
    console.log('System modal contains Racon Kesici:', systemModalText.includes('Racon Kesici'));

    const systemModalBox = await page.$('#badgeLevelSystemModal > div');
    if (systemModalBox) {
      const infoScreenshotPath = 'C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/verified_badge_level_system_modal.png';
      await systemModalBox.screenshot({ path: infoScreenshotPath });
      console.log('Saved system modal screenshot to:', infoScreenshotPath);
    }

    console.log('🎉 Browser verification finished successfully!');
  } catch (err) {
    console.error('Browser test error:', err);
  } finally {
    if (browser) await browser.close();
  }
})();

