---
name: Mission Tree
description: The whole satellite mission as one engineering drawing, plotted by day and starlit by night, with each Phase as a detail view.
colors:
  paper: "oklch(0.985 0.004 240)"
  paper-raised: "oklch(0.962 0.006 240)"
  desk-sky: "oklch(0.9 0.035 232)"
  ink: "oklch(0.25 0.016 255)"
  ink-secondary: "oklch(0.44 0.016 255)"
  ink-tertiary: "oklch(0.56 0.014 255)"
  hairline: "oklch(0.84 0.008 250)"
  branch-line: "oklch(0.66 0.012 250)"
  layer-sys: "oklch(0.25 0.016 255)"
  layer-box: "oklch(0.6 0.19 332)"
  layer-eps: "oklch(0.5 0.2 27)"
  layer-adcs: "oklch(0.66 0.17 148)"
  layer-com: "oklch(0.56 0.1 220)"
  layer-obc: "oklch(0.45 0.17 262)"
  layer-pay: "oklch(0.74 0.15 80)"
  alert: "oklch(0.52 0.19 27)"
typography:
  display:
    fontFamily: "Geologica Variable, -apple-system, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.015em"
    fontVariation: "'CRSV' 1, 'SHRP' 0"
  headline:
    fontFamily: "Geologica Variable, -apple-system, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
    fontVariation: "'CRSV' 1, 'SHRP' 0"
  title:
    fontFamily: "Geologica Variable, -apple-system, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    fontVariation: "'CRSV' 1, 'SHRP' 0"
  phase-title:
    fontFamily: "Geologica Variable, -apple-system, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.25
    fontVariation: "'CRSV' 1, 'SHRP' 0"
  body:
    fontFamily: "Geologica Variable, -apple-system, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "tnum"
    fontVariation: "'CRSV' 1, 'SHRP' 0"
  body-sm:
    fontFamily: "Geologica Variable, -apple-system, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.35
    fontVariation: "'CRSV' 1, 'SHRP' 0"
  label:
    fontFamily: "Geologica Variable, -apple-system, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    fontVariation: "'CRSV' 1, 'SHRP' 0"
  leaf:
    fontFamily: "Geologica Variable, -apple-system, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "15px"
    letterSpacing: "-0.005em"
    fontVariation: "'CRSV' 1, 'SHRP' 0"
  code:
    fontFamily: "Geologica Variable, -apple-system, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.04em"
    fontVariation: "'CRSV' 1, 'SHRP' 0"
  caption:
    fontFamily: "Geologica Variable, -apple-system, Apple SD Gothic Neo, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    fontVariation: "'CRSV' 1, 'SHRP' 0"
rounded:
  none: "0"
  satellite: "3px"
  circle: "50%"
spacing:
  xxs: "4px"
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
components:
  button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 10px"
    height: "32px"
  button-hover:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
  button-active:
    backgroundColor: "{colors.hairline}"
  button-disabled:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-tertiary}"
  button-icon-only:
    rounded: "{rounded.none}"
    size: "32px"
  segment:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 10px 0 8px"
    height: "30px"
  segment-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  segment-icon-only:
    rounded: "{rounded.none}"
    width: "32px"
    height: "30px"
  select:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 26px 0 8px"
    height: "30px"
  layer-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 8px 0 5px"
    height: "32px"
  layer-toggle-active:
    backgroundColor: "{colors.paper-raised}"
  step-tab:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.none}"
    padding: "0 12px 0 14px"
    height: "36px"
  step-tab-selected:
    textColor: "{colors.ink}"
    height: "37.5px"
  phase-station:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.circle}"
    size: "44px"
  phase-station-hover:
    backgroundColor: "{colors.desk-sky}"
    textColor: "{colors.ink}"
  phase-station-night:
    rounded: "{rounded.satellite}"
  phase-station-detail:
    size: "64px"
  team-balloon:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.circle}"
    size: "18px"
  team-balloon-md:
    size: "24px"
  material-slot-empty:
    backgroundColor: "transparent"
    rounded: "{rounded.none}"
    size: "8px"
  material-slot-filled:
    backgroundColor: "{colors.ink}"
    rounded: "{rounded.none}"
    size: "8px"
  leaf-current:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.leaf}"
    rounded: "{rounded.none}"
  gate-number:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.code}"
    rounded: "{rounded.none}"
    size: "20px"
  minimap:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.branch-line}"
    rounded: "{rounded.none}"
