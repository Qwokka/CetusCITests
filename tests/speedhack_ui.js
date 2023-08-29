import { BaseTest } from '../base_test.js';
import { createGameAndExtPages, sleep } from '../utils.js';

const MEMORY_ADDR = 0x00500d50;

class Test extends BaseTest {
    name = "Speedhack (UI)";
    description = "Tests speedhack from the user interface";
    usesUi = true;
    instantiationMethods = [ "instantiate" ];

    async run(browser, method, panelType) {
        const { gamePage, extPage } = await createGameAndExtPages(browser, "speedhack", method, panelType);

        await extPage.assertUnlocked();
        await gamePage.assertInitialized();

        await gamePage.consoleModifyMemory(MEMORY_ADDR, "1337", "i32");

        await sleep(1500);

        let resetValue = await gamePage.consoleQueryMemory(MEMORY_ADDR, "i32");
        if (resetValue !== 1234) {
            throw new Error("Unexpected value after modifying memory (step 1): " + resetValue);
        }

        await extPage.uiToggleSpeedhack(10);

        await gamePage.consoleModifyMemory(MEMORY_ADDR, "1337", "i32");
        await sleep(150);

        resetValue = await gamePage.consoleQueryMemory(MEMORY_ADDR, "i32");
        if (resetValue !== 1234) {
            throw new Error("Unexpected value after modifying memory (step 2): " + resetValue);
        }

        await extPage.uiToggleSpeedhack();
        await gamePage.consoleModifyMemory(MEMORY_ADDR, "1337", "i32");
        await sleep(150);

        resetValue = await gamePage.consoleQueryMemory(MEMORY_ADDR, "i32");
        if (resetValue !== 1337) {
            throw new Error("Unexpected value after modifying memory (step 3): " + resetValue);
        }

        await sleep(1350);

        resetValue = await gamePage.consoleQueryMemory(MEMORY_ADDR, "i32");
        if (resetValue !== 1234) {
            throw new Error("Unexpected value after modifying memory (step 4): " + resetValue);
        }

        return true;
    }
};

export default Test;
