# Active Context - Arkan

## Terminal Result
⚡ arkan-beta-full ~/arkan npm run build

> nextn@0.1.0 build
> next build

   ▲ Next.js 15.5.9
   - Environments: .env.local, .env
   - Experiments (use with caution):
     ✓ useCache
     · serverActions

   Creating an optimized production build ...
 ✓ (pwa) Compiling for server...
 ✓ (pwa) Compiling for server...
 ✓ (pwa) Compiling for client (static)...
 ○ (pwa) Service worker: /teamspace/studios/this_studio/arkan/public/sw.js
 ○ (pwa)   URL: /sw.js
 ○ (pwa)   Scope: /
 ⚠ Compiled with warnings in 2.2min

./node_modules/@opentelemetry/instrumentation/build/esm/platform/node/instrumentation.js
Critical dependency: the request of a dependency is an expression

Import trace for requested module:
./node_modules/@opentelemetry/instrumentation/build/esm/platform/node/instrumentation.js
./node_modules/@opentelemetry/instrumentation/build/esm/platform/node/index.js
./node_modules/@opentelemetry/instrumentation/build/esm/platform/index.js
./node_modules/@opentelemetry/instrumentation/build/esm/index.js
./node_modules/@opentelemetry/sdk-node/build/src/sdk.js
./node_modules/@opentelemetry/sdk-node/build/src/index.js
./node_modules/@genkit-ai/core/lib/tracing.js
./node_modules/@genkit-ai/ai/lib/evaluator.js
./node_modules/@genkit-ai/ai/lib/index.mjs
./src/ai/dynamic-flow/step-handlers.ts
./src/ai/flows/dynamic-flow-executor.ts
./src/app/api/flows/execute/route.ts

./node_modules/handlebars/lib/index.js
require.extensions is not supported by webpack. Use a loader instead.

Import trace for requested module:
./node_modules/handlebars/lib/index.js
./src/ai/dynamic-flow/template-engine.ts
./src/ai/dynamic-flow/executor.ts
./src/app/api/admin/flows/execute/route.ts

./node_modules/handlebars/lib/index.js
require.extensions is not supported by webpack. Use a loader instead.

Import trace for requested module:
./node_modules/handlebars/lib/index.js
./src/ai/dynamic-flow/template-engine.ts
./src/ai/dynamic-flow/executor.ts
./src/app/api/admin/flows/execute/route.ts

./node_modules/handlebars/lib/index.js
require.extensions is not supported by webpack. Use a loader instead.

Import trace for requested module:
./node_modules/handlebars/lib/index.js
./src/ai/dynamic-flow/template-engine.ts
./src/ai/dynamic-flow/executor.ts
./src/app/api/admin/flows/execute/route.ts

./src/ai/index.ts
The requested module './model-selector' contains conflicting star exports for the name 'getModelForFlow' with the previous requested module './model-mapping'

Import trace for requested module:
./src/ai/index.ts
./src/app/api/generate/section/route.ts

./src/ai/index.ts
The requested module './model-utils' contains conflicting star exports for the name 'estimateMemoryUsage' with the previous requested module './model-selector'

Import trace for requested module:
./src/ai/index.ts
./src/app/api/generate/section/route.ts

   Linting and checking validity of types  ..
 ⚠ The Next.js plugin was not detected in your ESLint configuration. See https://nextjs.org/docs/app/api-reference/config/eslint#migrating-existing-config

Failed to compile.

