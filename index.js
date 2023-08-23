import { ArgumentParser } from 'argparse';
import { globSync } from 'glob';
import { ExtensionPage } from './base_test.js';
import { createPage } from './utils.js';
import puppeteer from 'puppeteer';

const launchBrowser = async function(cetusDir) {
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

    const extensionUrl = `chrome-extension://${extensionId}/extension/devpanelview.html`;
    const newPage = await createPage(browser, extensionUrl);
    const extPage = new ExtensionPage(newPage);

    return {
        browser,
        extPage,
    };
}

const argParser = new ArgumentParser({
    description: "Regression testing for Cetus (https://github.com/Qwokka/Cetus)"
});

argParser.add_argument('-d', '--directory', { help: "Path to Cetus directory", required: true });
argParser.add_argument('-c', '--continue', { help: "Do not abort on failed test", action: "store_true", dest: "continueAfterFail" });

const args = argParser.parse_args();

const files = globSync("./tests/*.js");

for (let i = 0; i < files.length; i++) {
    const thisFile = files[i];

    const { browser, extPage } = await launchBrowser(args.directory);

    const Test = (await import(`./${thisFile}`)).default;
    const currentTest = new Test();

    console.log(`[*] Running test ${currentTest.name}`);

    try {
        const result = await currentTest.run(browser, extPage);

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

process.exit(0);
