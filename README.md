# Tests and notes about github actions

## 📝 Docs

- ✅ Bases
  - ~✅ [Officiel](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs)
    - Pas ouf, orienté node + besoin d'installer les dépendances et tout, utilisable si poussé avec sauvegarde d'artefacts, etc.
  - ✅📌 [Medium](https://medium.com/@morepravin1989/automatically-run-tests-using-github-actions-step-by-step-guide-for-beginners-with-example-51acdd6dd0ea)
  - //
  - ✅ Confirme que le langage à utiliser c'est le yml donc pas perdu ça va
  - 📝 en continu : noter les points à rechercher & améliorer/implémenter
  - ✅ Permet de lancer sur pull request ou **push**, à voir pour les merge
    - ✅ Note également pour branches spécifiques
  - ⬆️ Tourne sous npm, voir si moyen d'utiliser bun

### Tuto medium

- ✅⬆️ Adapter
  - ✅ bun
  - ✅ TS
  - ✅📌 Juste faire un POC afin de confirmer le bon fonctionement de GH actions..

---

#### Github > Onglet actions

- Tous les workflows
  - Inclus "Run Tests" qui est le nom fixé dans le .yml `name: Run Tests`
  - 🚨 Attention, le `.github\workflows\wtv.yml` DOIT être dans le dossier principal, pas dans le dossier applicatif
  - Notes rajoutées dans le fichier concerné

- ✅ Possibilité de lancer le (jeu de) test en direct depuis l'onglet `on: workflow_dispatch:`
  - ✅📌 Ok
  - ✅⬆️ Clean warning & deprecations
    - ubuntu-latest va maj ~19 octobre 2026 > message rapide sur le teams général
    - ✅FIX: warning sur node 20 deprecated ? wat > voir si moyen de spécifier la dernière version de manière explicite

- ❌ Organisation en sous dossiers ?
  - GitHub Actions does not support nested subfolders inside the .github/workflows/ directory. All workflow configuration files must be stored directly in the flat .github/workflows/ folder at the root of your repository to be recognized and executed
  - 💬 ATTENTION au niveau de l'organisation, il faudra tout préfixer de manière extrêmement stricte, si on décide de séparer les jeux de tests afin d'avoir une meilleure granularité

---

## Opti du temps & des artefacts

- ❌ Voir si moyen de ubuntu & bun i une seule fois > en faire un artefacts et réutiliser ?
  - Ne mettre à jour que si les versions dans le package.json sont changées ?
  - ❌ Complicado et pas forcément utile, il faut que ça tourne au moins une fois
  - ✅ On peut toutefois utiliser les artefacts en cas de multiples jeux de tests je pense ?
    - ~ oui : un seul jeu de test, séparé en multiples fichiers plutôt
  - 📌 Tester implémentation
    - `_ci.yml` > le fichier global
    - `_install.yml` > installation à réutiliser
    - `maths.yml` & `strings.yml`, deux jeux de tests séparés avec quelques fichiers d'illustrations
    - Juste afin de voir si la structure fonctionne correctement

---

## End to End e2e

Pas sûr que ça soit possible en ligne, il faut un back qui tourne.. Voir si moyen d'enforce en local avant l'envoi ?

---

## Intégration du gitflow ~ branches main, dev, features

### Branche `main`

Doit rester stable, les tests doivent être effectués avant de merge dedans

### Branche `dev`

est la branche intermédiaire avec multiples features.

Virtuellement inutile au vu du CI/CD, mais permettra d'avoir de la versatilité en cas d'instabilités prononcées, le temps que la majeure partie des tests soient implémentés

- Les tests sont effectués avant que dev soit merge dans main

### Branches features `feat-1234-XXX`

- nom `feat` + n° de ticket Jira + sujet rapide.
- Branches dédiées aux développements spécifiques, scopées
- Tests effectués lors que des mises à jour sont push
- Tests effectués lorsque la feature est merge dans dev (avant)
  - `dev` doit être rebase avant, les conflits sont traités en amont dans les branches `feat`

### Branches hotfix `hfix-1234-XXX`

- nom `feat` + n° de ticket Jira + sujet rapide.
- Exceptionnellement peut être crée à partir de `main` et re-mergée dedans, en vue de correction rapide
  - DOIT toutefois effectuer les tests avant d'être merge, afin de ne pas introduire de nouvelles régréssions lors du FIX
- Une fois mergée dans `main`, `dev` doit être rebase
