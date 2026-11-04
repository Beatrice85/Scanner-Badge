// Les dates saisies via <input type="date"> ("2026-08-10") sont stockées par le
// backend à minuit UTC : on formate en UTC pour éviter un décalage d'un jour.

export function formaterDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-FR', { timeZone: 'UTC' });
}

// Valeur pour un <input type="date"> à partir d'une date ISO renvoyée par l'API.
export function versChampDate(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 10) : '';
}
