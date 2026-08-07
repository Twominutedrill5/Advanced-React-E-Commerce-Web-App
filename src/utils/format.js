// Firestore timestamps arrive as Timestamp objects, but a document read back
// immediately after a write can still have `null` there while the server value
// resolves. Both cases have to be handled or the history page crashes.
export function formatOrderDate(value) {
  if (!value) return 'Just now';
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
