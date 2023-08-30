import { ArgumentParser } from 'argparse';
import { globSync } from 'glob';
import { ExtensionPage } from './base_test.js';
import puppeteer from 'puppeteer';
import express from 'express';

const PANEL_TYPES = [ "devpanelview.html", "popupview.html" ];
const INSTANTIATE_METHODS = [ "instantiate", "instantiateStreaming" ];

const launchBrowser = async function(cetusDir) {
    const browser = await puppeteer.launch({
        headless: false,
        devtools: true,
        args: [
            "--disable-extensions-except=" + cetusDir,
            "--load-extension=" + cetusDir,
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ],
    });

    return browser;
}

const runTest = async function(currentTest, panelType = null) {
    for (let instantiateMethod of currentTest.instantiationMethods) {
        const browser = await launchBrowser(args.directory, panelType === null ? "devpanel" : panelType);
        const realPanel = panelType === null ? "devpanelview.html" : panelType;

        if (panelType !== null) {
            console.log(`[*] Running test ${currentTest.name} for view \"${panelType}\" and method \"${instantiateMethod}\"`);
        }
        else {
            console.log(`[*] Running test ${currentTest.name} for method \"${instantiateMethod}\"`);
        }

        try {
            const result = await currentTest.run(browser, instantiateMethod, realPanel);

            if (result !== true) {
                throw new Error(result);
            }

            console.log(`[+] Test \"${currentTest.name}\" succeeded`);
        } catch (e) {
            console.error(`[-] Test \"${currentTest.name}\" failed: ${e.message}`);
            console.log(e);

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
    files = [ __dirname + "/tests/" + args.test + ".js" ];
}
else {
    files = globSync(__dirname + "/tests/*.js");
}

const webserver = express(); 

webserver.use(express.static("binaries/build"));
const server = webserver.listen(8080);

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

server.close();
