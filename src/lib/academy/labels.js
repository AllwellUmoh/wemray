/* ------------------------------------------------------------------ *
 * Pure formatting helpers for academy data.
 *
 * Client-safe: no database import. Client components import from here;
 * server modules import the same functions from ./courses, which
 * re-exports them.
 * ------------------------------------------------------------------ */

/** "Hybrid & Online" from ["Hybrid", "Online"]. */
export function formatLabel(formats = []) {
  if (!formats.length) return '';
  if (formats.length === 1) return formats[0];
  return `${formats.slice(0, -1).join(', ')} & ${formats[formats.length - 1]}`;
}

/** "Weekday & Weekend" from ["Weekday", "Weekend"]. */
export function deliveryLabel(delivery = []) {
  if (!delivery.length) return '';
  if (delivery.length === 1) return delivery[0];
  return `${delivery.slice(0, -1).join(', ')} & ${delivery[delivery.length - 1]}`;
}
