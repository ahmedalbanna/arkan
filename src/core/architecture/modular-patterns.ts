/**
 * Modular Design Patterns
 * Provides patterns for building modular, maintainable applications
 */

import { ServiceContainer, ServiceIdentifier } from './dependency-injection';

// Module Definition
export interface Module {
  name: string;
  version: string;
  dependencies: string[];
  services: ServiceDefinition[];
  initialize?(container: ServiceContainer): Promise<void>;
  dispose?(): Promise<void>;
}

export interface ServiceDefinition {
  identifier: ServiceIdentifier;
  factory: (container: ServiceContainer) => unknown;
  singleton?: boolean;
  dependencies?: ServiceIdentifier[];
}

// Module Registry
export class ModuleRegistry {
  private modules = new Map<string, Module>();
  private loadedModules = new Set<string>();

  register(module: Module): void {
    if (this.modules.has(module.name)) {
      throw new Error(`Module already registered: ${module.name}`);
    }

    this.modules.set(module.name, module);
  }

  async loadModule(name: string, container: ServiceContainer): Promise<void> {
    if (this.loadedModules.has(name)) {
      return;
    }

    const registeredModule = this.modules.get(name);
    if (!registeredModule) {
      throw new Error(`Module not found: ${name}`);
    }

    // Load dependencies first
    for (const dependency of registeredModule.dependencies) {
      await this.loadModule(dependency, container);
    }

    // Register services
    for (const service of registeredModule.services) {
      container.register({
        identifier: service.identifier,
        factory: () => service.factory(container),
        singleton: service.singleton ?? true,
        dependencies: service.dependencies
      });
    }

    // Initialize module
    if (registeredModule.initialize) {
      await registeredModule.initialize(container);
    }

    this.loadedModules.add(name);
  }

  async unloadModule(name: string): Promise<void> {
    const registeredModule = this.modules.get(name);
    if (!registeredModule) {
      return;
    }

    if (registeredModule.dispose) {
      await registeredModule.dispose();
    }

    this.loadedModules.delete(name);
  }

  getLoadedModules(): string[] {
    return Array.from(this.loadedModules);
  }
}

// Plugin System
export interface Plugin {
  name: string;
  version: string;
  install(container: ServiceContainer): Promise<void>;
  uninstall?(): Promise<void>;
}

export class PluginManager {
  private plugins = new Map<string, Plugin>();
  private installedPlugins = new Set<string>();

  register(plugin: Plugin): void {
    this.plugins.set(plugin.name, plugin);
  }

