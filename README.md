# Tests and notes about github actions

## Commandes

```bash
# Installation
bun i
bunx playwright install chromium

## ! Forcer les tests e2e en local, à activer une fois par poste
# POC dans `my-project` : `bun run test:e2e` (Playwright + `Bun.serve`).
# Une fois par clone :
git config core.hooksPath .githooks
# Le hook `pre-push` lance `test:e2e` avant `git push` (donc avant la PR). `git push --no-verify` le saute. Le check GitHub `gate` ne lance pas Playwright.

# 💥💥💥 🔧 auto merge from dev to main on accepted PR requires a GITHUB_TOKEN
# cf. tout en bas de ce doc pour la création du token (🔐 compte personnel, pas le repo)
# 💥 Besoin de gérer le token AVANT
# gh secret set PROMOTE_TOKEN --repo {owner}/{repo}

# ---

# Tests unitaires
bun run test

# Tests e2e avec browser (POC via bun en serveur & playwright+chromium )
bun run test:e2e

# Lancer le serveur local > http://localhost:3000/ pour voir la page avec un titre :')
bun run start
```

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

### ⚡️👨‍💻📝 Exceptions

Possibilité de push de la doc, fichiers markdown uniquement, en direct.

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
  - `dev` doit déjà contenir `main` (`sync-main` après un hotfix). Rebase la feat sur `dev` ; les conflits se traitent sur `feat-*`

### Branches hotfix `hfix-1234-XXX`

- nom `feat` + n° de ticket Jira + sujet rapide.
- Exceptionnellement peut être crée à partir de `main` et re-mergée dedans, en vue de correction rapide
  - DOIT toutefois effectuer les tests avant d'être merge, afin de ne pas introduire de nouvelles régréssions lors du FIX
- Une fois mergée dans `main`, `sync-main` met `dev` à jour (PR, pas de push direct)

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
- After a hotfix lands on main, `sync-main.yml` opens a PR into `dev`. Do not force-push `dev`.

##### gitflow implementation through terminal `gh` commands

Push `_ci.yml` (with the `gate` job) to `main` **before** creating the ruleset. Direct pushes to `main`/`dev` are blocked afterwards.

```bash
# Context: repo courant (owner/name)
gh repo view --json nameWithOwner --jq .nameWithOwner

# Vérifier qu'aucun ruleset n'existe déjà
gh api repos/{owner}/{repo}/rulesets

# Créer le ruleset : PR obligatoire + check `gate` + branche à jour
# Remplacer {owner}/{repo} (ex. youpiwaza/test-github-actions)
gh api --method POST \
  -H "Accept: application/vnd.github+json" \
  --input - \
  repos/{owner}/{repo}/rulesets <<'EOF'
{
  "name": "Protect dev and main",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["refs/heads/main", "refs/heads/dev"],
      "exclude": []
    }
  },
  "rules": [
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false,
        "allowed_merge_methods": ["merge", "squash", "rebase"]
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [
          { "context": "gate" }
        ]
      }
    }
  ]
}
EOF

# Lister / inspecter
gh api repos/{owner}/{repo}/rulesets
# gh api repos/{owner}/{repo}/rulesets/{id}

# 💥⛓️🔐 Désactiver / réactiver : Settings > Rules > Rulesets > Protect dev and main
# (un PUT partiel sur `enforcement` seul est refusé ; il faut tout le JSON, ou l'UI)
```

---

#### Commandes usuelles

```bash
# Créer une branche de feat
git checkout dev
git checkout -b feat-8888-test-demo
git push -u origin feat-1234-XXX

# Créer une branche de hotfix
git checkout main
git checkout -b hfix-1234-XXX
git push -u origin hfix-1234-XXX

# PR de dev vers main
gh pr create --base main --head dev

# Rebase d'une feat sur dev (dev est mis à jour par sync-main, pas par un push)
git fetch origin
git checkout feat-1234-XXX
git rebase origin/dev
git push --force-with-lease origin feat-1234-XXX

# PR d'une feat vers dev
gh pr create --base dev --head feat-1234-XXX

# PR d'un hotfix vers main
gh pr create --base main --head hfix-1234-XXX
```

---

## End to End : ~= tests poussés avec navigateur & calls au back

Pas sûr que ça soit possible en ligne, il faut un back qui tourne.. Voir si moyen d'enforce en local avant l'envoi ?

---

### Specs vs E2E

Les specs (unitaires / composant) restent dans le repo front : pas besoin d'API. L'E2E est possible avec back et front séparés ; Actions n'a besoin que d'une URL HTTP que le navigateur peut appeler.

### ❌ ~~Backend hébergé~~

~~Pointer Playwright/Cypress vers un environnement déjà déployé (`staging`). Job front : build, puis E2E contre cette URL. Pas de clone du back. Inconvénient : on teste le back déployé, pas celui de la PR ; données/auth dédiées ; si staging est down, les PRs front cassent.~~

