// ─────────────────────────────────────────────────────────────────────────────
// ARCHIVO: lib/activitySync.ts
// PROPÓSITO: Puente global para forzar un sync de pasos antes del logout.
//
// useActivity registra su función de sync aquí.
// App.tsx la llama antes de cerrar sesión, garantizando que los pasos
// se guarden en Supabase aunque el timer de 60s no haya disparado aún.
// ─────────────────────────────────────────────────────────────────────────────

type SyncFn = () => Promise<void>;

let _pendingSync: SyncFn | null = null;

/** useActivity llama esto para registrar su función de sync. */
export function registerActivitySync(fn: SyncFn) {
  _pendingSync = fn;
}

/** App.tsx llama esto antes de signOut para guardar pasos pendientes. */
export async function flushActivitySync(): Promise<void> {
  if (_pendingSync) {
    try {
      await _pendingSync();
    } catch (e) {
      console.warn('[activitySync] Error al hacer flush:', e);
    }
  }
}

/** Limpia la referencia al cerrar sesión. */
export function clearActivitySync() {
  _pendingSync = null;
}
