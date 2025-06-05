# parse-regex-properties

Une bibliothèque TypeScript universelle compatible avec tout environnement JavaScript pour parser et valider des patterns regex personnalisés depuis des fichiers `.properties` utilisés dans les scripts Java, initialement largement implémentés par Alaris dans Ephesoft.

Cette bibliothèque permet de convertir des patterns regex avec options personnalisées vers des objets typés et vice versa, avec validation intégrée utilisant des schémas Zod.

## Installation

```bash
npm install parse-regex-properties
```

## Fonctionnalités principales

- ✅ **Parsing bidirectionnel** : Conversion patterns regex ↔ objets JavaScript
- ✅ **Sécurité de type** : Support TypeScript complet avec validation Zod
- ✅ **Options avancées** : Sensibilité à la casse, précision, exclusions globales/locales
- ✅ **Configuration de lecture** : Positionnement et paramètres de police
- ✅ **Validation stricte** : Contraintes sur les patterns et paramètres

## Cas d'usage principaux

### Migration et modernisation
Cette bibliothèque facilite la transition des anciens patterns regex Java vers des formats plus modernes :

- **Migration de version** : Convertir facilement des patterns legacy vers de nouvelles implémentations
- **Modernisation de code** : Passer d'une syntaxe propriétaire à des standards JavaScript/TypeScript
- **Amélioration des patterns** : Optimiser et refactoriser les expressions régulières existantes
- **Normalisation** : Standardiser l'écriture des patterns à travers différents projets

### Contrôle et gestion des données
- **Meilleur contrôle** : Manipulation programmatique des patterns avec validation en temps réel
- **Debugging facilité** : Décomposition des patterns complexes en objets lisibles
- **Réutilisabilité** : Transformation et adaptation des patterns pour différents contextes
- **Maintenance simplifiée** : Modification centralisée des logiques de patterns

## Comportements importants ⚠️

### Types de regex supportées

**Regex classique**
- Traitée comme une expression régulière JavaScript standard
- Aucune option spécifiée (excepté le flag optionnel `(?i)` pour la casse)

**Regex personnalisée**
- Utilise l'algorithme de Levenshtein pour la correspondance floue
- Active dès qu'une option est présente (précision, exclusions)
- Comparaisons de chaînes avancées

### Contraintes de validation

| Contrainte | Valeur | Description |
|------------|--------|-------------|
| **Longueur minimale** | 3 caractères | Patterns requis avec `MIN_PATTERN_LENGTH` (ajustable si besoin) |
| **Caractères interdits** | `\|`, `&&` | Opérateurs OU et ET non autorisés |
| **Précision** | 50-100 | Pourcentage de correspondance (défaut: 100) |

### Limitation connue : Exclusions globales

Les exclusions globales (`!!`) sont actuellement traitées comme des regex classiques dans certaines implémentations. Cette limitation est maintenue pour assurer la compatibilité avec les systèmes existants.

## Guide d'utilisation

### Exemple de base

```typescript
import { 
  keywordOptionsSchema, 
  readerOptionsSchema,
  stringToKeywordOptions,
  stringToReaderOptions,
  parseOptionsToString 
} from 'parse-regex-properties';

// Validation d'options de mots-clés
const keywordData = {
  pattern: "exemple",
  casse: true,
  precision: 85,
  globalExclusion: false,
  localExclusion: true
};

const validatedKeyword = keywordOptionsSchema.parse(keywordData);

// Validation d'options de lecture
const readerData = {
  y: 100,
  fontHeight: 12,
  charExclusion: "abc"
};

const validatedReader = readerOptionsSchema.parse(readerData);

// Parsing depuis une chaîne regex
const regexString = "(!!)(?#85)(?i)exemple";
const parsedOptions = stringToKeywordOptions.parse(regexString);

// Conversion vers une chaîne regex
const optionsObject = { pattern: "test", casse: true, precision: 90 };
const regexString2 = parseOptionsToString.parse(optionsObject);
```

### Utilisation avancée

```typescript
import { 
  buildKeywordOptionsSchema, 
  buildGlobalExclusion,
  stringToBuildKeywordOptions,
  validKeywordSchema,
  Pattern,
  KeywordOptions,
  ReaderOptions
} from 'parse-regex-properties';

// Pattern validé avec contraintes
const pattern: Pattern = "terme_valide";
const validatedPattern = validKeywordSchema.parse({ pattern });

// Configuration complète des mots-clés
const options: KeywordOptions = {
  pattern: "terme_recherche",
  casse: false,
  precision: 90,
  globalExclusion: true,
  localExclusion: false
};

// Configuration de lecture avancée
const readerConfig: ReaderOptions = {
  y: "max",              // Position Y maximale
  fontHeight: 14,        // Hauteur de police
  charExclusion: "abc"   // Regex de chaînes à exclure
};

// Construction depuis une chaîne
const buildOptions = stringToBuildKeywordOptions.parse("!!(?i)test");

// Création d'exclusion globale
const globalExclusion = buildGlobalExclusion.parse({ 
  globalExclusion: true, 
  pattern: "test" 
});
```

