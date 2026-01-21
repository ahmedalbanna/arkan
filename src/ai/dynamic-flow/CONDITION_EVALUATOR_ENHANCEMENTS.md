# Condition Evaluator Enhancements

## Overview

The Condition Evaluator has been enhanced with three powerful features for advanced expression evaluation:

1. **Function Call Support** - Built-in functions like `length()`, `contains()`, `isEmpty()`, etc.
2. **Regex Matching** - Pattern matching with regular expressions
3. **Array Operations** - `in`, `includes`, `some`, `every` operators

---

## 1. Function Call Support

### Purpose
Provide built-in functions for common operations without requiring custom JavaScript code.

### Supported Functions

#### String Functions

**`length(value)`**
Check if string or array has length (non-empty).

```typescript
// Check if name is not empty
length(input.name)  // true if name has characters

// Check if array has items
length(items)  // true if array is not empty
```

**`contains(haystack, needle)`**
Check if string contains substring or array contains value.

```typescript
// String contains
contains(input.email, "@")  // true if email contains @

// Array contains
contains(input.tags, "premium")  // true if premium is in tags array
```

**`startsWith(str, prefix)`**
Check if string starts with prefix.

```typescript
startsWith(input.name, "John")  // true if name starts with John
startsWith(input.url, "https://")  // true for HTTPS URLs
```

**`endsWith(str, suffix)`**
Check if string ends with suffix.

```typescript
endsWith(input.filename, ".pdf")  // true for PDF files
endsWith(input.email, "@example.com")  // true for example.com emails
```

**`isEmpty(value)`**
Check if value is empty (null, undefined, empty string, empty array, empty object).

```typescript
isEmpty(input.name)  // true if name is empty or null
isEmpty(items)  // true if array is empty
isEmpty(user.profile)  // true if object has no properties
```

**`isNotEmpty(value)`**
Opposite of isEmpty.

```typescript
isNotEmpty(input.name)  // true if name has content
isNotEmpty(items)  // true if array has items
```

#### Array Functions

**`some(array)`**
Check if at least one array element is truthy.

```typescript
some(flags)  // true if at least one flag is true
some(results)  // true if at least one result is truthy
```

**`every(array)`**
Check if all array elements are truthy.

```typescript
every(checkmarks)  // true if all checkmarks are true
every(validations)  // true if all validations pass
```

### Usage Examples

```typescript
// Simple function call
length(input.email)

// Function with multiple arguments
contains(input.description, "important")

// Combined with comparisons
length(input.name) && input.age > 18

// Nested in logical expressions
isNotEmpty(input.email) && contains(input.email, "@")

// Multiple functions
startsWith(input.code, "PRE-") && endsWith(input.code, "-POST")
```

---

## 2. Regex Matching Support

### Purpose
Enable pattern matching with regular expressions for validation and text processing.

### Syntax

```typescript
/pattern/flags.test(value)
```

- **pattern**: Regular expression pattern
- **flags**: Optional regex flags (i, g, m, etc.)
- **value**: Value to test against pattern

### Common Patterns

#### Email Validation

```typescript
/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)
```

#### Phone Number Formats

```typescript
// US Format: 555-1234
/^\d{3}-\d{4}$/.test(input.phone)

// International: +1-555-123-4567
/^\+\d{1,3}-\d{3}-\d{3}-\d{4}$/.test(input.phone)
```

#### Alphanumeric Codes

```typescript
// Only letters and numbers
/^[A-Za-z0-9]+$/.test(input.code)

// Uppercase alphanumeric
/^[A-Z0-9]+$/.test(input.productCode)
```

#### URL Validation

```typescript
// HTTP/HTTPS URLs
/^https?:\/\/.+/.test(input.website)

// Specific domain
/^https:\/\/example\.com/.test(input.url)
```

#### Case-Insensitive Matching

```typescript
// Match "John" regardless of case
/^john/i.test(input.name)

// Contains word (case-insensitive)
/error/i.test(input.message)
```

#### Complex Patterns

```typescript
// ZIP Code: 12345 or 12345-6789
/^\d{5}(-\d{4})?$/.test(input.zipCode)

// Credit Card: 4 groups of 4 digits
/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(input.creditCard)

// Date: YYYY-MM-DD
/^\d{4}-\d{2}-\d{2}$/.test(input.date)
```

### Usage Examples

