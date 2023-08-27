import { GamePage } from './base_test.js';

const sleep = function(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const createGamePage = async function(browser, name, method) {
    const url = `http://localhost:8080/run.html?name=${name}&method=${method}`;
    const page = await createPage(browser, url);
    return new GamePage(page);
}

const createPage = async function(browser, url) {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'load' });
    return page;
}

export { createGamePage, createPage, sleep }
