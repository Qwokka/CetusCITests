class BaseTest {
    name = "Base Test";
    description = "Base Description";
    failMessage = "Base Fail Message";

    async run(browser, extPage) {
        assert(false);
    }
}

export default BaseTest;
