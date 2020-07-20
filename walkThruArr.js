const puppeteer = require("puppeteer");

async function wrapItAll(url) {

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);

  console.log("hello from 2");

  await page.goto(`${url}`);

  await page.type("#signin_username", "mge"); // cred
  await page.type("#signin_password", "steindia12"); // cred

  await Promise.all([page.click("tfoot input"), page.waitForNavigation()]);

  // do stuff
  await page.type("#ly_media_asset_cmt", "autom.");

  try {
    await Promise.all([
      page.click(".sf_admin_action_save input"),
      page.waitForNavigation(),
    ]);
  } catch (err) {
    throw new Error(`Error at save-input: ${err}`);
  }

  await browser.close();
}

exports.data = wrapItAll;
