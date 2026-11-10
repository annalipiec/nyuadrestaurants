/** Up to two uppercase initials from a name, ignoring anything after a comma
 *  (e.g. "Amara, Class of 2027" → "A"). */
export function initials(name: string) {
  return name
    .split(',')[0]
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
