// Each face follows Speffz clockwise order: corners TL, TR, BR, BL;
// edges top, right, bottom, left. Face order is U, L, F, R, B, D.
const LETTERING_KEY = 'bld_lettering_schemes_v1';
const LETTERING_VIEW_KEY = 'bld_lettering_view_v1';
const LETTERING_FACES = {
    U: { column: 2, row: 1, color: '#ffe435', normal: [0, 1, 0], opposite: 'D', zh: '黃色', en: 'Yellow' },
    L: { column: 1, row: 2, color: '#f56c68', normal: [-1, 0, 0], opposite: 'R', zh: '紅色', en: 'Red' },
    F: { column: 2, row: 2, color: '#65cf78', normal: [0, 0, 1], opposite: 'B', zh: '綠色', en: 'Green' },
    R: { column: 3, row: 2, color: '#ffb449', normal: [1, 0, 0], opposite: 'L', zh: '橘色', en: 'Orange' },
    B: { column: 4, row: 2, color: '#62b4f3', normal: [0, 0, -1], opposite: 'F', zh: '藍色', en: 'Blue' },
    D: { column: 2, row: 3, color: '#f8fafc', normal: [0, -1, 0], opposite: 'U', zh: '白色', en: 'White' }
};
let letteringState = null;
let letteringDraft = null;

function validateLetteringScheme(value) {
    if (!Array.isArray(value) || value.length !== 24) return null;
    const labels = value.map(label => typeof label === 'string' ? label.trim().toLowerCase() : '');
    return labels.every(label => [...label].length === 1) && new Set(labels).size === 24 ? labels : null;
}

function sanitizeLetteringState(value) {
    if (!value || !['zh', 'en', 'custom'].includes(value.selected)) return null;
    const result = { selected: value.selected, active: {}, custom: {} };
    for (const type of ['corner', 'edge']) {
        result.active[type] = validateLetteringScheme(value.active?.[type]);
        result.custom[type] = validateLetteringScheme(value.custom?.[type]);
        if (!result.active[type] || !result.custom[type]) return null;
    }
    return result;
}

function ensureLetteringState() {
    if (letteringState) return letteringState;
    letteringState = sanitizeLetteringState(readStoredJson(LETTERING_KEY, null));
    if (!letteringState) {
        const active = validateLetteringScheme(chars) || [...CHARS_ZH];
        const custom = validateLetteringScheme(getSavedCustomChars()) || [...active];
        letteringState = {
            selected: isSameCharScheme(active, CHARS_EN) ? 'en' : isSameCharScheme(active, CHARS_ZH) ? 'zh' : 'custom',
            active: { corner: [...active], edge: [...active] },
            custom: { corner: [...custom], edge: [...custom] }
        };
    }
    return letteringState;
}

function getPieceChars(type = 'corner') {
    const state = ensureLetteringState();
    return state.active[type === 'edge' || type === 'edge-word' ? 'edge' : 'corner'];
}

function saveLetteringState() {
    localStorage.setItem(LETTERING_KEY, JSON.stringify(letteringState));
    chars = [...letteringState.active.corner];
    localStorage.setItem(CHARS_KEY, JSON.stringify(chars));
    localStorage.setItem(CUSTOM_CHARS_KEY, JSON.stringify(letteringState.custom.corner));
}

function remapLetteringData(type, oldLabels, newLabels) {
    const remap = pair => {
        for (let i = 0; i < oldLabels.length; i++) {
            if (!pair.startsWith(oldLabels[i])) continue;
            const j = oldLabels.indexOf(pair.slice(oldLabels[i].length));
            if (j >= 0) return newLabels[i] + newLabels[j];
        }
        return pair;
    };
    for (const mode of [type, type === 'edge' ? 'edge-word' : 'word']) {
        for (const key of [getContentStorageKey(mode), getStatusStorageKey(mode)]) {
            const map = readStoredJson(key, {});
            const next = {};
            Object.entries(map).forEach(([pair, value]) => { next[remap(pair)] = value; });
            localStorage.setItem(key, JSON.stringify(next));
        }
    }
    trainerRecords = trainerRecords.map(record => record.algorithmType === type ? { ...record, pair: remap(record.pair) } : record);
}