./src/ai/custom-transformers.ts
12:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:64  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:73  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
112:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
118:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
124:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
131:52  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
145:65  Error: 'params' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
174:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
174:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
174:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
194:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/ai/dynamic-flow/__tests__/condition-evaluator.test.ts
12:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/ai/dynamic-flow/__tests__/executor.test.ts
5:32  Error: 'ValidationError' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
42:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
91:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
126:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
170:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
220:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
268:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
303:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
325:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
360:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/ai/dynamic-flow/__tests__/step-executor.test.ts
21:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/ai/dynamic-flow/__tests__/template-engine.test.ts
12:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/ai/dynamic-flow/condition-evaluator.ts
105:65  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
106:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
136:66  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
250:84  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
280:61  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
280:68  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
309:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
324:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
324:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
379:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/ai/dynamic-flow/context-manager.ts
18:10  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
21:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
42:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
49:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
50:64  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
51:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
59:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
61:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
64:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
78:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
119:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
150:57  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
185:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
195:6  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
198:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
238:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
238:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
276:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
284:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
350:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
351:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
395:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
451:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
455:59  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
459:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
510:51  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
533:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
535:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
550:52  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
553:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
576:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
576:55  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
601:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
608:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
629:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
642:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
649:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
690:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
697:75  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/ai/dynamic-flow/example.ts
24:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
100:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
187:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
289:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/ai/dynamic-flow/executor.ts
48:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
301:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
306:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
311:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
339:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
362:10  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/ai/dynamic-flow/schema-validator.ts
41:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
158:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
166:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
215:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
253:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
291:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
304:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
312:69  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
313:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
335:72  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
336:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
354:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
413:75  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
414:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
430:65  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
431:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
453:9  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
465:10  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
476:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
490:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/ai/dynamic-flow/step-executor.ts
64:58  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
92:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
133:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
165:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
195:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
208:20  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
220:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
243:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
290:68  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
295:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
306:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
308:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
309:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
352:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/ai/dynamic-flow/step-handlers.ts
30:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
36:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
38:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
52:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
82:12  Error: '_error' is defined but never used.  @typescript-eslint/no-unused-vars
99:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
130:20  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
146:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
167:12  Error: '_error' is defined but never used.  @typescript-eslint/no-unused-vars
176:72  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
186:12  Error: '_error' is defined but never used.  @typescript-eslint/no-unused-vars
220:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
244:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
263:12  Error: '_error' is defined but never used.  @typescript-eslint/no-unused-vars
280:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
286:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
316:12  Error: '_error' is defined but never used.  @typescript-eslint/no-unused-vars
333:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
351:12  Error: '_error' is defined but never used.  @typescript-eslint/no-unused-vars
362:10  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
363:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
364:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
366:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
366:59  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
366:67  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
379:78  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
380:72  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
391:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
400:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
444:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
454:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
455:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
483:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
485:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
499:12  Error: '_error' is defined but never used.  @typescript-eslint/no-unused-vars
541:12  Error: '_error' is defined but never used.  @typescript-eslint/no-unused-vars
556:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
558:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
580:12  Error: '_error' is defined but never used.  @typescript-eslint/no-unused-vars

./src/ai/dynamic-flow/template-engine.ts
63:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
97:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
101:51  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
105:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
109:52  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
114:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
114:54  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
115:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
115:54  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
120:53  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
125:52  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
130:51  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
142:72  Error: 'format' is assigned a value but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
153:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
162:55  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
162:74  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
170:74  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
171:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
194:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
194:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
201:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
216:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
220:59  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
243:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/ai/flows/__tests__/summarize-text.test.ts
87:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/ai/flows/academic-literature-review.ts
46:17  Error: 'topic' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
46:49  Error: 'focusAreas' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
46:61  Error: 'minLength' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
46:72  Error: 'includeGaps' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/ai/flows/academic-paper-quality-checker.ts
51:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
138:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
281:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
283:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/ai/flows/dynamic-flow-executor.ts
11:10  Error: 'TemplateEngine' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
12:10  Error: 'ConditionEvaluator' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
13:10  Error: 'StepExecutor' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
19:3  Error: 'StepResult' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
53:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
231:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
300:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
300:59  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
305:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
305:59  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
310:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
310:55  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
315:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
315:57  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
320:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
320:60  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
325:38  Error: 'config' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
325:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
325:60  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
330:33  Error: 'config' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
330:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
330:55  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
335:37  Error: 'config' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
335:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
335:59  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
363:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
364:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
380:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
387:61  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
469:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
472:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
482:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
483:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
496:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
497:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
508:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
514:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
516:56  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
540:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/ai/flows/paraphrase-text.ts
48:102  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/ai/flows/professional-document-writer.ts
47:13  Error: 'keyPoints' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
52:13  Error: 'additionalContext' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
248:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/ai/flows/project-documentation-generator.ts
86:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/ai/model-health-check.ts
96:14  Error: '_error' is defined but never used.  @typescript-eslint/no-unused-vars
132:14  Error: '_error' is defined but never used.  @typescript-eslint/no-unused-vars
173:14  Error: '_error' is defined but never used.  @typescript-eslint/no-unused-vars
400:14  Error: '_error' is defined but never used.  @typescript-eslint/no-unused-vars

