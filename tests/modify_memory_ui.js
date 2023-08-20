import BaseTest from '../base_test.js';
import { getElementProperty, sleep, launchGame } from '../utils.js';

class Test extends BaseTest {
    name = "Modify Memory (UI)";
    description = "Tests modifying game memory from the Cetus UI";

    async run(browser, extPage) {
        const gamePage = await launchGame(browser, 'http://localhost/main.html');
        await sleep(1000);

        const className = await getElementProperty(extPage, "#lockOverlay", "className");

        extPage.bringToFront();

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

        // Input "1234" into search parameter
        try {
            await extPage.evaluate(function() {
                document.getElementById("searchParam").value = "1234";
            });
        } catch (e) {
            return { result: false, failMessage: "Failed to modify \"#searchParam\"" };
        }

        // Press search button
        try {
            await extPage.evaluate(function() {
                document.getElementsByName("search")[0].click();
            });
        } catch (e) {
            return { result: false, failMessage: "Failed to press search button" };
        }

        await sleep(1000);

        const resultsCount = await getElementProperty(extPage, "#resultsTitle", "innerHTML");

        if (resultsCount !== "3 results") {
            return { result: false, failMessage: `Unexpected search result: "${resultsCount}"` };
        }

        let bookmarkAddress;

        // Click bookmark button and get address
        try {
            bookmarkAddress = await extPage.evaluate(function() {
                const saveButton = document.getElementsByName("saveBtn")[2];
                saveButton.click();
                return saveButton.getAttribute("address");
            });
        } catch (e) {
            return { result: false, failMessage: "Failed to add bookmark" };
        }

        await sleep(500);

        // Set watchpoints
        try {
            const result = await extPage.evaluate(function() {
                const bookmarkMenu = document.getElementById("bookmarks");

                if (bookmarkMenu.children[0].tagName !== "TABLE") {
                    return false;
                }

                const bookmarkTable = bookmarkMenu.children[0];
                const tableBody = bookmarkTable.children[1];
                const tableRow = tableBody.children[0];

                const inputField = tableRow.children[1].children[0];
                const freezeButton = tableRow.children[2].children[0];

                freezeButton.click();

                inputField.value = 1337;
                inputField.dispatchEvent(new Event('change'));

                return true;
            });

            if (!result) {
                return { result: false, failMessage: "Failed to set watchpoints" };
            }
        } catch (e) {
            return { result: false, failMessage: "Failed to set watchpoints" };
        }

        await sleep(1500);

        // Test freeze
        try {
            const result = await gamePage.evaluate(function(queryAddress) {
                return cetusInstances.get(1).queryMemory(queryAddress, "i32");
            }, bookmarkAddress);

            if (result !== 1337) {
                return { result: false, failMessage: "Freeze failed" };
            }
        } catch (e) {
            return { result: false, failMessage: "Freeze failed" };
        }

        // Unfreeze
        try {
            const result = await extPage.evaluate(function() {
                const bookmarkMenu = document.getElementById("bookmarks");

                if (bookmarkMenu.children[0].tagName !== "TABLE") {
                    return false;
                }

                const bookmarkTable = bookmarkMenu.children[0];
                const tableBody = bookmarkTable.children[1];
                const tableRow = tableBody.children[0];

                const freezeButton = tableRow.children[2].children[0];

                freezeButton.click();

                return true;
            });

            if (!result) {
                return { result: false, failMessage: "Failed to unfreeze" };
            }
        } catch (e) {
            return { result: false, failMessage: "Failed to unfreeze" };
        }

        await sleep(1500);

        // Test unfreeze
        try {
            const result = await gamePage.evaluate(function(queryAddress) {
                return cetusInstances.get(1).queryMemory(queryAddress, "i32");
            }, bookmarkAddress);

            if (result !== 1234) {
                return { result: false, failMessage: "Unfreeze failed" };
            }
        } catch (e) {
            return { result: false, failMessage: "Unfreeze failed" };
        }

        return { result: true };
    }
};

export default Test;
