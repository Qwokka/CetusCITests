import BaseTest from '../base_test.js';
import { sleep, launchGame } from '../utils.js';

class Test extends BaseTest {
    name = "Modify Memory (Console)";
    description = "Tests modifying game memory from the console API";

    async run(browser, extPage) {
        const gamePage = await launchGame(browser, 'http://localhost:8080/main.html');
        await sleep(1000);

        const className = await getElementProperty(extPage, "#lockOverlay", "className");

        if (className.indexOf("overlay") !== -1) {
            return { result: false, failMessage: "Overlay did not unlock. Cetus probably failed to initialize" };
        }

        try {
            const cetusObject = await gamePage.evaluate(function() {
                return cetusInstances;
            });
        } catch (e) {
            return { result: false, failMessage: "Variable \"cetusInstances\" not found. Cetus probably failed to initialize" };
        }

        let searchResults;

        try {
            searchResults = await gamePage.evaluate(function() {
                return cetusInstances.get(1).search("eq", "i32", true, 1234);
            });
        } catch (e) {
            return { result: false, failMessage: "Memory search failed" };
        }

        for (const [key, _] of Object.entries(searchResults.results)) {
            const result = await gamePage.evaluate(function(queryAddress) {
                return cetusInstances.get(1).queryMemory(queryAddress, "i32");
            }, key);

            if (result != 1234) {
                return { result: false, failMessage: "Query memory failed" };
            }
        }

        for (const [key, _] of Object.entries(searchResults.results)) {
            const result = await gamePage.evaluate(function(modifyAddress) {
                cetusInstances.get(1).modifyMemory(modifyAddress, 1337, "i32");
                return cetusInstances.get(1).queryMemory(modifyAddress, "i32");
            }, key);

            if (result != 1337) {
                return { result: false, failMessage: "Modify memory failed" };
            }
        }

        return { result: true };
    }
};

export default Test;
