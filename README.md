# CetusCITests
Automated tests for Cetus (https://github.com/Qwokka/Cetus)

## Necessary Regression Tests

### Binary Loading

- [x] Binary loading via `WebAssembly.instantiateStreaming()`
- [x] Binary loading via `WebAssembly.instantiate()`
- [ ] Binary loading via `WebAssembly.Module()` and `WebAssembly.Instance()`
- [ ] Load multiple concurrent WASM instances

### Memory Search/Modification
    
- [x] Memory searching via `Cetus.search()`
- [x] Memory searching via UI
- [x] String search via `Cetus.strings()`
- [ ] String search via UI
- [ ] Add bookmarks via `Cetus.addBookmark()`
- [x] Add bookmarks via UI
- [ ] Remove bookmark via Javascript (Not yet implemented)
- [x] Remove bookmark via  UI
- [x] Memory modification via `Cetus.modifyMemory()`
- [x] Memory modification via UI
- [ ] Memory viewer

### Watchpoints
  
- [x] Freeze/unfreeze memory
- [ ] Set/unset read watchpoint
- [ ] Set/unset write watchpoint
- [ ] Set multiple concurrent watchpoints in a single WASM instance
- [ ] Set multiple concurrent watchpoints in separate WASM instances

### Speedhack

- [ ] Enable/disable speedhack via `Cetus.setSpeedhackMultipler()`
- [ ] Enable/disable speedhack via UI

### Patching

- [ ] Query function disassembly via UI
- [ ] Save and apply patch via UI

### UI

- [x] Extension unlocks when first WASM instance is loaded
- [ ] Extension locks when last WASM instance is closed
- [x] Duplicate all UI tests for both devpanel and popup
