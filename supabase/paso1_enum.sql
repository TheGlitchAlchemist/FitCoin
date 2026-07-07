-- ═══════════════════════════════════════════════════════════════════
-- PASO 1 — Ejecutar PRIMERO, solo, y en su propia query.
-- Agrega los valores nuevos al enum transaction_type existente.
-- (Postgres no permite agregar valores a un enum y usarlos en la
--  misma transacción, por eso va separado del script principal.)
-- ═══════════════════════════════════════════════════════════════════

alter type public.transaction_type add value if not exists 'earned_activity';
alter type public.transaction_type add value if not exists 'penalty_suspicious_activity';
alter type public.transaction_type add value if not exists 'spent_redemption';
