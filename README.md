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

## ✅ Opti du temps & des artefacts

- ❌ Voir si moyen de ubuntu & bun i une seule fois > en faire un artefacts et réutiliser ?
  - Ne mettre à jour que si les versions dans le package.json sont changées ?
  - ❌ Complicado et pas forcément utile, il faut que ça tourne au moins une fois
  - ✅ On peut toutefois utiliser les artefacts en cas de multiples jeux de tests je pense ?
    - ~ oui : un seul jeu de test, séparé en multiples fichiers plutôt
  - ✅📌 Tester implémentation
    - `_ci.yml` > le fichier global
    - `_install.yml` > installation à réutiliser
    - `maths.yml` & `strings.yml`, deux jeux de tests séparés avec quelques fichiers d'illustrations
    - Juste afin de voir si la structure fonctionne correctement
  - ✅♻️ Refacto avec include ?
    - dispo dans gitlab (non natif ? chelou, ptet a cause de yml et pas yAml, bref)
    - "rien" dans github mais en fait sous dossier .github/actions/xxx fait pour ça

---

## Intégration du gitflow ~ branches main, dev, features

💥 Attention, au niveau des règles, on **DOIT** passer par du pull-request afin de forcer les tests pré-merge !

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

---

### Commandes d'implémentations

#### Mise en place

Run these yourself from the repo. Do not create the branches until the workflow change is on main, otherwise dev and the examples will not contain the new CI.

```bash
git checkout main
git pull origin main

git checkout -b dev
git push -u origin dev

git checkout dev
```

- feat-1234-XXX is cut from dev.
- hfix-1234-XXX is cut from main.
- 💥 After a hotfix lands on main, rebase dev onto main by hand (manual only ! 💥) :

```bash
git checkout dev && git rebase main
```

---

#### Commandes usuelles

```bash
# Créer une branche de feat
git checkout dev
git checkout -b feat-1234-XXX
git push -u origin feat-1234-XXX

# Créer une branche de hotfix
git checkout main
git checkout -b hfix-1234-XXX
git push -u origin hfix-1234-XXX

# Rebase de dev sur main
git checkout main
git pull origin main
git checkout dev
git pull origin dev
git rebase main
git push --force-with-lease origin dev

# PR de dev vers main
gh pr create --base main --head dev

# Rebase d'une feat : d'abord dev sur main, puis la feat sur dev
git checkout main
git pull origin main
git checkout dev
git pull origin dev
git rebase main
git push --force-with-lease origin dev
git checkout feat-1234-XXX
git rebase dev
git push --force-with-lease origin feat-1234-XXX

# PR d'une feat vers dev
gh pr create --base dev --head feat-1234-XXX

# PR d'un hotfix vers main
gh pr create --base main --head hfix-1234-XXX
```

---

## End to End e2e

Pas sûr que ça soit possible en ligne, il faut un back qui tourne.. Voir si moyen d'enforce en local avant l'envoi ?