---

# Design System: Mission Tree

## Overview

**Creative North Star: "One Drawing, Day and Night"**

The interface is one engineering drawing laid under a sky. By day it is a sheet plotted on cool white paper in graphite ink, resting on a pale daytime sky. By night it is the same drawing in starlit linework on blue-grey paper, resting on a deep navy sky scattered with sparse stars. The user picks Day, Night or Auto from the top bar; Auto follows the computer. Drawing grammar (part-number balloons, leader and branch lines, a trunk with an arrowhead, a gate diamond, numbered steps) appears only where it carries information. It is never ornament.

This is an operate-mode tool. The world lends type, palette, density and one family of real-element motion, and nothing else. Controls stay standard: a select is a select, a tab is a tab, a button is a thin-ruled rectangle. Density is high and calm, like a full drawing sheet. Hierarchy comes from line weight, ink value and type weight, never from fills, cards or shadows. The one place the theme changes form rather than colour is the Phase station: an Earth with a graticule by day, a square satellite body whose solar wings unfold on hover by night, and the detail transition follows that shape.

Confirmed rejections in the build: no dashboard of cards, no collapsible outline, no cream paper, no decorative chrome, no workshop progress status.

**Key Characteristics:**
- Cool paper and graphite ink on a sky-coloured desk; hierarchy by line weight and ink value.
- Seven team colours borrowed from CAD layer colours, each paired with a numbered balloon.
- One typeface, Geologica Variable with its soft (CRSV) letterforms on, tabular figures throughout.
- Square corners on every control and region; rounded or circular forms only on drawing symbols.
- Selection is ink inversion; focus is a dashed ink outline, like a selected CAD object.
- Flat. Two shadows in the whole system: the floating minimap and the mobile full-screen panel.
- Motion moves the real elements: the Phase head and team branches travel; nothing is a screenshot cross-fade.

## Colors

A near-monochrome ink-on-paper palette with seven layer colours held in reserve. All values are OKLCH custom properties in `frontend/src/styles/global.css`. The frontmatter records Day; every neutral, layer and alert token is redefined for Night (values in the sidecar), which applies when `data-theme="night"` is set or when no theme is stored and the system prefers dark. `main.tsx` applies the stored theme before first paint.

### Primary
- **Graphite Ink** (`--ink`): all primary text, Phase station outlines, the gate box frame, group rules, the minimap frame, every selected state. By night it becomes pale starlight linework.

### Secondary
- **CAD Layer Colours** (`--team-*`): seven team colours on the AutoCAD index pattern (red, yellow, green, cyan, blue, magenta, ink). SYS is ink itself. Darkened to read on paper by day, brightened by night. Lightness is deliberately spread (ink 0.25, obc 0.45, eps 0.5, com 0.56, box 0.6, adcs 0.66, pay 0.74) so teams stay distinguishable under colour-vision deficiency. Each layer has a paired `--team-*-on` digit colour (paper or ink) for a filled balloon; by night every layer is light, so all digits are dark paper.

### Tertiary
- **Alert Red** (`--alert`): viewer error titles only.

