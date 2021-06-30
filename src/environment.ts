export const uiConfig = '/uiconfig.json';
export const acapyConfig = '/acapy.json';

export interface EnvironmentInfo {
  acapyAdminUri: string; // REST API For Cloud Agent
  acapyAdminKey: string; // REST API authorisation key
  featureFlags: string[]; // Enabled/Disbled features for this customer
}