function applyLetteringScheme(scheme) {
    const state = ensureLetteringState();
    for (const type of ['corner', 'edge']) {
        const next = scheme === 'custom' ? [...state.custom[type]] : [...(scheme === 'en' ? CHARS_EN : CHARS_ZH)];
        remapLetteringData(type, state.active[type], next);
        state.active[type] = next;
    }
    state.selected = scheme;
    saveLetteringState();
    localStorage.setItem(TRAINER_RECORDS_KEY, JSON.stringify(trainerRecords));
    resetTrainerScrambleNavigation();
    currentTrainerPair = null;
    currentTrainerScramble = '';
    recentMemPairs = [];
    lastMemPair = null;
    initUI();
    applyLanguage();
    updateLayoutMode();
    renderCurrentListView();
    renderLetteringNet();
    generateTrainerScramble({ silent: true, resetTimerDisplay: true });
    if (currentTab === 'memory') nextMemoryCard();
}

function letteringText(zh, en) { return currentLang === 'en' ? en : zh; }

function getLetteringFrontChoices(up) {
    return Object.keys(LETTERING_FACES).filter(face => face !== up && face !== LETTERING_FACES[up].opposite);
}

function normalizeLetteringView(value) {
    const up = Object.hasOwn(LETTERING_FACES, value?.up) ? value.up : 'U';
    const frontChoices = getLetteringFrontChoices(up);
    const defaultFront = frontChoices.includes('F') ? 'F' : frontChoices[0];
    const front = frontChoices.includes(value?.front) ? value.front : defaultFront;
    return { up, front };
}

function getLetteringViewFaces({ up, front }) {
    const [ux, uy, uz] = LETTERING_FACES[up].normal;
    const [fx, fy, fz] = LETTERING_FACES[front].normal;
    // Up × front points to the face on the viewer's right.
    const rightNormal = [uy * fz - uz * fy, uz * fx - ux * fz, ux * fy - uy * fx];
    const right = Object.keys(LETTERING_FACES).find(face =>
        LETTERING_FACES[face].normal.every((component, axis) => component === rightNormal[axis]));
    return {
        U: up, L: LETTERING_FACES[right].opposite, F: front,
        R: right, B: LETTERING_FACES[front].opposite, D: LETTERING_FACES[up].opposite
    };
}

function getLetteringStickerIndex(type, viewIndex, viewFaces) {
    const stickers = BUFFER_STICKER_NAMES[type];
    const physicalSticker = [...stickers[viewIndex]].map(face => viewFaces[face]).join('');
    return stickers.indexOf(physicalSticker);
}

function createLetteringFaceField(labelText) {
    const field = document.createElement('label');
    field.className = 'settings-buffer-field';
    const label = document.createElement('span');
    label.textContent = labelText;
    const wrapper = document.createElement('span');
    wrapper.className = 'styled-select-wrapper';
    const select = document.createElement('select');
    select.className = 'styled-select';
    const chevron = document.createElement('span');
    chevron.className = 'select-arrow';
    chevron.setAttribute('aria-hidden', 'true');
    wrapper.append(select, chevron);
    field.append(label, wrapper);
    return { field, select };
}

function fillLetteringFaceChoices(select, choices, selected) {
    const options = choices.map(face => {
        const option = document.createElement('option');
        const { zh, en } = LETTERING_FACES[face];
        option.value = face;
        option.textContent = letteringText(zh, en);
        return option;
    });
    select.replaceChildren(...options);
    select.value = selected;
}