### Neutral
- **Plot Paper** (`--paper`): sheets, panel, top bar, buttons, balloon and station fills.
- **Raised Paper** (`--paper-raised`, source `--paper-2`): one step up; hover fills, the pressed layer toggle, the notebook guide strip, satellite solar panels.
- **Desk Sky** (`--desk`): the background around the sheet. Pale daytime blue by day (also the Day station hover fill); deep navy by night, under the `--sky-art` star field (five sparse radial-gradient stars tiled at 347 × 263px).
- **Secondary Ink** (`--ink-secondary`, source `--ink-2`): codes, counts, meta lines, unselected tabs, labels such as "Mission:", "Tree", "Team". At least 7:1 on paper.
- **Tertiary Ink** (`--ink-tertiary`, source `--ink-3`): disabled text only.
- **Hairline** (`--hairline`, source `--line`): row dividers, the top-bar rule, the Earth graticule, unlit minimap lines, button active fill.
- **Branch Line** (`--branch-line`, source `--line-2`): trunk, stems, team and workshop branches, sheet frame, control borders, empty-slot dashes, unlit minimap text.

### Named Rules
**The Ink Inversion Rule.** Selection is ink fill with paper text (`--select-bg` / `--select-fg`). There is no accent colour for "selected": a pressed segment, the active theme, the open workshop leaf, the night Phase station on hover and text selection all invert.

**The Layer Reserve Rule.** At rest, team colour appears only as the 1.5px ring of each numbered balloon. Picking a team layer fills that team's balloons, recolours its branch lines and its detail group rule, and fades every other team, and every Phase without that team, to opacity 0.5. Team colour never fills a surface, a text block or a button. The minimap is the one sanctioned exception: it fills the balloons and tick of the path currently being viewed in their layer colours, whether or not a layer is picked, and sets the lit workshop codes in the layer colour mixed 62% toward ink (`color-mix(in oklab, …)`, never oklch, which would turn yellow green) so 8px codes stay legible.

**The Two Skies Rule.** Night is not an inverted Day. Any new colour token is declared for Day in `:root` and for Night in the single `:root[data-theme='night']` block. The page always carries a resolved `data-theme` of `day` or `night`: `frontend/src/features/feature_a/theme.ts` turns the Auto choice (`data-theme-mode="auto"`) into day or night from `prefers-color-scheme` and follows the system while Auto is chosen, so there is no media-query copy of the night values to keep in step.

## Typography

**Font:** Geologica Variable (with -apple-system, Apple SD Gothic Neo, Segoe UI, sans-serif), loaded from `@fontsource-variable/geologica`, with `font-variation-settings: 'CRSV' 1, 'SHRP' 0`.

**Character:** One engineered sans with its soft cursive-leaning letterforms switched on: technical in skeleton, friendly in detail. A separate semi-condensed label face was dropped because it read as stiff; `--font-narrow` survives only as a role alias of `--font`. Figures are tabular everywhere. Its large x-height lets workshop leaves sit one step smaller (12px) than reading text and still read.

### Hierarchy
The size scale steps by roughly 1.15 from 0.75rem to 1.875rem (`--t-xs` to `--t-3xl`). Weights are 400, 500 and 600.
- **Display** (600, 1.875rem, 1.15, -0.015em): the Phase detail sheet heading only; 1.5rem below 1000px.
- **Headline** (600, 1.5rem, 1.2, -0.01em): the workshop panel title.
- **Title** (600, 1rem): wordmark, gate heading, empty-state and viewer-state titles, the station letter.
- **Phase Title** (600, 0.8125rem, 1.25, balanced wrap): Phase names beside the stations.
- **Body** (400, 0.875rem, 1.45): reading text; cap prose at 70ch.
- **Body Small** (400, 0.8125rem): task descriptions, workshop source lines, the guide strip.
- **Label** (500, 0.8125rem): buttons, toggles, selects, segments; tabs at 0.875rem.
- **Leaf** (400, 0.75rem, 15px line, -0.005em): workshop leaves on the sheet; codes beside them at 0.6875rem in secondary ink.
- **Code** (600, 0.75rem, 0.04em): team codes and group codes. These codes are natively capitals; no `text-transform` is used anywhere.
- **Caption** (400, 0.75rem): counts, legend text, review sources, gate step detail.

