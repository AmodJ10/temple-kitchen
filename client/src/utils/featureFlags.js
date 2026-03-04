/**
 * Feature Flags — Engineer Early Access System
 *
 * Features flagged here are visible to engineers always.
 * For other roles, they are only visible when `enabled` is `true`.
 * 
 * To ship a new feature behind a flag:
 *  1. Add it here with enabled: false
 *  2. Engineers will see it immediately
 *  3. When ready, flip enabled: true for all users
 *  4. Eventually remove the flag entirely
 */

export const FEATURE_FLAGS = {
    // Example: ADVANCED_REPORTS: { enabled: false, description: 'Advanced analytics dashboard' },
};

/**
 * Check if a feature is enabled for the given user role.
 * Engineers always see all features.
 */
export const isFeatureEnabled = (flagName, userRole) => {
    const flag = FEATURE_FLAGS[flagName];
    if (!flag) return true; // Unknown flag = enabled by default
    if (userRole === 'engineer') return true; // Engineers always see everything
    return flag.enabled;
};
