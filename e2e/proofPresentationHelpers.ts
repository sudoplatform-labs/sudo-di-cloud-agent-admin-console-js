import { By, until } from 'selenium-webdriver';
import {
  e2eActivateTableRowDropdownAction,
  e2eEnterDatePickerDetails,
  e2eExecuteTableRowDropdownAction,
  e2eNavigateToCard,
  e2eWaitElementVisible,
} from './commonHelpers';
import { driver } from './setup-tests';

export const ppWaitDefault = 20000;

/**
 * Utility function to navigate to the Verifier Active Proof Exchanges card
 * and verify presence.
 */
export async function e2eNavigateToVerifierActiveProofRequestsCard(): Promise<void> {
  await e2eNavigateToCard(
    ['Credential Verifier', 'Proof Requests'],
    'ActiveProofRequestsCard',
    'Active Proof Exchanges',
  );
}

/**
 * Utility function to navigate to the Verifier Completed Proof Presentations card
 * and verify presence.
 */
export async function e2eNavigateToVerifierCompletedProofPresentationsCard(): Promise<void> {
  await e2eNavigateToCard(
    ['Credential Verifier', 'Proof Requests'],
    'CompletedProofsCard',
    'Completed Proof Presentations',
  );
}

/**
 * Utility function to navigate to the Holder Active Proof Presentations card
 * and verify presence.
 */
export async function e2eNavigateToHolderActiveProofPresentationsCard(): Promise<void> {
  await e2eNavigateToCard(
    ['Holder Wallet', 'My Proof Presentations'],
    'ActiveProofPresentationsCard',
    'Active Proof Presentations',
  );
}

/**
 * Utility function to navigate to the Holder Completed Proof Presentations card
 * and verify presence.
 */
export async function e2eNavigateToHolderCompletedProofPresentationsCard(): Promise<void> {
  await e2eNavigateToCard(
    ['Holder Wallet', 'My Proof Presentations'],
    'CompletedProofsCard',
    'Completed Proof Presentations',
  );
}

/**
 * Utility function to enter the details of a proof request form
 * for a requesting Verifier. Will enter details but NOT submit form.
 * This allows tests that may want to do other actions before/instead of
 * submitting.
 *
 * @param {!string} credentialDefinitionId the unique credential definition
 * that defines the credential type being requested and defines the attributes required.
 * @param {!string} message a human readable message intended to be sent
 * to the Holder explaining the purpose or reason for the credential request
 * @param {!string} connectionAlias the DIDComm connection alias representing
 * connection to the Holder
 * @param {!{name:string, toggleRequired:boolean, timeRange?: {start:Date; end:Date}}[]} attributes
 * the list of schema attributes, an indication for each on whether to toggle
 * the associated checkbox and an optional Date range that the credential was
 * not-revoked
 *
 */