./src/ai/model-request-queue.ts
53:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/ai/prompts/index.ts
68:5  Error: 'WriteDocumentOutputSchema' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
70:115  Error: 'GenerateTheoreticalLectureOutputSchema' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
79:7  Error: 'styleDescriptions' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
87:7  Error: 'lengthDescriptions' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
93:7  Error: 'styleControls' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/ai/tool-registry.ts
57:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
57:51  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
57:58  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
84:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
87:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
210:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
210:52  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
243:14  Error: '_error' is defined but never used.  @typescript-eslint/no-unused-vars
331:18  Error: '_error' is defined but never used.  @typescript-eslint/no-unused-vars
434:18  Error: '_error' is defined but never used.  @typescript-eslint/no-unused-vars
536:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
536:64  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/ai/tools/index.ts
147:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/admin/manage-agents/page.tsx
4:10  Error: 'useEffect' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
25:13  Error: 'firebaseUser' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/app/api/__tests__/flows.test.ts
6:46  Error: 'afterAll' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/app/api/admin/document-stats/route.ts
19:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/admin/flows/route.ts
104:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/admin/indexed-documents/route.ts
24:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/admin/payments/verify/route.ts
31:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/admin/prompts/route.ts
108:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/admin/sections/route.ts
16:38  Error: 'user' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

./src/app/api/admin/tools/route.ts
107:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/admin/traces/route.ts
21:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/admin/users/[id]/reset-password/route.ts
28:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/admin/users/[id]/route.ts
9:63  Error: 'token' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

./src/app/api/admin/users/reset-password/route.ts
14:39  Error: 'user' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
14:64  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/agents/route.ts
5:15  Error: 'AgentProperties' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/app/api/auth/logout/route.ts
26:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/auth/signup/route.ts
54:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/creative-studio/generate-step/route.ts
17:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
52:58  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/demo/benchmark/route.ts
9:28  Error: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

./src/app/api/export/docx/route.ts
46:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
49:53  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
65:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/export/pptx/route.ts
27:51  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
34:59  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
47:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/notifications/mark-as-read/route.ts
34:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/notifications/route.ts
17:14  Error: '_error' is defined but never used.  @typescript-eslint/no-unused-vars
42:14  Error: '_error' is defined but never used.  @typescript-eslint/no-unused-vars

./src/app/api/project/[projectId]/upload-logo/route.ts
7:26  Error: 'createApiResponse' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/app/api/rag/health/route.ts
17:69  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
18:74  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
19:69  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
81:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
89:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/stats/route.ts
16:14  Error: '_error' is defined but never used.  @typescript-eslint/no-unused-vars
72:14  Error: '_error' is defined but never used.  @typescript-eslint/no-unused-vars

