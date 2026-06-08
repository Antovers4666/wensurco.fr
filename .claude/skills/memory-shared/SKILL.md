---
name: memory-shared
description: |
  Use this skill to read and write shared memory between agents
  on wensurco.fr. All agents must check MEMORY.md before starting
  and update it after completing a task.
---
# Mémoire partagée — wensurco.fr

## Protocole lecture
Au début de chaque tâche : lire .claude/MEMORY.md pour connaître
l'état actuel du projet et éviter de refaire un travail déjà fait.

## Protocole écriture
À la fin de chaque tâche : ajouter dans .claude/MEMORY.md :
- Date
- Agent qui a travaillé
- Ce qui a été fait
- Ce qui reste à faire
- Problèmes rencontrés

## Format d'entrée
## [DATE] — [NOM AGENT]
**Fait :** description courte
**Reste :** description courte
**Problèmes :** aucun / description
