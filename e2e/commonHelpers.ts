import { By, Locator, until, WebElement } from 'selenium-webdriver';
import { driver } from './setup-tests';

export const commonWaitDefault = 20000;

/**
 * Utility function to wait for a element to appear and be
 * visible.  Returns to element if found.
 *
 * @param {?number} wait an optional amount of time to use when waiting for
 * elements to resolve when locating them.
 * @return {WebElement} The now visible element.
 */
export async function e2eWaitElementVisible(
  locator: Locator,
  wait: number = commonWaitDefault,
): Promise<WebElement> {
  try {
    const element = await driver.wait(
      until.elementIsVisible(
        await driver.wait(until.elementLocated(locator), wait),
      ),
      wait,
    );
    return element;
  } catch (e) {
    throw `Failed to find visible element ${locator}: ${e}`;
  }
}

/**
 * Utility function to test navigation to a specified card
 * and verify presence.
 * NOTE: This helper relies on the UI using a consitent id
 *       naming scheme for UI elements
 *
 * @param {!string[]} route Array of strings containing the navbar links
 * reqiured to travers to get to the desired card.
 * @param {!string} cardIdPrefix value of the cards "id=" value used
 * to check navigation completed correctly
 * @param {!string} cardTitle value of the cards "title=" value used
 * to check navigation completed correctly
 * @param {?number} wait an optional amount of time to use when waiting for
 * elements to resolve when locating them.
 */
export async function e2eNavigateToCard(
  route: string[],
  cardIdPrefix: string,
  cardTitle: string,
  wait: number = commonWaitDefault,
): Promise<void> {
  // Use the side nav to get to the correct panel
  for (let i = 0; i < route.length; i++) {
    const element = await e2eWaitElementVisible(By.linkText(route[i]), wait);
    await driver
      .actions({ bridge: true })
      .pause(200)
      .move({ origin: element })
      .pause(200)
      .click()
      .perform();
  }
  // Make sure the correct card is found
  await e2eWaitElementVisible(
    By.css(`#${cardIdPrefix} .ant-card-head-title`),
    wait,
  );
  expect(
    await (
      await driver.findElement(By.css(`#${cardIdPrefix} .ant-card-head-title`))
    ).getText(),
  ).toBe(cardTitle);
}

/**
 * Utility function to test hover over the card info icon
 * displays expected pop-up and then disappears when moused out of.
 * NOTE: This helper relies on the UI using a consitent id
 *       naming scheme for UI elements
 *
 * @param {!string} cardIdPrefix value of the cards "id=" value used
 * to locate the popover icon and dialog
 * @param {?number} wait an optional amount of time to use when waiting for
 * elements to resolve when locating them.
 */
export async function e2eHoverOverCardInfoIcon(
  cardIdPrefix: string,
  wait: number = commonWaitDefault,
): Promise<void> {
  {
    // Move mouse over info icon
    const element = await e2eWaitElementVisible(
      By.css(`#${cardIdPrefix}__popover-icon > svg`),
      wait,
    );
    await driver.actions({ bridge: true }).move({ origin: element }).perform();
  }
  // Make sure the pop up displays
  await e2eWaitElementVisible(
    By.xpath(`//div[@id='${cardIdPrefix}__popover-dialog']/div[2]/p`),
    wait,
  );

  // Move mouse out of info icon
  await driver.actions({ bridge: true }).move({}).perform();
  // Make sure the pop up goes away
  await driver.wait(
    until.elementIsNotVisible(
      await driver.findElement(
        By.xpath(`//div[@id='${cardIdPrefix}__popover-dialog']/div[2]/p`),
      ),
    ),
    wait,
  );
}

/**
 * Utility function to check that a notification message is
 * displayed then removed from the screen
 *
 * @param {!string} message The string value displayed in a "message"
 * popover to check for on screen
 * @param {?number} wait an optional amount of time to use when waiting for
 * elements to resolve when locating them.
 */
export async function e2eCheckMessageDisplays(
  message: string,
  wait: number = commonWaitDefault,
): Promise<void> {
  // Check that the expected message appears after the action.
  const element = await e2eWaitElementVisible(
    By.xpath(`//span[contains(.,'${message}')]`),
    wait,
  );

  // Wait for message to dissapear to avoid artifact issues
  // with subsequent UI actions
  await driver.wait(until.stalenessOf(element), wait);
}

