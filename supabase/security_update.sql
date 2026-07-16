-- ============================================================
-- MISE À JOUR SÉCURITÉ — à coller dans Supabase Dashboard > SQL Editor
-- Corrige : la table recruiter_proposals était lisible publiquement,
-- exposant les e-mails et noms des recruteurs à n'importe qui.
-- ============================================================

-- 1. Supprimer la lecture publique de la table brute
drop policy if exists "Allow public select" on recruiter_proposals;

-- 2. Vue publique : uniquement les champs affichés sur la carte,
--    et uniquement les propositions approuvées (modération anti-spam).
--    Les colonnes contact_name / contact_email ne sont JAMAIS exposées.
create or replace view recruiter_pins_public as
  select id, created_at, company_name, lat, lng, job_type, duration, message
  from recruiter_proposals
  where status = 'approved';

grant select on recruiter_pins_public to anon, authenticated;

-- 3. L'insertion publique reste possible (le formulaire recruteur),
--    mais le pin ne s'affichera aux visiteurs qu'après ton approbation :
--    Dashboard > Table editor > recruiter_proposals > status = 'approved'
--
--    (La policy "Allow public inserts" existante est conservée.)