## Référence API

### Schémas de validation

#### `keywordOptionsSchema`
Valide les options de parsing des mots-clés.

| Propriété | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `pattern` | `string` | - | Pattern de recherche (min. 3 caractères) |
| `casse` | `boolean` | `false` | Sensibilité à la casse |
| `precision` | `number` | `100` | Précision de correspondance (50-100) |
| `globalExclusion` | `boolean` | `false` | Exclusion globale |
| `localExclusion` | `boolean` | `false` | Exclusion locale |

#### `readerOptionsSchema`
Valide la configuration de lecture.

| Propriété | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `y` | `number \| "max"` | `"max"` | Position verticale |
| `fontHeight` | `number` | `10` | Hauteur de police |
| `charExclusion` | `string?` | - | Regex de chaînes à exclure |

#### `keywordSchema`
Schéma combiné fusionnant les options de mots-clés et de lecture.

### Types TypeScript

```typescript
// Types principaux
type Pattern = string;              // Pattern validé
type KeywordOptions = { ... };      // Options de mots-clés
type ReaderOptions = { ... };       // Options de lecture
type BuildKeywordOptionsRegex = { ... }; // Options de construction
type PageExclusion = { ... };       // Exclusions de page
```

### Fonctions de transformation

#### Parsing : Chaîne → Objet

| Fonction | Entrée | Sortie | Description |
|----------|--------|--------|-------------|
| `stringToKeywordOptions` | `string` | `KeywordOptions` | Parse regex vers options |
| `stringToReaderOptions` | `string` | `ReaderOptions` | Parse config vers options |
| `stringToKeyword` | `string` | `KeywordOptions \| ReaderOptions` | Auto-détection |
| `stringToBuildKeywordOptions` | `string` | `BuildKeywordOptionsRegex` | Parse pour construction |

#### Conversion : Objet → Chaîne

| Fonction | Entrée | Sortie | Description |
|----------|--------|--------|-------------|
| `parseOptionsToString` | `Object` | `string` | Convertit options vers regex |

#### Schémas de construction

| Schéma | Description |
|--------|-------------|
| `buildKeywordOptionsSchema` | Construction de regex depuis options |
| `buildGlobalExclusion` | Gestion des exclusions globales |
| `validKeywordSchema` | Validation avec contraintes (interdit `\|`, `&&`) |

### Patterns regex reconnus

| Pattern | Description | Exemple |
|---------|-------------|---------|
| `(?i)` | Flag insensible à la casse | `(?i)exemple` |
| `(?#digits)` | Précision (50-100) | `(?#85)` |
| `!!` | Exclusion globale | `exemple!!` |
| `(!!)` | Exclusion locale | `exemple(!!)` |
| `y=value` | Position Y | `y=100`, `y=max` |
| `FontHeight=digits` | Hauteur de police | `FontHeight=12` |
| `exclude={regex}` | Regex de chaînes d'exclusion | `exclude={abc}`, `exclude={[0-9]+}` |

### Constantes

```typescript
import { 
  CASSE,                 // Flag de casse
  PRECISION,             // Paramètre de précision
  GLOBAL_EXCLUSION,      // Exclusion globale
  LOCAL_EXCLUSION,       // Exclusion locale
  Y,                     // Position Y
  FONT_HEIGHT,           // Hauteur de police
  CHAR_EXCLUSION,        // Exclusion de chaînes par regex
  MIN_PATTERN_LENGTH     // Longueur minimale (3)
} from 'parse-regex-properties';
```

## Développement

### Scripts disponibles

```bash
# Compilation
npm run build

# Tests
npm run test

# Nettoyage
npm run clean
```

### Publication

Configuration pour le registre interne Arkea :

```bash
npm publish
```

> **Note** : Le script `prepublishOnly` compile automatiquement le projet avant publication.

## Structure du projet

```
parse-regex-properties/
├── src/
│   ├── base-schema.ts       # Schémas Zod de base
│   ├── build-schema.ts      # Schémas de construction
│   ├── transform-schema.ts  # Schémas de transformation
│   ├── types.ts            # Types TypeScript
│   └── index.ts            # Point d'entrée
├── dist/                   # Build de production
├── tests/
│   └── regex.test.ts       # Tests unitaires
├── tsconfig.json
├── jest.config.js
└── package.json
```

## Contributeurs

- **ns969** 

## Licence

**UNLICENSED** - Usage interne Arkea uniquement.

---

*Cette bibliothèque fait partie de l'écosystème Eclair pour le facilitation de la lecture de fichiers .properties avec des patterns regex personnalisés.*