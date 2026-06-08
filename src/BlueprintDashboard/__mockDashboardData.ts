/**
 * DEV-ONLY mock data for previewing the logged-in Blueprint Dashboard home page
 * without hitting the live Flock API. Activated via the `?mock=1` URL param
 * (e.g. #/dashboard?mock=1). Safe to delete once styling work is complete.
 */
import { BlueprintMetadata } from '../hooks/hooks';

export const MOCK_USERNAME = 'AVERY';

// Note: some teams intentionally own multiple blueprints (across types and
// dates) so the "By Team" grouping and newest-first ordering can be exercised.
export const MOCK_BLUEPRINTS: BlueprintMetadata[] = [
    // --- Gridiron Gurus: 3 blueprints across types (newest = Infinite, May 20) ---
    {
        blueprintId: '1001',
        blueprintType: 'Standard',
        platform: 'Sleeper',
        ownerUserId: 'u1',
        rosterId: 1,
        teamName: 'Gridiron Gurus',
        createdUtc: '2026-01-15T12:00:00',
        updatedUtc: '2026-01-15T12:00:00',
        deliveryStatus: 'Published',
    },
    {
        blueprintId: '2001',
        blueprintType: 'Premium',
        platform: 'Sleeper',
        ownerUserId: 'u1',
        rosterId: 1,
        teamName: 'Gridiron Gurus',
        createdUtc: '2026-03-10T12:00:00',
        updatedUtc: '2026-03-10T12:00:00',
        deliveryStatus: 'Published',
    },
    {
        blueprintId: '4001',
        blueprintType: 'Infinite',
        platform: 'Sleeper',
        ownerUserId: 'u1',
        rosterId: 1,
        teamName: 'Gridiron Gurus',
        createdUtc: '2026-05-20T12:00:00',
        updatedUtc: '2026-05-20T12:00:00',
        deliveryStatus: 'Published',
    },
    // --- The Replacements: 2 blueprints (Standard + Rookie) ---
    {
        blueprintId: '1002',
        blueprintType: 'Standard',
        platform: 'Sleeper',
        ownerUserId: 'u1',
        rosterId: 2,
        teamName: 'The Replacements',
        createdUtc: '2026-02-02T12:00:00',
        updatedUtc: '2026-02-02T12:00:00',
        deliveryStatus: 'Published',
    },
    {
        blueprintId: '3002',
        blueprintType: 'RookieDraft',
        platform: 'Sleeper',
        ownerUserId: 'u1',
        rosterId: 2,
        teamName: 'The Replacements',
        createdUtc: '2026-04-18T12:00:00',
        updatedUtc: '2026-04-18T12:00:00',
        deliveryStatus: 'Published',
    },
    // --- Single-blueprint teams ---
    {
        blueprintId: '3001',
        blueprintType: 'RookieDraft',
        platform: 'Sleeper',
        ownerUserId: 'u1',
        rosterId: 4,
        teamName: 'Draft Day Dominators',
        createdUtc: '2026-04-01T12:00:00',
        updatedUtc: '2026-04-01T12:00:00',
        deliveryStatus: 'Published',
    },
    {
        blueprintId: '4002',
        blueprintType: 'Infinite',
        platform: 'Sleeper',
        ownerUserId: 'u1',
        rosterId: 7,
        teamName: 'Perennial Contenders',
        createdUtc: '2026-05-05T12:00:00',
        updatedUtc: '2026-05-05T12:00:00',
        deliveryStatus: 'Published',
    },
    // Non-published, shows only in the status tracker (not the lists)
    {
        blueprintId: '5001',
        blueprintType: 'Standard',
        platform: 'Sleeper',
        ownerUserId: 'u1',
        rosterId: 8,
        teamName: 'Work In Progress',
        createdUtc: '2026-06-01T12:00:00',
        updatedUtc: '2026-06-01T12:00:00',
        deliveryStatus: 'InProgress',
    },
];
