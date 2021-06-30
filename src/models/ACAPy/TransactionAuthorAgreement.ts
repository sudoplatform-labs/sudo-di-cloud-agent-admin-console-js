// We use snake_case in the models modules for protocol related
// fields because the Aries RFCs
// define the protocol using that schema.  Originally I attempted to
// convert to camel case here to isolate that peculiarity, however that
// resulted in confusion when comparing to on-the-wire data. In addition
// because of an issue with OpenAPI code generation of typescript-fetch,
// if we don't use 'orginal' for the names output the generated
// api doesn't match the json objects returned in responses.

/*
 * This module contains all routines and definitions required to
 * interface with the Cloud Agent service for activities related to
 * Transaction Author Agreement processing.
 */
import { CloudAgentAPI } from '../../containers/App/AppContext';
import { reportCloudAgentError } from '../../utils/errorlog';
import { TAAInfo, TAAResult } from '@sudoplatform-labs/sudo-di-cloud-agent';

export type TAAAcceptParams = {
  // The way the TAA was displayed and acknowledged.
  // Must be one of the key values returned in the aml_record.aml[]
  mechanism: string;
  // The EXACT string displayed to the user and accepted.
  // This will be used in signing and must match the ledgers TAA
  text: string;
  // The taa_record.version value from the fetchLedgerTaa() result.
  version?: string;
};

export async function fetchLedgerTaa(agent: CloudAgentAPI): Promise<TAAInfo> {
  try {
    const ledgerTaa: TAAResult = await agent.ledger.ledgerTaaGet();

    return ledgerTaa.result ?? {};
  } catch (error) {
    throw await reportCloudAgentError(
      `Current Transaction Author Agreement NOT RETURNED by Ledger`,
      error,
    );
  }
}

export async function acceptLedgerTaa(
  agent: CloudAgentAPI,
  params: TAAAcceptParams,
): Promise<void> {
  try {
    await agent.ledger.ledgerTaaAcceptPost(
      {
        mechanism: params.mechanism,
        text: params.text,
        version: params.version,
      },
      agent.httpOptionOverrides.httpPostOptionOverrides,
    );
  } catch (error) {
    throw await reportCloudAgentError(
      `Transaction Author Agreement NOT ACCEPTED by Ledger`,
      error,
    );
  }
}
