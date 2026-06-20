version: "alpha"
name: Kinetic Operational Dashboard
description: High-fidelity, mission-critical administrative suite for inDrive, optimized for long-duration monitoring and rapid tactical response.
colors:
  primary: "#C6F70A"
  primary-hover: "#B7F000"
  primary-active: "#D0FF32"
  background: "#0F0F10"
  sidebar: "#151515"
  surface: "#1B1B1B"
  surface-secondary: "#232323"
  surface-tertiary: "#2C2C2C"
  border: "#2E2E2E"
  border-subtle: "rgba(255,255,255,0.06)"
  input: "#2B2B2B"
  text-primary: "#FFFFFF"
  text-secondary: "#B8B8B8"
  text-muted: "#7D7D7D"
  success: "#C6F70A"
  warning: "#FFC857"
  error: "#FF6B6B"
  info: "#61B8FF"
typography:
  display:
    fontFamily: Inter
    fontSize: 2.5rem
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  h1:
    fontFamily: Inter
    fontSize: 2rem
    fontWeight: 700
    lineHeight: 1.2
  h2:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: 700
    lineHeight: 1.25
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 500
    lineHeight: 1.6
  body-md:
    fontFamily: Inter
    fontSize: 0.9375rem
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Inter
    fontSize: 0.8125rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.02em"
rounded:
  sm: 8px
  md: 12px
  lg: 18px
  xl: 24px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
components:
  sidebar:
    backgroundColor: "{colors.sidebar}"
    textColor: "{colors.text-secondary}"
    width: 280px
  sidebar-item-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.md}"
  dashboard-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: 24px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.sm}"
    typography: "{typography.label}"
  input-default:
    backgroundColor: "{colors.input}"
    textColor: "{colors.text-primary}"
rounded: "{rounded.sm}"



Overview

The Kinetic Operational Dashboard is a high-fidelity, mission-critical administrative suite for inDrive. It translates the brand's energetic identity into a professional, data-dense environment optimized for long-duration monitoring and rapid tactical response.

Core Principles:





Fidelity: High-contrast surfaces to minimize eye strain.



Speed: Neon lime highlights to direct attention to critical actions.



Precision: Utilitarian typography and modular grids for scanning accuracy.

Colors

The administrative palette maintains the neon lime signature while introducing stronger structural contrast for large-scale desktop layouts.





Primary (#C6F70A): Primary actions, active navigation states, KPIs, and operational highlights.



Background (#0F0F10): Deep matte foundation for reduced visual fatigue.



Sidebar (#151515): Dedicated navigation layer separated from content surfaces.



Surface (#1B1B1B): Primary content container.



Surface Secondary (#232323): Elevated analytical components and charts.



Semantic Indicators: High-contrast colors for success (lime), warning (yellow), and error (red).

Typography

Typeface: Inter (Sans-serif)
Chosen for its exceptional legibility in dense data environments and technical clarity.





Display (2.5rem): Large KPI totals for immediate scanning.



Heading 1 (2.0rem): Primary Page Titles.



Body Med (0.9375rem): Standard UI text and table data.



Label (0.8125rem): Metadata and status chips.

Layout

The dashboard uses a Modular Grid System:





Header Zone: Global search and notifications.



KPI Strip: Top-row metrics for immediate situational awareness.



Primary Work Area: Main operational content (tables, maps, or charts).



Utility Sidebar: Optional right-aligned panel for real-time alerts.

Elevation & Depth

Restrained elevation to maintain a flat, professional aesthetic.





Contrast over Shadows: Hierarchy is created through color contrast and containment rather than deep shadows.



Layering: Cards appear stacked and modular, following a strict z-index hierarchy for overlays.

Shapes

Maintains brand consistency while supporting technical analytical workflows.





Radius Small (8px): Standard for buttons and inputs.



Radius Large (18px): Reserved for outer layout containers.

Components

Navigation Architecture





SideNavBar: 280px wide, persistent navigational anchor.



TopNavBar: Fixed at 64px-72px height for global utilities.

Data Visualization





KPI Cards: Modular containers with bold metrics and trend indicators.



Operational Tables: High-density lists with clear status chip categorization.

Do's and Don'ts

Do





Maintain high contrast ratios for accessibility.



Use the primary neon lime sparingly to highlight critical paths.



Preserve generous internal padding (24px) in content cards.

Don't





Do not use decorative gradients or excessive blur.



Do not overload a single view with competing visual priorities.



Do not use thin weights for primary numerical data.
