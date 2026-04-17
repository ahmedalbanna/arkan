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
            from: {
                orphan: true,
                pathNot: [
                    '^src/modules/users/adapters/api-client/DeviceTokenApiClient\\.ts$',
                    '^src/modules/users/adapters/components/admin/EditUserForm\\.tsx$',
                    '^src/modules/users/adapters/components/auth/GuestProfilePage\\.tsx$',
                    '^src/modules/users/adapters/components/auth/PhoneAuthForm\\.tsx$',
                    '^src/modules/users/domain/utils/randomPassword\\.ts$',
                    '^src/modules/users/infrastructure/services/TwoFactorAuthService\\.ts$'
                ]
            },
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
