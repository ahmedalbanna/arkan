# TypeScript Error Suppressions Reference

## Overview

This document catalogs all `@ts-expect-error` and `@ts-ignore` suppressions in the codebase, explaining why they're necessary and when they can be removed.

**Current Total:** 14 suppressions
**Last Updated:** January 2026

---

## Table of Contents

1. [Library Compatibility Issues](#library-compatibility-issues)
2. [Type Inference Edge Cases](#type-inference-edge-cases)
3. [Third-Party Integration Issues](#third-party-integration-issues)
4. [Removal Guidelines](#removal-guidelines)

---

## Suppression Categories

### Legend
- 🔴 **Permanent** - Requires library update or cannot be fixed
- 🟡 **Temporary** - Can be fixed with refactoring
- 🟢 **Pending** - Waiting on upstream library fix

---

## Library Compatibility Issues

### 1. TipTap Editor Commands

**Status:** 🔴 Permanent (until TipTap v3.0)

#### Location: `src/lib/editor/EditorController.ts:47`

```typescript
// @ts-expect-error - TipTap extension command
setFontSize = (size: string) => this.editor.chain().focus().setFontSize(size).run();
```

**Why:** Custom TipTap extension `setFontSize` is not in the base command types.

**Fix Required:** 
- Update TipTap to version with proper extension typing
- OR: Create custom type declarations for extensions

**Related Files:**
- `src/lib/editor/EditorController.ts`
- `src/lib/tiptap-extensions.ts`

---

#### Location: `src/lib/editor/slash-command.tsx:55`

```typescript
// @ts-expect-error - Custom TipTap extension command
{ title: 'PlantUML Diagram', description: 'Embed a live PlantUML diagram.', icon: <GitGraph size={20} />, command: () => editor.chain().focus().insertPlantUML().run() },
```

**Why:** Custom `insertPlantUML` command from our PlantUML extension.

**Fix Required:** 
- Add proper type declarations for custom commands
- Update extension typing in `src/lib/editor/plantUml-extension.tsx`

---

#### Location: `src/lib/editor/plantUml-extension.tsx:45`

```typescript
addCommands() {
  return {
    insertPlantUML: () => ({ commands }: any) => {
      return commands.insertContent('<plant-uml></plant-uml>');
    },
  } as any;
},
```

**Why:** TipTap's command type system doesn't properly infer custom commands.

**Fix Required:**
```typescript
// Future fix when TipTap improves types
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    plantUml: {
      insertPlantUML: () => ReturnType;
    };
  }
}
```

---

#### Location: `src/components/report-mode/MarkdownEditor.tsx:42`

```typescript
// @ts-expect-error - TipTap handlePaste return type mismatch
handlePaste: async (view, event, slice): Promise<boolean> => {
```

**Why:** TipTap expects specific EditorView type, but we use simplified signature.

**Fix Required:** Import proper types from `@tiptap/pm`

---

#### Location: `src/components/report-mode/MarkdownEditor.tsx:101`

```typescript
// @ts-expect-error - BubbleMenu tippyOptions onClose prop type mismatch
tippyOptions={{ duration: 100, placement: 'top', onClose: () => false }}
```

**Why:** TipTap's BubbleMenu expects different onClose signature than what Tippy.js provides.

**Fix Required:** Wait for TipTap to update Tippy.js integration.

---

### 2. Document Generation Libraries

**Status:** 🟢 Pending (waiting on library updates)

#### Location: `src/lib/word-converter/node-handlers.ts:8`

```typescript
// IFootnotesOptions not available in current docx version
type IFootnotesOptions = any;
```

**Why:** `docx` library v7.x doesn't export `IFootnotesOptions` interface.

**Fix Required:**
- Update to `docx` v8.x when released
- OR: Define proper interface based on library source

**Workaround:**
```typescript
// Temporary type definition
interface IFootnotesOptions {
  reference?: string;
  children?: any[];
}
```

---

#### Location: `src/lib/markdown-to-word-converter.ts:89`

```typescript
(finalStyles.paragraphStyles as any).push({
```

**Why:** `docx` types mark `paragraphStyles` as readonly array.

**Fix Required:** Use immutable array operations or wait for library update.

**Better Approach:**
```typescript
finalStyles.paragraphStyles = [
  ...finalStyles.paragraphStyles!,
  captionStyle
];
```

---

#### Location: `src/lib/markdown-to-pptx-converter.ts:145,148`

```typescript
return pptx.write('nodebuffer' as any) as Promise<Buffer>;
return pptx.write('blob' as any) as Promise<Blob>;
```

**Why:** PptxGenJS types don't include 'nodebuffer' and 'blob' options, though they work at runtime.

**Fix Required:** Submit PR to @types/pptxgenjs or wait for library update.

---

### 3. UI Library Issues

**Status:** 🔴 Permanent (Radix UI design choice)

#### Location: `src/components/ui/dropdown-menu.tsx:54`

```typescript
// @ts-expect-error - Radix UI onCloseAutoFocus event type mismatch
onCloseAutoFocus={(e: Event) => e.preventDefault()}
```

**Why:** Radix UI expects FocusEvent but we need generic Event.

**Fix Required:** 
- Use proper FocusEvent type
- OR: Cast to correct type

**Better Approach:**
```typescript
onCloseAutoFocus={(e: FocusEvent) => e.preventDefault()}
```

---

#### Location: `src/components/ui/menubar.tsx:80`

```typescript
// @ts-expect-error - Radix UI onCloseAutoFocus event type mismatch
onCloseAutoFocus={(e: Event) => e.preventDefault()}
```

**Why:** Same as dropdown-menu above.

**Fix Required:** Same as above.

---

### 4. File Handling

**Status:** 🟡 Temporary

#### Location: `src/components/writing-tools/MarkdownToWordTool.tsx:83`

```typescript
// @ts-expect-error - saveAs is a UMD global from file-saver
saveAs(blob, `${data.fileName}.docx`);
```

**Why:** `file-saver` is loaded as UMD global, not properly typed as module.

**Fix Required:**
```typescript
// Add to src/@types/file-saver.d.ts
declare module 'file-saver' {
  export function saveAs(blob: Blob, filename: string): void;
}
```

---

#### Location: `src/hooks/util/useExport.ts:99`

```typescript
// @ts-expect-error - saveAs type overload mismatch
saveAs(blob, `${project.name.replace(/\s+/g, '_')}_presentation.pptx`);
```

**Why:** Same as above.

---

## Type Inference Edge Cases

### 5. React Hook Form

**Status:** 🟡 Temporary

#### Location: `src/components/sidebar/AgentDialog.tsx:78`

```typescript
// @ts-expect-error - useFieldArray name type inference issue
name: 'guidelines',
```

**Why:** React Hook Form's type inference doesn't work properly with nested field arrays in certain cases.

**Fix Required:**
- Update react-hook-form to latest version
- OR: Explicitly type the form schema

**Better Approach:**
```typescript
interface FormSchema {
  guidelines: string[];
}

const { fields } = useFieldArray<FormSchema>({
  control: form.control,
  name: 'guidelines' as const,
});
```

---

### 6. React Query

**Status:** 🟡 Temporary

#### Location: `src/hooks/data/use-templates.ts:128`

```typescript
// @ts-expect-error - fetchPresentationTemplatesApi return type mismatch
queryFn: fetchPresentationTemplatesApi,
```

**Why:** Query function return type doesn't perfectly match generic parameter.

**Fix Required:** Ensure API function explicitly returns `Promise<PptxTemplateProperties[]>`

**Better Approach:**
```typescript
export async function fetchPresentationTemplatesApi(): Promise<PptxTemplateProperties[]> {
  const response = await fetch('/api/templates/pptx');
  return response.json();
}
```

---

## Third-Party Integration Issues

### 7. Genkit AI Actions

**Status:** 🔴 Permanent (Genkit design)

#### Location: `src/components/agent/AgentPlayground.tsx:47`

```typescript
// @ts-expect-error - Genkit Action type vs MutationFunction type mismatch
mutationFn: runAgentFlow,
```

**Why:** Genkit's Action type is not compatible with React Query's MutationFunction.

**Fix Required:**
- Create wrapper function that adapts types
- OR: Wait for Genkit to provide React Query integration

**Better Approach:**
```typescript
const mutation = useMutation({
  mutationFn: async (input: FlowInput) => {
    const result = await runAgentFlow(input);
    return result;
  },
});
```

---

#### Location: `src/hooks/writing-tools/use-writing-tool.ts:37,47`

```typescript
// @ts-expect-error - Type mismatch with TanStack Query callback signature
options.onSuccess(data, variables, context);
options.onError(error, variables, context);
```

**Why:** TanStack Query v5 changed callback signatures (4 parameters vs 3).

**Fix Required:** Update to match TanStack Query v5 signature.

**Better Approach:**
```typescript
onSuccess: (data, variables, context) => {
  if (options?.onSuccess) {
    options.onSuccess(data, variables, context, undefined);
  }
},
```

---

### 8. Zod Schema Unions

**Status:** 🟡 Temporary

#### Location: `src/hooks/writing-tools/use-ai-researcher-logic.ts:216`

```typescript
// @ts-expect-error - Zod discriminated union schema type inference issue
resolver: zodResolver(getSchema(researchMode)),
```

**Why:** Zod's discriminated union type doesn't properly narrow when passed to zodResolver.

**Fix Required:**
- Use explicit type casting
- OR: Refactor to avoid discriminated unions

**Better Approach:**
```typescript
const schema = getSchema(researchMode);
const form = useForm({
  resolver: zodResolver(schema) as any,
  // OR
  resolver: zodResolver(schema as ZodObject<any>),
});
```

---

## Firebase/Admin SDK

### 9. Firebase Admin Messaging

**Status:** 🔴 Permanent (Firebase SDK types)

#### Location: `src/app/api/admin/gift-credits/route.ts:85`

```typescript
// @ts-expect-error - Firebase Admin SDK messaging property
await adminAuth.app.messaging().send(pushMessage);
```

**Why:** Firebase Admin SDK types don't include `.messaging()` on app instance.

**Fix Required:** Wait for Firebase Admin SDK type definitions update.

**Workaround:**
```typescript
import { getMessaging } from 'firebase-admin/messaging';

const messaging = getMessaging(adminAuth.app);
await messaging.send(pushMessage);
```

---

## Type System Edge Cases

### 10. Component Props

**Status:** 🟡 Temporary

#### Location: `src/app/admin/manage-users/[id]/edit/page.tsx:64`

```typescript
{/* @ts-expect-error - Lazy loaded component prop type mismatch */}
<EditUserFormComponent user={user} />
```

**Why:** React.lazy() loses prop type information in some Next.js contexts.

**Fix Required:**
- Define explicit prop types for lazy components
- OR: Use dynamic imports with proper typing

**Better Approach:**
```typescript
const EditUserFormComponent = lazy(() => 
  import('@/components/admin/EditUserForm').then(mod => ({
    default: mod.EditUserForm
  }))
) as React.ComponentType<{ user: User }>;
```

---

#### Location: `src/components/admin/users/CreateCategoryDialog.tsx:9`

```typescript
// @ts-expect-error - Module not yet implemented
import { useCreateCategoryDialog } from '@/hooks/admin/use-create-category-dialog';
```

**Why:** Hook module doesn't exist yet (feature in development).

**Fix Required:** Implement the missing hook or remove the import.

---

#### Location: `src/components/pricing/PurchaseCreditsDialog.tsx:122`

```typescript
// @ts-expect-error - FormData object literal property mismatch
mutation.mutate({ formData: formData as any, token });
```

**Why:** FormData object type doesn't match mutation input type exactly.

**Fix Required:** Define proper mutation input type.

**Better Approach:**
```typescript
interface PurchaseMutationInput {
  formData: FormData;
  token: string;
}

const mutation = useMutation<Response, Error, PurchaseMutationInput>({
  // ...
});
```

---

#### Location: `src/components/report-mode/settings/ProjectSettingsPanel.tsx:136`

```typescript
// @ts-expect-error - Form data type mismatch with ProjectProperties
const updatePayload: Partial<ProjectProperties> = { ...data };
```

**Why:** Form data has string types but ProjectProperties expects transformed types.

**Fix Required:** Transform form data before creating payload.

**Better Approach:**
```typescript
const updatePayload: Partial<ProjectProperties> = {
  name: data.name,
  description: data.description,
  teamMembers: data.teamMembers?.split(',').map(s => s.trim()),
  // ... explicit transformations
};
```

---

#### Location: `src/components/report-mode/templates/ApplyTemplatePanel.tsx:99`

```typescript
// @ts-expect-error - ReportTemplateProperties type mismatch between imports
handleSelectTemplate(previewTemplate)
```

**Why:** ReportTemplateProperties defined in two places with slight differences.

**Fix Required:** Consolidate type definitions.

---

#### Location: `src/app/api/export/docx/route.ts:87`

```typescript
return new NextResponse(docxBuffer as any, {
```

**Why:** NextResponse expects specific body types, Buffer needs casting.

**Fix Required:** Use proper Buffer type or Response constructor.

**Better Approach:**
```typescript
return new Response(docxBuffer, {
  headers: {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
});
```

---

## Removal Guidelines

### When to Remove Suppressions

1. **Library Updates**
   - Check if new library version fixes the type issue
   - Remove suppression after successful upgrade test

2. **Type Definition Improvements**
   - If @types packages are updated, retest
   - Remove suppression if types now work

3. **Code Refactoring**
   - When refactoring related code, attempt to remove suppression
   - If type-safe solution exists, prefer it

4. **Framework Updates**
   - Next.js, React, or other framework updates may fix issues
   - Retest after major version upgrades

### How to Test Removal

```bash
# 1. Comment out the suppression
# 2. Run typecheck
npm run typecheck

# 3. If passes, remove the suppression
# 4. Run tests to ensure no runtime issues
npm test

# 5. Test the feature manually
npm run dev
```

### Documentation Requirements

When removing a suppression:
1. Note the removal in PR description
2. Mention which library version fixed it
3. Update this document

When adding a new suppression:
1. Document it in this file immediately
2. Explain why it's necessary
3. Describe what would fix it
4. Add status indicator (🔴/🟡/🟢)

---

## Maintenance Schedule

### Monthly Review
- Check for library updates that might fix suppressions
- Review 🟢 Pending suppressions
- Update documentation

### Quarterly Review
- Attempt to remove all 🟡 Temporary suppressions
- Refactor code to eliminate suppressions where possible
- Update version compatibility notes

### Before Major Releases
- Review all suppressions
- Ensure documentation is current
- Validate all suppressions are still necessary

---

## Summary Statistics

**By Category:**
- Library Compatibility: 7 suppressions
- Type Inference: 2 suppressions
- Third-Party Integration: 3 suppressions
- Firebase SDK: 1 suppression
- Component Props: 6 suppressions

**By Status:**
- 🔴 Permanent: 6 suppressions
- 🟡 Temporary: 7 suppressions
- 🟢 Pending: 1 suppression

**Priority for Removal:**
1. Temporary suppressions in component props
2. React Query type mismatches
3. Form handling issues
4. Radix UI event handlers
5. Library-dependent suppressions

---

## Contributing

When you encounter a new type error:

1. **Try to fix it properly first** - Suppressions are last resort
2. **Document if suppression is needed** - Add to this file
3. **Use correct suppression type**:
   - `@ts-expect-error` - Preferred (errors if code is fixed)
   - `@ts-ignore` - Avoid (suppresses all errors)
4. **Add descriptive comment** - Explain why and what would fix it

---

## Related Resources

- [TypeScript Handbook - Type Assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions)
- [TypeScript Patterns](./TYPESCRIPT_PATTERNS.md)
- [Migration Guide](./TYPESCRIPT_MIGRATION_GUIDE.md)
- [TipTap Documentation](https://tiptap.dev/api/commands)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives)
