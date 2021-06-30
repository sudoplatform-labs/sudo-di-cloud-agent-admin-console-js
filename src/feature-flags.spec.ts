import { getFeatureFlags, FeatureFlag } from './feature-flags';

enum TestFeatureFlagEnum {
  FEATURE_A,
  FEATURE_B,
}

// Overwrite FeatureFlag enum with predicable test values
Object.assign(FeatureFlag, TestFeatureFlagEnum);

describe('getFeatureFlags()', () => {
  it('should convert feature flag strings to numbers', () => {
    const result = getFeatureFlags(['FEATURE_B', 'FEATURE_A', 'FEATURE_X']);
    expect(result).toEqual([
      TestFeatureFlagEnum.FEATURE_A,
      TestFeatureFlagEnum.FEATURE_B,
    ]);
  });
});
