# Solution Hooks Architecture

## Overview

This document describes the new architecture for handling solution operations with clean separation of responsibilities. This architecture mirrors the novedad hooks pattern and solves the problem of mixed responsibilities in solution processing.

## Problem Solved

The original solution flow in `solucion-form.view-model.ts` was handling multiple responsibilities in a single function:
1. **Creating new solutions** (form submission)
2. **API communication** (direct repository calls)
3. **Redux state management** (multiple dispatch calls)
4. **Error handling** (individual try-catch blocks)
5. **UI feedback** (manual toast messages)

This made it impossible to reuse the solution logic for retry scenarios and violated the single responsibility principle.

## New Architecture

### 1. `useSolucionApi` - Core API Layer
**Purpose**: Pure API communication without Redux state management
**Responsibilities**:
- Make API calls to create/update solutions
- Handle API responses and errors
- Show result messages
- No Redux state mutations

**Usage**:
```typescript
const { procesarSolucionesApiEnLote, mostrarMensajesDeResultado } = useSolucionApi();
```

### 2. `useSolucionCreation` - Creation Flow
**Purpose**: Handle creation of new solutions
**Responsibilities**:
- Separate temporary vs synced solutions
- Handle temporary solutions locally (no API call)
- Process synced solutions via API
- Update Redux state appropriately
- Clear selections on success

**Usage**:
```typescript
const { crearNuevasSoluciones } = useSolucionCreation();

// In form submission
await crearNuevasSoluciones(solucionesData, {
  showToasts: true,
  clearSelectionsOnSuccess: true,
});
```

### 3. `useRetrySoluciones` - Retry Flow
**Purpose**: Handle retry of existing solutions with error state
**Responsibilities**:
- Get existing solution data from Redux
- Retry API calls using existing data
- Update existing solution state (error → success)
- Remove solved novedades from store
- No creation of new solutions

**Usage**:
```typescript
const { reintentarSolucionesConError, isRetryLoading } = useRetrySoluciones();

// In retry operation
await reintentarSolucionesConError(novedadIds);
```

## Flow Comparison

### Before (Problematic)
```
SolucionForm → onSubmit → {
  - Check temp vs synced IDs manually
  - Individual API calls in loop
  - Manual Redux dispatches
  - Manual error handling
  - Manual toast messages
  - No retry capability
}
```

### After (Fixed)
```
SolucionForm → crearNuevasSoluciones → {
  - Automatic temp vs synced separation
  - Batch API processing
  - Centralized Redux updates
  - Unified error handling
  - Automatic toast messages
}

Retry → reintentarSolucionesConError → {
  - Uses existing solution data
  - Batch retry processing
  - Updates existing solutions
  - Removes solved novedades
}
```

## Key Features

### Temporary vs Synced Solutions
- **Temporary solutions**: Saved locally only (no API call needed)
- **Synced solutions**: Sent to API and removed from store when successful

### Error Handling
- Solutions that fail API calls get `estado_solucion: 'error'`
- Failed solutions can be retried using `useRetrySoluciones`
- Successful solutions remove the novedad from store (solved)

### State Management
- **Creation**: Adds solutions locally or removes novedades
- **Retry**: Updates existing solution state or removes novedades
- **Selections**: Automatically cleared on success

## Benefits

1. **Separation of Concerns**: Each hook has a single, clear responsibility
2. **Reusability**: Core API layer can be reused by different flows
3. **Retry Capability**: Failed solutions can be retried without duplication
4. **Data Consistency**: Retry uses original solution data from Redux
5. **Maintainability**: Smaller, focused hooks are easier to test and maintain
6. **Type Safety**: Each hook has specific interfaces and configurations

## Migration Guide

### From Manual Solution Processing

**Before**:
```typescript
// Manual processing in view model
for (const novedadId of novedadesSeleccionadas) {
  try {
    const solucionData = { id: novedadId, solucion: data.solucion };
    
    if (isTempId(novedadId)) {
      dispatch(guardarSolucionNovedad(solucionData));
      // ... more manual logic
    } else {
      await novedadRepository.solucionarNovedades(schemaName, solucionData);
      // ... more manual logic
    }
  } catch (error) {
    // Manual error handling
  }
}
```

**After**:
```typescript
// Clean, declarative approach
const solucionesData = novedadesSeleccionadas.map(id => ({
  id,
  solucion: data.solucion,
}));

await crearNuevasSoluciones(solucionesData, {
  showToasts: true,
  clearSelectionsOnSuccess: true,
});
```

## Files

- `use-solucion-api.hook.ts` - Core API communication
- `use-solucion-creation.hook.ts` - New solution creation flow
- `use-retry-soluciones.hook.ts` - Existing solution retry flow
- `solucion-hooks.index.ts` - Barrel exports
- `SOLUTION_ARCHITECTURE.md` - This documentation

## Integration with Existing Code

The new hooks integrate seamlessly with existing Redux slices and selectors:
- Uses existing `guardarSolucionNovedad`, `limpiarNovedad` actions
- Works with existing `estado_solucion` states
- Maintains compatibility with temporary ID system
- Preserves all existing UI components and navigation
