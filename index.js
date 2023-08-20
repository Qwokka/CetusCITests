import { ArgumentParser } from 'argparse';
import { globSync } from 'glob';
import puppeteer from 'puppeteer';

const checkTestResult = function(condition, test, failMessage) {
    if (condition !== true) {
        console.error(`[-] Test \"${test.name}\" failed: ${failMessage}`);

        if (!args.continueAfterFail) {
            process.exit();
        }
    }
    else {
        console.log(`[+] Test \"${test.name}\" succeeded`);
    }
}

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

    const extPage = await browser.newPage();
    const extensionUrl = `chrome-extension://${extensionId}/extension/devpanelview.html`;
    await extPage.goto(extensionUrl, { waitUntil: 'load' });

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
    const { result, failMessage }  = await currentTest.run(browser, extPage);
    checkTestResult(result, currentTest, failMessage);

    await browser.close();
}
