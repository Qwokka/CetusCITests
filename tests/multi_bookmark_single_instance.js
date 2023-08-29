import { BaseTest } from '../base_test.js';
import { createGameAndExtPages, sleep } from '../utils.js';

class Test extends BaseTest {
    name = "Multi Bookmark / Single Instance";
    description = "Tests setting multiple bookmarks in a single WASM instance";
    usesUi = true;
    instantiationMethods = [ "instantiate" ];

    async run(browser, method, panelType) {
        const { gamePage, extPage } = await createGameAndExtPages(browser, "multivalue", method, panelType);

        await extPage.assertUnlocked();
        await gamePage.assertInitialized();

        let searchResults = await extPage.uiSearch(1234);

        if (searchResults.length != 2) {
            throw new Error("Unexpected search results (step 1)");
        }

        const bookmarkAddress1234 = await extPage.page.evaluate(function() {
            const saveButton = document.getElementsByName("saveBtn")[1];
            saveButton.click();
            return saveButton.getAttribute("address");
        });

        await extPage.uiRestartSearch();

        searchResults = await extPage.uiSearch(2345);

        if (searchResults.length != 3) {
            throw new Error("Unexpected search results (step 2)");
        }

        const bookmarkAddress2345 = await extPage.page.evaluate(function() {
            const saveButton = document.getElementsByName("saveBtn")[2];
            saveButton.click();
            return saveButton.getAttribute("address");
        });

        await extPage.bookmarkToggleFreeze(1);
        await extPage.modifyBookmarkValue(1, 1111);

        await sleep(1100);

        let queryResult = await gamePage.consoleQueryMemory(bookmarkAddress1234, "i32");
        if (queryResult !== 1111) {
            throw new Error("Memory freeze failed");
        }

        await extPage.bookmarkToggleFreeze(0);
        await extPage.modifyBookmarkValue(0, 2222);

        await sleep(1100);

        queryResult = await gamePage.consoleQueryMemory(bookmarkAddress2345, "i32");
        if (queryResult !== 2222) {
            throw new Error("Memory freeze failed");
        }

        await extPage.bookmarkToggleFreeze(1);

        await sleep(1100);

        queryResult = await gamePage.consoleQueryMemory(bookmarkAddress1234, "i32");
        if (queryResult !== 1234) {
            throw new Error("Memory freeze failed");
        }
        queryResult = await gamePage.consoleQueryMemory(bookmarkAddress2345, "i32");
        if (queryResult !== 2222) {
            throw new Error("Memory freeze failed");
        }

        await extPage.bookmarkToggleFreeze(0);

        await sleep(1100);

        queryResult = await gamePage.consoleQueryMemory(bookmarkAddress1234, "i32");
        if (queryResult !== 1234) {
            throw new Error("Memory freeze failed");
        }
        queryResult = await gamePage.consoleQueryMemory(bookmarkAddress2345, "i32");
        if (queryResult !== 2345) {
            throw new Error("Memory freeze failed");
        }

        return true;
    }
};

export default Test;
