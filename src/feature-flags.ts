/**
 * Feature flags are set during ACC deployment via runtime deployer variables.
 * E.g. RD_FF_EXAMPLE_FEATURE => FeatureFlag.EXAMPLE_FEATURE
 */
export enum FeatureFlag {
  EXAMPLE_FEATURE,
}

export function getFeatureFlags(featureFlagStrings: string[]): FeatureFlag[] {
  return featureFlagStrings
    .map((ffs) => {
      return FeatureFlag[ffs as keyof typeof FeatureFlag];
    })
    .filter((flag) => flag !== undefined)
    .sort();
}
