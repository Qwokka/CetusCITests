import { BaseTest } from '../base_test.js';
import { createGamePage, sleep } from '../utils.js';

const MEMORY_ADDR = 0x00500d50;

class Test extends BaseTest {
    name = "Speedhack (Console)";
    description = "Tests speedhack from the Cetus Javascript API";
    usesUi = false;
    instantiationMethods = [ "instantiate" ];

    async run(browser, extPage, method) {
        const gamePage = await createGamePage(browser, "speedhack", method);

        await extPage.assertUnlocked();
        await gamePage.assertInitialized();

        await gamePage.consoleModifyMemory(MEMORY_ADDR, "1337", "i32");

        await sleep(1500);

        let resetValue = await gamePage.consoleQueryMemory(MEMORY_ADDR, "i32");
        if (resetValue !== 1234) {
            throw new Error("Unexpected value after modifying memory (step 1): " + resetValue);
        }

        await gamePage.consoleSetSpeedhackMultiplier(10);

        await gamePage.consoleModifyMemory(MEMORY_ADDR, "1337", "i32");
        await sleep(150);

        resetValue = await gamePage.consoleQueryMemory(MEMORY_ADDR, "i32");
        if (resetValue !== 1234) {
            throw new Error("Unexpected value after modifying memory (step 2): " + resetValue);
        }

        await gamePage.consoleSetSpeedhackMultiplier(1);
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
