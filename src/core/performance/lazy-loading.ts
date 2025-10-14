/**
 * Lazy Loading System
 * Implements comprehensive lazy loading for components, modules, and resources
 */

export interface LazyLoadOptions {
  threshold?: number; // Intersection observer threshold
  rootMargin?: string; // Intersection observer root margin
  timeout?: number; // Loading timeout
  retries?: number; // Number of retry attempts
  fallback?: () => Promise<any>; // Fallback loader
  onLoad?: (loaded: any) => void; // Load success callback
  onError?: (error: Error) => void; // Load error callback
}

export interface LazyLoadResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  retry: () => Promise<void>;
}

// Component Lazy Loader
export class ComponentLazyLoader {
  private loadedComponents = new Map<string, any>();
  private loadingComponents = new Map<string, Promise<any>>();
  private observers = new Map<Element, IntersectionObserver>();

  async loadComponent<T>(
    loader: () => Promise<T>,
    options: LazyLoadOptions = {}
  ): Promise<T> {
    const key = loader.toString();

    // Return cached component if already loaded
    if (this.loadedComponents.has(key)) {
      return this.loadedComponents.get(key);
    }

    // Return existing promise if currently loading
    if (this.loadingComponents.has(key)) {
      return this.loadingComponents.get(key);
    }

    // Start loading
    const loadPromise = this.loadWithRetry(loader, options);
    this.loadingComponents.set(key, loadPromise);

    try {
      const component = await loadPromise;
      this.loadedComponents.set(key, component);
      this.loadingComponents.delete(key);

      if (options.onLoad) {
        options.onLoad(component);
      }

      return component;
    } catch (error) {
      this.loadingComponents.delete(key);

      if (options.onError) {
        options.onError(error as Error);
      }

      throw error;
    }
  }

  private async loadWithRetry<T>(
    loader: () => Promise<T>,
    options: LazyLoadOptions
  ): Promise<T> {
    const retries = options.retries || 3;
    let lastError: Error;

    for (let i = 0; i <= retries; i++) {
      try {
        const result = await Promise.race([
          loader(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Load timeout')), options.timeout || 10000)
          )
        ]);
        return result;
      } catch (error) {
        lastError = error as Error;

        if (i === retries) {
          // Try fallback if available
          if (options.fallback) {
            try {
              return await options.fallback();
            } catch (fallbackError) {
              throw lastError;
            }
          }
          throw lastError;
        }

        // Exponential backoff
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  observeElement(
    element: Element,
    loader: () => Promise<any>,
    options: LazyLoadOptions = {}
  ): () => void {
    const observer = new IntersectionObserver(
      async (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            try {
              await this.loadComponent(loader, options);
            } catch (error) {
              console.error('Failed to load component:', error);
            }
          }
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '50px'
      }
    );

    observer.observe(element);
    this.observers.set(element, observer);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
      this.observers.delete(element);
    };
  }

  preloadComponent<T>(loader: () => Promise<T>): Promise<T> {
    return this.loadComponent(loader);
  }

  clearCache(): void {
    this.loadedComponents.clear();
    this.loadingComponents.clear();
  }

  dispose(): void {
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    this.observers.clear();
    this.clearCache();
  }
}

// Module Lazy Loader
export class ModuleLazyLoader {
  private loadedModules = new Map<string, any>();
  private loadingModules = new Map<string, Promise<any>>();

  async loadModule<T>(
    modulePath: string,
    options: LazyLoadOptions = {}
  ): Promise<T> {
    // Return cached module if already loaded
    if (this.loadedModules.has(modulePath)) {
      return this.loadedModules.get(modulePath);
    }

    // Return existing promise if currently loading
    if (this.loadingModules.has(modulePath)) {
      return this.loadingModules.get(modulePath);
    }

    // Start loading
    const loadPromise = this.loadModuleWithRetry(modulePath, options);
    this.loadingModules.set(modulePath, loadPromise);

    try {
      const loadedModule = await loadPromise;
      this.loadedModules.set(modulePath, loadedModule);
      this.loadingModules.delete(modulePath);

      if (options.onLoad) {
        options.onLoad(loadedModule);
      }

      return loadedModule;
    } catch (error) {
      this.loadingModules.delete(modulePath);

      if (options.onError) {
        options.onError(error as Error);
      }

      throw error;
    }
  }

