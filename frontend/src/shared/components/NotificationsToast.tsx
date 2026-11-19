import { useEffect, useRef, useState } from 'react';
import { ecouterToasts, type NotificationToast } from '../lib/toast';

const DUREE_AFFICHAGE = 2500;

export default function NotificationsToast() {
  const [toasts, setToasts] = useState<NotificationToast[]>([]);
  const temporisateurs = useRef(new Map<number, number>());

  useEffect(() => {
    const arreterEcoute = ecouterToasts(toast => {
      setToasts(liste => [...liste, toast]);
      const temporisateur = window.setTimeout(() => {
        setToasts(liste => liste.filter(element => element.id !== toast.id));
        temporisateurs.current.delete(toast.id);
      }, DUREE_AFFICHAGE);
      temporisateurs.current.set(toast.id, temporisateur);
    });

    return () => {
      arreterEcoute();
      temporisateurs.current.forEach(temporisateur => window.clearTimeout(temporisateur));
      temporisateurs.current.clear();
    };
  }, []);

  function fermer(id: number) {
    const temporisateur = temporisateurs.current.get(id);
    if (temporisateur !== undefined) window.clearTimeout(temporisateur);
    temporisateurs.current.delete(id);
    setToasts(liste => liste.filter(toast => toast.id !== id));
  }

  return (
    <div className="fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
      {toasts.map(toast => (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-800 bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-xl"
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => fermer(toast.id)}
            aria-label="Fermer la notification"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-emerald-800"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      ))}
    </div>
  );
}
