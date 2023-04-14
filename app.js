const puppeteer = require('puppeteer')
const url = 'https://rcs-rds.speedtestcustom.com/'
let stats = {
    latency: undefined,
    jitter: undefined,
    down: undefined,
    up: undefined,
    user_ip: undefined,
    city: undefined,
    provider: undefined,
    isDone: false
};

async function update() {
    console.clear();
    console.log(stats);
}

async function checkinternet() {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })

    page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const element = await page.waitForSelector('#main-content > div.button__wrapper > div > button');
    await element.click();

    await page.setRequestInterception(true)

    page.on('request', (request) => {
        if (request.resourceType() === 'image') request.abort()
        else request.continue()
    })

    while (true) {
        const result = await page.evaluate(() => {
            const select_data = document.querySelector.bind(document);
            return {
                latency: Number(select_data('#root > div > div.test.test--download.test--in-progress > div.container > main > div > div.results-latency > div.result-tile.result-tile-ping > div.result-body > div > div > span')?.textContent) || undefined,
                jitter: Number(select_data('#root > div > div.test.test--download.test--in-progress > div.container > main > div > div.results-latency > div.result-tile.result-tile-jitter > div.result-body > div > div > span')?.textContent) || undefined,
                down: Number(select_data("#root > div > div.test.test--download.test--in-progress > div.container > main > div > div.results-speed > div.result-tile.result-active-test.result-tile-download > div.result-body > div > div > span")?.textContent) || undefined,
                up: Number(select_data("#root > div > div.test.test--upload.test--in-progress > div.container > main > div > div.results-speed > div.result-tile.result-active-test.result-tile-upload > div.result-body > div > div > span")?.textContent) || undefined,
                user_ip: select_data("#root > div > div.test.test--finished.test--in-progress > div.container > footer > div.host-display-transition > div > div.host-display__connection.host-display__connection--isp > div.host-display__connection-body > h4")?.textContent || undefined,
                city: select_data("#root > div > div.test.test--finished.test--in-progress > div.container > footer > div.host-display-transition > div > div.host-display__connection.host-display__connection--sponsor > div.host-display__connection-body > h4 > span")?.textContent || undefined,
                provider: select_data("#root > div > div.test.test--finished.test--in-progress > div.container > footer > div.host-display-transition > div > div.host-display__connection.host-display__connection--sponsor > div.host-display__connection-body > h3 > span")?.textContent || undefined,
                isDone: select_data("#copyLink > span")?.textContent || Boolean(false)
            }
        })

        update();

        if (stats.isDone != false) {
            stats.isDone = true;
            update();
            break;
        }
        for (propres in result) 
            for (prop in stats) 
                if (prop == propres && result[propres] !== (null && "undefined" && false && undefined)) 
                    stats[prop] = result[propres];    
    }
}

checkinternet();


