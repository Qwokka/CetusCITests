import { BaseTest } from '../base_test.js';
import { createGamePage } from '../utils.js';

class Test extends BaseTest {
    name = "String Search (UI)";
    description = "Tests string searching from the Cetus Javascript API";
    usesUi = true;
    instantiationMethods = [ "instantiate" ];

    async run(browser, extPage, method) {
        const gamePage = await createGamePage(browser, "strings", method);

        await extPage.assertUnlocked();
        await gamePage.assertInitialized();

        let searchResults = await extPage.uiStringSearch(4);

        if (searchResults.length !== 4) {
            throw new Error("Unexpected string search results");
        }

        for (const result of searchResults) {
            if (result.address === "0x00000400" && result.value === "hihellohowareyou") {
                return true;
            }
        }

        return false;
    }
};

export default Test;
