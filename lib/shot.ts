/**
 * The projector shot's live state.
 *
 * One mutable object: written by the scrubbed timeline in
 * components/chrome/ProjectorShot.tsx, read every frame by the render loops that
 * draw the shot. Module state, not React state — it changes on every scroll
 * frame, and nothing should re-render for it.
 */
export const shot = {
  /** How far the projector has left the hero photograph, 0 → 1. */
  lift: 0,
  /** The projector's light, in viewport CSS pixels. Drawn by BeamCanvas. */
  beam: {
    /** Overall intensity, 0 → 1. */
    on: 0,
    /** How far from the lens toward the target the light has travelled, 0 → 1. */
    reach: 0,
    /** The lens. */
    ox: 0,
    oy: 0,
    /** Where the light lands. */
    tx: 0,
    ty: 0,
    /** Half-angle of the cone, in radians. */
    spread: 0.16,
  },
};
