# Scripts إضافية لتنظيم الكود

## Scripts مقترحة لإضافة إلى package.json

```json
{
  "scripts": {
    // Scripts موجودة
    "dev": "next dev --turbopack -p 9002",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",

    // Scripts جديدة للتنظيم
    "analyze:duplicates": "find src -name '*.ts' -o -name '*.tsx' | xargs grep -l 'useState\\|useEffect' | wc -l",
    "analyze:hooks": "find src/hooks -name '*.ts' | wc -l",
    "analyze:components": "find src/components -name '*.tsx' | wc -l",
    "analyze:size": "du -sh src/",
    "analyze:complexity": "npx complexity-report src/",
    "analyze:dependencies": "npx madge --circular src/",
    "analyze:unused": "npx ts-unused-exports tsconfig.json",

    // Scripts للتنظيم
    "organize:imports": "npx organize-imports-cli src/**/*.{ts,tsx}",
    "organize:exports": "npx ts-unused-exports tsconfig.json --excludePathsFromReport=src/core",
    "organize:clean": "npx rimraf src/**/*.d.ts src/**/*.js.map",

    // Scripts للجودة
    "quality:check": "npm run lint && npm run typecheck && npm run test",
    "quality:fix": "npm run lint -- --fix && npm run organize:imports",
    "quality:report": "npm run analyze:duplicates && npm run analyze:hooks && npm run analyze:components",

    // Scripts للتوثيق
    "docs:generate": "npx typedoc src/core --out docs/core",
    "docs:serve": "npx serve docs/core",
    "docs:update": "npm run docs:generate && npm run docs:serve",

    // Scripts للتحليل المتقدم
    "analyze:bundle": "npx webpack-bundle-analyzer .next/static/chunks/*.js",
    "analyze:performance": "npx lighthouse http://localhost:9002 --output=html --output-path=./lighthouse-report.html",
    "analyze:accessibility": "npx pa11y http://localhost:9002",

    // Scripts للتحسين
    "optimize:images": "npx imagemin src/assets/images/* --out-dir=src/assets/images/optimized",
    "optimize:fonts": "npx fontmin src/assets/fonts/* --out-dir=src/assets/fonts/optimized",
    "optimize:bundle": "npm run build && npx webpack-bundle-analyzer .next/static/chunks/*.js"
  }
}
```

## أدوات إضافية مقترحة

### 1. تحليل التعقيد
```bash
npm install --save-dev complexity-report
```

### 2. تحليل التبعيات
```bash
npm install --save-dev madge
```

### 3. تنظيف الصادرات غير المستخدمة
```bash
npm install --save-dev ts-unused-exports
```

### 4. تنظيم الـ imports
```bash
npm install --save-dev organize-imports-cli
```

### 5. تحليل الأداء
```bash
npm install --save-dev lighthouse pa11y
```

### 6. تحليل الحزمة
```bash
npm install --save-dev webpack-bundle-analyzer
```

## استخدام Scripts الجديدة

### تحليل الكود
```bash
# تحليل التكرار
npm run analyze:duplicates

# تحليل التعقيد
npm run analyze:complexity

# تحليل التبعيات الدائرية
npm run analyze:dependencies
```

### تنظيف الكود
```bash
# تنظيم الـ imports
npm run organize:imports

# تنظيف الملفات المؤقتة
npm run organize:clean
```

### فحص الجودة
```bash
# فحص شامل للجودة
npm run quality:check

# إصلاح المشاكل تلقائياً
npm run quality:fix

# تقرير شامل
npm run quality:report
```

### التوثيق
```bash
# إنشاء توثيق للـ core module
npm run docs:generate

# عرض التوثيق
npm run docs:serve
```

## تكامل مع CI/CD

### GitHub Actions مثال
```yaml
name: Code Quality
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run quality:check
      - run: npm run analyze:complexity
      - run: npm run analyze:dependencies
```

## مراقبة الجودة المستمرة

### 1. إعدادات ESLint محسنة
```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "prefer-const": "error",
    "no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      "newlines-between": "always"
    }]
  }
}
```

### 2. إعدادات Prettier
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### 3. إعدادات TypeScript محسنة
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```
