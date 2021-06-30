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
 * Decentralized Identifiers.
 */
import { CloudAgentAPI } from '../../containers/App/AppContext';
import { DID } from '@sudoplatform-labs/sudo-di-cloud-agent';
import { reportCloudAgentError } from '../../utils/errorlog';

export async function createPrivateDID(agent: CloudAgentAPI): Promise<DID> {
  // Create a new wallet private DID and return the
  // resulting details.
  try {
    const newDID = await agent.wallet.walletDidCreatePost();
    return newDID.result ?? {};
  } catch (error) {
    throw await reportCloudAgentError(
      'Failed to Create new Decentralized Identifier in Wallet',
      error,
    );
  }
}

export async function assignAgentsPublicDID(
  agent: CloudAgentAPI,
  did: string, // Wallet DID to assign as public for Agent operations
): Promise<void> {
  try {
    await agent.wallet.walletDidPublicPost(did);
  } catch (error) {
    throw await reportCloudAgentError(
      'Failed to Assign new Public Decentralized Identifier for Wallet',
      error,
    );
  }
}

export async function writeDIDToLedger(
  agent: CloudAgentAPI,
  did: string, // Wallet DID to write to ledger
  verkey: string,
): Promise<void> {
  try {
    await agent.ledger.ledgerRegisterNymPost(did, verkey);
  } catch (error) {
    throw await reportCloudAgentError(
      'Failed to Write Decentralized Identifier to Ledger',
      error,
    );
  }
}

export async function fetchAllAgentDIDs(agent: CloudAgentAPI): Promise<DID[]> {
  try {
    const didList = await agent.wallet.walletDidGet();
    return didList.results ?? [];
  } catch (error) {
    throw await reportCloudAgentError(
      'Failed to Retrieve Decentralized Identifiers from Wallet',
      error,
    );
  }
}
