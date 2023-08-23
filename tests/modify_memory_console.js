import { ExtensionPage, GamePage, BaseTest } from '../base_test.js';
import { createPage } from '../utils.js';

class Test extends BaseTest {
    name = "Modify Memory (Console)";
    description = "Tests modifying game memory from the console API";

    async run(browser, extPage) {
        const newPage = await createPage(browser, 'http://localhost:8080/main.html');
        const gamePage = new GamePage(newPage);

        await extPage.assertUnlocked();
        await gamePage.assertInitialized();

        const searchResults = await gamePage.consoleSearch("eq", "i32", true, 1234);

        for (const [key, _] of Object.entries(searchResults.results)) {
            const result = await gamePage.consoleQueryMemory(key, "i32");

            if (result != 1234) {
                throw new Error("Query memory failed");
            }
        }

        for (const [key, _] of Object.entries(searchResults.results)) {
            await gamePage.consoleModifyMemory(key, 1337, "i32");
            const result = await gamePage.consoleQueryMemory(key, "i32");

            if (result != 1337) {
                throw new Error("Modify memory failed");
            }
        }

        return true;
    }
};

export default Test;