export async function e2eEnterProofRequestDetails(
  credentialDefinitionId: string,
  message: string,
  connectionAlias: string,
  attributes: {
    name: string;
    toggleRequired: boolean;
    timeRange?: { start: Date; end: Date };
  }[],
): Promise<void> {
  await e2eNavigateToVerifierActiveProofRequestsCard();
  await (
    await driver.wait(
      until.elementLocated(By.css('#ActiveProofRequestsCard__new-btn > span')),
      ppWaitDefault,
    )
  ).click();

  await driver.wait(
    until.elementIsVisible(
      await driver.wait(
        until.elementLocated(By.id('RequestProofForm')),
        ppWaitDefault,
      ),
    ),
    ppWaitDefault,
  );

  await (
    await driver.wait(
      until.elementLocated(By.id('credentialDefinitionId')),
      ppWaitDefault,
    )
  ).click();

  {
    const element = await driver.wait(
      until.elementLocated(By.id('credentialDefinitionId')),
      ppWaitDefault,
    );

    await driver
      .actions({ bridge: true })
      .move({ origin: element })
      .click()
      .pause(200)
      .sendKeys(credentialDefinitionId)
      // Pause to let the credential definition to fetch schema update
      .pause(1000)
      .perform();
  }

  await (
    await driver.wait(until.elementLocated(By.id('message')), ppWaitDefault)
  ).click();
  await (
    await driver.wait(until.elementLocated(By.id('message')), ppWaitDefault)
  ).sendKeys(message);

  await (
    await driver.wait(
      until.elementLocated(By.xpath("//input[@id='DIDCommSelections']/../..")),
      ppWaitDefault,
    )
  ).click();

  {
    // Move mouse over selection
    const element = await driver.wait(
      until.elementLocated(
        By.xpath(
          `//div[@class='rc-virtual-list']//div[contains(.,'${connectionAlias}')][1]/../span`,
        ),
      ),
      ppWaitDefault,
    );

    await driver
      .actions({ bridge: true })
      .pause(200)
      .move({ origin: element })
      .pause(1000)
      .click()
      .perform();
  }

  for (let i = 0; i < attributes.length; i++) {
    if (attributes[i].toggleRequired) {
      const checkBox = await driver.wait(
        until.elementLocated(
          By.xpath(
            `//div[@id='RequestProofAttributeList']/div/div/table/tbody/tr/td[contains(.,'${attributes[i].name}')]/../td/label[contains(@class,'RequestProofAttributeList__attributeInludedCheck')]/span/input`,
          ),
        ),
        ppWaitDefault,
      );
      await checkBox.click();
    }
    // If there is a timewindow for non-revocation
    // we need to navigate the range picker
    if (attributes[i].timeRange !== undefined) {
      // Open the start time picker
      await (
        await driver.wait(
          until.elementLocated(
            By.xpath(
              `//div[@id='RequestProofAttributeList']/div/div/table/tbody/tr/td[contains(.,'${attributes[i].name}')]/../td/div[contains(@class,'RequestProofAttributeList__${attributes[i].name}_ValidTimeWindow')]/div[1]/input`,
            ),
          ),
          ppWaitDefault,
        )
      ).click();

      const datePickerLocator = `//div[contains(@class,'RequestProofAttributeList__${attributes[i].name}_DatePicker')]`;
      // Input the start value provided
      await e2eEnterDatePickerDetails(
        datePickerLocator,
        attributes[i].timeRange!.start,
        ppWaitDefault,
      );

      // Move to the end time picker
      await (
        await driver.wait(
          until.elementLocated(
            By.xpath(
              `${datePickerLocator}//div[@class='ant-picker-footer']//button[contains(@class,'ant-btn-primary')]`,
            ),
          ),
          ppWaitDefault,
        )
      ).click();

      // Input the end value provided
      await e2eEnterDatePickerDetails(
        datePickerLocator,
        attributes[i].timeRange!.end,
        ppWaitDefault,
      );

      // Close the time range input
      await (
        await driver.wait(
          until.elementLocated(
            By.xpath(
              `${datePickerLocator}//div[@class='ant-picker-footer']//button[contains(@class,'ant-btn-primary')]`,
            ),
          ),
          ppWaitDefault,
        )
      ).click();
    }
  }
}

/**
 * Utility function to send a proof request from a Verifier to a Holder
 *
 * @param {!string} credentialDefinitionId the unique credential definition
 * that defines the credential type being requested and defines the attributes required.
 * @param {!string} message a human readable message intended to be sent
 * to the Holder explaining the purpose or reason for the credential request
 * @param {!string} connectionAlias the DIDComm connection alias representing
 * connection to the Holder
 * @param {!{name:string, toggleRequired:boolean, timeRange?: {start:Date; end:Date}}[]} attributes
 * the list of schema attributes, an indication for each on whether to toggle
 * the associated checkbox and an optional Date range that the credential was
 * not-revoked
 * @returns {string} the threadId that identifies the proof request
 *
 */
export async function e2eSendProofRequest(
  credentialDefinitionId: string,
  message: string,
  connectionAlias: string,
  attributes: {
    name: string;
    toggleRequired: boolean;
    timeRange?: { start: Date; end: Date };
  }[],
): Promise<string> {
  await e2eEnterProofRequestDetails(
    credentialDefinitionId,
    message,
    connectionAlias,
    attributes,
  );

  await (
    await driver.wait(
      until.elementLocated(By.css('#RequestProofForm__submit-btn > span')),
      ppWaitDefault,
    )
  ).click();

  await driver.wait(
    until.elementIsNotVisible(
      await driver.wait(
        until.elementLocated(By.id('RequestProofForm')),
        ppWaitDefault,
      ),
    ),
    ppWaitDefault,
  );

  // Check that a proof request is indicated as sent.
  const confirmation = await driver.wait(
    until.elementLocated(By.xpath(`//span[contains(.,'Proof request sent')]`)),
    ppWaitDefault,
  );
  await driver.wait(until.elementIsVisible(confirmation), ppWaitDefault);
  // Wait for message to dissapear to avoid artifact issues
  // with subsequent UI actions
  await driver.wait(until.stalenessOf(confirmation), ppWaitDefault);

  // Get the thread id to use in looking up the
  // proof request in future actions
  const proofRequestThread = await (
    await driver.wait(
      until.elementLocated(
        By.xpath(`//td[contains(.,'${connectionAlias}')]/../td[4]`),
      ),
      ppWaitDefault,
    )
  ).getText();

  return proofRequestThread;
}