/**
 * Utility function to test form activation on a card followed
 * by cancel works.
 * NOTE: This helper relies on the UI using a consitent id
 *       naming scheme for UI elements
 *
 * @param {!string} cardFormActivateButton value of the card button
 * "id=" value used to find it and activate
 * @param {!string} cardFormId value of the card form "id=" value
 * used to check the form activates
 * @param {?number} wait an optional amount of time to use when waiting for
 * elements to resolve when locating them.
 */
export async function e2eInitiateThenCancelCardForm(
  cardFormActivateButton: string,
  cardFormId: string,
  wait: number = commonWaitDefault,
): Promise<void> {
  await (
    await e2eWaitElementVisible(
      By.css(`#${cardFormActivateButton} > span`),
      wait,
    )
  ).click();
  await e2eWaitElementVisible(By.id(cardFormId), wait);

  const cancelBtn = await e2eWaitElementVisible(
    By.css(`#${cardFormId}__cancel-btn > span`),
    wait,
  );
  await driver
    .actions({ bridge: true })
    .pause(200)
    .move({ origin: cancelBtn })
    .pause(200)
    .click()
    .perform();

  await driver.wait(
    until.elementIsNotVisible(
      await driver.wait(until.elementLocated(By.id(cardFormId)), wait),
    ),
    wait,
  );
}

/**
 * Utility function to open an action on a table row
 *
 * @param {!string} tableId the value of the table "id" attribute to scope
 * the xpath operations to the correct table
 * @param {!string} rowId value of a unique data value displayed
 * for the row which is used to locate the row and related action button
 * @param {!string} actionButtonLabel the button label within the
 * table row.
 * @param {!string} actionSelection the string value of the label within
 * the action selection list to activate
 * @param {?number} wait an optional amount of time to use when waiting for
 * elements to resolve when locating them.
 */
export async function e2eActivateTableRowDropdownAction(
  tableId: string,
  rowId: string,
  actionButtonLabel: string,
  actionSelection: string,
  wait: number = commonWaitDefault,
): Promise<void> {
  await (
    await e2eWaitElementVisible(
      By.xpath(
        `//div[@id='${tableId}']//table/tbody/tr/td[contains(.,'${rowId}')]/..//button[contains(.,'${actionButtonLabel}')]`,
      ),
      wait,
    )
  ).click();

  {
    const element = await e2eWaitElementVisible(
      By.xpath(`//li[contains(.,'${actionSelection}')]`),
      wait,
    );
    await driver.wait(until.elementIsEnabled(element), wait);
    await driver
      .actions({ bridge: true })
      .pause(200)
      .move({ origin: element })
      .pause(200)
      .click()
      .perform();
  }
}

/**
 * Utility function to perform an action on a table row
 * and check that a confirmation of the action is presented
 * NOTE: This helper relies on the UI using a consistent
 *       approach to table row action dialogs
 *
 * @param {!string} tableId the value of the table "id" attribute to scope
 * the xpath operations to the correct table
 * @param {!string} rowId value of a unique data value displayed
 * for the row which is used to locate the row and related action button
 * @param {!string} actionButtonLabel the button label within the
 * table row.
 * @param {!string} actionSelection the string value of the label within
 * the action selection list to activate
 * @param {!string} dialogButtonId the string value of the button label to
 * execute one the modal dialog for the actionSelection is displayed
 * @param {!string} expectedMessage the string value of the message which should
 * be displayed once the modal dialogButtonId is clicked
 * @param {?number} wait an optional amount of time to use when waiting for
 * elements to resolve when locating them.
 */
export async function e2eExecuteTableRowDropdownAction(
  tableId: string,
  rowId: string,
  actionButtonLabel: string,
  actionSelection: string,
  dialogButtonId: string,
  expectedMessage: string,
  wait: number = commonWaitDefault,
): Promise<void> {
  await e2eActivateTableRowDropdownAction(
    tableId,
    rowId,
    actionButtonLabel,
    actionSelection,
  );

  {
    const element = await e2eWaitElementVisible(
      By.xpath(`//button[contains(.,'${dialogButtonId}')]/span`),
      wait,
    );

    await driver
      .actions({ bridge: true })
      .pause(200)
      .move({ origin: element })
      .pause(200)
      .click()
      .perform();
  }

  await e2eCheckMessageDisplays(expectedMessage, wait);
}