./src/app/api/templates/docx/route.ts
27:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/templates/pptx/route.ts
27:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/users/[id]/reset-password/route.ts
27:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/users/[id]/route.ts
69:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
83:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/writing-tools/[tool]/route.ts
93:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/dashboard/page.tsx
9:28  Error: 'History' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
9:67  Error: 'MessageSquare' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
9:82  Error: 'Loader2' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
10:41  Error: 'CardTitle' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
10:52  Error: 'CardDescription' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
13:10  Error: 'toast' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
16:15  Error: 'UserProfile' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
49:26  Error: 'firebaseUser' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
51:11  Error: 'router' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
52:12  Error: 'isCreatingChat' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
52:28  Error: 'setIsCreatingChat' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/app/demo/dynamic-flows/page.tsx
19:3  Error: 'BarChart3' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
24:10  Error: 'activeDemo' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
24:22  Error: 'setActiveDemo' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/app/demo/flow-builder/page.tsx
26:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/demo/page.tsx
12:3  Error: 'BarChart3' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/app/docs/page.tsx
6:87  Error: 'BookCheck' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
6:98  Error: 'PencilLine' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
6:140  Error: 'Workflow' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/app/login/page.tsx
4:10  Error: 'KeyRound' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/app/manage-users/actions.ts
25:12  Error: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
40:51  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
71:51  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/page.tsx
6:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/profile/ChangePasswordForm.tsx
45:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/profile/[id]/page.tsx
13:15  Error: 'Suspense' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
13:25  Error: 'lazy' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
45:37  Error: 'firebaseUser' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/app/profile/page.tsx
5:41  Error: 'CardTitle' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
5:52  Error: 'CardDescription' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
40:13  Error: 't' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/app/signup/page.tsx
6:10  Error: 'UserPlus' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/app/writing-tools/translator/page.tsx
4:19  Error: 'Controller' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
43:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/admin/EditUserForm.tsx
4:19  Error: 'Controller' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
107:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/admin/FeatureManager.tsx
5:16  Error: 'CardContent' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
5:46  Error: 'CardFooter' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
5:58  Error: 'CardHeader' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/admin/ab-testing/ABTestingPanel.tsx
61:9  Error: 'getStatusBadge' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
62:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
327:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/admin/dashboard/Dashboard.tsx
12:15  Error: 'UserProfile' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/admin/dashboard/RecentActivity.tsx
22:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
23:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/admin/document-indexer/FileUploadZone.tsx
35:9  Error: 'acceptedTypes' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/admin/document-indexer/IndexingProgress.tsx
11:10  Error: 'Loader2' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/admin/document-indexer/IndexingSettings.tsx
66:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/admin/flow-builder/DataFlowDiagram.tsx
49:3  Error: 'highlightedVariable' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
53:9  Error: 'dataFlow' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
79:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
79:76  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
109:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
109:78  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
136:9  Error: 'getNodeIcon' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
255:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
255:80  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
256:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
256:82  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
290:78  Error: 'value' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/admin/flow-builder/ExecutionTraceViewer.tsx
54:9  Error: 'getStatusIcon' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/admin/flow-builder/FlowBuilderCanvas.tsx
19:8  Error: 'Edge' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/admin/flow-builder/FlowBuilderInterface.tsx
17:10  Error: 'Badge' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
49:12  Error: 'flowState' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
72:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
464:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
465:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/admin/flow-builder/FlowCanvas.tsx
77:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/admin/flow-builder/FlowSettings.tsx
112:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/admin/flow-builder/FlowStatsDashboard.tsx
12:10  Error: 'Badge' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/admin/flow-builder/MappingBuilder.tsx
21:3  Error: 'EyeOff' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/admin/flow-builder/StepConfigPanel.tsx
20:27  Error: 'Eye' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
35:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
47:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
54:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
64:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
74:54  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
228:32  Error: 'err' is defined but never used.  @typescript-eslint/no-unused-vars
377:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
382:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
394:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
399:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/admin/flow-builder/StepEditor.tsx
34:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
41:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
191:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
223:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
263:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
299:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
340:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/admin/flow-builder/StepLibrary.tsx
19:3  Error: 'Zap' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
38:9  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/admin/flow-builder/VariableBrowser.tsx
50:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
136:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
136:80  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
137:54  Error: 'value' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
170:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
170:78  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/admin/migration/MigrationDashboard.tsx
10:20  Error: 'useEffect' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/admin/payments/FinancialReportExporter.tsx
83:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/admin/prompt-editor/PromptEditor.tsx
21:27  Error: 'Code' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
21:33  Error: 'Settings' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
26:68  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
40:10  Error: 'cursorPosition' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
40:26  Error: 'setCursorPosition' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
85:9  Error: 'handleUpdateVariable' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
111:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
359:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/admin/prompt-editor/PromptTester.tsx
21:67  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
25:61  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
36:54  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/admin/prompt-editor/VariableEditor.tsx
99:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/admin/rag/RAGHealthMonitor.tsx
18:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/admin/rag/RAGQueryTester.tsx
14:10  Error: 'Textarea' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/admin/sections/SectionFormDialog.tsx
59:15  Error: 'id' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
93:78  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/admin/users/UserTableRow.tsx
13:10  Error: 'useRouter' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
14:10  Error: 'toast' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
28:40  Error: 'adminProfile' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/admin/users/UserTableSkeleton.tsx
8:7  Error: 'USERS_PER_PAGE' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/agent/AgentPlayground.tsx
12:16  Error: 'FormControl' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/agent/ResponseDisplay.tsx
4:10  Error: 'Card' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
4:16  Error: 'CardContent' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
4:29  Error: 'CardHeader' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
4:41  Error: 'CardTitle' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/auth/ForgotPasswordForm.tsx
21:9  Error: 'router' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/auth/LoginForm.tsx
38:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/auth/PhoneAuthForm.tsx
25:64  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/auth/SignupForm.tsx
16:10  Error: 'getAuth' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
16:19  Error: 'updateProfile' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
27:9  Error: 'router' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
29:11  Error: 'toast' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/creative-studio/ContentStudioDashboard.tsx
21:16  Error: 'CardContent' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/demo/DynamicFlowsShowcase.tsx
15:3  Error: 'TrendingUp' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/demo/FlowExecutor.tsx
26:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
81:42  Error: 'onClose' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
82:53  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
83:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
94:51  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
101:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
102:20  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
143:14  Error: 'err' is defined but never used.  @typescript-eslint/no-unused-vars
215:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
396:69  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
396:76  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
397:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/demo/RerankingDemo.tsx
15:19  Error: 'ArrowRight' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/home/HomePageContent.tsx
11:66  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/pricing/PurchaseCreditsDialog.tsx
17:136  Error: 'Smartphone' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
19:15  Error: 'BankAccount' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
21:10  Error: 'Accordion' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
21:21  Error: 'AccordionContent' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
21:39  Error: 'AccordionItem' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
21:54  Error: 'AccordionTrigger' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
90:11  Error: 't' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/report-mode/MarkdownEditor.tsx
30:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
42:40  Error: 'slice' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/report-mode/ReportModeGenerator.tsx
3:10  Error: 'useLocalization' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/report-mode/ReportResults.tsx
17:60  Error: 'PencilLine' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
19:10  Error: 'useState' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/report-mode/dialogs/BuildProjectDialog.tsx
76:71  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/report-mode/dialogs/ChapterToolsDialog.tsx
52:5  Error: 'context' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
53:5  Error: 'setContext' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
80:101  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
175:81  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/report-mode/dialogs/GenerateTocDialog.tsx
4:10  Error: 'useForm' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
9:27  Error: 'useToast' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/report-mode/file-manager/AnalystAgent.tsx
20:10  Error: 'analyzeContextApi' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
40:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
90:28  Error: 'variables' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
90:71  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/report-mode/file-manager/PdfPreview.tsx
36:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
63:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
66:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/report-mode/file-manager/index.tsx
14:10  Error: 'cn' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/report-mode/section-controls/SectionContextSelector.tsx
36:9  Error: 'fileTypes' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/report-mode/section-controls/SectionGenerationControls.tsx
11:21  Error: 'Language' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
17:10  Error: 'Badge' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
179:128  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/report-mode/settings/ProjectSettingsPanel.tsx
12:10  Error: 'Loader2' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
12:19  Error: 'UploadCloud' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
16:8  Error: 'Image' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
20:47  Error: 'Behavior' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
20:81  Error: 'CitationStyleSchema' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
86:10  Error: 'logoPreview' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
87:11  Error: 'isUploading' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
87:24  Error: 'handleFileUpload' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/report-mode/templates/ApplyTemplatePanel.tsx
66:11  Error: 't' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/shared/CoverPage.tsx
5:33  Error: 'Frame' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
5:72  Error: 'BookCopy' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
7:25  Error: 'useState' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
14:10  Error: 'Button' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
56:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
58:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
186:85  Warning: Unexpected empty arrow function.  @typescript-eslint/no-empty-function
202:83  Warning: Unexpected empty arrow function.  @typescript-eslint/no-empty-function
210:39  Warning: Unexpected empty arrow function.  @typescript-eslint/no-empty-function
221:88  Warning: Unexpected empty arrow function.  @typescript-eslint/no-empty-function
223:86  Warning: Unexpected empty arrow function.  @typescript-eslint/no-empty-function
225:130  Warning: Unexpected empty arrow function.  @typescript-eslint/no-empty-function
229:86  Warning: Unexpected empty arrow function.  @typescript-eslint/no-empty-function
230:82  Warning: Unexpected empty arrow function.  @typescript-eslint/no-empty-function
234:39  Warning: Unexpected empty arrow function.  @typescript-eslint/no-empty-function

