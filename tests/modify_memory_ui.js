import { BaseTest } from '../base_test.js';
import { createGamePage, createPage, sleep } from '../utils.js';

class Test extends BaseTest {
    name = "Modify Memory (UI)";
    description = "Tests modifying game memory from the Cetus UI";

    async run(browser, extPage, method) {
        const gamePage = await createGamePage(browser, "simple", method);

        await extPage.assertUnlocked();
        await gamePage.assertInitialized();

        const searchResults = await extPage.uiSearch(1234, 1000);
        if (searchResults.length !== 3) {
            throw new Error("Unexpected search results");
        }

        const bookmarkAddress = await extPage.page.evaluate(function() {
            const saveButton = document.getElementsByName("saveBtn")[2];
            saveButton.click();
            return saveButton.getAttribute("address");
        });

        await sleep(500);

        const bookmarks = await extPage.getBookmarks();
        if (bookmarks.length !== 1) {
            throw new Error("Unexpected bookmark table contents");
        }

        // Freeze and modify value
        await extPage.clickElement("#bookmarks tbody>tr:nth-child(1)>td:nth-child(3)>button");
        await extPage.changeInputValue("#bookmarks tbody>tr:nth-child(1)>td:nth-child(2)>input", "1337");

        await sleep(1500);

        let queryResult = await gamePage.consoleQueryMemory(bookmarkAddress, "i32");
        if (queryResult !== 1337) {
            throw new Error("Memory modification/freeze failed");
        }

        // Unfreeze
        await extPage.clickElement("#bookmarks tbody>tr:nth-child(1)>td:nth-child(3)>button");

        await sleep(1500);

        queryResult = await gamePage.consoleQueryMemory(bookmarkAddress, "i32");
        if (queryResult !== 1234) {
            throw new Error("Memory unfreeze failed");
        }

        return true;
    }
};

export default Test;
