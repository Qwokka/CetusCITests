const sleep = function(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const createPage = async function(browser, url) {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'load' });
    return page;
}

export { sleep, createPage }