./src/components/shared/NotificationDropdown.tsx
12:8  Error: 'Link' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/sidebar/AgentDialog.tsx
24:16  Error: 'uuidv4' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
96:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
165:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/sidebar/AgentGeneratorDialog.tsx
68:9  Error: 'debouncedId' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
83:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
96:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/ui/use-toast.ts
19:7  Error: 'actionTypes' is assigned a value but only used as a type. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/writing-tools/AIImageGeneratorTool.tsx
5:46  Error: 'CardFooter' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/writing-tools/AIResearcherTool.tsx
102:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
102:123  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
133:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
133:123  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
181:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
181:126  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
231:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
231:127  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
300:55  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/writing-tools/AITextTune.tsx
22:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
57:53  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
309:111  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/writing-tools/AIToolCard.tsx
15:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/writing-tools/BiasCheckerTool.tsx
4:15  Error: 'BiasCheckOutput' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
11:10  Error: 'AlertCircle' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
11:44  Error: 'Scale' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/writing-tools/FileListDisplay.tsx
8:75  Error: 'DialogDescription' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/writing-tools/GenerateUIDescriptionTool.tsx
29:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/writing-tools/ImageToPdfTool.tsx
21:42  Error: 'X' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
22:8  Error: 'Image' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
45:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/writing-tools/ImageToSvgTool.tsx
12:10  Error: 'Check' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
25:5  Error: 'isCopied' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
50:106  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
57:92  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/writing-tools/MarkdownToPptxTool.tsx
185:18  Error: 'e' is defined but never used.  @typescript-eslint/no-unused-vars
240:18  Error: 'e' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/writing-tools/MarkdownToWordTool.tsx
139:95  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/writing-tools/ProjectBlueprintTool.tsx
29:9  Error: 'complexityValue' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
116:81  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/writing-tools/SentenceStructureCheckerTool.tsx
4:15  Error: 'SentenceStructureCheckOutput' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/context/AuthContext.tsx
8:21  Error: 'UserProfile' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/context/LocalizationContext.tsx
12:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
15:51  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
34:54  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
38:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/firebase/error-emitter.ts
19:54  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/firebase/errors.ts
7:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
33:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/firebase/firestore/use-collection.tsx
54:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
87:8  Error: 'error' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

