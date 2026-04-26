# Changelog

All notable changes to this project will be documented in this file.

## [v0.0.2] - 2026-04-25

### Added
- **Real-Time Meetup Map**: Pulse logic for squad coordination, interactive Leaflet integration, and live sharing toggle.
- **Journey Archive (Souvenirs)**: Post-trip memory page with aggregated expenses, chat media, and member stats.
- **Dedicated Memory Uploads**: Functionality for squad members to upload curated trip photos directly to the archive.
- **PWA & Offline Resilience**: Progressive Web App support, custom service worker for asset caching, and persistent Security Vault for zero-connectivity situations.

### Fixed
- **Squad Permissions**: Refined RLS policies for souvenirs to ensure seamless collaborative archiving.
- **Logic Polish**: Hardened request status types and visibility logic for memory triggers.
- **Context Hardening**: Improved error logging and real-time state synchronization for utilities.

---

## [v1.2.0] - 2026-04-26

### Added
- **Boarding Pass Live Preview**: Premium airline-inspired visualization with real-time field synchronization and holographic scanner animation.
- **Real-Time Weather Pulse 🌦️**: Global, coordinate-based arrival forecasts via Open-Meteo API integration.
- **Universal Scan Verification**: Scannable deep-link QR codes resolving to a dedicated virtual ticket landing page.
- **Digital Wallet Support 💳**: Native "Add to Apple/Google Wallet" buttons with simulated pass generation.
- **Traveler Storytelling (Blog)**: Community-driven blog hub with interactive trip orientation maps and author attribution.
- **Dynamic Careers Engine**: Transitioned hiring directory to a fully database-backed management system.
- **Smart Luggage Tracking**: Explicit luggage capacity fields and "Extra Space" trust badges for companion matching.

### Fixed
- **SSR Hydration Fix**: Resolved protocol/hostname mismatches in dynamic QR generation by deferring computation to client mount.
- **Blog Security Policies**: Fixed RLS insert errors for community story publishing.
- **Dark Mode Visibility**: Hardened contrast for labels and components across all premium dashboard views.
- **Build Stabilization**: Resolved Ecmascript compilation errors in dynamic route imports.

---

## [v1.1.0] - 2026-04-25

### Added
- **Conditional CTAs**: Implemented smart landing page buttons that adapt to user authentication status.
- **Branding**: Deployed custom high-fidelity SVG favicon and apple-touch-icon.
- **SEO Optimization**: Updated global metadata and routing for Next.js 15/16 compliance.

### Changed
- **Nuclear Accessibility**: Achieved 100/100 Lighthouse score via:
    - Semantic heading hierarchy remediation.
    - Extreme contrast hardening (Hero, Mission, and Features components).
    - Descriptive ARIA labels for all interactive navigation elements.
- **Framework Modernization**: Migrated `middleware.ts` to `proxy.ts` convention for improved routing logic.
- **Performance**: Deferred Agora RTC and heavy SDKs/components via dynamic imports to ensure sub-2s TTI.

### Fixed
- **Redirection Logic**: Corrected dashboard access for unauthenticated users to redirect to home screen instead of default Clerk page.
- **Logo Accessibility**: Added descriptive alt-text and home-link labels.

---

## [v1.0.0] - Initial Release
- Core Journey-Mate platform features including Flight Tracking, Map Integration, and Real-time Voice/Chat pairing.