```typescript
// Simple pattern match
/^\d+$/.test(input.age)  // Only digits

// With flags
/john/i.test(input.name)  // Case-insensitive

// Combined with other conditions
/^[A-Z]+$/.test(input.code) && length(input.code) === 6

// Multiple regex checks
/^[a-z]+$/i.test(input.username) && /^\w+@\w+\.\w+$/.test(input.email)

// Validation pipeline
/^.{8,}$/.test(input.password) && /\d/.test(input.password) && /[A-Z]/.test(input.password)
```

### Regex Flags

| Flag | Description | Example |
|------|-------------|---------|
| `i` | Case-insensitive | `/john/i` matches "John", "JOHN", "john" |
| `g` | Global (not typically needed in .test()) | `/a/g` |
| `m` | Multiline | `/^start/m` matches start of any line |
| `s` | Dotall (. matches newlines) | `/a.b/s` |
| `u` | Unicode | `/\u{1F600}/u` |
| `y` | Sticky | `/word/y` |

---

## 3. Array Operations

### Purpose
Provide intuitive operators for checking array membership.

### `in` Operator

Check if a value is in an array.

```typescript
// Syntax: value in array

"premium" in input.tags
"admin" in user.roles
42 in numbers
```

**Examples:**

```typescript
// String in array
"active" in statuses  // true if "active" is in statuses array

// Number in array
5 in scores  // true if 5 is in scores array

// Variable in array
userType in allowedTypes  // true if userType is allowed

// With property access
input.role in steps.auth.allowedRoles
```

### `includes` Operator

Alias for `in` operator (more intuitive for some users).

```typescript
// Syntax: value includes array

"verified" includes input.badges
"gold" includes membershipLevels
```

**Note:** The syntax is `value includes array` which is equivalent to `value in array`.

### Combined with Other Conditions

```typescript
// Check membership and other conditions
"premium" in input.tags && input.age >= 18

// Multiple array checks
"verified" in input.badges && "active" in statuses

// With negation
!"blocked" in input.flags && isNotEmpty(input.email)

// Complex logic
("admin" in user.roles || "moderator" in user.roles) && user.isActive
```

---

## 4. Combined Usage

### Real-World Examples

#### User Authentication Check

```typescript
// Check if user is authenticated and has valid email
isNotEmpty(user.token) && 
/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email) && 
"verified" in user.badges
```

#### Content Validation

```typescript
// Validate blog post
length(post.title) && 
length(post.content) && 
some(post.tags) && 
"draft" in allowedStatuses
```

#### Access Control

```typescript
// Check if user can access resource
("admin" in user.roles || "owner" in user.roles) &&
!isEmpty(user.permissions) &&
contains(user.permissions, "write")
```

#### Form Validation

```typescript
// Password requirements
/^.{8,}$/.test(input.password) &&  // At least 8 characters
/[A-Z]/.test(input.password) &&     // Has uppercase
/[a-z]/.test(input.password) &&     // Has lowercase
/\d/.test(input.password)           // Has digit
```

#### E-commerce Rules

```typescript
// Apply discount
"premium" in customer.tiers &&
customer.orderCount > 5 &&
contains(cart.items, "featured-product")
```

#### Multi-step Workflow

```typescript
// Check if can proceed to next step
every(validations) &&
isNotEmpty(form.requiredFields) &&
/^(ready|pending)$/.test(workflow.status)
```

---

## 5. API Reference

### Function Calls

```typescript
// String functions
length(value): boolean
contains(haystack, needle): boolean
startsWith(str, prefix): boolean
endsWith(str, suffix): boolean
isEmpty(value): boolean
isNotEmpty(value): boolean

// Array functions
some(array): boolean
every(array): boolean
```

### Regex Syntax

```typescript
/pattern/flags.test(value)

// Examples
/^\d+$/.test(input.age)           // Digits only
/^[a-z]+$/i.test(input.name)      // Letters only (case-insensitive)
/^\w+@\w+\.\w+$/.test(input.email) // Email pattern
```

### Array Operations

```typescript
// in operator
value in array

// includes operator (alias)
value includes array

// Examples
"premium" in tags
42 in numbers
userType in allowedTypes
```

---

## 6. Migration Guide

### Backward Compatibility

All existing expressions continue to work unchanged. New features are additive only.

```typescript
// Existing comparisons - still work
input.age > 18
input.status === "active"
input.count >= 10

// New features - optional enhancements
length(input.name)  // New
/^\d+$/.test(input.age)  // New
"premium" in input.tags  // New
```

