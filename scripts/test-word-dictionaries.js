const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const stored = new Map([['bld_custom_dict_v3', JSON.stringify({ ab: 'corner word' })]]);
const context = vm.createContext({
    window: {},
    localStorage: {
        getItem: key => stored.get(key) ?? null,
        setItem: (key, value) => stored.set(key, value),
        removeItem: key => stored.delete(key)
    },
    setTimeout, clearTimeout
});
vm.runInContext(fs.readFileSync('lettering.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('script.js', 'utf8'), context);
const run = code => vm.runInContext(code, context);
assert.equal(run("getPairContentValue('ab', 'word')"), 'corner word');
assert.equal(run("getPairContentValue('ab', 'edge-word')"), '');
run("saveContentDict('edge-word', {ab: 'edge word'})");
assert.equal(run("getPairContentValue('ab', 'word')"), 'corner word');
assert.equal(run("getPairContentValue('ab', 'edge-word')"), 'edge word');
run("saveStatusData('ab', {color: 'green'}, 'edge-word')");
assert.equal(run("getPairColor('ab', 'word')"), '');
assert.equal(run("getPairColor('ab', 'edge-word')"), 'green');
run("currentAlgorithmType = 'edge'");
assert.equal(run('getCurrentListContentMode()'), 'edge-word');
assert.equal(run("getCurrentListContentMode('formula')"), 'edge');
// Rapid edits to different fields must both persist, including across piece types.
run("savePairData('ac', 'first edit', 'word'); savePairData('ad', 'second edit', 'word'); savePairData('ac', 'edge edit', 'edge-word')");
assert.equal(run("getPairContentValue('ac', 'word')"), 'first edit');
assert.equal(run("getPairContentValue('ad', 'word')"), 'second edit');
assert.equal(run("getPairContentValue('ac', 'edge-word')"), 'edge edit');
assert.equal(run("matchesListEntry('AB', 'Apple', 'apple', 'filled')"), true);
assert.equal(run("matchesListEntry('AB', 'Apple', 'ab', 'all')"), true);
assert.equal(run("matchesListEntry('AB', 'Apple', '', 'empty')"), false);
assert.equal(run("matchesListEntry('AC', '   ', '', 'empty')"), true);
assert.equal(run("matchesListEntry('AC', '', '', 'filled')"), false);
assert.equal(run("matchesListEntry('AB', 'Apple', 'banana', 'all')"), false);
run("currentMemoryPieceType = 'edge'");
assert.equal(run("formatMemoryAnswer('ab', getSelectedMemoryContentModes())"), 'edge word');
run("currentMemoryPieceType = 'corner'");
assert.equal(run("formatMemoryAnswer('ab', getSelectedMemoryContentModes())"), 'corner word');
assert.equal(run("Object.keys(normalizeBackupPayload({dict: {ab:'legacy'}}).edgeWordDict).length"), 0);
assert.equal(run("normalizeBackupPayload({dict: {ab:'legacy'}}).dict.ab"), 'legacy');
assert.equal(run("normalizeBackupPayload({sections: {letterPairs: {word: {ab:'corner'}, edgeWord: {ab:'edge'}}}}).edgeWordDict.ab"), 'edge');
const display = {innerText: ''};
context.document = {getElementById: id => id === 'trainer-scramble' ? display : null};
run("chars = [...CHARS_EN]; currentTrainerContentGroup = 'word'; currentTrainerAlgorithmType = 'edge'; setTrainerScrambleDisplay('R U', 'ab')");
assert.match(display.innerText, /edge word/);
run("currentTrainerAlgorithmType = 'corner'; setTrainerScrambleDisplay('R U', 'ab')");
assert.match(display.innerText, /corner word/);
run('clearAppStorageData()');
assert.equal(stored.has('bld_word_edge_dict_v1'), false);

run('letteringState = null; chars = [...CHARS_EN]; ensureLetteringState()');
assert.equal(run("validateLetteringScheme(Array(24).fill('a'))"), null);
assert.equal(run("validateLetteringScheme(CHARS_EN).length"), 24);
run("saveContentDict('word', {ab:'corner'}); saveContentDict('edge-word', {ab:'edge'}); saveStatusData('ab', {color:'green'}, 'edge-word')");
run("const reversed = [...CHARS_EN].reverse(); remapLetteringData('edge', getPieceChars('edge'), reversed); letteringState.active.edge = reversed; letteringState.custom.edge = [...reversed]; letteringState.selected = 'custom'; saveLetteringState()");
assert.equal(run("getPairContentValue('xw','edge-word')"), 'edge');
assert.equal(run("getPairContentValue('ab','word')"), 'corner');
assert.equal(run("getPairColor('xw','edge-word')"), 'green');
assert.equal(run("JSON.stringify(getPairIndices('xw', 'edge'))"), '[0,1]');
assert.equal(run("JSON.stringify(getPairIndices('ab', 'corner'))"), '[0,1]');
assert.equal(run("normalizeBackupPayload({dict: {}, sections:{settings:{lettering:ensureLetteringState()}}}).lettering.active.edge[0]"), 'x');
assert.throws(() => run("normalizeBackupPayload({lang:'en'})"), /Invalid or incomplete backup/);
assert.throws(() => run("normalizeBackupPayload({version:3, dict:{}})"), /Invalid or incomplete backup/);
const beforeRestore = new Map(stored);
const writeLocal = context.localStorage.setItem;
context.localStorage.setItem = (key, value) => {
    if (key === run('CORNER_FORMULA_STORAGE_KEY')) throw new Error('Storage full');
    writeLocal(key, value);
};
assert.throws(() => run("restoreBackup(normalizeBackupPayload({dict:{ab:'replacement'}}))"), /Storage full/);
context.localStorage.setItem = writeLocal;
assert.deepEqual(stored, beforeRestore);
run("const originalRenderTrainerRecords = renderTrainerRecords; renderTrainerRecords = () => {}; trainerRecords = []");
const trainerStorageKey = run('TRAINER_RECORDS_KEY');
stored.set(trainerStorageKey, JSON.stringify([{id: 'from-another-tab', rawTimeMs: 1000}]));
run("updateTrainerRecords(records => [{id: 'from-this-tab', rawTimeMs: 1500}, ...records])");
assert.deepEqual(JSON.parse(stored.get(trainerStorageKey)).map(record => record.id), ['from-this-tab', 'from-another-tab']);
stored.delete(trainerStorageKey);
run("trainerRecords = []; renderTrainerRecords = originalRenderTrainerRecords");
const matrix = { innerHTML: '' };
const editToggle = { checked: false };
const bufferFilter = {
    style: {},
    classList: { toggle() {} },
    setAttribute(name, value) { this[name] = value; }
};
const orientationFilter = { ...bufferFilter, style: {} };
const matrixElements = {
    'full-matrix': matrix,
    'matrix-buffer-filter-btn': bufferFilter,
    'matrix-orientation-filter-btn': orientationFilter,
    'matrix-edit-toggle': editToggle
};
context.document.getElementById = id => matrixElements[id] ?? null;
run("currentListViewMode = 'matrix'; currentAlgorithmType = 'corner'; saveContentDict('word', {ab: 'normal pair', cj: 'keep this pair'}); saveStatusData('cj', {color: 'green'}, 'word'); renderCurrentListView()");
assert.equal(bufferFilter.title, 'URF · C / J / M');
assert.match(matrix.innerHTML, /value="keep this pair" data-pair="cj"/);
run('toggleMatrixBufferPairs()');
assert.equal(bufferFilter['aria-pressed'], 'true');
assert.equal(matrix.innerHTML.match(/class="matrix-input"/g).length, 24 * 24);
assert.equal(matrix.innerHTML.match(/status-gray/g).length, 24 * 24 - 21 * 21);
assert.match(matrix.innerHTML, /<td class="status-gray">\s*<input class="matrix-input" value="keep this pair" data-pair="cj"/);
assert.match(matrix.innerHTML, /class="header-input char-idx-3" readonly/);
assert.equal(run("getAvailablePairContentModes('cj', ['word']).length"), 0);
assert.equal(run("getAvailablePairContentModes('ab', ['word']).length"), 1);
assert.equal(run("getPairData('cj', 'word').color"), 'green');

run("getSelectedRanges = () => getPieceChars('corner'); saveContentDict('corner', {ac: 'R U', ma: 'L U', ab: 'U R'}); currentTrainerAlgorithmType = 'corner'");
assert.equal(run('JSON.stringify(getTrainerCandidatePairs().pairs)'), '["ab"]');

// Edge lettering uses the reversed custom scheme set above. Picking RU also hides UR.
run("currentListViewMode = 'formula-matrix'; currentAlgorithmType = 'edge'; currentAlgorithmBufferIndices.edge = 12; saveContentDict('edge', {xw: 'R U', xa: 'U R'}); renderCurrentListView()");
assert.equal(bufferFilter.title, 'RU · W / L');
assert.equal(matrix.innerHTML.match(/class="matrix-input"/g).length, 24 * 24);
assert.equal(run("getPairColor('xw', 'edge')"), 'gray');
assert.equal(run("getPairColor('xa', 'edge')"), '');
run("currentListViewMode = 'matrix'; currentAlgorithmType = 'corner'; toggleMatrixBufferPairs()");
assert.equal(bufferFilter['aria-pressed'], 'false');
assert.match(matrix.innerHTML, /<td class="status-green">\s*<input class="matrix-input" value="keep this pair" data-pair="cj"/);
assert.equal(run("getAvailablePairContentModes('cj', ['word']).length"), 1);

run("currentLang = 'en'; saveContentDict('word', {ab: 'normal', df: 'twist', fd: 'reverse twist'}); saveStatusData('df', {color: 'green'}, 'word'); toggleMatrixOrientationPairs()");
assert.equal(orientationFilter.textContent, 'Hide Twist');
assert.equal(orientationFilter['aria-pressed'], 'true');
assert.equal(matrix.innerHTML.match(/status-gray/g).length, 48);
assert.equal(run("getPairColor('dd', 'word')"), '');
assert.equal(run("getAvailablePairContentModes('df', ['word']).length"), 0);
assert.equal(run("getAvailablePairContentModes('ab', ['word']).length"), 1);
run("saveContentDict('corner', {df: 'R U', fd: 'L U', ab: 'U R'})");
assert.equal(run('JSON.stringify(getTrainerCandidatePairs().pairs)'), '["ab"]');

// In the reversed custom edge scheme, W and L are the two stickers on UR/RU.
run("currentAlgorithmType = 'edge'; renderCurrentListView()");
assert.equal(orientationFilter.textContent, 'Hide Flip');
assert.equal(orientationFilter['aria-pressed'], 'false');
run('toggleMatrixOrientationPairs()');
assert.equal(matrix.innerHTML.match(/status-gray/g).length, 24);
assert.equal(run("getPairColor('wl', 'edge-word')"), 'gray');
assert.equal(run("getPairColor('lw', 'edge-word')"), 'gray');
assert.equal(run("getPairColor('ww', 'edge-word')"), '');
assert.equal(run("getPairColor('xw', 'edge-word')"), 'green');
run('toggleMatrixOrientationPairs()');
assert.equal(run("getPairColor('wl', 'edge-word')"), '');
run("currentAlgorithmType = 'corner'; renderCurrentListView()");
assert.equal(orientationFilter['aria-pressed'], 'true');
run('toggleMatrixOrientationPairs()');
assert.equal(run("getPairColor('df', 'word')"), 'green');
// A grade chosen first applies to each tapped cell without entering text or selecting it.
function makeMatrixInput(pair) {
    const classes = new Set();
    const cell = {
        classList: {
            add: name => classes.add(name),
            remove: (...names) => names.forEach(name => classes.delete(name))
        },
        querySelector: () => input
    };
    const input = {
        dataset: { pair, store: 'word' },
        readOnly: false,
        closest: () => cell,
        matches: () => false,
        classes
    };
    return input;
}
const markableInputs = ['ab', 'df'].map(makeMatrixInput);
matrixElements['matrix-area'] = { classList: { toggle() {} }, querySelectorAll: () => markableInputs };
context.document.querySelectorAll = () => markableInputs;
editToggle.checked = true;
run("window.setMatrixStatus('yellow')");
assert.equal(run('matrixMarkingGrade'), 'yellow');
for (const input of markableInputs) {
    assert.equal(input.readOnly, true);
    context.event = { target: input, preventDefault() {} };
    run('handleMatrixCellClick(event)');
    assert.ok(input.classes.has('status-yellow'));
}
assert.equal(run("getPairData('df', 'word').color"), 'yellow');
run('setMatrixMarkingGrade(null)');
assert.ok(markableInputs.every(input => !input.readOnly));

// Normal clicks are for editing; they cannot create a batch to be graded later.
for (const input of markableInputs) {
    context.event = { target: input };
    run('handleMatrixCellClick(event)');
    assert.ok(input.classes.has('status-yellow'));
    assert.equal(input.readOnly, false);
}
run("window.setMatrixStatus('red')");
assert.equal(run('matrixMarkingGrade'), 'red');
assert.ok(markableInputs.every(input => input.classes.has('status-yellow')));
assert.equal(run("getPairData('ab', 'word').color"), 'yellow');
assert.equal(run("getPairData('df', 'word').color"), 'yellow');
// The net must keep each editor field tied to its physical sticker in every grip.
const views = JSON.parse(run('JSON.stringify(Object.keys(LETTERING_FACES).flatMap(up => getLetteringFrontChoices(up).map(front => ({ up, front }))))'));
assert.equal(views.length, 24);
for (const view of views) {
    context.testView = view;
    for (const type of ['corner', 'edge']) {
        context.testPieceType = type;
        const indices = JSON.parse(run('JSON.stringify(BUFFER_STICKER_NAMES[testPieceType].map((_, index) => getLetteringStickerIndex(testPieceType, index, getLetteringViewFaces(testView))))'));
        assert.deepEqual(indices.sort((a, b) => a - b), Array.from({ length: 24 }, (_, index) => index));
    }
}
assert.equal(run("getLetteringStickerIndex('corner', 0, getLetteringViewFaces({ up: 'F', front: 'U' }))"), 10);
assert.equal(run("normalizeLetteringView({ up: 'U', front: 'D' }).front"), 'F');
context.URL = URL;
vm.runInContext(fs.readFileSync('built-in-algorithms.js', 'utf8'), context);
run('Object.assign(BUILT_IN_ALGORITHMS, window.BUILT_IN_ALGORITHMS); currentAlgorithmBufferIndices = {edge: 2, corner: 2}');
const parity = run('getParityCase(0, 0)');
assert.equal(parity.key, '2-0-2-0');
assert.equal(parity.url, 'https://v2.blddb.net/parity?position=UF-UB-UFR-UBL&mode=nightmare');
assert.equal(parity.reference, JSON.parse(fs.readFileSync('parityNightmareSelected.json', 'utf8')).AEJD);
assert.equal(run('getParityCase(8, 0)'), null);
assert.equal(run('getParityCase(0, 9)'), null);
const parityControls = {
    'parity-edge-target': {value: '0'},
    'parity-corner-target': {value: '0'},
    'parity-formula': {value: 'R U'},
    'parity-blddb-link': {},
    'parity-reference': {}
};
context.document.getElementById = id => parityControls[id] ?? null;
run('saveParityFormula(); currentAlgorithmBufferIndices.corner = 1; renderParityCase()');
assert.equal(parityControls['parity-formula'].value, '');
run('currentAlgorithmBufferIndices.corner = 2; renderParityCase()');
assert.equal(parityControls['parity-formula'].value, 'R U');
run("restoreBackup(normalizeBackupPayload({dict:{}})); renderParityCase()");
assert.equal(parityControls['parity-formula'].value, 'R U');
run("restoreBackup(normalizeBackupPayload({sections:{letterPairs:{word:{}, parity:{'2-0-2-0':'U R'}}}})); renderParityCase()");
assert.equal(parityControls['parity-formula'].value, 'U R');
for (const type of ['corner', 'edge']) {
    const select = parityControls[`parity-${type}-target`];
    select.replaceChildren = () => { select.options = []; };
    select.appendChild = option => { select.options.push(option); };
}
parityControls['parity-buffers'] = {};
context.document.createElement = () => ({});
run('renderParityEditor()');
assert.equal(parityControls['parity-corner-target'].options.length, 21);
assert.equal(parityControls['parity-edge-target'].options.length, 22);
assert.match(parityControls['parity-edge-target'].options[0].textContent, /^X/);
console.log('Word dictionaries, lettering, matrix controls, and parity formulas passed.');
