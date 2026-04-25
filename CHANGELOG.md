# Changelog

All notable changes to this project will be documented in this file.

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
