const puppeteer = require('puppeteer');
const walkThruFunc = require('./walkThruArr');
const _ = require('lodash');

const urlArr = [
    "https://www.autoscout24.de/",
    "https://www.amazon.de/autp-Spielzeug/s?k=autp&rh=n%3A12950651",
    "https://de.pons.com/%C3%BCbersetzung/deutsch-franz%C3%B6sisch/das+autp"
];

console.log("Hello from index");
const str = "";
const pos = str.search("von");
const realPos = pos + 4;
console.log(str.substring(realPos, str.length-1));
let arrWithLinks = [];

async function processUrls(URLS) {
    for (let id of URLS) {
        await walkThruFunc.data(`https://ribosom.labamboss.com/ly_media_asset/${id}/edit`);
    }
}

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
  
    // enlarge span for navigation timeout (by default 30.000ms)
    page.setDefaultNavigationTimeout(60000);
  
    // for production
    // await page.goto('https://ribosom.miamed.de/login');
    // for testing via labamboss
    await page.goto("https://ribosom.labamboss.com/");
  
    await page.type("#signin_username", "mge"); // cred
    await page.type("#signin_password", "steindia12"); // cred
  
    await Promise.all([page.click("tfoot input"), page.waitForNavigation()]);
  
    await Promise.all([
      page.click('[href="/ly_media_asset"]'),
      page.waitForNavigation()
    ]);
  
    // await page.select("#ly_media_asset_filters_copyright", "smartzoom"); // 14 pages
    await page.select("#ly_media_asset_filters_copyright", "dr_kissig"); // 8 pages 
    // await page.select("#ly_media_asset_filters_copyright", "smart_in_media"); // 1 page

    
    
    await Promise.all([
        page.click('[value="Filtern"]'),
        page.waitForNavigation()
    ]);

    // GET PAGE AMOUNT TO NAVIGATE THROUGH ALL SEARCH RESULT PAGES:
    const inner_html = await page.evaluate(() => document.querySelector('[colspan="7"]').innerHTML.trim());
    console.log("HERE: ", inner_html);
    const position = inner_html.search("von");
    let pageAmount;
    if (position !== -1) {
        const realPosition = position + 4;
        pageAmount = inner_html.substring(realPosition, inner_html.length-1);
    } else {
        pageAmount = 1;
    }
    console.log("maxPageAmount: ", pageAmount);

    let conditionCheck = false;
    let pageNumber = 2;
    if (conditionCheck && pageAmount > 1) {
        await Promise.all([
            page.goto(`https://ribosom.labamboss.com/ly_media_asset?page=${pageNumber}`),
            page.waitForNavigation() // maybe not needed?
        ]);
        pageNumber++;
        console.log("pageNumber: ", pageNumber);
    }

    // const getThem = await page.$$('.sf_admin_list_td_id a');
    // console.log(getThem.length); // epc. 20

    // WORKS HERE
    // await page.$$eval('.sf_admin_list_td_id a', links => links.forEach(link => console.log("LINK: ", link.innerHTML)));

    // use $$eval and then pageFunction to open each in a neew tab, perfom on the tab, save and close tab, then re-loop).
    // const allLinks = await page.$$('.sf_admin_list_td_id a');
    // console.log(allLinks);
    // for (let link of allLinks) {
    //     const page2 = await browser.newPage();
    //     await page2.goto(`https://ribosom.labamboss.com/ly_media_asset/${link.innerHTML}/edit`);
    //     await page2.bringToFront();
    // }

    // tr y if forEach des not work direclty ino oneliner:
    // async function work link ...
    // const workLink = (linkArr) => {
    //     console.log("L I N K -ARR : ", linkArr);
    //     linkArr.forEach(async (link) => {
    //         console.log("link: ", link.innerHTML);
    //         console.log(`https://ribosom.labamboss.com/ly_media_asset/${link.innerHTML}/edit`);
    //         await Promise.all([page.click(link), page.waitForNavigation()]);

    //         // await page2.goto(`https://ribosom.labamboss.com/ly_media_asset/${link.innerHTML}/edit`);
    //         // await page2.bringToFront();
    //     });
    // };

    // BUILD ONE BIG ARRAY THAT HOLDS ALL PAGE-ARRAYS. A PAGE-ARRAY HOLDS ALL LYMEDIA-IDS FOUND FOR THE GIVEN SEARCH:
    for (let i = 1; i <= pageAmount; i++) {
        await page.goto(`https://ribosom.labamboss.com/ly_media_asset?page=${i}`);
        arrForPush = await page.$$eval('.sf_admin_list_td_id a', links => links.map(link => link.innerHTML));
        arrWithLinks.push(arrForPush);
    }
    const bigArray = _.flatten(arrWithLinks);
    console.log(" -----------HIIIIER 1 -------------" , bigArray.length);
    console.log(" -----------HIIIIER 2 -------------" , bigArray);

    if (bigArray.length >= 1) {
        processUrls(bigArray);
    } else {
        console.log("ZU FRÜH?");
    }

        // link.click();
        // (async () => {
        //     const browser2 = await puppeteer.launch({ headless: false });
        //     const page2 = await browser2.newPage();
          
        //     // enlarge span for navigation timeout (by default 30.000ms)
        //     page2.setDefaultNavigationTimeout(60000);
          
        //     // for production
        //     // await page.goto('https://ribosom.miamed.de/login');
        //     // for testing via labamboss
        //     await page2.goto(`https://ribosom.labamboss.com/ly_media_asset/${link.innerHTML}/edit`);
        // // link.click();
        // // console.log(`https://ribosom.labamboss.com/ly_media_asset/${link.innerHTML}/edit`);
        // // // await page.goto(`https://ribosom.labamboss.com/ly_media_asset/${link.innerHTML}/edit`);
        // // const page2 = browser.newPage();
        // // page2.goto(`https://ribosom.labamboss.com/ly_media_asset/${link.innerHTML}/edit`);
        // // page2.bringToFront();
        // // page2.close();
        // })();
        // await browser.close();
})();