./src/firebase/firestore/use-doc.tsx
41:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
74:8  Error: 'error' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

./src/firebase/non-blocking-updates.tsx
19:73  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
20:39  Error: 'error' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
39:75  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
41:12  Error: 'error' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
59:76  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
61:12  Error: 'error' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
80:12  Error: 'error' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

./src/hooks/auth/use-auth-mutations.ts
35:17  Error: 'user' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
100:98  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
102:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
124:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
149:58  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/core/use-build-project.ts
8:13  Error: 'project' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/hooks/core/use-context-selector.ts
7:15  Error: 'SectionContext' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/hooks/core/use-guideline-editor.ts
5:10  Error: 'useEffect' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
5:30  Error: 'useState' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/hooks/core/useBuilderStore.ts
3:10  Error: 'Chapter' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
3:28  Error: 'Section' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
9:10  Error: 'parseMarkdownToContent' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/hooks/core/useGenerationUIStore.ts
17:58  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/creative-studio/use-creative-studio.ts
50:9  Error: 'router' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
62:5  Error: 'templateId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
83:42  Error: 'projectId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
120:44  Error: 'projectId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

./src/hooks/data/use-docx-templates.ts
30:68  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
38:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
54:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
84:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/data/use-features.ts
49:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/data/use-pptx-templates.ts
31:68  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
39:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
55:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
85:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/data/use-projects.ts
86:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
107:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
121:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/data/use-sections.ts
41:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
62:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
81:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/data/use-templates.ts
62:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
85:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
101:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
117:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
143:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
159:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
175:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/data/use-users.ts
54:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
58:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
131:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/report-mode/use-ai-actions.ts
5:10  Error: 'useWritingTool' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
16:38  Error: 'Section' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
71:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
81:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
92:52  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
155:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
185:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
202:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
207:26  Error: 'project' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

./src/hooks/report-mode/use-chapter-actions.ts
8:40  Error: 'useCallback' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
68:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
70:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
85:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
113:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/use-agent-store.ts
8:21  Error: 'useState' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
92:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
130:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
141:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
151:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/util/use-toast.ts
18:7  Error: 'actionTypes' is assigned a value but only used as a type. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/hooks/util/useExport.ts
81:26  Error: 'parseError' is defined but never used.  @typescript-eslint/no-unused-vars

