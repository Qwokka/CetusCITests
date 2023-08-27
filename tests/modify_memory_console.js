import { BaseTest } from '../base_test.js';
import { createGamePage } from '../utils.js';

class Test extends BaseTest {
    name = "Modify Memory (Console)";
    description = "Tests modifying game memory from the console API";
    usesUi = false;
    instantiationMethods = [ "instantiate" ];

    async run(browser, extPage, method) {
        const gamePage = await createGamePage(browser, "simple", method);

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