  private async loadModuleWithRetry<T>(
    modulePath: string,
    options: LazyLoadOptions
  ): Promise<T> {
    const retries = options.retries || 3;
    let lastError: Error;

    for (let i = 0; i <= retries; i++) {
      try {
        const loadedModule = await Promise.race([
          import(modulePath),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Module load timeout')), options.timeout || 15000)
          )
        ]);
        return loadedModule as T;
      } catch (error) {
        lastError = error as Error;

        if (i === retries) {
          // Try fallback if available
          if (options.fallback) {
            try {
              return await options.fallback();
            } catch (fallbackError) {
              throw lastError;
            }
          }
          throw lastError;
        }

        // Exponential backoff
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  preloadModule<T>(modulePath: string): Promise<T> {
    return this.loadModule<T>(modulePath);
  }

  clearCache(): void {
    this.loadedModules.clear();
    this.loadingModules.clear();
  }
}

// Resource Lazy Loader
export class ResourceLazyLoader {
  private loadedResources = new Map<string, any>();
  private loadingResources = new Map<string, Promise<any>>();

  async loadImage(src: string, options: LazyLoadOptions = {}): Promise<HTMLImageElement> {
    return this.loadResource(
      () => this.loadImageResource(src),
      src,
      options
    );
  }

  async loadScript(src: string, options: LazyLoadOptions = {}): Promise<void> {
    return this.loadResource(
      () => this.loadScriptResource(src),
      src,
      options
    );
  }

  async loadStylesheet(href: string, options: LazyLoadOptions = {}): Promise<void> {
    return this.loadResource(
      () => this.loadStylesheetResource(href),
      href,
      options
    );
  }

  private async loadResource<T>(
    loader: () => Promise<T>,
    key: string,
    options: LazyLoadOptions
  ): Promise<T> {
    // Return cached resource if already loaded
    if (this.loadedResources.has(key)) {
      return this.loadedResources.get(key);
    }

    // Return existing promise if currently loading
    if (this.loadingResources.has(key)) {
      return this.loadingResources.get(key);
    }

    // Start loading
    const loadPromise = this.loadResourceWithRetry(loader, options);
    this.loadingResources.set(key, loadPromise);

    try {
      const resource = await loadPromise;
      this.loadedResources.set(key, resource);
      this.loadingResources.delete(key);

      if (options.onLoad) {
        options.onLoad(resource);
      }

      return resource;
    } catch (error) {
      this.loadingResources.delete(key);

      if (options.onError) {
        options.onError(error as Error);
      }

      throw error;
    }
  }

  private async loadResourceWithRetry<T>(
    loader: () => Promise<T>,
    options: LazyLoadOptions
  ): Promise<T> {
    const retries = options.retries || 3;
    let lastError: Error;

    for (let i = 0; i <= retries; i++) {
      try {
        const result = await Promise.race([
          loader(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Resource load timeout')), options.timeout || 10000)
          )
        ]);
        return result;
      } catch (error) {
        lastError = error as Error;

        if (i === retries) {
          // Try fallback if available
          if (options.fallback) {
            try {
              return await options.fallback();
            } catch (fallbackError) {
              throw lastError;
            }
          }
          throw lastError;
        }

        // Exponential backoff
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  private loadImageResource(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }

  private loadScriptResource(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  private loadStylesheetResource(href: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if stylesheet already exists
      const existingLink = document.querySelector(`link[href="${href}"]`);
      if (existingLink) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`));
      document.head.appendChild(link);
    });
  }

  preloadResource<T>(loader: () => Promise<T>, key: string): Promise<T> {
    return this.loadResource(loader, key, {});
  }

  clearCache(): void {
    this.loadedResources.clear();
    this.loadingResources.clear();
  }
}

// React Hook for Lazy Loading
export function useLazyLoad<T>(
  loader: () => Promise<T>,
  options: LazyLoadOptions = {}
): LazyLoadResult<T> {
  const [state, setState] = React.useState<LazyLoadResult<T>>({
    data: null,
    loading: false,
    error: null,
    retry: async () => {}
  });

  const loadData = React.useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await loader();
      setState({
        data,
        loading: false,
        error: null,
        retry: loadData
      });

      if (options.onLoad) {
        options.onLoad(data);
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error as Error,
        retry: loadData
      });

      if (options.onError) {
        options.onError(error as Error);
      }
    }
  }, [loader, options]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  return state;
}

// React Hook for Intersection Observer
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: LazyLoadOptions = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '50px'
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [elementRef, options]);

  return isIntersecting;
}

// Global lazy loaders
export const componentLoader = new ComponentLazyLoader();
export const moduleLoader = new ModuleLazyLoader();
export const resourceLoader = new ResourceLazyLoader();

// Utility functions
export function lazy<T>(loader: () => Promise<T>): () => Promise<T> {
  return () => componentLoader.loadComponent(loader);
}

export function preload<T>(loader: () => Promise<T>): Promise<T> {
  return componentLoader.preloadComponent(loader);
}

export function lazyModule<T>(modulePath: string): () => Promise<T> {
  return () => moduleLoader.loadModule<T>(modulePath);
}

export function preloadModule<T>(modulePath: string): Promise<T> {
  return moduleLoader.preloadModule<T>(modulePath);
}