### Gradual Adoption

**Before (basic comparisons):**
```typescript
input.email !== "" && input.email !== null
```

**After (with functions):**
```typescript
isNotEmpty(input.email)
```

**Before (complex string checks):**
```typescript
input.email.indexOf("@") >= 0  // Not possible in evaluator
```

**After (with functions):**
```typescript
contains(input.email, "@")
```

**Before (manual validation):**
```typescript
input.status === "active" || input.status === "pending"
```

**After (with arrays):**
```typescript
input.status in ["active", "pending"]  // Would need variable
// Or use regex:
/^(active|pending)$/.test(input.status)
```

---

## 7. Best Practices

### Use Appropriate Features

✅ **Use functions for:**
- Common operations (length, contains, isEmpty)
- Readable, self-documenting code
- Simple checks

✅ **Use regex for:**
- Pattern validation (email, phone, URLs)
- Complex string matching
- Format validation

✅ **Use array operations for:**
- Membership checks
- Role/permission verification
- Tag/category checks

### Performance Considerations

**Fast Operations:**
```typescript
length(input.name)  // Very fast
contains(input.tags, "premium")  // Fast
"admin" in roles  // Fast
```

**Moderate Operations:**
```typescript
/^\w+@\w+\.\w+$/.test(input.email)  // Moderate (regex compilation)
```

**Tips:**
- Simple comparisons are fastest
- Functions are fast for small data
- Regex patterns are compiled each time (moderate overhead)
- Array operations are O(n) but fast for small arrays

### Readability

**Good (Clear intent):**
```typescript
isNotEmpty(user.email)
/^\d{5}$/.test(zipCode)
"premium" in tiers
```

**Avoid (Overly complex):**
```typescript
// Too many nested operations
contains(startsWith(endsWith(...)))  // Hard to read

// Better: Break into multiple conditions
startsWith(input.code, "PRE-") && endsWith(input.code, "-POST")
```

---

## 8. Testing

Comprehensive test suite: `src/ai/dynamic-flow/__tests__/condition-evaluator-enhancements.test.ts`

**41 Tests Passing:**
- ✅ Function call support (18 tests)
- ✅ Regex matching (5 tests)
- ✅ Array operations (4 tests)
- ✅ Combined features (5 tests)
- ✅ Edge cases (5 tests)
- ✅ Code quality (4 tests)

Run tests:
```bash
npm test -- condition-evaluator-enhancements.test.ts
```

---

## 9. Examples by Use Case

### Authentication & Authorization

```typescript
// User is authenticated
isNotEmpty(user.token) && !isEmpty(user.id)

// Has required role
"admin" in user.roles || "moderator" in user.roles

// Email verified
/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email) && "verified" in user.status
```

### Content Validation

```typescript
// Valid blog post
length(post.title) && length(post.content) && some(post.tags)

// Image requirements
/\.(jpg|png|gif)$/i.test(file.name) && file.size < 5000000

// URL validation
/^https:\/\//.test(url) && contains(url, "example.com")
```

### E-commerce

```typescript
// Eligible for discount
"premium" in customer.membership && customer.purchases > 10

// Free shipping
cartTotal > 50 || "free-shipping" in appliedCoupons

// Product availability
"in-stock" in product.status && product.quantity > 0
```

### Form Validation

```typescript
// Required fields
isNotEmpty(form.name) && isNotEmpty(form.email) && isNotEmpty(form.message)

// Email format
/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)

// Password strength
/^.{8,}$/.test(password) && /\d/.test(password) && /[A-Z]/.test(password)
```

---

## 10. Troubleshooting

### Function Not Working

**Check:**
1. Function name spelling: `length()` not `len()`
2. Arguments: `contains(str, substring)` needs 2 args
3. Value types: Functions expect appropriate types

### Regex Not Matching

**Check:**
1. Escaping: Use `\\d` not `\d` in pattern
2. Flags: Case-sensitive by default, add `i` for case-insensitive
3. Anchors: Use `^` and `$` for exact matches

### Array Operation Not Working

**Check:**
1. Syntax: `"value" in array` not `array includes "value"`
2. Value type: Must match array element type exactly
3. Array exists: Ensure variable is actually an array

---

**Last Updated:** 2026-01-21  
**Version:** 2.0.0  
**Status:** ✅ Production Ready
