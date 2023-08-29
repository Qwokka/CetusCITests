// Note the extra "c" in "ExcecutionContext" (Should probably submit a pull request :) )
import { getDevtoolsPanel, setCaptureContentScriptExecutionContexts, getContentScriptExcecutionContext } from 'puppeteer-devtools'
import { GamePage, ExtensionPage } from './base_test.js'


const sleep = function(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const createGameAndExtPages = async function(browser, name, method, panelName = "devpanelview.html") {
    const url = `http://localhost:8080/run.html?name=${name}&method=${method}`;

    const [ game ] = await browser.pages();
    await setCaptureContentScriptExecutionContexts(game);
    await game.goto(url, { waitUntil: 'networkidle0' })

    const ext = await getDevtoolsPanel(game, { panelName: 'devpanelview.html' });
    const contentScriptExecutionContext = await getContentScriptExcecutionContext(game);

    const gamePage = new GamePage(game);
    const extPage = new ExtensionPage(ext);
    
    return {
        gamePage,
        extPage
    };
}

export { createGameAndExtPages, sleep }