### Named Rules
**The Lettering Rule.** One family carries everything. Distinguish a code from a name by weight, ink value and tracking, never by switching face.

## Layout

The page is a sticky 52px top bar over a desk of sky. On the desk sits one sheet: a 1px branch-line frame, paper fill, 16px margin, 20px padding.

**Across (default).** A horizontal trunk runs left to right from the first station's centre to an arrowhead at the right edge. Seven Phase columns sit on a weighted grid (0.9 / 1.05 / 1.1 / 1.05 / 1 / 1 / 0.9 fr, 14px gaps) so the busiest Phases get the most width. Each column drops a stem to team balloons, which drop branches to workshop leaves. The legend sits under the first column; the first column reserves the legend's measured height and the last two reserve the minimap's measured height (`--minimap-h`) so nothing sits under the floating map.

**Down.** The trunk runs top to bottom with a downward arrowhead. Each Phase is one row: a 230px head column, then a horizontal branch on which teams stand in seven fixed columns by team number, so SYS is always column 1 and PAY column 7. The legend moves below the trunk. The choice is stored per browser.

**Detail sheet.** Same frame with 24px 28px padding: header (64px station, display heading, meta line, Whole mission / previous / next), the gate box, a Tasks tool row (Expand all / Collapse all), then team groups in CSS multi-column (340px columns, 32px gap), with the legend at the foot.

**Workshop open.** Whichever view it was opened from, the workspace becomes two columns: on the left a branch pane holding that Phase's column at its sheet width (sticky, full viewport height), on the right the panel. The panel can widen to full width, which hides the branch. Closing returns to the view it was opened from.

**Breakpoints.** At 1360px the sheet tightens (8px column gaps, smaller leaves, 7px slots). At 1100px the top bar wraps, the Tree toggle hides and layer toggles drop to their own row. At 1000px the trunk stacks to one column, the branch pane and minimap hide, and the panel becomes a fixed full-screen overlay.

Spacing rhythm is small and dense: 4, 6, 8, 12 inside components; 16, 20, 24, 32 between regions.

## Elevation & Depth

Flat. Depth is carried by line weight (1px hairline, 1px branch line, 1.5px ink symbol and frame rules, 2px gate diamond) and by one paper step (`--paper-raised`). The sheet separates from the desk by colour, not by shadow. Two things genuinely float above the sheet and only they cast a shadow.

### Shadow Vocabulary
- **Minimap float** (`box-shadow: 0 6px 20px rgb(0 0 0 / 0.14)`): the fixed bottom-right minimap, which overlaps the sheet.
- **Mobile panel lift** (`box-shadow: 0 -8px 32px rgb(0 0 0 / 0.18)`): the workshop panel only when it becomes a full-screen overlay below 1000px.

A picked detail group draws its rule twice (`box-shadow: 0 1px 0` in the layer colour). That is a line doubling to 2px, not elevation.

### Named Rules
**The Plotter Rule.** A plotter cannot draw a shadow. Nothing on the sheet casts one; separate things with a line or a paper step. Only an object that floats over the sheet may lift.

## Shapes

Square corners on every rectangle that is a control or a region: buttons, selects, segments, tabs, toggles, sheets, panel, gate box, gate step numbers, minimap (radius 0). Rounded and circular forms belong only to drawing symbols:
- **Team balloons:** circles (18px, 24px in detail groups) with 1.5px rings.
- **Phase stations:** by day an Earth, a 44px circle (64px in detail) with a hairline graticule; by night a satellite, the same box with 3px corners and two 12 × 18 solar panels on struts, folded to zero width at rest. The shape comes from theme tokens (`--station-radius`, `--station-globe`, `--station-wings`, `--station-gap`).
- **Material slots:** 8px squares, dashed branch line when empty, solid ink when filled (left = technical manual, right = notebook). Empty states enlarge it to a 28px dashed square.
- **Gate mark:** a 10px square rotated 45° with a 2px ink stroke.
- **Step tabs:** chevron tips drawn as 1.5px SVG strokes.
- **Icons:** 16px single-path SVG strokes, 1.5 stroke, square caps.

