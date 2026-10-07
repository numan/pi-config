# Testing Patterns Reference

Load this reference from the `testing-strategy` skill when concrete examples are needed. Use `test-driven-development` separately when the task requires a red-green-refactor workflow.

## Table of Contents

- [Test Structure (Arrange-Act-Assert)](#test-structure-arrange-act-assert)
- [Test Naming Conventions](#test-naming-conventions)
- [Common Assertions](#common-assertions)
- [Mocking Patterns](#mocking-patterns)
- [React/Component Testing](#reactcomponent-testing)
- [Async Completion](#async-completion)
- [Layered Test Refactoring](#layered-test-refactoring)
- [Narrow Integration Scenarios](#narrow-integration-scenarios)
- [API / Integration Testing](#api--integration-testing)
- [E2E Testing (Playwright)](#e2e-testing-playwright)
- [Test Anti-Patterns](#test-anti-patterns)

## Test Structure (Arrange-Act-Assert)

```typescript
it('describes expected behavior', () => {
  // Arrange: Set up test data and preconditions
  const input = { title: 'Test Task', priority: 'high' };

  // Act: Perform the action being tested
  const result = createTask(input);

  // Assert: Verify the outcome
  expect(result.title).toBe('Test Task');
  expect(result.priority).toBe('high');
  expect(result.status).toBe('pending');
});
```

## Test Naming Conventions

```typescript
// Pattern: [unit] [expected behavior] [condition]
describe('TaskService.createTask', () => {
  it('creates a task with default pending status', () => {});
  it('throws ValidationError when title is empty', () => {});
  it('trims whitespace from title', () => {});
  it('generates a unique ID for each task', () => {});
});
```

## Common Assertions

```typescript
// Equality
expect(result).toBe(expected);           // Strict equality (===)
expect(result).toEqual(expected);        // Deep equality (objects/arrays)
expect(result).toStrictEqual(expected);  // Deep equality + type matching

// Truthiness
expect(result).toBeTruthy();
expect(result).toBeFalsy();
expect(result).toBeNull();
expect(result).toBeDefined();
expect(result).toBeUndefined();

// Numbers
expect(result).toBeGreaterThan(5);
expect(result).toBeLessThanOrEqual(10);
expect(result).toBeCloseTo(0.3, 5);      // Floating point

// Strings
expect(result).toMatch(/pattern/);
expect(result).toContain('substring');

// Arrays / Objects
expect(array).toContain(item);
expect(array).toHaveLength(3);
expect(object).toHaveProperty('key', 'value');

// Errors
expect(() => fn()).toThrow();
expect(() => fn()).toThrow(ValidationError);
expect(() => fn()).toThrow('specific message');

// Async
await expect(asyncFn()).resolves.toBe(value);
await expect(asyncFn()).rejects.toThrow(Error);
```

## Mocking Patterns

### Mock Functions

```typescript
const mockFn = jest.fn();
mockFn.mockReturnValue(42);
mockFn.mockResolvedValue({ data: 'test' });
mockFn.mockImplementation((x) => x * 2);

expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenCalledTimes(3);
```

### Mock Modules

```typescript
// Mock an entire module
jest.mock('./database', () => ({
  query: jest.fn().mockResolvedValue([{ id: 1, title: 'Test' }]),
}));

// Mock specific exports
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  generateId: jest.fn().mockReturnValue('test-id'),
}));
```

### Mock Outside the Behavior Under Test

Choose doubles relative to the contract being tested. These are typical external boundaries, not permission to replace the behavior the test claims to prove:

```
Mock these:                    Don't mock these:
├── Database calls             ├── Internal utility functions
├── HTTP requests              ├── Business logic
├── File system operations     ├── Data transformations
├── External API calls         ├── Validation functions
└── Time/Date (when needed)    └── Pure functions
```

A focused integration test may also replace an expensive child widget unrelated to its contract. For example, a first-save navigation test can replace segmented date entry with a labeled input that receives the current value and calls the real update callback with the expected date representation. Keep segmented entry, clearing, keyboard, and focus behavior covered with the real widget in its own tests. Keep routing and persistence logic real in the navigation test, with HTTP responses supplied at the network boundary.

Do not implement the behavior under test in the double. If a parent owns focus restoration, a component harness that manually focuses the expected element proves the harness, not the application. Keep that assertion at a layer containing the real parent behavior. Scope widget doubles locally or reuse an existing focused helper; do not introduce a global replacement for unrelated tests.

## React/Component Testing

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

describe('TaskForm', () => {
  it('submits the form with entered data', async () => {
    const onSubmit = jest.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    // Find elements by accessible role/label (not test IDs)
    await screen.findByRole('textbox', { name: /title/i });
    fireEvent.change(screen.getByRole('textbox', { name: /title/i }), {
      target: { value: 'New Task' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ title: 'New Task' });
    });
  });

  it('shows validation error for empty title', async () => {
    render(<TaskForm onSubmit={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
  });
});
```

## Async Completion

A matched request proves the request was sent, not that the application has processed its response. Keep request assertions, but wait for the action's observable result before teardown or dependent actions. For a form that shows a new success status after saving:

```tsx
expect(screen.queryByRole('status')).not.toBeInTheDocument();
await user.click(screen.getByRole('button', { name: 'Save' }));
await waitFor(() => {
  expect(screen.getByRole('status')).toHaveTextContent('Changes saved');
});
expect(saveRequest.isDone()).toBe(true);
```

Use the application's actual completion contract. If a status already exists, assert its action-specific change rather than its presence. If the contract is navigation, await the destination UI. An enabled Save button alone can pass before a mutation starts; use it only when the sequence establishes that it represents completion.

Re-query replaced controls after rerender or navigation instead of asserting against a detached element reference. For a test of interruption itself, deliberately keep the operation pending, perform the interruption, then resolve or reject the controlled work and verify the outcome before ending the test. Avoid arbitrary sleeps and cleanup-only fixes for unfinished work.

## Layered Test Refactoring

When a slow page test repeats rule coverage, separate the contracts by ownership rather than splitting the scenario into more full-page tests.

### 1. Keep the rule matrix pure

```typescript
it.each([
  ['not a price', 'Price must be a number.'],
  ['-1', 'Price cannot be negative.'],
  ['12.345', 'Price can include up to two decimal places.'],
])('validates price %j', (value, message) => {
  expect(validatePrice(value)).toBe(message);
});
```

This layer owns all representative invalid inputs and exact messages.

### 2. Test visibility as state

```typescript
it('reveals only touched errors', () => {
  const errors = {
    clientName: 'Client name is required.',
    price: 'Price must be a number.',
  };

  expect(filterTouchedErrors(errors, new Set(['price']))).toEqual({
    price: 'Price must be a number.',
  });
});
```

This layer owns touched, hidden, reveal-all, and recovery state transitions.

### 3. Keep one page-level wiring assertion

```tsx
it('shows the required error after the field is touched', async () => {
  render(<QuotePage />);

  const clientName = await screen.findByLabelText(/client name/i);
  expect(clientName).not.toHaveAccessibleDescription();

  fireEvent.blur(clientName);

  expect(clientName).toHaveAccessibleDescription('Client name is required.');
});
```

This layer proves the input is wired to touched state and exposes its error accessibly. It does not repeat every validation input or state transition.

### Redundancy checklist

For non-trivial coverage moves, search the suite and record ownership. For smaller changes, use these distinctions without producing a separate map:

| Contract | Owning layer | Higher-level unique confidence |
|---|---|---|
| Validation values and messages | Pure validator test | None |
| Touched/error filtering | Unit or hook test | None |
| Input blur reaches touched state | Component/page smoke test | Event wiring and accessible description |
| Multi-page user journey | Browser/E2E | Routing and browser integration |

Remove an expensive assertion only after identifying where its contract remains covered. If no owning test exists, add the lower-level test first. Measure before and after with the same isolated and representative suite/coverage commands; splitting one slow page test into several page tests is not an optimization when total renders increase.

## Narrow Integration Scenarios

Before writing a nontrivial test, state its starting state, transition, outcome, and unique failure mode. Search existing tests for the remaining contracts. For example:

| Design question | Saved-item insertion test |
|---|---|
| Starting state | A saved contract with two selected upsells and saved inclusion defaults |
| Transition | Insert one saved inclusion into one upsell, then save |
| Observable outcome | The outgoing PATCH contains the new inclusion only on the target upsell |
| Unique failure caught | The menu, parent callback, draft update, or save wiring targets the wrong upsell |
| Covered elsewhere | Catalog copy, price arithmetic, keyboard editing, and generic hydration |

Keep the two-upsell setup: a one-upsell hook test cannot prove isolation between two selected upsells. Omit the unrelated editing and reload journeys unless they protect an additional contract that needs this layer.

Suppose a page test fills recipient details and three dates, saves a new contract, checks guidance, switches Preview → Builder, and checks guidance and disclosures again. Separate the contracts before reducing its work:

| Starting state | Transition | Observable outcome | Required setup |
|---|---|---|---|
| Valid new draft with open disclosures | First save changes the URL | Guidance and disclosures survive canonical navigation | Real creation and router behavior; direct input setup where typing is unrelated |
| Valid saved contract with open disclosures | Preview → Builder | Disclosures remain open | Load a saved fixture; no creation journey |
| Independently loaded saved contract | Initial load | New-draft guidance is absent | Load through the saved route rather than reuse a newly saved instance |

Remove the Preview round trip from the first-save test only after checking whether new-versus-saved state changes the behavior. If it does, retain coverage of that distinction. Do not replace the first-save scenario with a saved fixture: that would bypass the transition it protects.

Keep exact helper copy and link details in focused rendering coverage. Use representative visibility or state assertions during navigation. Keep parent-owned focus assertions with the real parent implementation.

### Distinguish reload coverage from persistence

A save followed by an independently hard-coded mocked GET proves two separate things: the client sends a write and the client hydrates the supplied response. It does not prove the backend stored that write. Removing the second render is appropriate when hydration already has owning coverage and there is no distinct reload-specific UI behavior.

Keep one UI-to-request integration test, with serialization and hydration rules covered below it. Retain a mocked reload when it catches a unique client behavior, such as stale state surviving remount, and name that contract accurately. Use a real backend round trip when stored data is the contract. Do not introduce a stateful mock that recreates persistence just to retain the longer scenario.

For a clipping or responsive-layout fix, use a browser check at the affected widths to verify the rendered result. Add an automated regression test only if it meaningfully detects that failure; an assertion that repeats the CSS value does not prove the banner is visible.

### Report comparable performance evidence

Compare the same focused command before and after, then the relevant suite or shard configuration. Include the timeout budget and distinguish local evidence from CI results. For example, a 3.7-second focused result and a 7.3-second local shard result are different measurements; with a 10-second timeout, the latter leaves about 2.7 seconds of observed margin. Neither confirms a CI pass. Do not require repeated successful runs without a specific unresolved concern.

## API / Integration Testing

```typescript
import request from 'supertest';
import { app } from '../src/app';

describe('POST /api/tasks', () => {
  it('creates a task and returns 201', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({ title: 'Test Task' })
      .set('Authorization', `Bearer ${testToken}`)
      .expect(201);

    expect(response.body).toMatchObject({
      id: expect.any(String),
      title: 'Test Task',
      status: 'pending',
    });
  });

  it('returns 422 for invalid input', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({ title: '' })
      .set('Authorization', `Bearer ${testToken}`)
      .expect(422);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 401 without authentication', async () => {
    await request(app)
      .post('/api/tasks')
      .send({ title: 'Test' })
      .expect(401);
  });
});
```

## E2E Testing (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test('user can create and complete a task', async ({ page }) => {
  // Navigate and authenticate
  await page.goto('/');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'testpass123');
  await page.click('button:has-text("Log in")');

  // Create a task
  await page.click('button:has-text("New Task")');
  await page.fill('[name="title"]', 'Buy groceries');
  await page.click('button:has-text("Create")');

  // Verify task appears
  await expect(page.locator('text=Buy groceries')).toBeVisible();

  // Complete the task
  await page.click('[aria-label="Complete Buy groceries"]');
  await expect(page.locator('text=Buy groceries')).toHaveCSS(
    'text-decoration-line', 'line-through'
  );
});
```

## Test Anti-Patterns

| Anti-Pattern | Problem | Better Approach |
|---|---|---|
| Testing implementation details | Breaks on refactor | Test inputs/outputs |
| Snapshot everything | No one reviews snapshot diffs | Assert specific values |
| Shared mutable state | Tests pollute each other | Setup/teardown per test |
| Testing third-party code | Wastes time, not your bug | Mock the boundary |
| Skipping tests to pass CI | Hides real bugs | Fix or delete the test |
| Using `test.skip` permanently | Dead code | Remove or fix it |
| Overly broad assertions | Doesn't catch regressions | Be specific |
| No async error handling | Swallowed errors, false passes | Always `await` async tests |
