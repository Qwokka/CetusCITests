import { sleep } from './utils.js';

class BaseTest {
    name = "Base Test";
    description = "Base Description";
    usesUi = true;
    // TODO Also handle "WebAssembly.Module()" combined with "WebAssembly.Instance()"
    instantiationMethods = [ "instantiate", "instantiateStreaming" ];

    async run(browser, extPage, method) {
        assert(false);
    }
}

class WebPage {
    constructor(page) {
        this.page = page;
    }

    async getElement(selector) {
        return await this.page.$(selector);
    }

    async getElements(selector) {
        return await this.page.$$(selector);
    }

    async getElementProperty(selector, propertyName) {
        const element = await this.getElement(selector);
        const elementProperty = await element.getProperty(propertyName);
        return await elementProperty.jsonValue();
    }

    async setElementProperty(selector, propertyName, propertyValue) {
        await this.page.$eval(selector, function(element, propertyName, propertyValue) {
            element.setAttribute(propertyName, propertyValue)
        }, propertyName, propertyValue);
    }

    // Changes the "value" attribute and triggers the "change" event
    async changeInputValue(selector, newValue) {
        await this.page.$eval(selector, function(element, propertyValue) {
            element.value = propertyValue;
            element.dispatchEvent(new Event('change'));
        }, newValue);
    }

    async clickElement(selector) {
        await this.page.$eval(selector, function(element) {
            element.click();
        });
    }
}

class ExtensionPage extends WebPage {
    async assertUnlocked(tryCount = 100) {
        for (let i = 0; i < tryCount; i++) {
            const lockOverlayClassName = await this.getElementProperty("#lockOverlay", "className");

            if (lockOverlayClassName.indexOf("overlay") !== -1) {
                await sleep(100);
                continue;
            }

            return true;
        }

        throw new Error("Extension failed to unlock. Cetus probably failed to initialize");
    }

    // TODO Support changing comparator and type
    async uiSearch(searchValue, waitTime = 1000) {
        this.changeInputValue("#searchParam", searchValue);
        this.clickElement("[name='search']");

        await sleep(waitTime);

        return await this.getElements("[name='saveBtn']");
    }

    async uiRestartSearch() {
        await this.clickElement("#restartBtn");
    }

    // TODO Support changing string type
    async uiStringSearch(minLen, waitTime = 1000) {
        this.changeInputValue("#strMinLength", minLen);
        this.clickElement("[name='stringSearch']");

        await sleep(waitTime)

        const resultTDs = await this.getElements("tr[name='strResultRow']>td");

        const results = [];

        for (let i = 0; i < resultTDs.length; i += 2) {
            const thisResult = {};

            let textProperty = await resultTDs[i].getProperty("innerText");
            thisResult.address = await textProperty.jsonValue();

            textProperty = await resultTDs[i + 1].getProperty("innerText");
            thisResult.value = await textProperty.jsonValue();

            results.push(thisResult);
        }

        return results;
    }

    async getBookmarks() {
        return await this.getElements("#bookmarks tbody>tr");
    }

    async bookmarkToggleFreeze(bookmarkIndex) {
        const realIndex = parseInt(bookmarkIndex) + 1;
        await this.clickElement(`#bookmarks tbody>tr:nth-child(${realIndex})>td:nth-child(3)>button`);
    }

    async modifyBookmarkValue(bookmarkIndex, value) {
        const realIndex = parseInt(bookmarkIndex) + 1;
        await this.changeInputValue(`#bookmarks tbody>tr:nth-child(${realIndex})>td:nth-child(2)>input`, value);
    }
}

class GamePage extends WebPage {
    async assertInitialized(tryCount = 100) {
        for (let i = 0; i < tryCount; i++) {
            try {
                const cetusObject = await this.page.evaluate(function() {
                    return cetusInstances;
                });
            } catch (e) {
                await sleep(100);
                continue;
            }

            return true;
        }

        throw new Error("Variable \"cetusInstances\" not found. Cetus probably failed to initialize");
    }

    async consoleSearch(comparator, type, memAlign, searchParam) {
        try {
            return await this.page.evaluate(function(comparator, type, memAlign, searchParam) {
                return cetusInstances.get(0).search(comparator, type, memAlign, searchParam);
            }, comparator, type, memAlign, searchParam);
        } catch (e) {
            throw new Error("Memory search failed");
        }
    }

    async consoleStringSearch(minLen) {
        try {
            return await this.page.evaluate(function(minLen) {
                return cetusInstances.get(0).strings(minLen);
            }, minLen);
        } catch (e) {
            throw new Error("Memory search failed");
        }
    }

    async consoleQueryMemory(address, type) {
        return await this.page.evaluate(function(queryAddress, type) {
            return cetusInstances.get(0).queryMemory(queryAddress, type);
        }, address, type);
    }

    async consoleModifyMemory(address, value, type) {
        return await this.page.evaluate(function(modifyAddress, value, type) {
            cetusInstances.get(0).modifyMemory(modifyAddress, value, type);
        }, address, value, type);
    }

    async consoleSetSpeedhackMultiplier(multiplier) {
        return await this.page.evaluate(function(multiplier) {
            cetusInstances.get(0).setSpeedhackMultiplier(multiplier);
        }, multiplier);
    }
}

export { BaseTest, WebPage, ExtensionPage, GamePage };
