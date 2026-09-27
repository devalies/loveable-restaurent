# Usk Bar & Grill visual and layout refinements

## What will change
- Give the site a more distinctive, welcoming typographic identity: replace the current Playfair Display and Manrope pairing with a characterful restaurant-appropriate display face and a clear, humanist reading face. Keep type sizes and line wrapping comfortable on small phones.
- Make the reviews shorter and easier to browse: use a compact, horizontally scrollable review track with left and right arrow controls flanking it. Arrows slide by one review; mouse wheel/trackpad horizontal scrolling, click-and-drag with a mouse, and touch swipes also work. Keep review text readable rather than clipping it, and handle one or zero reviews gracefully.
- Reorganize the contact section so “Come see us” and “Drop us a line” start level in two columns on larger screens, then place the map beneath both columns at full available width. On phones, stack the contact blocks and map cleanly.
- Add restrained entrance motion as sections come into view, plus subtle interactive transitions; disable nonessential motion when visitors prefer reduced motion.
- Audit and tune mobile spacing, text wrapping, buttons, navigation, review controls, form, and map at narrow Android-sized widths, avoiding oversized or overflowing buttons.

## Technical approach
- Adjust the existing homepage, shared typography tokens/font loading, and button sizing only where needed; preserve the current brand colors, content, logo, and contact behavior.
- Use a scroll-snap review container with synchronized arrow controls and pointer dragging. Use a viewport observer for reveal effects without delaying content visibility when scripts are unavailable.
- Verify the resulting page and interactions in a browser at desktop and narrow mobile sizes, including review navigation, dragging/swiping, map layout, and reduced-motion behavior.

The existing owner-only staff-access task remains separate and still awaits the owner's account identity.