/**
 * Utility function to perform remove action on a table row
 * and check that a confirmation of the action is presented and
 * table row is removed.  Also checks first that the cancel
 * operation works.
 * NOTE: This helper relies on the UI using a consistent
 *       approach to table row action dialogs
 *
 * @param {!string} tableId the value of the table "id" attribute to scope
 * the xpath operations to the correct table
 * @param {!string} rowId value of a unique data value displayed
 * for the row which is used to locate the row and related action button
 * @param {!string} removeButtonLabel the text of the remove button
 * to activate
 * @param {!string} confirmDialogTitle the header text displayed
 * to confirm the remove operation
 * @param {!string} confirmButtonLabel the string value of the button label to
 * execute remove
 * @param {!string} cancelButtonLabel the string value of the button label to
 * cancel remove
 * @param {!string} expectedMessage the string value of the message which should
 * be displayed once the confirm button is clicked
 * @param {?number} wait an optional amount of time to use when waiting for
 * elements to resolve when locating them.
 */
export async function e2eExecuteTableRowRemoveAction(
  tableId: string,
  rowId: string,
  removeButtonLabel: string,
  confirmDialogTitle: string,
  confirmButtonLabel: string,
  cancelButtonLabel: string,
  expectedMessage: string,
  wait: number = commonWaitDefault,
): Promise<void> {
  await (
    await e2eWaitElementVisible(
      By.xpath(
        `//div[@id='${tableId}']//table/tbody/tr/td[contains(.,'${rowId}')]/..//button[contains(.,'${removeButtonLabel}')]`,
      ),
      wait,
    )
  ).click();

  // Check Remove dialog appears
  let element = await e2eWaitElementVisible(
    By.xpath(`//span[contains(.,'${confirmDialogTitle}')]`),
    wait,
  );

  // Cancel out to make sure that works
  await (
    await e2eWaitElementVisible(
      By.xpath(
        `//span[contains(.,'${confirmDialogTitle}')]/ancestor::div[@class='ant-modal-body']//span[contains(.,'${cancelButtonLabel}')]`,
      ),
      wait,
    )
  ).click();

  // Wait for message to dissapear to avoid artifact issues
  // with subsequent UI actions
  await driver.wait(until.stalenessOf(element), wait);

  await (
    await e2eWaitElementVisible(
      By.xpath(
        `//div[@id='${tableId}']//table/tbody/tr/td[contains(.,'${rowId}')]/..//button[contains(.,'${removeButtonLabel}')]`,
      ),
      wait,
    )
  ).click();

  element = await e2eWaitElementVisible(
    By.xpath(`//span[contains(.,'${confirmDialogTitle}')]`),
    wait,
  );

  await (
    await e2eWaitElementVisible(
      By.xpath(
        `//span[contains(.,'${confirmDialogTitle}')]/ancestor::div[@class='ant-modal-body']//span[contains(.,'${confirmButtonLabel}')]`,
      ),
      wait,
    )
  ).click();

  await e2eCheckMessageDisplays(expectedMessage, wait);
  // Wait for message to dissapear to avoid artifact issues
  // with subsequent UI actions
  await driver.wait(until.stalenessOf(element), wait);

  // Make sure it was deleted from the table
  {
    const elements = await driver.findElements(
      By.xpath(
        `//div[@id='${tableId}']//table/tbody/tr/td[contains(.,'${rowId}')]/..//button[contains(.,'${removeButtonLabel}')]`,
      ),
    );
    expect(elements.length).toBeFalsy();
  }
}

/**
 * Utility function to cancel the TAA dialog and check it goes away.
 * Expects the TAA dialog is being or about to be displayed.
 *
 * @param {?number} wait an optional amount of time to use when waiting for
 * elements to resolve when locating them.
 */
export async function e2eCancelTAAForm(
  wait: number = commonWaitDefault,
): Promise<void> {
  // Check that the TAA is displayed
  const taa = await e2eWaitElementVisible(
    By.xpath("//span[contains(.,'Transaction Authors Agreement (TAA)')]"),
    wait,
  );

  // Cancel out
  await (
    await e2eWaitElementVisible(
      By.css('#ModalTAAAcceptance__cancel-btn > span'),
      wait,
    )
  ).click();
  await driver.wait(until.stalenessOf(taa), wait);
}

/**
 * Utility function to Accept the TAA dialog.
 * Expects the TAA dialog is being or about to be displayed.
 *
 * @param {?number} wait an optional amount of time to use when waiting for
 * elements to resolve when locating them.
 */
export async function e2eAcceptTAAForm(
  wait: number = commonWaitDefault,
): Promise<void> {
  // Check that the TAA is displayed
  await e2eWaitElementVisible(
    By.xpath("//span[contains(.,'Transaction Authors Agreement (TAA)')]"),
    wait,
  );

  // Accept the TAA
  await (
    await e2eWaitElementVisible(
      By.css('#ModalTAAAcceptance__accept-btn > span'),
      wait,
    )
  ).click();
}