function renderLetteringCube(net, view) {
    const viewFaces = getLetteringViewFaces(view);
    const corners = { 0: 0, 2: 1, 8: 2, 6: 3 };
    const edges = { 1: 0, 5: 1, 7: 2, 3: 3 };
    const grids = Object.entries(LETTERING_FACES).map(([direction, { column, row }], faceIndex) => {
        const face = viewFaces[direction];
        const { color, zh, en } = LETTERING_FACES[face];
        const grid = document.createElement('div');
        grid.className = 'lettering-cube-face';
        grid.style.gridColumn = column;
        grid.style.gridRow = row;
        grid.style.backgroundColor = color;
        grid.setAttribute('role', 'group');
        grid.setAttribute('aria-label', `${letteringText(zh, en)} (${direction})`);
        for (let cell = 0; cell < 9; cell++) {
            if (cell === 4) {
                const center = document.createElement('span');
                center.className = 'lettering-cube-center';
                center.textContent = direction;
                grid.appendChild(center);
                continue;
            }
            const type = cell in corners ? 'corner' : 'edge';
            const viewIndex = faceIndex * 4 + (type === 'corner' ? corners[cell] : edges[cell]);
            const index = getLetteringStickerIndex(type, viewIndex, viewFaces);
            const input = document.createElement('input');
            input.className = 'lettering-sticker';
            input.value = letteringDraft[type][index].toUpperCase();
            input.autocomplete = 'off';
            input.spellcheck = false;
            const piece = type === 'corner' ? letteringText('角塊', 'Corner') : letteringText('邊塊', 'Edge');
            input.setAttribute('aria-label', piece + ' ' + BUFFER_STICKER_NAMES[type][viewIndex]);
            input.dataset.piece = type;
            input.dataset.index = index;
            input.addEventListener('input', () => {
                letteringDraft[type][index] = input.value.trim().toLowerCase();
            });
            grid.appendChild(input);
        }
        return grid;
    });
    net.replaceChildren(...grids);
}

function renderLetteringNet() {
    const container = document.getElementById('lettering-net-editor');
    if (!container) return;
    const state = ensureLetteringState();
    const displayed = state.selected === 'custom' ? state.custom : state.active;
    letteringDraft = { corner: [...displayed.corner], edge: [...displayed.edge] };

    const orientationControls = document.createElement('div');
    orientationControls.className = 'lettering-orientation';
    const upField = createLetteringFaceField(letteringText('朝上的面', 'Up face'));
    const frontField = createLetteringFaceField(letteringText('朝自己的面', 'Face toward you'));
    orientationControls.append(upField.field, frontField.field);
    const hint = document.createElement('p');
    hint.className = 'mode-hint';
    hint.textContent = letteringText(
        '角格輸入角塊編碼，邊格輸入邊塊編碼。各需 24 個不重複的單字元，填好後按「套用自訂」。',
        'Enter corner and edge codes in their stickers. Each set needs 24 unique characters. Choose Apply Custom to save.'
    );
    const net = document.createElement('div');
    net.className = 'lettering-cube-net';

    let view = normalizeLetteringView(readStoredJson(LETTERING_VIEW_KEY, null));
    fillLetteringFaceChoices(upField.select, Object.keys(LETTERING_FACES), view.up);
    const drawView = () => {
        fillLetteringFaceChoices(frontField.select, getLetteringFrontChoices(view.up), view.front);
        renderLetteringCube(net, view);
    };
    const updateView = change => {
        view = normalizeLetteringView({ ...view, ...change });
        localStorage.setItem(LETTERING_VIEW_KEY, JSON.stringify(view));
        drawView();
    };
    upField.select.onchange = () => updateView({ up: upField.select.value });
    frontField.select.onchange = () => updateView({ front: frontField.select.value });
    drawView();

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'action-btn';
    button.textContent = letteringText('套用自訂', 'Apply Custom');
    button.onclick = () => {
        const corner = validateLetteringScheme(letteringDraft.corner);
        const edge = validateLetteringScheme(letteringDraft.edge);
        if (!corner || !edge) {
            alert(letteringText(
                '角塊和邊塊各需 24 個不重複的單字元，不能留空。',
                'Corners and Edges each need 24 unique single characters, with no empty cells.'
            ));
            return;
        }
        state.custom = { corner, edge };
        applyLetteringScheme('custom');
    };
    container.replaceChildren(orientationControls, hint, net, button);
}