/**
 * Utility function to enter the details of a proof presentation form
 * for a proving Holder . Will enter details but NOT submit form.
 * This allows tests that may want to do other actions before/instead of
 * submitting.
 *
 * @param {!string} proofThreadId the threadId that identifies the proof request
 * @param {{name:string, valueSelection?:string,revealToggle:boolean}[]} attributes the list of schema
 * attribute names along with values to select and whether to reveal the attribute in
 * the proof presentation.
 *
 */
export async function e2eEnterProofPresentationDetails(
  proofThreadId: string,
  attributes: {
    name: string;
    valueSelection?: string;
    toggleReveal: boolean;
  }[],
): Promise<void> {
  await e2eNavigateToHolderActiveProofPresentationsCard();
  await e2eActivateTableRowDropdownAction(
    'ActiveProofPresentationsList',
    proofThreadId,
    'Actions',
    'Create Presentation',
  );

  await driver.wait(
    until.elementIsVisible(
      await driver.wait(
        until.elementLocated(By.id('PreparePresentationForm')),
        ppWaitDefault,
      ),
    ),
    ppWaitDefault,
  );

  for (let i = 0; i < attributes.length; i++) {
    const checkBox = await driver.wait(
      until.elementLocated(
        By.xpath(
          `//div[@id='ProofPresentationAttributeList']/div/div/table/tbody/tr/td[contains(.,'${attributes[i].name}')]/../td/label[contains(@class,'ProofPresentationAttributeList__revealValueCheck')]/span/input`,
        ),
      ),
      ppWaitDefault,
    );
    if (attributes[i].valueSelection) {
      // Need to do dropdown value selection processing based
      // on attributes.valueSelection
    }

    if (attributes[i].toggleReveal) {
      await checkBox.click();
    }
  }
}

/**
 * Utility function to send a proof presentation from a Holder to a Verifier
 *
 * @param {!string} proofThreadId the threadId that identifies the proof request
 * @param {{name:string, valueSelection?:string,revealToggle:boolean}[]} attributes the list of schema
 * attribute names along with values to select and whether to reveal the attribute in
 * the proof presentation.
 *
 */
export async function e2eSendProofPresentation(
  proofThreadId: string,
  attributes: {
    name: string;
    valueSelection?: string;
    toggleReveal: boolean;
  }[],
): Promise<void> {
  await e2eEnterProofPresentationDetails(proofThreadId, attributes);

  await (
    await driver.wait(
      until.elementLocated(
        By.css('#PreparePresentationForm__submit-btn > span'),
      ),
      ppWaitDefault,
    )
  ).click();

  await driver.wait(
    until.elementIsNotVisible(
      await driver.wait(
        until.elementLocated(By.id('PreparePresentationForm')),
        ppWaitDefault,
      ),
    ),
    ppWaitDefault,
  );

  // Check that a proof request is indicated as sent.
  const confirmation = await driver.wait(
    until.elementLocated(
      By.xpath(`//span[contains(.,'Proof presentation sent')]`),
    ),
    ppWaitDefault,
  );
  await driver.wait(until.elementIsVisible(confirmation), ppWaitDefault);
  // Wait for message to dissapear to avoid artifact issues
  // with subsequent UI actions
  await driver.wait(until.stalenessOf(confirmation), ppWaitDefault);
}

/**
 * Utility test routine to verify an offered proof presentation at the Verifier
 *
 * @param {!string} proofThread the unique id of the proof
 * request thread to be verified.
 * @param {?boolean} shouldFail indicates if the verification result should be
 * a failure.
 */
export async function e2eVerifyProof(
  proofThread: string,
  shouldSucceed?: boolean,
): Promise<void> {
  await e2eNavigateToVerifierActiveProofRequestsCard();
  await e2eExecuteTableRowDropdownAction(
    'ActiveProofRequestsList',
    proofThread,
    'Actions',
    'Verify Presentation',
    'Verify',
    'Proof Verified',
  );

  // Refresh to make sure we have updates and then check the
  // verification result is as requested
  await e2eNavigateToVerifierActiveProofRequestsCard();
  if (shouldSucceed === false) {
    await e2eWaitElementVisible(
      By.xpath(
        `//div[@id='CompletedProofsList']//table/tbody/tr/td[contains(.,'${proofThread}')]/../td/span[contains(@class,'anticon-dislike')]`,
      ),
      ppWaitDefault,
    );
  } else {
    await e2eWaitElementVisible(
      By.xpath(
        `//div[@id='CompletedProofsList']//table/tbody/tr/td[contains(.,'${proofThread}')]/../td/span[contains(@class,'anticon-like')]`,
      ),
      ppWaitDefault,
    );
  }
}