./src/hooks/util/useMarkdownParser.ts
9:54  Error: 'SectionProperties' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/hooks/writing-tools/use-ai-detector-logic.ts
53:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/writing-tools/use-ai-researcher-logic.ts
7:26  Error: 'useProjects' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
45:6  Error: 'ResearchFormValues' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
150:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
215:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
227:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
229:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
268:76  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
269:80  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
270:84  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
271:81  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/writing-tools/use-assignments-solver-logic.ts
28:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
61:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/writing-tools/use-bias-checker-logic.ts
55:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/writing-tools/use-citation-generator-logic.ts
5:19  Error: 'Controller' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
26:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/writing-tools/use-document-writer-logic.ts
4:19  Error: 'Controller' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
27:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/writing-tools/use-fact-checker-logic.ts
57:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/writing-tools/use-generate-toc-logic.ts
7:20  Error: 'useBuilderStore' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/hooks/writing-tools/use-grammar-checker-logic.ts
54:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/writing-tools/use-image-to-svg-logic.ts
70:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/writing-tools/use-paraphraser-logic.ts
55:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/writing-tools/use-plagiarism-checker-logic.ts
57:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/writing-tools/use-plant-uml-generator-logic.ts
5:19  Error: 'Controller' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
48:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/writing-tools/use-presentation-outline-logic.ts
49:65  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/writing-tools/use-project-blueprint-logic.ts
33:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/writing-tools/use-quiz-generator-logic.ts
5:19  Error: 'Controller' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
19:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/writing-tools/use-sentence-structure-checker-logic.ts
64:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/writing-tools/use-summarizer-logic.ts
30:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
63:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/writing-tools/use-text-stylist-logic.ts
5:19  Error: 'Controller' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
8:10  Error: 'useWritingTool' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
27:55  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
27:71  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
29:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
41:19  Error: 'error' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
41:26  Error: 'variables' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
41:37  Error: 'context' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
50:54  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
57:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
57:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
91:60  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
91:74  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/writing-tools/use-writing-tool.ts
17:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/db/seed.ts
91:67  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/editor/CommandList.tsx
7:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
41:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/editor/ToolBar.tsx
10:3  Error: 'AlignCenter' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
10:16  Error: 'AlignLeft' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
10:27  Error: 'AlignRight' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
10:81  Error: 'List' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
10:87  Error: 'ListOrdered' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
10:109  Error: 'Quote' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
10:116  Error: 'Sigma' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
10:155  Error: 'TableIcon' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
10:214  Error: 'Palette' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
10:223  Error: 'Baseline' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/lib/editor/ai-image-generator-extension.tsx
16:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/editor/plantUml-extension.tsx
5:10  Error: 'useEffect' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
12:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
90:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
93:10  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/editor/slash-command.tsx
5:18  Error: 'Range' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
56:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
63:65  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
81:78  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
90:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
125:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/firebase/error.ts
10:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
26:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
36:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
36:72  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/firebase/server-init.ts
37:16  Error: 'fileError' is defined but never used.  @typescript-eslint/no-unused-vars
41:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/markdown-to-pptx-converter.ts
5:8  Error: 'rehypeSanitize' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
6:8  Error: 'rehypeStringify' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
9:8  Error: 'remarkRehype' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
11:10  Error: 'exportComponentAsPDF' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
13:10  Error: 'DEFAULT_CODE_FONT' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
13:29  Error: 'DEFAULT_FONT' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
119:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
121:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/markdown-to-word-converter.ts
15:3  Error: 'VerticalAlign' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
16:3  Error: 'TableOfContents' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
17:3  Error: 'ImageRun' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
27:19  Error: 'Chapter' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
59:64  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
65:65  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
79:53  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
79:58  Error: 'options' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
404:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
423:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
436:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
447:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
491:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
511:55  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
584:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
600:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/migration/ComparisonTools.ts
22:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
23:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
24:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
34:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
35:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
56:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
57:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
188:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
190:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
190:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
191:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
191:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
217:16  Error: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
264:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
264:56  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
280:51  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
280:66  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
397:9  Error: 'tools' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/lib/migration/__tests__/migration.test.ts
7:10  Error: 'FlowAnalyzer' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
9:10  Error: 'MigrationValidator' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
55:11  Error: 'generator' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
63:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
99:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
155:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
171:11  Error: 'generator' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/lib/migration/analyzer/FlowAnalyzer.ts
11:15  Error: 'FlowConfiguration' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
64:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/migration/generator/ConfigurationGenerator.ts
143:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
166:55  Error: 'sourceCode' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
221:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
254:54  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/migration/validator/MigrationValidator.ts
9:10  Error: 'SchemaValidator' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
77:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
78:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
207:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
220:16  Error: 'field' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
274:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
274:56  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
300:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
301:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
315:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
316:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/models/chapter.ts
64:20  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/models/execution-trace.ts
40:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
43:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
52:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
98:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
101:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
147:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
164:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
181:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
216:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/models/external-context.ts
10:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
18:55  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/models/flow-config.ts
104:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
138:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
230:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
271:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
363:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
423:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
561:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
562:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/models/project.ts
9:30  Error: 'CitationStyleSchema' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
304:57  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
330:60  Error: 'allSections' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
493:22  Error: 'err' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/models/prompt-config.ts
94:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
128:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
145:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
159:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
205:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
386:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
406:10  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
429:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
485:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
486:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/models/section.ts
16:10  Error: 'PromptBuilder' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
46:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
61:53  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/models/template.ts
4:52  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
11:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/models/tool-config.ts
191:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
228:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
248:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/pptx-convert/pptx-renderer.ts
140:153  Error: 'x' is assigned a value but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
140:183  Error: 'w' is assigned a value but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
156:111  Error: 'isRtl' is assigned a value but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