  async install(name: string, container: ServiceContainer): Promise<void> {
    if (this.installedPlugins.has(name)) {
      return;
    }

    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin not found: ${name}`);
    }

    await plugin.install(container);
    this.installedPlugins.add(name);
  }

  async uninstall(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      return;
    }

    if (plugin.uninstall) {
      await plugin.uninstall();
    }

    this.installedPlugins.delete(name);
  }

  getInstalledPlugins(): string[] {
    return Array.from(this.installedPlugins);
  }
}

// Feature Flags
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
  conditions?: Record<string, unknown>;
}

export class FeatureFlagManager {
  private flags = new Map<string, FeatureFlag>();

  setFlag(flag: FeatureFlag): void {
    this.flags.set(flag.name, flag);
  }

  isEnabled(name: string, context?: Record<string, unknown>): boolean {
    const flag = this.flags.get(name);
    if (!flag) {
      return false;
    }

    if (!flag.enabled) {
      return false;
    }

    // Check conditions if provided
    if (flag.conditions && context) {
      for (const [key, value] of Object.entries(flag.conditions)) {
        if (context[key] !== value) {
          return false;
        }
      }
    }

    return true;
  }

  getFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }
}

// Configuration Management
export interface Configuration {
  get<T>(key: string): T | undefined;
  get<T>(key: string, defaultValue: T): T;
  set<T>(key: string, value: T): void;
  has(key: string): boolean;
  getAll(): Record<string, unknown>;
}

export class ConfigurationManager implements Configuration {
  private config = new Map<string, unknown>();

  get<T>(key: string): T | undefined;
  get<T>(key: string, defaultValue: T): T;
  get<T>(key: string, defaultValue?: T): T | undefined {
    const value = this.config.get(key) as T;
    return value !== undefined ? value : defaultValue;
  }

  set<T>(key: string, value: T): void {
    this.config.set(key, value);
  }

  has(key: string): boolean {
    return this.config.has(key);
  }

  getAll(): Record<string, unknown> {
    return Object.fromEntries(this.config);
  }

  loadFromObject(config: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(config)) {
      this.config.set(key, value);
    }
  }

  loadFromEnvironment(prefix = ''): void {
    for (const [key, value] of Object.entries(process.env)) {
      if (prefix && !key.startsWith(prefix)) {
        continue;
      }

      const configKey = prefix ? key.substring(prefix.length) : key;
      this.config.set(configKey.toLowerCase().replace(/_/g, '.'), value);
    }
  }
}

// Middleware System
export interface Middleware<TContext = unknown> {
  execute(context: TContext, next: () => Promise<void>): Promise<void>;
}

export class MiddlewarePipeline<TContext = unknown> {
  private middlewares: Middleware<TContext>[] = [];

  use(middleware: Middleware<TContext>): void {
    this.middlewares.push(middleware);
  }

  async execute(context: TContext): Promise<void> {
    let index = 0;

    const next = async (): Promise<void> => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        await middleware.execute(context, next);
      }
    };

    await next();
  }
}

// Observer Pattern
export interface Observer<T = unknown> {
  update(data: T): void;
}

export class Subject<T = unknown> {
  private observers: Observer<T>[] = [];

  attach(observer: Observer<T>): void {
    this.observers.push(observer);
  }

  detach(observer: Observer<T>): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(data: T): void {
    this.observers.forEach(observer => observer.update(data));
  }
}

// Strategy Pattern
export interface Strategy<TInput = unknown, TOutput = unknown> {
  execute(input: TInput): TOutput;
}

export class StrategyManager<TInput = unknown, TOutput = unknown> {
  private strategies = new Map<string, Strategy<TInput, TOutput>>();

  register(name: string, strategy: Strategy<TInput, TOutput>): void {
    this.strategies.set(name, strategy);
  }

  execute(name: string, input: TInput): TOutput {
    const strategy = this.strategies.get(name);
    if (!strategy) {
      throw new Error(`Strategy not found: ${name}`);
    }
    return strategy.execute(input);
  }

  getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }
}

// Factory Pattern
export interface Factory<T = unknown> {
  create(...args: unknown[]): T;
}

export class GenericFactory<T = unknown> implements Factory<T> {
  constructor(
    private createFn: (...args: unknown[]) => T,
    private dependencies: ServiceIdentifier[] = []
  ) {}

  create(...args: unknown[]): T {
    return this.createFn(...args);
  }
}

// Builder Pattern
export interface Builder<T = unknown> {
  build(): T;
}

export abstract class BaseBuilder<T = unknown> implements Builder<T> {
  abstract build(): T;

  protected validateRequired(property: unknown, name: string): void {
    if (property === undefined || property === null) {
      throw new Error(`Required property missing: ${name}`);
    }
  }
}

// Application Context
export class ApplicationContext {
  private container: ServiceContainer;
  private moduleRegistry: ModuleRegistry;
  private pluginManager: PluginManager;
  private featureFlags: FeatureFlagManager;
  private configuration: ConfigurationManager;

  constructor() {
    this.container = new (require('./dependency-injection').DependencyInjectionContainer)();
    this.moduleRegistry = new ModuleRegistry();
    this.pluginManager = new PluginManager();
    this.featureFlags = new FeatureFlagManager();
    this.configuration = new ConfigurationManager();
  }

  getContainer(): ServiceContainer {
    return this.container;
  }

  getModuleRegistry(): ModuleRegistry {
    return this.moduleRegistry;
  }

  getPluginManager(): PluginManager {
    return this.pluginManager;
  }

  getFeatureFlags(): FeatureFlagManager {
    return this.featureFlags;
  }

  getConfiguration(): ConfigurationManager {
    return this.configuration;
  }

  async initialize(): Promise<void> {
    // Load configuration
    this.configuration.loadFromEnvironment('APP_');

    // Initialize core modules
    await this.moduleRegistry.loadModule('core', this.container);
  }

  async dispose(): Promise<void> {
    this.container.dispose();
  }
}

// Global application context
export const appContext = new ApplicationContext();
