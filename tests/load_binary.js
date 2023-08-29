import { BaseTest } from '../base_test.js';
import { createGameAndExtPages } from '../utils.js';

class Test extends BaseTest {
    name = "Load Binary";
    description = "Tests loading WASM binary with each instantiation type";
    usesUi = false;
    instantiationMethods = [ "instantiate", "instantiateStreaming" ];

    async run(browser, method, panelType) {
        const { gamePage, extPage } = await createGameAndExtPages(browser, "simple", method, panelType);

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
