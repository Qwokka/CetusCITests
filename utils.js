const sleep = function(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const launchGame = async function(browser, gameUrl) {
    const gamePage = await browser.newPage();
    await gamePage.goto(gameUrl, { waitUntil: 'load' });
    gamePage.bringToFront();

    return gamePage;
}

const getElementProperty = async function(page, selector, propertyName) {
    const element = await page.$(selector);
    const elementProperty = await element.getProperty(propertyName);
    return await elementProperty.jsonValue();
}

export { getElementProperty, sleep, launchGame }