## Components

### Buttons
Thin-ruled, square, quiet.
- **Shape:** square corners, 32px tall, 32px square when icon-only.
- **Default:** paper fill, ink text, 1px branch-line border, label 500, 6px icon gap, 0 10px padding.
- **Hover / Active:** border goes to ink and fill to raised paper (150ms); active fills hairline.
- **Disabled:** hairline border, tertiary ink.
- **Text action:** "Next: notebook" is underlined ink text (1px, 3px offset), no box.

### Segmented Switches
Abutting 30px square segments that share borders (-1px overlap), branch-line borders, paper fill; hover raises the border to ink; the selected segment inverts to ink. Used for Tree Across / Down (arrow icon plus word), the notebook switcher, and the Day / Night / Auto theme switch, which is icon-only (32px wide, name in the tooltip): a sun, a planet with a 1px orbit, and a half-filled disc. While Night is active a 1.8px satellite square travels the orbit (6s loop, static under reduced motion).

### Inputs / Fields
- **Cohort select:** square, 30px, branch-line border, paper fill, label type, native appearance removed; the chevron is a CSS mask filled with secondary ink so it follows the theme. Hover raises the border to ink.
- **Focus:** the global 1.5px dashed ink outline at 2px offset.

### Navigation
- **Top bar:** sticky, 52px, paper with a hairline underneath, held in place during view transitions. Wordmark (title, 600); "Mission:" in secondary ink before the mission name, then the cohort select behind a hairline divider; then Tree, theme and Team groups at the right, each led by a quiet secondary-ink label.
- **Layer toggle:** balloon plus team code, transparent at rest, branch-line border on hover, ink border and raised paper when pressed, and its balloon fills with the layer colour.
- **Step tabs:** one connected bar reading Manual > Notebook > Tasks >. A 1.5px top rule runs across the bar, the first tab has a straight left edge, and each tab ends in a 13 × 38 chevron tip that interlocks with the next. The selected tab's rules and both chevrons touching it turn ink, its label goes ink 600, and it breaks the 1.5px ink baseline beneath. A tab whose material is missing carries an empty dashed slot; counts sit in secondary ink.
- **Phase navigation:** Whole mission, previous and next as standard buttons; arrow keys step Phases and Esc closes.

### Phase Station (signature)
The Phase code (600) on a paper station with a 1.5px ink outline. Hover or focus on the Phase head: by day the Earth fills with desk-sky blue; by night the satellite inverts to ink and its wings unfold outward from the body (260ms, `--ease-out`). The Phase name underlines on hover and the workshop count, a bare number in secondary ink, fades in; its space is reserved so nothing shifts. On screens without hover (`@media (hover: none)`, touch) the count is always visible. The detail station shows the art at 64px and does not unfold.

### Sheet Tree
Leaves are full-width rows: code, name, two slots. Hover fills raised paper and underlines the name. The leaf whose workshop is open inverts to ink, with code and slot dashes mixed toward paper.

### Detail Sheet
- **Gate box:** "To close Phase X", led by the gate diamond, framed in 1.5px ink like a drawing NOTE block. Review codes in 700 with their names, the source in caption, then numbered steps on an auto-fit grid (min 220px), each with a 20px square numeral boxed in 1.5px ink. Order is the information.
- **Groups:** balloon, team name and code over a 1px ink rule; a picked layer recolours the rule and doubles it.
- **Workshop rows:** code column, name and source line, slots and task count, then a separate 32px expand control whose chevron rotates 90° (200ms) to reveal tasks inline, indented under the name, each with a dotted code (C1.2) and a boxed "Notebook" tag where one exists. Expand all / Collapse all act on every row.

