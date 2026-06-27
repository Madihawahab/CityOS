---
name: Civic Excellence System
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#434655'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#784b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#996100'
  on-tertiary-container: '#ffeedd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 57px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  title-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.1px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  container-max: 1280px
---

## Brand & Style

This design system establishes a high-trust, "GovTech" aesthetic that merges the systematic rigor of Material Design 3 with the refined, breathable minimalism characteristic of premium consumer electronics. The target audience includes both engaged citizens and government administrators who require a platform that feels authoritative yet remarkably easy to navigate.

The design style is **Modern Corporate Minimalism**. It prioritizes clarity through generous whitespace, high-fidelity typography, and a sophisticated layering system. By utilizing soft depth and expansive rounded corners, the interface transforms complex civic data into approachable, human-centric experiences. The emotional goal is to evoke a sense of stability, transparency, and forward-thinking innovation.

## Colors

The palette is anchored by a commanding "Civic Blue" primary, chosen to project reliability and institutional strength. 

- **Primary (#2563EB):** Used for key actions, active states, and branding elements.
- **Surface & Background:** A clean separation is maintained between the page background (#F8FAFC) and elevated white cards (#FFFFFF) to create clear content grouping.
- **Semantic Accents:** Success, Warning, and Danger colors are calibrated for high legibility against white backgrounds, ensuring critical status updates are immediately recognizable.
- **Neutral/Text (#1E293B):** A deep slate is used instead of pure black to maintain a softer, more modern contrast ratio that reduces eye strain during long-form reading.

## Typography

The system utilizes **Inter** exclusively to achieve a systematic, neutral, and highly legible interface. The typographic scale follows a strict mathematical hierarchy to ensure information density is managed effectively.

- **Headlines:** Use tighter letter-spacing and heavier weights to command attention in dashboards and landing sections.
- **Body Text:** Set with generous line-heights to ensure accessibility and readability for policy documents and community posts.
- **Labels:** Utilized for metadata, tags, and overlines, often employing medium weights to maintain hierarchy even at small scales.

## Layout & Spacing

This design system employs a **Fluid Grid** model based on a 4px baseline shift. 

- **Desktop:** A 12-column grid with 24px gutters. Content is housed within a maximum width container of 1280px to prevent excessive line lengths on ultra-wide monitors.
- **Tablet:** 8-column grid with 24px gutters and margins.
- **Mobile:** 4-column grid with 16px gutters and margins.
- **Spacing Rhythm:** Padding and margins should always be multiples of 8px (e.g., 8, 16, 24, 32, 48, 64) to maintain visual harmony. Large sections of content should be separated by 48px or 64px to emphasize the minimalist aesthetic.

## Elevation & Depth

Depth is used sparingly and purposefully to indicate interactivity and hierarchy, following a **Tonal Layering** and **Ambient Shadow** approach.

- **Level 0 (Background):** #F8FAFC. The lowest layer.
- **Level 1 (Default Card):** #FFFFFF with a very soft, diffused shadow: `0px 4px 20px rgba(30, 41, 59, 0.05)`.
- **Level 2 (Hover/Active):** Increased shadow spread and slightly higher opacity to simulate physical lift: `0px 8px 30px rgba(30, 41, 59, 0.08)`.
- **Modals/Overlays:** Significant elevation using a backdrop blur (12px) on the scrim to maintain context while focusing user attention.

## Shapes

The shape language is defined by extreme **Pill-shaped** roundedness to soften the institutional nature of the platform and make it feel more accessible.

- **Base Components:** Buttons and small inputs utilize a 12px to 16px radius.
- **Containers & Cards:** Standard cards must use a **24px** corner radius. Large hero sections or layout containers should use a **32px** radius.
- **Iconography:** Use "Rounded" variants of system icons to match the container radius.

## Components

- **Buttons:** Primary buttons feature the Primary Blue background with white text, using a 12px radius. Secondary buttons should use a subtle ghost style or a light blue tonal background (#EFF6FF).
- **Cards:** White surfaces with 24px rounded corners and Level 1 shadows. Content inside cards should have 24px or 32px of internal padding.
- **Input Fields:** Soft gray borders (1px solid #E2E8F0) that transition to a 2px Primary Blue border on focus. Backgrounds should be slightly off-white (#F1F5F9) to provide a clear hit area.
- **Chips/Badges:** High-contrast text on low-opacity backgrounds (e.g., Success Green text on 10% opacity Green background) for status indicators.
- **AI-Powered Elements:** Components driven by AI (like smart summaries or governance suggestions) should feature a subtle gradient border or a faint "glow" shadow using the primary blue to distinguish them from standard data.
- **Lists:** Clean, borderless list items with 16px vertical padding and a subtle divider (#F1F5F9).