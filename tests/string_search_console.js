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

        let searchResults = await gamePage.consoleStringSearch(4);

        let found = false;

        // First search should found our target string
        for (const key in searchResults) {
            const string = searchResults[key];

            if (string === "hihellohowareyou") {
                found = true;
                break;
            }
        }

        if (!found) {
            throw new Error("String search failed");
        }

        searchResults = await gamePage.consoleStringSearch(20);

        found = false;

        // Second search should not find our target string if minLength is being respected
        for (const key in searchResults) {
            const string = searchResults[key];

            if (string === "hihellohowareyou") {
                found = true;
                break;
            }
        }

        return !found;
    }
};

export default Test;
