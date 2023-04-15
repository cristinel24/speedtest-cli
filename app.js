#!/usr/bin/env node
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
}, __ = 0;


function colorize(color, output) {
    return ['\033[', color, 'm', output, '\033[0m'].join('');
}

async function update(index) {

    if (index == 0 && !__) { process.stdout.write(`\n`); __ = 1; }

    switch (index) {
        case 1:
            process.stdout.clearLine(1)
            process.stdout.cursorTo(0);
            process.stdout.write(`${colorize(90, 'Download: ')}`);
            process.stdout.write(`${colorize(32, (stats.down).toFixed(1))}`);
            process.stdout.write(` mb/s`); break;
        case 0:
            process.stdout.clearLine(1)
            process.stdout.cursorTo(0);
            process.stdout.write(`${colorize(90, 'Upload: ')}`);
            process.stdout.write(`${colorize(32, (stats.up).toFixed(1))}`);
            process.stdout.write(` mb/s`); break;
    }

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
            process.stdout.write(`${colorize(90, `\nIPv4: `)}`);
            process.stdout.write(`${colorize(36, stats.user_ip)}\n`);
            process.stdout.write(`${colorize(90, `City: `)}`);
            process.stdout.write(`${colorize(36, stats.city)}\n`);
            process.stdout.write(`${colorize(90, `Provider: `)}`);
            process.stdout.write(`${colorize(36, stats.provider)}\n`);
            break;
        }

        for (propres in result) {
            for (prop in stats) {
                if (prop == propres && result[propres] !== (null && "undefined" && undefined)) {
                    if (prop == 'latency' && stats[prop] == undefined) {
                        process.stdout.write(`${colorize(90, 'Latency: ')}`);
                        process.stdout.write(`${colorize(32, result.latency)}`);
                        process.stdout.write(` ms\n`);
                    }
                    else if (prop == 'jitter' && (stats[prop] == undefined || stats[prop] == 'undefined' || stats[prop] == null)) {
                        process.stdout.write(`${colorize(90, 'Jitter: ')}`);
                        process.stdout.write(`${colorize(32, result.jitter)}`);
                        process.stdout.write(` ms\n`);
                    }
                    else if (stats[prop] && result[propres] && prop == 'down')
                        update(1);
                    else if (stats[prop] && result[propres] && prop == 'up') {
                        update(0);
                    }
                    stats[prop] = result[propres];
                }
            }
        }
    }
    browser.close()
}
console.log("\x1b[2m", ".______________________________________________________.")
console.log("\x1b[2m", "|---------------- Network-SpeedTest CLI ---------------|\x1b[0m")
console.log("\x1b[2m", "| Copyright (c) 2023 Cristian Andrei                   |\x1b[0m")
console.log("\x1b[2m", "|______________________________________________________|\x1b[0m\n")

checkinternet();
