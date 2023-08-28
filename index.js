import { ArgumentParser } from 'argparse';
import { globSync } from 'glob';
import { ExtensionPage } from './base_test.js';
import { createPage } from './utils.js';
import puppeteer from 'puppeteer';

const PANEL_TYPES = [ "devpanel", "popup" ];
const INSTANTIATE_METHODS = [ "instantiate", "instantiateStreaming" ];

const launchBrowser = async function(cetusDir, type) {
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            "--disable-extensions-except=" + cetusDir,
            "--load-extension=" + cetusDir,
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ],
    });

    const targets = await browser.targets();
    const extensionTarget = targets.find(target => target.url().includes('chrome-extension'));
    const partialExtensionUrl = extensionTarget.url() || '';
    const extensionId = partialExtensionUrl.split('/')[2];

    let extensionUrl;

    if (type === "devpanel") {
        extensionUrl = `chrome-extension://${extensionId}/extension/devpanelview.html`;
    }
    else if (type === "popup") {
        extensionUrl = `chrome-extension://${extensionId}/extension/popupview.html`;
    }
    else {
        throw new Error(`Unexpected type: \"${type}\"`);
    }

    const newPage = await createPage(browser, extensionUrl);
    const extPage = new ExtensionPage(newPage);

    return {
        browser,
        extPage,
    };
}

const runTest = async function(currentTest, panelType = null) {
    for (let instantiateMethod of currentTest.instantiationMethods) {
        const { browser, extPage } = await launchBrowser(args.directory, panelType === null ? "devpanel" : panelType);

        if (panelType !== null) {
            console.log(`[*] Running test ${currentTest.name} for view \"${panelType}\" and method \"${instantiateMethod}\"`);
        }
        else {
            console.log(`[*] Running test ${currentTest.name} for method \"${instantiateMethod}\"`);
        }

        try {
            const result = await currentTest.run(browser, extPage, instantiateMethod);

            if (result !== true) {
                throw new Error(result);
            }

            console.log(`[+] Test \"${currentTest.name}\" succeeded`);
        } catch (e) {
            console.error(`[-] Test \"${currentTest.name}\" failed: ${e.message}`);

            if (!args.continueAfterFail) {
                process.exit(1);
            }
        }

        await browser.close();
    }
}

const argParser = new ArgumentParser({
    description: "Regression testing for Cetus (https://github.com/Qwokka/Cetus)"
});

argParser.add_argument('-d', '--directory', { help: "Path to Cetus directory", required: true });
argParser.add_argument('-t', '--test', { help: "Run a single test" });
argParser.add_argument('-c', '--continue', { help: "Do not abort on failed test", action: "store_true", dest: "continueAfterFail" });

const args = argParser.parse_args();

let files;

if (args.test) {
    files = [ "./tests/" + args.test + ".js" ];
}
else {
    files = globSync("./tests/*.js");
}

for (let i = 0; i < files.length; i++) {
    const thisFile = files[i];

    const Test = (await import(`./${thisFile}`)).default;
    const currentTest = new Test();

    // If the test requires the UI, we run it twice (Once per view)
    if (currentTest.usesUi) {
        for (let panelType of PANEL_TYPES) {
            await runTest(currentTest, panelType)
        }
    }
    else {
        await runTest(currentTest)
    }
}