./src/lib/pptx-convert/slide-layout-engine.ts
244:17  Error: 'lineColor' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
424:9  Error: 'sentenceIndex' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
588:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
601:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/rag/__tests__/integration.test.ts
16:10  Error: 'RAGConfig' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
24:73  Warning: Unexpected empty arrow function.  @typescript-eslint/no-empty-function

./src/lib/rag/__tests__/qdrant-adapter.test.ts
41:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
124:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
148:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
174:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
196:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
206:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/rag/cache.ts
192:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
204:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
224:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
224:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
232:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
232:57  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/rag/qdrant-adapter.ts
209:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
239:69  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
242:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/rag/retrieval.ts
9:31  Error: 'SearchResult' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/lib/rag/vector-store.ts
169:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
175:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/types.ts
26:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
96:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
227:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/utils/ai-utils.ts
10:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
14:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/utils/api-utils.ts
16:9  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
53:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
66:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
105:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/utils/errorUtils.ts
13:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/utils/markdown-styles.ts
8:7  Error: 'isSimpleParagraph' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
8:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
16:10  Error: 'node' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
17:10  Error: 'node' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
18:10  Error: 'node' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
28:9  Error: 'node' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
29:10  Error: 'node' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
30:10  Error: 'node' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
31:10  Error: 'node' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
32:18  Error: 'node' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
33:11  Error: 'node' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
33:151  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
34:12  Error: 'node' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
47:13  Error: 'node' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
48:13  Error: 'node' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
49:13  Error: 'node' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
50:10  Error: 'node' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
51:10  Error: 'node' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
52:10  Error: 'node' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

./src/lib/word-converter/ast-converter.ts
38:13  Error: 'hasCheckedProperty' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
149:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
330:53  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
369:55  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/word-converter/node-handlers.ts
4:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
37:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/word-converter/types.ts
59:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/__tests__/execution-trace-service.test.ts
22:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/ab-testing-service.ts
230:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
232:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
400:14  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
439:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
462:14  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/api/adminService.ts
15:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
16:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/api/analyticsService.ts
13:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
14:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/api/apiService.ts
25:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
25:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
72:14  Error: 'e' is defined but never used.  @typescript-eslint/no-unused-vars

./src/services/api/authService.ts
17:10  Error: 'createUserWithEmailAndPassword' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
34:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
53:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/api/diagramService.ts
12:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/api/generationLogService.ts
9:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
10:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/api/reportService.ts
12:54  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:83  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/api/templateService.ts
16:74  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
56:74  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
186:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/document-tracking-service.ts
48:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
91:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/execution-trace-service.ts
13:15  Error: 'ExecutionResult' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
34:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
79:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
80:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
213:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
269:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
303:64  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
365:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
378:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
382:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
383:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
384:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
384:71  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
385:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
385:80  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
386:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
386:77  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
518:10  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
519:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
520:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
528:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
544:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
545:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
546:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
547:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
555:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
556:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
557:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/flow-config-service.ts
28:10  Error: 'flowConfigCache' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
280:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
380:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
400:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/generation-service.ts
10:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
11:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/local-project-service.ts
25:32  Warning: Unexpected empty arrow function.  @typescript-eslint/no-empty-function

./src/services/projectService.ts
7:10  Error: 'FieldValue' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
7:22  Error: 'Timestamp' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/services/prompt-management-service.ts
284:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
371:53  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
391:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/rag-service.ts
8:51  Error: 'IndexingOptions' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/services/service-cache.ts
240:5  Error: 'l2Ttl' is assigned a value but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
319:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
324:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
326:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
348:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
354:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
394:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
395:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
396:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
397:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/templateService.ts
7:97  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/tool-registry-service.ts
281:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
298:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
318:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
381:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/transactionService.ts
5:10  Error: 'FieldValue' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars

./src/services/userService.ts
6:10  Error: 'FieldValue' is defined but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
95:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/types/module-stubs.d.ts
9:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
14:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
18:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
22:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
26:51  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
30:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
38:56  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
38:72  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
42:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
47:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
52:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
57:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
62:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
⚡ arkan-beta-full ~/arkan 