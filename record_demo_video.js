const path = require('path');
const fs = require('fs');

// Ensure Playwright finds ffmpeg
process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(process.env.USERPROFILE, 'AppData', 'Local', 'ms-playwright');
const { chromium } = require('playwright-core');

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function recordWalkthrough() {
  const outputDir = path.resolve(__dirname, 'demo-video');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🎬 Starting automated browser video recording for Algions SMS...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,720'],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();

  console.log('📍 Scene 1: Application Login & 1-Click Fast Track Reviewer Personas');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await sleep(3000);

  // Smooth scroll on login screen
  await page.evaluate(() => window.scrollBy({ top: 180, behavior: 'smooth' }));
  await sleep(1500);

  console.log('📍 Scene 2: Admin Dashboard (Dr. Arthur Vance)');
  const adminBtn = await page.waitForSelector('button:has-text("Admin (Dr. Vance)")');
  await adminBtn.click();
  await sleep(3500);

  // Smoothly scroll through KPI cards and Recharts charts
  await page.evaluate(() => window.scrollBy({ top: 320, behavior: 'smooth' }));
  await sleep(2500);
  await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
  await sleep(2500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await sleep(1500);

  // Click Academic & Staffing Tab
  const academicTab = await page.$('button:has-text("Academic & Staffing")');
  if (academicTab) {
    await academicTab.click();
    await sleep(2500);
    await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }));
    await sleep(1500);
  }

  // Click Fee Ledger & Reconciliation Tab
  const feesTab = await page.$('button:has-text("Fee Ledger & Reconciliation")');
  if (feesTab) {
    await feesTab.click();
    await sleep(3000);
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await sleep(2000);
  }

  // Click Audit Trail Tab
  const auditTab = await page.$('button:has-text("Audit Trail")');
  if (auditTab) {
    await auditTab.click();
    await sleep(2500);
  }

  console.log('📍 Scene 3: Teacher Portal (Sarah Connor - Scoped Classes)');
  const switchTeacherBtn = await page.waitForSelector('header button:has-text("Teacher (Sarah Connor)")');
  await switchTeacherBtn.click();
  await sleep(3500);

  // View Assigned Classes & Daily Attendance Sheet
  await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
  await sleep(2500);

  // View Marks Entry tab
  const marksTab = await page.$('button:has-text("Marks Entry & Evaluation")');
  if (marksTab) {
    await marksTab.click();
    await sleep(2500);
  }

  console.log('📍 Scene 4: Guardian Portal (Robert Stark - Wards Arya & Bran)');
  const switchGuardianBtn = await page.waitForSelector('header button:has-text("Guardian (Robert Stark)")');
  await switchGuardianBtn.click();
  await sleep(3500);

  // View Academic Report Card
  await page.evaluate(() => window.scrollBy({ top: 280, behavior: 'smooth' }));
  await sleep(2500);

  // View Attendance Record tab
  const guardAttendanceTab = await page.$('button:has-text("Attendance Record")');
  if (guardAttendanceTab) {
    await guardAttendanceTab.click();
    await sleep(2500);
  }

  // View Fee Ledger & Invoices tab
  const guardFeesTab = await page.$('button:has-text("Fee Ledger & Invoices")');
  if (guardFeesTab) {
    await guardFeesTab.click();
    await sleep(2500);

    // Pay simulated invoice
    const payBtn = await page.$('button:has-text("Pay")');
    if (payBtn) {
      await payBtn.click();
      await sleep(1500);
      const closeBtn = await page.$('button:has-text("Cancel"), button:has-text("Close")');
      if (closeBtn) {
        await closeBtn.click();
        await sleep(1000);
      }
    }
  }

  console.log('📍 Scene 5: Swagger / OpenAPI Interactive Documentation');
  await page.goto('http://localhost:5000/api-docs', { waitUntil: 'networkidle' });
  await sleep(3000);
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await sleep(2000);
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await sleep(2000);

  console.log('💾 Finalizing video recording...');
  const video = page.video();
  const videoPath = await video.path();

  await page.close();
  await context.close();
  await browser.close();

  const finalVideoPath = path.resolve(outputDir, 'school-management-system-demo.webm');
  if (fs.existsSync(videoPath)) {
    fs.copyFileSync(videoPath, finalVideoPath);
    console.log('🎉 Demo video generated successfully at:', finalVideoPath);
    const stats = fs.statSync(finalVideoPath);
    console.log(`Video File Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
  }
}

recordWalkthrough().catch(console.error);