Yeah non, contraignant à moins d'avoir un vrai circuit DevOps (lorsqu'un PR est accepté sur le back, il est déployé sur le staging afin de rester à jour, PUIS cela trigger les tests du front, etc.)

Clairement faisable mais besoin de temps & des compétences afin de ne pas faire n'importe quoi, c'est un métier x')

### ~❌ Backend démarré dans le job front

Checkout du repo back (`actions/checkout` + PAT), Docker / bun / Nest, attendre le healthcheck, lancer l'E2E. Pinner le commit back (`main`, tag, `BACKEND_SHA`). Plus long, secrets + DB, et il faut choisir quelle version du back booter.

~❌ Moins sécurisé, couteux en temps, etc.

### ~✅ Repo E2E ou workflow réutilisable

Un petit repo (ou `workflow_call`) qui checkout **front et back**, les démarre, lance la suite. Un merge sur `dev`/`main` d'un des deux repos peut le déclencher. Évite de dupliquer le YAML E2E.

~✅ Yeah un repo commun dédié au tests uniquements, DRY, ça pourrait marcher.

Mais à voir pour forcer les autres repos à passer (et attendre les résultats) des tests avant de valider les merge, je sais pas si ni comment c'est possible.

### ~❌ ~~Mocks~~

~~MSW / API enregistrée ≠ E2E. Utile pour l'intégration composant. Les parcours critiques passent par une vraie API (ou Docker).~~

~❌ Je ne recommande pas, clairement sujet à de faux positifs (le test du front passe > le back à été mis à jour mais cela n'est pas répercuté sur le test)

### ✅⚡️ Local avant push

Un hook pre-push peut lancer l'E2E si la stack tourne. Facultatif et contournable (`--no-verify`). C'est le check `gate` sur les PR vers `dev`/`main` qui bloque vraiment. Le local est un raccourci, pas l'enforcement.

✅⚡️ Clairement le plus simple & le moins couteux à mettre en place, ne demande pas un grosse montée en compétences de DevOps, Dans un premier temps on va partir la dessus

---

## Config pour auto-merge dev et main sur tests OK

La PR reste obligatoire. Personne ne clique sur Merge : GitHub merge en squash dès que `gate` est vert et que la branche est à jour.

Une fois par repo (Settings > General > Pull Requests, ou) :

```bash
gh api --method PATCH repos/{owner}/{repo} -F allow_auto_merge=true
```

Le workflow [`.github/workflows/auto-merge.yml`](.github/workflows/auto-merge.yml) lance `gh pr merge --auto --squash` à l'ouverture (et à chaque push) d'une PR vers `dev` ou `main`.

### 🤖♨️ auto merge de dev vers main quand PR dev OK

Un merge `feat-*` vers `dev` ne merge pas `main` tout seul. [`.github/workflows/promote-dev.yml`](.github/workflows/promote-dev.yml) s'exécute quand cette PR est mergée : il ouvre une PR `dev` vers `main` (ou réutilise celle déjà ouverte) et active l'auto-merge. `gate` tourne une seconde fois.

### Sync main vers dev

Un push sur `main` (hotfix ou promote) ne met pas `dev` à jour tout seul, et un `git push` sur `dev` est bloqué. [`.github/workflows/sync-main.yml`](.github/workflows/sync-main.yml) ouvre (ou réutilise) une PR `sync-main` vers `dev`, merge `main` dessus, et active l'auto-merge. `gate` tourne. Un conflit arrête le job. Ce merge n'appelle pas `promote-dev.yml`.

Les workflows auto-merge, promote-dev et sync-main utilisent le secret `PROMOTE_TOKEN` (PAT, scope `repo`). Un merge fait avec `GITHUB_TOKEN` ne déclenche pas le workflow suivant.

GitHub does not issue PROMOTE_TOKEN. You create a personal access token, then save that value as an Actions secret. After it is saved, GitHub never shows it again.

1. On GitHub: Settings (your user, not the repo) → Developer settings (note max: colonne de gauche, tout en bas !) → Personal access tokens → Fine-grained tokens → Generate new token.
2. Resource owner: your user. Repository access: only youpiwaza/test-github-actions.
3. Permissions: Contents Read and write, Pull requests Read and write. Metadata is included.
4. Generate, then copy the token once (github_pat_...).

Store it on the repo:

```bash
# Cela va générer un prompt dans lequel il faudra coller le secret généré ci-dessus
gh secret set PROMOTE_TOKEN --repo {owner}/{repo}
```

- `feat-*` ou `sync-main` vers `dev` ; `dev` ou `hfix-*` vers `main` : `guard` refuse le reste.
- Tests en échec : la PR reste ouverte.
- Branche en retard sur `dev`/`main` : l'auto-merge attend une mise à jour, il ne rebase pas.
- Le hook local `test:e2e` n'est pas relancé ici. `gate` ne lance pas Playwright.