### Workshop Panel
Paper, 1px branch-line left edge, full viewport height. Crumb (Phase > balloon team), icon-only widen and close buttons, headline title with code in secondary ink, source line with the card id. It always opens on Manual. A resource bar (48px) names the material with a New tab or .ipynb action above the viewer. Loading is a 160px, 2px hairline track with an ink segment scanning across (1.4s); reduced motion shows a static bar. Empty material shows the 28px dashed slot, a title and one line; a missing notebook offers only notebooks from the same team.

### Minimap
A miniature of the whole tree, fixed 16px from the bottom right, framed in 1.5px ink, following the sheet's orientation. Everything sits in hairline and branch-line grey; the current location lights up: on the sheet every branch, in a detail sheet the trunk up to that Phase and all its branches, with a workshop open the trunk, that team and that workshop only. Lit lines and stations go ink; lit team balloons fill with their layer colour; lit workshop codes are 8px, weight 600, in the ink-mixed layer colour. Stations take the same shape as the sheet's Phase buttons (a circle by day, a square with 1.5px corners by night) and the same hover colours (desk sky by day, ink inversion by night). Stations and codes are clickable. It collapses to a small "Map" button, remembered per browser.

### Motion (signature)
- **Detail transition:** opening a Phase grows a clip from its station to the viewport (700ms, `cubic-bezier(0.45, 0, 0.2, 1)`); closing shrinks it back (480ms, `cubic-bezier(0.5, 0, 0.75, 0.2)`), both with `fill: forwards`. By day the clip is a circle with a synced 1.5px ink ring; by night it is a square inset (3px corners) with a synced 1.5px ink square frame. The default cross-fade is off and scroll is set inside the transition callback so nothing jumps.
- **Branch move:** opening a workshop from the sheet moves the real Phase head and team branches from the sheet into the branch pane (FLIP, 560ms, `cubic-bezier(0.3, 0, 0, 1)`; teams stagger 32ms when coming from Down). A fixed ghost of the sheet stays behind and fades out while the panel fades from 0.25 to 1 opacity (460ms). Closing reverses it and restores the scroll position.
- **Orientation flip:** switching Across / Down moves the same parts (620ms, same curve, 28ms per Phase and 18ms per team); connectors and legend reappear at 70% (260ms).
- **State changes:** 150ms for colour and border, 200ms for layer fades.
- Under `prefers-reduced-motion` every move is instant.

### Legend
"Slots after each workshop" with filled, half-filled and empty slot samples; on the sheet it adds a one-line hint over a hairline.

## Do's and Don'ts

### Do:
- **Do** separate regions with 1px hairlines or branch lines and a single paper step; let line weight carry hierarchy.
- **Do** show selection as ink inversion (ink fill, paper text) and focus as the 1.5px dashed ink outline at 2px offset.
- **Do** keep team colour on balloon rings at rest, and on balloon fills, branch lines and group rules only for the picked layer; fade everything else to opacity 0.5.
- **Do** pair every team colour with its numbered balloon and its `-on` digit colour, so colour is never the only signal.
- **Do** draw missing material as a dashed slot and keep it visible; absence is information.
- **Do** declare every new colour or shape token for Day and for both Night blocks.
- **Do** animate real elements with FLIP on `cubic-bezier(0.3, 0, 0, 1)`, and make every move instant under reduced motion.

### Don't:
- **Don't** round control or region corners; rounded forms belong to balloons, stations, the transition ring and the satellite.
- **Don't** add shadows, glows or blur; the floating minimap and the mobile full-screen panel are the only exceptions.
- **Don't** fill surfaces, buttons or text with team colour, or introduce an accent colour for selection.
- **Don't** use drawing grammar (balloons, dimension lines, title-block cells) where it carries no data.
- **Don't** show workshop progress status (done / active / pending); it is intentionally absent.
- **Don't** use a screenshot cross-fade for a view change; move the elements or clip from the station.
- **Don't** use cream or warm paper; the paper is cool (hue 240 by day, 262 by night).
