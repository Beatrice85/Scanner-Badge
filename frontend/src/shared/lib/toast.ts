export type NotificationToast = {
  id: number;
  message: string;
};

const EVENEMENT_TOAST = 'scanner-badge:toast';
let prochainId = 0;

export function notifierToast(message: string) {
  window.dispatchEvent(
    new CustomEvent<NotificationToast>(EVENEMENT_TOAST, {
      detail: { id: ++prochainId, message },
    }),
  );
}

export function ecouterToasts(handler: (toast: NotificationToast) => void) {
  const ecouter = (event: Event) => {
    handler((event as CustomEvent<NotificationToast>).detail);
  };
  window.addEventListener(EVENEMENT_TOAST, ecouter);
  return () => window.removeEventListener(EVENEMENT_TOAST, ecouter);
}
