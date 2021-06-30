# Sudo Decentralized Identity Cloud Agent Admin Console

The Sudo Decentralized Cloud Agent Admin Console implements a Sample Web UI to control the process of
creating, issuing and holding Verifiable Credentials. This Web UI utilises the
Sudo Decentralized Identity Cloud Agent SDK to create a local, standalone,
Decentralized Identity development environment.

_NOTE:_ Currently only MacOS is supported as a development environment and Chrome Browser for the Web UI.

## <a name="setup_instructions"></a>Setup / Running standalone environment

Before begining these instructions you must have [yarn](https://yarnpkg.com) and [docker desktop](https://hub.docker.com/editions/community/docker-ce-desktop-mac) installed on your machine.

1. Clone this github repository.
2. Change to the top level project directory
3. Run `yarn bootstrap`.
   This will initialise the `node_modules` directory with project dependencies.
4. Edit `public/acapy.json` and add element "endorserSeed": “<32 byte seed>”,
5. Start the local development environment using the installed
   `@sudoplatform-labs/sudo-di-cloud-agent` command `yarn di-env start -c $PWD/public/acapy.json`.
   This will download and start local docker instances of both a VON Indy Ledger and the
   Sudo Cloud Agency Service. (see di-env for other command options).
6. Run `yarn start` to begin serving the Web UI.
7. Browse to the web page url at `localhost:3000`
8. Stop the local development environment when finished using `yarn di-env down`.
   NOTE: This will destroy all credentials, schemas and DIDs created.

**_Troubleshooting_**

It is possible that the `yarn di-env down/start` commands could fail. Instances of this occuring usually relate to a change of the node_modules/@sudoplatform-labs/sudo-di-cloud-agent
package whilst the environment is running. The simplest way to recover from such errors is to manualy terminate the docker containers related to the VON-network and sudo-di-cloud-agent.

## Using a Public Ledger and Public Cloud Agent Endpoint

**IMPORTANT** : When using a public ledger, information written is persistent and immutable. Personally Identifiable Information (PII) **MUST NOT** be written and is a major reason why the Transaction Authorisation Agreement must be signed in the acceptance/setup process.
It is recommended that as much development activity as possible is performed with the local VON Ledger before using a Public ledger.

The Web UI can support using a public ledger such as [Sovrin BuilderNet or StagingNet](https://sovrin.org/overview).
When using these ledgers the UI will automatically display the Transaction Authorisation Agreement and require acceptance before any ledger write operation (e.g Schema Creation, Credential Definition, DID Writes).

For details on starting the Development Environment with public ledgers and/or a public cloud agent endpoint, refer to the [Sudo Decentralized Identity Cloud Agent SDK](https://www.npmjs.com/package/@sudoplatform-labs/sudo-di-cloud-agent) documentation.

**NOTE:** It is unnecessary to perform the TAA acceptance steps in the SDK documentation as the Web UI will handle this automatically when appropriate.
