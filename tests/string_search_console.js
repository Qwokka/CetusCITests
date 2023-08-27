import { BaseTest } from '../base_test.js';
import { createGamePage } from '../utils.js';

class Test extends BaseTest {
    name = "String Search (Console)";
    description = "Tests string searching from the Cetus Javascript API";
    usesUi = false;
    instantiationMethods = [ "instantiate" ];

    async run(browser, extPage, method) {
        const gamePage = await createGamePage(browser, "strings", method);

        await extPage.assertUnlocked();
        await gamePage.assertInitialized();

        const searchResults = await gamePage.consoleStringSearch(4);

        let found = false;

        for (const key in searchResults) {
            const string = searchResults[key];

            if (string === "hihellohowareyou") {
                found = true;
                break;
            }
        }

        return found;
    }
};

export default Test;
