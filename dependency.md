We need to provide a configuration file for dependency-cruiser that enforces Clean Architecture rules for the Arkan project. The user wants to set up dependency validation for the modular structure with domain, application, adapters, infrastructure layers. We should explain what dependency-cruiser does and provide a tailored config with rules preventing improper dependencies (e.g., domain importing from infrastructure). Also mention how to run it and integrate with CI.

Key aspects:

Modules in src/modules/* each have domain, application, adapters, infrastructure.

Domain should be isolated (no external deps except maybe shared utils like zod, result).

Application can depend on domain.

Adapters can depend on application and domain (but not infrastructure directly? Actually controllers inject use cases and repos, so adapters may import infrastructure for DI setup, but ideally we want to limit that. For practicality, adapters might import from infrastructure for composition root).

Infrastructure implements domain interfaces.

We'll create a config that defines layers and rules.


Below is a tailored `.dependency-cruiser.js` configuration file for the Arkan project. It enforces Clean Architecture layer boundaries and will help you visually validate the dependency flow within `src/modules/`.

Place this file in your project root.

```javascript
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies are not allowed.',
      from: {},
      to: { circular: true }
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: 'Files that are not imported by any other file (except entry points).',
      from: { orphan: true },
      to: {}
    },
    // ============================================================
    // Clean Architecture Layer Rules for src/modules/
    // ============================================================
    {
      name: 'domain-must-not-depend-on-outer-layers',
      severity: 'error',
      comment: 'The domain layer must have zero dependencies on adapters, application, or infrastructure.',
      from: { path: '^src/modules/[^/]+/domain/' },
      to: {
        path: '^src/modules/[^/]+/(adapters|application|infrastructure)/',
        pathNot: '\\.(test|spec)\\.(ts|tsx)$'
      }
    },
    {
      name: 'domain-must-not-depend-on-other-modules-domain',
      severity: 'error',
      comment: 'Domain of one module should not directly import domain of another module (use interfaces if cross-module communication is needed).',
      from: { path: '^src/modules/([^/]+)/domain/' },
      to: {
        path: '^src/modules/(?!$1)[^/]+/domain/',
        pathNot: '\\.(test|spec)\\.(ts|tsx)$'
      }
    },
    {
      name: 'application-must-not-depend-on-adapters-or-infrastructure',
      severity: 'error',
      comment: 'Application layer (use cases) should only depend on domain and possibly shared utilities.',
      from: { path: '^src/modules/[^/]+/application/' },
      to: {
        path: '^src/modules/[^/]+/(adapters|infrastructure)/',
        pathNot: '\\.(test|spec)\\.(ts|tsx)$'
      }
    },
    {
      name: 'adapters-must-not-depend-on-infrastructure-directly',
      severity: 'warn',
      comment: 'Adapters should ideally not import infrastructure directly; dependencies should be injected via composition root.',
      from: { path: '^src/modules/[^/]+/adapters/' },
      to: {
        path: '^src/modules/[^/]+/infrastructure/',
        pathNot: '\\.(test|spec)\\.(ts|tsx)$'
      }
    },
    {
      name: 'infrastructure-must-not-depend-on-other-layers',
      severity: 'error',
      comment: 'Infrastructure should only depend on domain (interfaces) and external libraries.',
      from: { path: '^src/modules/[^/]+/infrastructure/' },
      to: {
        path: '^src/modules/[^/]+/(adapters|application)/',
        pathNot: '\\.(test|spec)\\.(ts|tsx)$'
      }
    },
    {
      name: 'no-cross-module-imports-except-shared',
      severity: 'error',
      comment: 'Modules should be self-contained. Only allowed cross-module imports are from shared utilities or via defined public APIs.',
      from: { path: '^src/modules/([^/]+)/' },
      to: {
        path: '^src/modules/(?!$1)[^/]+/',
        pathNot: ['\\.(test|spec)\\.(ts|tsx)$', '^src/modules/[^/]+/domain/schemas/']
      }
    },
    {
      name: 'no-app-router-imports-from-modules',
      severity: 'error',
      comment: 'The Next.js app/ directory (UI pages, API routes) may import from modules, but modules must never import from app/.',
      from: { path: '^src/modules/' },
      to: { path: '^src/app/' }
    }
  ],
  options: {
    doNotFollow: {
      path: ['node_modules', 'dist', '\\.next']
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json'
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default']
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/(@[^/]+/[^/]+|[^/]+)',
        theme: {
          graph: { rankdir: 'TB' },
          modules: [
            {
              criteria: { source: '^src/modules/[^/]+/domain/' },
              attributes: { fillcolor: '#b5e48c', style: 'filled' }  // green
            },
            {
              criteria: { source: '^src/modules/[^/]+/application/' },
              attributes: { fillcolor: '#90e0ef', style: 'filled' }  // light blue
            },
            {
              criteria: { source: '^src/modules/[^/]+/adapters/' },
              attributes: { fillcolor: '#f9c74f', style: 'filled' }  // yellow
            },
            {
              criteria: { source: '^src/modules/[^/]+/infrastructure/' },
              attributes: { fillcolor: '#f94144', style: 'filled' }   // red
            }
          ],
          dependencies: [
            {
              criteria: { resolved: '^src/modules/[^/]+/domain/' },
              attributes: { color: '#2d6a4f' }
            },
            {
              criteria: { resolved: '^src/modules/[^/]+/infrastructure/' },
              attributes: { color: '#9d0208' }
            }
          ]
        }
      },
      archi: {
        collapsePattern: '^src/modules/([^/]+)/([^/]+)',
        theme: {
          modules: [
            {
              criteria: { source: '\\.domain\\.' },
              attributes: { fillcolor: '#b5e48c' }
            },
            {
              criteria: { source: '\\.application\\.' },
              attributes: { fillcolor: '#90e0ef' }
            },
            {
              criteria: { source: '\\.adapters\\.' },
              attributes: { fillcolor: '#f9c74f' }
            },
            {
              criteria: { source: '\\.infrastructure\\.' },
              attributes: { fillcolor: '#f94144' }
            }
          ]
        }
      }
    }
  }
};
```

---

### How to Use

1. **Install dependency-cruiser**
   ```bash
   npm install --save-dev dependency-cruiser
   ```

2. **Run validation** (checks rules, fails on `error` severity)
   ```bash
   npx depcruise src
   ```

3. **Generate a visual graph** (SVG)
   ```bash
   npx depcruise --output-type dot src | dot -T svg > architecture-deps.svg
   ```

4. **Generate an interactive HTML report**
   ```bash
   npx depcruise --output-type html src > deps-report.html
   ```

5. **Integrate with CI**
   Add to your `package.json` scripts:
   ```json
   "lint:deps": "depcruise src"
   ```
   Then include it in your CI pipeline (e.g., GitHub Actions) to prevent architectural violations.

---

### Customization Notes

- **Layer colors** in the `dot` reporter match the Clean Architecture layers (green = domain, blue = application, yellow = adapters, red = infrastructure).
- **Cross-module schema imports** are allowed (`pathNot: '^src/modules/[^/]+/domain/schemas/'`) because schemas are often shared as a public API between modules (e.g., `UserSchema` used in `projects`). You can tighten this rule if needed.
- The `adapters-must-not-depend-on-infrastructure-directly` rule is set to `warn` because in practice your composition root (e.g., `src/app/api/.../route.ts`) may need to wire up dependencies. Adjust to `error` once you've moved all wiring to a dedicated container.

This configuration will give you immediate feedback on architectural drift and help maintain the integrity of your Clean Architecture implementation.
