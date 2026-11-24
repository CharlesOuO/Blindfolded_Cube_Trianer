const CHARS_ZH = ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ', 'ㄍ', 'ㄎ', 'ㄏ', 'ㄐ', 'ㄑ', 'ㄒ', 'ㄓ', 'ㄔ', 'ㄕ', 'ㄖ', 'ㄗ', 'ㄘ', 'ㄙ', 'ㄧ', 'ㄨ', 'ㄩ'];
const CHARS_EN = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x'];
let chars = [...CHARS_ZH];

// Sticker names in Speffz index order. Buffer settings must stay independent
// from the user's lettering scheme, while preserving the existing stored index.
const BUFFER_STICKER_NAMES = Object.freeze({
    corner: Object.freeze([
        'ULB', 'UBR', 'URF', 'UFL',
        'LBU', 'LUF', 'LFD', 'LDB',
        'FLU', 'FUR', 'FRD', 'FDL',
        'RFU', 'RUB', 'RBD', 'RDF',
        'BRU', 'BUL', 'BLD', 'BDR',
        'DLF', 'DFR', 'DRB', 'DBL'
    ]),
    edge: Object.freeze([
        'UB', 'UR', 'UF', 'UL',
        'LU', 'LF', 'LD', 'LB',
        'FU', 'FR', 'FD', 'FL',
        'RU', 'RB', 'RD', 'RF',
        'BU', 'BL', 'BD', 'BR',
        'DF', 'DR', 'DB', 'DL'
    ])
});
const PIECE_KEYS_BY_STICKER = Object.fromEntries(
    Object.entries(BUFFER_STICKER_NAMES).map(([type, stickers]) => [
        type, stickers.map(sticker => [...sticker].sort().join(''))
    ])
);

const STORAGE_KEY = 'bld_custom_dict_v3';
const STATUS_KEY = 'bld_status_v1';
const EDGE_WORD_STORAGE_KEY = 'bld_word_edge_dict_v1';
const EDGE_WORD_STATUS_KEY = 'bld_word_edge_status_v1';
const LEGACY_FORMULA_STORAGE_KEY = 'bld_formula_dict_v1';
const LEGACY_FORMULA_STATUS_KEY = 'bld_formula_status_v1';
const CORNER_FORMULA_STORAGE_KEY = 'bld_formula_corner_dict_v1';
const EDGE_FORMULA_STORAGE_KEY = 'bld_formula_edge_dict_v1';
const CORNER_FORMULA_STATUS_KEY = 'bld_formula_corner_status_v1';
const EDGE_FORMULA_STATUS_KEY = 'bld_formula_edge_status_v1';
const CORNER_BUFFER_STORAGE_KEY = 'bld_corner_buffer_index_v1';
const EDGE_BUFFER_STORAGE_KEY = 'bld_edge_buffer_index_v1';
const PARITY_FORMULA_STORAGE_KEY = 'bld_parity_formulas_v1';
const MATRIX_BUFFER_FILTER_KEY = 'bld_matrix_hide_buffer_pairs_v1';
const MATRIX_ORIENTATION_FILTER_KEYS = {
    corner: 'bld_matrix_hide_twists_v1',
    edge: 'bld_matrix_hide_flips_v1'
};
const LANG_KEY = 'bld_lang_v1';
const DEFAULT_LANGUAGE = 'en';
const CHARS_KEY = 'bld_chars_v1';
const CUSTOM_CHARS_KEY = 'bld_custom_chars_v1';
const TRAINER_RECORDS_KEY = 'bld_trainer_records_v1';
const APP_STORAGE_KEYS = [
    STORAGE_KEY,
    EDGE_WORD_STORAGE_KEY,
    EDGE_WORD_STATUS_KEY,
    STATUS_KEY,
    LEGACY_FORMULA_STORAGE_KEY,
    LEGACY_FORMULA_STATUS_KEY,
    CORNER_FORMULA_STORAGE_KEY,
    EDGE_FORMULA_STORAGE_KEY,
    CORNER_FORMULA_STATUS_KEY,
    EDGE_FORMULA_STATUS_KEY,
    CORNER_BUFFER_STORAGE_KEY,
    EDGE_BUFFER_STORAGE_KEY,
    PARITY_FORMULA_STORAGE_KEY,
    MATRIX_BUFFER_FILTER_KEY,
    ...Object.values(MATRIX_ORIENTATION_FILTER_KEYS),
    LANG_KEY,
    CHARS_KEY,
    CUSTOM_CHARS_KEY,
    LETTERING_KEY,
    LETTERING_VIEW_KEY,
    TRAINER_RECORDS_KEY
];

let currentPair = null;
let isMemAnswerShown = false;
let lastMemPair = null;
let recentMemPairs = [];
let currentLang = localStorage.getItem(LANG_KEY) || DEFAULT_LANGUAGE;
let isMatrixMode = false;
let currentListViewMode = 'list';
let currentAlgorithmType = 'corner';
let currentMemoryContentModes = ['word'];
let currentMemoryPieceType = 'corner';
let currentTrainerContentGroup = 'formula';
let currentTrainerAlgorithmType = 'corner';
let currentAlgorithmBufferIndices = { corner: 2, edge: 2 };
let currentTrainerPair = null;
let currentTrainerScramble = '';
let currentTrainerAlgorithm = '';
let trainerRecords = [];
let latestTrainerRecordId = null;
let trainerTimerState = 'idle';
let trainerHoldTimeoutId = null;
let trainerAnimationFrameId = null;
let trainerStartTimestamp = 0;
let currentTrainerStatusKey = 'trainer_status_idle';
let trainerDeleteConfirmArmed = false;
let expandedTrainerRecordId = null;
let trainerHistoryDeleteConfirmRecordId = null;
let trainerClearMenuOpen = false;
let trainerCubeSolverInitState = 'unknown';
let trainerTouchTapState = null;
let trainerTouchSuppressClickUntil = 0;
let deferredPwaInstallPrompt = null;
let pwaSetupCompleted = false;
let trainerScrambleNavigation = {
    corner: { items: [], index: -1 },
    edge: { items: [], index: -1 }
};
let trainerAlgorithmDrawState = {
    corner: {},
    edge: {}
};
let trainerPairDrawState = {
    corner: { signature: '', total: 0, drawOrder: [] },
    edge: { signature: '', total: 0, drawOrder: [] }
};
let currentTab = 'list';
const BUILT_IN_ALGORITHMS = window.BUILT_IN_ALGORITHMS || { corner: {}, edge: {} };
const MEMORY_REPEAT_GAP = 5;
const TAB_ORDER = ['list', 'memory', 'trainer', 'data'];
const TRAINER_AVERAGE_COUNTS = [5, 12, 50, 100];
const TRAINER_SCRAMBLE_HISTORY_LIMIT = 200;
const TRAINER_CUBE_SOLVER_MAX_DEPTH = 22;
const TRAINER_TOUCH_TAP_MAX_MOVE_PX = 14;
const TRAINER_TOUCH_GHOST_CLICK_SUPPRESS_MS = 700;
const TRAINER_ACTION_ICONS = Object.freeze({
    plus2: '◷',
    dnf: '⊘',
    delete: '⌫',
    cancel: '↺',
    confirm: '✓'
});

// --- [新增] 矩陣模式目前選中的配對 ---
let matrixMarkingGrade = null;
let appInitCompleted = false;
let bootTransitionCompleted = false;

function savePairData(pair, value, contentMode = 'word') {
    const d = getContentDict(contentMode);
    d[pair] = value.trim();
    saveContentDict(contentMode, d);
    if (typeof document !== 'undefined' && document.getElementById('list-save-status')) {
        document.getElementById('list-save-status').textContent = t('list_saved');
        updateListEditorSummary();
    }
}

function readStoredJson(key, fallbackValue) {
    const raw = localStorage.getItem(key);
    if (!raw) return fallbackValue;

    try {
        const parsed = JSON.parse(raw);
        return parsed ?? fallbackValue;
    } catch (error) {
        // Prevent one malformed localStorage entry from breaking app boot.
        localStorage.removeItem(key);
        return fallbackValue;
    }
}

const translations = {
    'zh-TW': {
        nav_list: "列表輸入", nav_mem: "記憶翻牌", nav_test: "打字測驗", nav_data: "設定",
        lbl_start_char: "開頭代碼：", btn_reset_color: "重置熟悉度：",
        lbl_range: "選擇範圍：", lbl_test_range: "測驗範圍：", btn_next: "下一題", btn_start_test: "開始測驗 (Space)",
        btn_submit: "提交 (Enter)", ph_input: "輸入後按 Enter",
        title_settings: "設定", title_backup: "備份", lbl_select_file: "匯入檔案：", btn_import: "確認匯入", btn_clear_all: "清空所有資料", alert_export_failed: "匯出失敗，請再試一次。",
        opt_json: "系統備份檔 (.json)", opt_csv: "Excel 表格 (.csv)", btn_export_exec: "匯出資料",
        hint_matrix_edit: "提示：點擊表頭可修改代碼",
        btn_reset_chars: "回復預設", mode_card: "列表模式", mode_matrix: "表格模式", btn_same: "同",
        alert_chars_empty: "輸入不能為空！", alert_reset: "確定重置？", alert_reset_done: "已重置",
        opt_start: " 開頭", sel_full: "全選", sel_none: "未選擇", sel_count: "已選 {n} 個", sel_prefix: "SEL: ",
        hint_click_flip: "點擊卡片翻牌", fb_empty: "空白跳過", fb_wrong: "不熟", fb_slow: "猶豫", fb_good: "熟練",
        ans_prefix: "答案：", alert_no_data: "請先輸入資料！", alert_sel_range: "請選擇範圍", alert_import_success: "匯入成功", alert_import_error: "格式錯誤",
        lbl_start: "開頭：", lbl_end: "結尾：",
        btn_hide: "隱藏", lbl_edit_mode: "編輯模式", btn_reset_all: "全部",
        settings_formula_title: "公式預設",
        settings_formula_prefix: "公式預設來源為 ",
        settings_formula_suffix: "，預設使用 Speffz lettering scheme。",
        settings_language_label: "語言",
        settings_language_hint: "可在中文與 English 之間切換介面語言。"
    },
    'en': {
        nav_list: "List Input", nav_mem: "Flashcards", nav_test: "Typing Test", nav_data: "Setting",
        lbl_start_char: "Start Code:", btn_reset_color: "Reset familiarity:",
        lbl_range: "Select Range:", lbl_test_range: "Test Range:", btn_next: "Next", btn_start_test: "Start Test (Space)",
        btn_submit: "Submit (Enter)", ph_input: "Type & Enter",
        title_settings: "Setting", title_backup: "Backup", lbl_select_file: "Import File:", btn_import: "Import", btn_clear_all: "Clear All Data", alert_export_failed: "Export failed. Please try again.",
        opt_json: "Backup File (.json)", opt_csv: "Excel Table (.csv)", btn_export_exec: "Export Data",
        hint_matrix_edit: "Click header to edit code",
        btn_reset_chars: "Reset Default", mode_card: "List Mode", mode_matrix: "Table Mode", btn_same: "Same",
        alert_chars_empty: "Cannot be empty!", alert_reset: "Are you sure?", alert_reset_done: "Reset done.",
        opt_start: " Start", sel_full: "ALL", sel_none: "NONE", sel_count: "{n} selected", sel_prefix: "SEL: ",
        hint_click_flip: "Click to flip", fb_empty: "Skipped", fb_wrong: "Hard", fb_slow: "Slow", fb_good: "Good",
        ans_prefix: "Ans: ", alert_no_data: "No data!", alert_sel_range: "Select range", alert_import_success: "Success", alert_import_error: "Error",
        lbl_start: "Start:", lbl_end: "End:",
        btn_hide: "Hide", lbl_edit_mode: "Edit Mode", btn_reset_all: "All",
        settings_formula_title: "Formula Defaults",
        settings_formula_prefix: "Default algorithms are sourced from ",
        settings_formula_suffix: " and use the Speffz lettering scheme.",
        settings_language_label: "Language",
        settings_language_hint: "Switch the interface between English and Chinese."
    }
};

Object.assign(translations['zh-TW'], {
    matrix_familiarity: "熟悉度",
    matrix_marking_hint: "先選熟悉度，再點格子",
    matrix_marking_active: "點格子標記「{grade}」",
    matrix_finish_marking: "完成",
    matrix_practice_filters: "練習略過",
    matrix_edit_lettering: "編碼編輯",
    matrix_table_label: "字母配對表格",
    matrix_hide_twist: "隱藏 Twist",
    matrix_hide_flip: "隱藏 Flip",
    matrix_hide_buffer_pairs: "隱藏 Buffer 配對",
    settings_edit_lettering: "編輯自訂編碼",
    settings_export_format: "匯出格式",
    nav_label: "主要導覽",
    nav_list: "字母配對",
    nav_mem: "翻牌",
    nav_trainer_short: "計時訓練",
    list_start_code: "開頭代碼",
    list_save_hint: "輸入後自動儲存於此裝置",
    list_saved: "已儲存於此裝置",
    list_search_placeholder: "搜尋這一組的配對或內容",
    list_filter_all: "全部",
    list_filter_empty: "未填寫",
    list_filter_filled: "已填寫",
    list_progress: "{done} / {total} 已填寫",
    list_no_results: "沒有符合的配對，試試其他關鍵字或切換為「全部」。",
    list_keyboard_hint: "單字按 Enter 跳下一格；公式按 Ctrl / ⌘ + Enter。資料僅儲存於目前裝置，請定期備份。",
    list_word_placeholder: "輸入聯想詞",
    list_previous_group: "上一組開頭代碼",
    list_next_group: "下一組開頭代碼",
    list_search_label: "搜尋目前開頭代碼的配對與內容",
    list_filter_label: "依填寫狀態篩選",
    workspace_list_title: "字母配對",
    workspace_memory_title: "記憶翻牌",
    workspace_trainer_title: "3-Style 計時訓練",
    workspace_data_title: "設定",
    nav_trainer: "3-Style 訓練",
    mode_formula: "\u516c\u5f0f\u6a21\u5f0f",
    mode_formula_matrix: "\u516c\u5f0f\u8868\u683c",
    group_words: "\u5b57\u8a5e",
    group_formula: "\u516c\u5f0f",
    switch_layout: "\u7248\u578b",
    switch_content: "\u5167\u5bb9",
    switch_list: "\u5217\u8868",
    switch_matrix: "\u8868\u683c",
    switch_words: "\u5b57\u8a5e",
    switch_algorithm: "\u516c\u5f0f",
    algorithm_type: "部位",
    algorithm_corners: "角塊",
    algorithm_edges: "邊塊",
    content_word_label: "\u5b57\u8a5e",
    content_formula_label: "\u516c\u5f0f",
    content_corner_label: "角塊",
    content_edge_label: "邊塊",
    study_word_mode: "\u5b57\u8a5e\u6a21\u5f0f",
    study_formula_mode: "\u516c\u5f0f\u6a21\u5f0f",
    study_corner_mode: "角塊模式",
    study_edge_mode: "邊塊模式",
    ph_formula: "\u8f38\u5165\u516c\u5f0f",
    ph_algorithm: "\u8f38\u5165\u516c\u5f0f",
    hint_formula_edit: "\u53ef\u5728\u9019\u88e1\u70ba\u6bcf\u7d44\u5b57\u6bcd\u5c0d\u8f38\u5165\u89d2\u584a\u6216\u908a\u584a\u516c\u5f0f\uff0c\u7a7a\u767d\u6642\u6703\u986f\u793a\u5167\u5efa BLDDB \u9810\u8a2d\u4ea4\u63db\u5b50\uff0c\u7ffb\u724c\u6a21\u5f0f\u4e5f\u53ef\u4ee5\u5206\u958b\u7df4\u7fd2",
    blddb_pair_lookup: "\u5728 BLDDB \u67e5\u8a62 {pair}\uff08\u65b0\u5206\u9801\uff09",
    parity_title: "Parity",
    parity_corner_target: "\u89d2\u584a target",
    parity_edge_target: "\u908a\u584a target",
    parity_buffers: "\u89d2\u584a buffer {corner}\uff0c\u908a\u584a buffer {edge}",
    parity_custom: "\u81ea\u8a02\u516c\u5f0f",
    parity_reference: "BLDDB Nightmare \u53c3\u8003\u516c\u5f0f\uff1a{algorithm}",
    parity_no_reference: "\u9019\u500b\u6848\u4f8b\u6c92\u6709\u96e2\u7dda\u53c3\u8003\u516c\u5f0f\uff0c\u53ef\u958b\u555f BLDDB \u67e5\u8a62\u3002",
    parity_lookup: "\u5728 BLDDB \u67e5\u8a62\uff08\u65b0\u5206\u9801\uff09",
    confirm_restore_backup: "\u9084\u539f\u5099\u4efd\u6703\u53d6\u4ee3\u76ee\u524d\u7684\u5b57\u8a5e\u3001\u516c\u5f0f\u3001\u8907\u7fd2\u9032\u5ea6\u548c\u8a08\u6642\u7d00\u9304\u3002\u820a\u7248\u5099\u4efd\u672a\u5305\u542b\u7684\u8cc7\u6599\u985e\u5225\u6703\u6e05\u7a7a\u3002\u78ba\u5b9a\u9084\u539f\uff1f",
    alert_no_formula_data: "\u76ee\u524d\u9078\u53d6\u7bc4\u570d\u6c92\u6709\u516c\u5f0f\u8cc7\u6599\uff01",
    alert_no_algorithm_data: "\u76ee\u524d\u9078\u53d6\u7bc4\u570d\u6c92\u6709\u89d2\u584a\u6216\u908a\u584a\u516c\u5f0f\u8cc7\u6599\uff01",
    confirm_switch_chars_en: "\u8981\u4e00\u8d77\u5207\u63db\u6210\u82f1\u6587 a-x \u4ee3\u78bc\u55ce\uff1f",
    confirm_switch_chars_zh: "\u8981\u5207\u56de\u6ce8\u97f3\u4ee3\u78bc\u55ce\uff1f",
    trainer_scramble_label: "\u6253\u4e82",
    trainer_scramble_placeholder: "\u6309\u4e0b\u300c\u7522\u751f\u4e0b\u4e00\u7d44\u6253\u4e82\u300d\u958b\u59cb\u3002",
    trainer_scramble_hint: "\u6253\u4e82\u5b8c\u6210\u5f8c\u6309\u4e00\u4e0b\u7a7a\u767d\u9375\u958b\u59cb\u8a08\u6642\uff0c\u4efb\u610f\u9375\u505c\u6b62\u3002",
    trainer_status_idle: "點按秒數或按空白鍵開始",
    trainer_status_holding: "\u7e7c\u7e8c\u6309\u4f4f\u2026",
    trainer_status_ready: "\u653e\u958b\u958b\u59cb",
    trainer_status_running: "\u8a08\u6642\u4e2d",
    trainer_status_stopped: "\u5df2\u8a18\u9304\u9019\u6b21\u6210\u7e3e\uff0c\u53ef\u4ee5\u9078\u64c7 +2\u3001DNF \u6216\u522a\u9664\u3002",
    trainer_status_delete_confirm: "\u518d\u6309\u4e00\u6b21\u300c\u78ba\u8a8d\u300d\u624d\u6703\u522a\u9664\u6700\u8fd1\u4e00\u6b21\u6210\u7e3e\u3002",
    trainer_status_no_scramble: "\u76ee\u524d\u7bc4\u570d\u6c92\u6709\u53ef\u7528\u7684\u6253\u4e82\u3002",
    btn_generate_scramble: "\u7522\u751f\u4e0b\u4e00\u7d44\u6253\u4e82",
    btn_prev_scramble: "\u4e0a\u4e00\u7d44\u6253\u4e82",
    btn_penalty_plus2: "+2",
    btn_penalty_dnf: "DNF",
    btn_delete_solve: "\u522a\u9664",
    btn_delete_cancel: "\u53d6\u6d88",
    btn_delete_confirm: "\u78ba\u8a8d",
    trainer_last_result_label: "\u6700\u8fd1\u4e00\u6b21",
    trainer_averages_label: "\u5e73\u5747",
    trainer_history_label: "\u7d00\u9304",
    trainer_solution_label: "\u89e3\u6cd5",
    trainer_history_empty: "\u9084\u6c92\u6709\u8a08\u6642\u7d00\u9304",
    btn_clear_records: "\u6e05\u9664\u7d00\u9304",
    btn_clear_corners_records: "\u522a\u9664\u89d2\u584a",
    btn_clear_edges_records: "\u522a\u9664\u908a\u584a",
    confirm_clear_trainer_records: "\u78ba\u5b9a\u8981\u522a\u9664\u6240\u6709 {type} \u7d00\u9304\uff08\u5171 {count} \u7b46\uff09\u55ce\uff1f\u6b64\u52d5\u4f5c\u7121\u6cd5\u5fa9\u539f\u3002",
    alert_no_trainer_records_type: "\u76ee\u524d\u6c92\u6709 {type} \u7d00\u9304\u53ef\u522a\u9664\u3002",
    alert_invalid_algorithm_format: "\u9019\u7d44\u516c\u5f0f\u683c\u5f0f\u76ee\u524d\u7121\u6cd5\u7528\u4f86\u751f\u6210\u6253\u4e82\u3002",
    btn_toggle_lang: "English / \u4e2d\u6587",
    settings_chars_label: "\u7de8\u78bc\u7cfb\u7d71",
    settings_chars_hint: "\u53ef\u7368\u7acb\u9078\u64c7\u6ce8\u97f3\uff08\u3105~\u3129\uff09\u3001\u82f1\u6587\uff08a~x\uff09\u6216\u81ea\u8a02\uff1b\u5207\u63db\u5230\u82f1\u6587\u4e0d\u6703\u8986\u84cb\u4f60\u7684\u81ea\u8a02\u3002",
    settings_buffer_label: "Buffer \u8a2d\u5b9a",
    settings_buffer_hint: "\u4f7f\u7528 URF / UF \u7b49 sticker \u4f4d\u7f6e\u5206\u5225\u9078\u64c7\u89d2\u584a\u8207\u908a\u584a buffer\uff1b\u5167\u5efa placeholder \u6703\u7acb\u5373\u6539\u7528\u5c0d\u61c9\u7684 BLDDB \u516c\u5f0f\u3002",
    settings_corner_buffer: "\u89d2\u584a Buffer",
    settings_edge_buffer: "\u908a\u584a Buffer",
    settings_buffer_option: "{sticker}",
    settings_formula_suffix: "，並依所選的 Buffer 顯示對應公式。",
    btn_chars_zh: "\u6ce8\u97f3 \u3105~\u3129",
    btn_chars_en: "English a~x",
    btn_chars_custom: "\u81ea\u8a02",
    page_title: "3BLD 3-Style Letter Pairs \u7df4\u7fd2",
    settings_install_label: "\u5b89\u88dd App",
    settings_install_hint: "\u5c07\u9019\u500b\u7df4\u7fd2\u5de5\u5177\u5b89\u88dd\u5230\u4e3b\u756b\u9762\uff0c\u4e4b\u5f8c\u53ef\u4ee5\u50cf App \u4e00\u6a23\u7368\u7acb\u958b\u555f\u3002",
    settings_install_button: "\u5b89\u88dd App",
    settings_install_ios_hint: "iPhone / iPad \u8acb\u9ede\u700f\u89bd\u5668\u7684\u5206\u4eab\u6309\u9215\uff0c\u518d\u9078\u300c\u52a0\u5165\u4e3b\u756b\u9762\u300d\u3002",
    settings_install_ios_button: "\u67e5\u770b\u5b89\u88dd\u65b9\u5f0f",
    settings_install_ios_instructions: "\u8acb\u9ede\u700f\u89bd\u5668\u7684\u5206\u4eab\u6309\u9215\uff0c\u5f80\u4e0b\u627e\u5230\u4e26\u9078\u64c7\u300c\u52a0\u5165\u4e3b\u756b\u9762\u300d\u3002",
    sel_prefix: "\u5df2\u9078\uff1a"
});

Object.assign(translations.en, {
    matrix_familiarity: "Familiarity",
    matrix_marking_hint: "Choose a grade, then tap cells",
    matrix_marking_active: "Tap cells to mark {grade}",
    matrix_finish_marking: "Done",
    matrix_practice_filters: "Skip in practice",
    matrix_edit_lettering: "Edit lettering",
    matrix_table_label: "Letter pair table",
    matrix_hide_twist: "Hide Twist",
    matrix_hide_flip: "Hide Flip",
    matrix_hide_buffer_pairs: "Hide buffer pairs",
    settings_edit_lettering: "Edit custom lettering",
    settings_export_format: "Export format",
    nav_label: "Main navigation",
    nav_list: "Letter pairs",
    nav_trainer_short: "Trainer",
    nav_data: "Settings",
    list_start_code: "Start code",
    list_save_hint: "Auto-saved on this device",
    list_saved: "Saved on this device",
    list_search_placeholder: "Search pairs or content in this group",
    list_filter_all: "All entries",
    list_filter_empty: "Unfilled",
    list_filter_filled: "Filled",
    list_progress: "{done} / {total} filled",
    list_no_results: "No matching pairs. Try another search or select All entries.",
    list_keyboard_hint: "Words: Enter for the next field. Algorithms: Ctrl / ⌘ + Enter. Data stays on this device; back up regularly.",
    list_word_placeholder: "Add a memory word",
    list_previous_group: "Previous start code",
    list_next_group: "Next start code",
    list_search_label: "Search pairs and content in the current start-code group",
    list_filter_label: "Filter by completion",
    workspace_list_title: "Letter pairs",
    workspace_memory_title: "Flashcards",
    workspace_trainer_title: "3-Style trainer",
    workspace_data_title: "Settings",
    nav_trainer: "3-Style Trainer",
    mode_formula: "Formula Mode",
    mode_formula_matrix: "Formula Table",
    group_words: "Words",
    group_formula: "Formula",
    switch_layout: "Layout",
    switch_content: "Content",
    switch_list: "List",
    switch_matrix: "Table",
    switch_words: "Words",
    switch_algorithm: "Algorithm",
    algorithm_type: "Piece Type",
    algorithm_corners: "Corners",
    algorithm_edges: "Edges",
    content_word_label: "Word",
    content_formula_label: "Formula",
    content_corner_label: "Corners",
    content_edge_label: "Edges",
    study_word_mode: "Word Mode",
    study_formula_mode: "Formula Mode",
    study_corner_mode: "Corners",
    study_edge_mode: "Edges",
    ph_formula: "Enter formula",
    ph_algorithm: "Enter algorithm",
    hint_formula_edit: "Edit corner or edge algorithms for the selected start code. Empty fields show built-in BLDDB commutators, and Flashcards can study them separately too.",
    blddb_pair_lookup: "Look up {pair} on BLDDB (new tab)",
    parity_title: "Parity",
    parity_corner_target: "Corner target",
    parity_edge_target: "Edge target",
    parity_buffers: "Corner buffer {corner} · Edge buffer {edge}",
    parity_custom: "Your algorithm",
    parity_reference: "BLDDB Nightmare reference: {algorithm}",
    parity_no_reference: "No offline reference for this case. Open BLDDB to look it up.",
    parity_lookup: "Look up on BLDDB (new tab)",
    confirm_restore_backup: "Restore this backup and replace your words, algorithms, review progress, and timer history? Data categories missing from older backups will be cleared.",
    alert_no_formula_data: "No formula data in this range!",
    alert_no_algorithm_data: "No corner or edge algorithm data in this range!",
    confirm_switch_chars_en: "Also switch to English a-x codes?",
    confirm_switch_chars_zh: "Switch back to Zhuyin codes as well?",
    trainer_scramble_label: "Scramble",
    trainer_scramble_placeholder: "Press Next Scramble to begin.",
    trainer_scramble_hint: "Scramble first, press Space to start, and press any key to stop.",
    trainer_status_idle: "Tap the timer or press Space to start",
    trainer_status_holding: "Keep holding...",
    trainer_status_ready: "Release to start",
    trainer_status_running: "Timer running",
    trainer_status_stopped: "Solve saved. You can choose +2, DNF, or delete it.",
    trainer_status_delete_confirm: "Press Confirm again to delete the latest solve.",
    trainer_status_no_scramble: "No available scramble in this range.",
    btn_generate_scramble: "Next Scramble",
    btn_prev_scramble: "Previous Scramble",
    btn_penalty_plus2: "+2",
    btn_penalty_dnf: "DNF",
    btn_delete_solve: "Delete",
    btn_delete_cancel: "Cancel",
    btn_delete_confirm: "Confirm",
    trainer_last_result_label: "Last Solve",
    trainer_averages_label: "Averages",
    trainer_history_label: "History",
    trainer_solution_label: "Solution",
    trainer_history_empty: "No solves yet.",
    btn_clear_records: "Clear Records",
    btn_clear_corners_records: "Delete Corners",
    btn_clear_edges_records: "Delete Edges",
    confirm_clear_trainer_records: "Delete all {type} records ({count})? This action cannot be undone.",
    alert_no_trainer_records_type: "No {type} records to delete.",
    alert_invalid_algorithm_format: "This algorithm format cannot be converted into a scramble yet.",
    btn_toggle_lang: "\u4e2d\u6587 / English",
    settings_chars_label: "Lettering System",
    settings_chars_hint: "Choose Zhuyin (\u3105~\u3129), English (a~x), or Custom. Switching to English won't erase your custom scheme.",
    settings_buffer_label: "Buffer Settings",
    settings_buffer_hint: "Choose corner and edge buffers by sticker position (such as URF or UF). Built-in placeholders update immediately to the matching BLDDB algorithms.",
    settings_corner_buffer: "Corner Buffer",
    settings_edge_buffer: "Edge Buffer",
    settings_buffer_option: "{sticker}",
    settings_formula_suffix: " and follow the selected buffers.",
    btn_chars_zh: "Zhuyin \u3105~\u3129",
    btn_chars_en: "English a~x",
    btn_chars_custom: "Custom",
    settings_install_label: "Install App",
    settings_install_hint: "Install this trainer on your device and launch it later in its own app window.",
    settings_install_button: "Install App",
    settings_install_ios_hint: "On iPhone or iPad, open the browser Share menu and choose Add to Home Screen.",
    settings_install_ios_button: "Installation Help",
    settings_install_ios_instructions: "Open the browser Share menu, scroll down, and choose Add to Home Screen.",
    page_title: "3BLD(3 style & letter pairs) practice"
});

const SM2_SETTINGS = { defaultEf: 2.5, minEf: 1.3, intervals: [1, 3] };
const REVIEW_DELAY_SETTINGS = {
    hardMinutes: 10,
    slowHours: 6
};

function isAlgorithmContentMode(contentMode = 'word') {
    return contentMode === 'corner' || contentMode === 'edge';
}

function getContentStorageKey(contentMode = 'word') {
    if (contentMode === 'corner') return CORNER_FORMULA_STORAGE_KEY;
    if (contentMode === 'edge') return EDGE_FORMULA_STORAGE_KEY;
    if (contentMode === 'edge-word') return EDGE_WORD_STORAGE_KEY;
    return STORAGE_KEY;
}

function getStatusStorageKey(contentMode = 'word') {
    if (contentMode === 'corner') return CORNER_FORMULA_STATUS_KEY;
    if (contentMode === 'edge') return EDGE_FORMULA_STATUS_KEY;
    if (contentMode === 'edge-word') return EDGE_WORD_STATUS_KEY;
    return STATUS_KEY;
}

function calculateNextReview(currentData, grade) {
    let card = (typeof currentData === 'object' && currentData !== null) ? currentData : {
        interval: 0, repetition: 0, ef: SM2_SETTINGS.defaultEf, dueDate: 0, color: 'red'
    };
    let nextInterval, nextRepetition, nextEf;
    if (grade < 3) {
        nextRepetition = 0; nextInterval = 1; nextEf = Math.max(SM2_SETTINGS.minEf, card.ef - 0.2);
    } else {
        nextRepetition = card.repetition + 1;
        nextEf = card.ef + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
        if (nextEf < SM2_SETTINGS.minEf) nextEf = SM2_SETTINGS.minEf;
        if (nextRepetition === 1) nextInterval = SM2_SETTINGS.intervals[0];
        else if (nextRepetition === 2) nextInterval = SM2_SETTINGS.intervals[1];
        else nextInterval = Math.round(card.interval * nextEf);
    }
    let nextColor = grade >= 4 ? 'green' : (grade === 3 ? 'yellow' : 'red');
    let nextDueDate;

    if (grade < 3) {
        nextDueDate = Date.now() + (REVIEW_DELAY_SETTINGS.hardMinutes * 60 * 1000);
    } else if (grade === 3) {
        nextDueDate = Date.now() + (REVIEW_DELAY_SETTINGS.slowHours * 60 * 60 * 1000);
    } else {
        nextDueDate = Date.now() + (nextInterval * 24 * 60 * 60 * 1000);
    }

    return { interval: nextInterval, repetition: nextRepetition, ef: nextEf, dueDate: nextDueDate, color: nextColor };
}

function getStatusMap(contentMode = 'word') {
    return readStoredJson(getStatusStorageKey(contentMode), {});
}
function shouldDefaultHidePair(pair, contentMode, dict) {
    if (!isAlgorithmContentMode(contentMode)) return false;

    const storedValue = ((dict ?? getContentDict(contentMode))[pair] || '').trim();
    if (storedValue) return false;

    return !getBuiltInAlgorithm(pair, contentMode);
}
function getPairData(pair, contentMode = 'word', { statusMap, dict } = {}) {
    const map = statusMap ?? getStatusMap(contentMode);
    let data = map[pair];
    if (typeof data === 'string') {
        return { interval: (data === 'green' ? 10 : 3), repetition: 1, ef: 2.5, dueDate: Date.now(), color: data };
    }
    if (data) return data;
    if (shouldDefaultHidePair(pair, contentMode, dict)) {
        return { interval: -1, repetition: 0, ef: 2.5, dueDate: 0, color: 'gray' };
    }
    return null;
}
function saveStatusData(pair, dataObject, contentMode = 'word') {
    const map = getStatusMap(contentMode);
    map[pair] = dataObject;
    localStorage.setItem(getStatusStorageKey(contentMode), JSON.stringify(map));
}
function getPairColor(pair, contentMode = 'word', snapshot = {}) {
    if (isBufferPairHidden(pair, contentMode, snapshot.bufferLabels) ||
        isOrientationPairHidden(pair, contentMode, snapshot.hideOrientation)) return 'gray';
    const data = getPairData(pair, contentMode, snapshot);
    return data ? (data.color || 'red') : '';
}

function t(key, params = {}) { let str = translations[currentLang][key] || key; Object.keys(params).forEach(k => { str = str.replace(`{${k}}`, params[k]); }); return str; }
function getDict() { return readStoredJson(STORAGE_KEY, {}); }
function getFormulaDict(formulaType = 'corner') { return readStoredJson(getContentStorageKey(formulaType), {}); }
function saveFormulaDict(formulaType = 'corner', dict) { localStorage.setItem(getContentStorageKey(formulaType), JSON.stringify(dict)); }
function getContentDict(contentMode = 'word') { return isAlgorithmContentMode(contentMode) ? getFormulaDict(contentMode) : readStoredJson(getContentStorageKey(contentMode), {}); }
function saveContentDict(contentMode = 'word', dict) { return isAlgorithmContentMode(contentMode) ? saveFormulaDict(contentMode, dict) : localStorage.setItem(getContentStorageKey(contentMode), JSON.stringify(dict)); }

function isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function escapeCsvCell(value = '') {
    const stringValue = String(value ?? '');
    if (!/[",\n\r]/.test(stringValue)) return stringValue;
    return `"${stringValue.replace(/"/g, '""')}"`;
}

function sanitizeStringMap(value) {
    if (!isPlainObject(value)) return {};
    const next = {};
    Object.entries(value).forEach(([key, mapValue]) => {
        if (typeof key !== 'string' || typeof mapValue !== 'string') return;
        next[key] = mapValue;
    });
    return next;
}

function sanitizeStatusMap(value) {
    if (!isPlainObject(value)) return {};

    const next = {};
    const allowedColors = new Set(['green', 'yellow', 'red', 'gray']);

    Object.entries(value).forEach(([key, statusValue]) => {
        if (typeof key !== 'string') return;

        if (typeof statusValue === 'string') {
            if (allowedColors.has(statusValue)) next[key] = statusValue;
            return;
        }

        if (!isPlainObject(statusValue)) return;

        const color = allowedColors.has(statusValue.color) ? statusValue.color : 'red';
        next[key] = {
            interval: Number.isFinite(Number(statusValue.interval)) ? Number(statusValue.interval) : 0,
            repetition: Number.isFinite(Number(statusValue.repetition)) ? Number(statusValue.repetition) : 0,
            ef: Number.isFinite(Number(statusValue.ef)) ? Number(statusValue.ef) : SM2_SETTINGS.defaultEf,
            dueDate: Number.isFinite(Number(statusValue.dueDate)) ? Number(statusValue.dueDate) : 0,
            color
        };
    });

    return next;
}

function sanitizeChars(value) {
    if (!Array.isArray(value)) return null;

    const next = value
        .map((char) => typeof char === 'string' ? char.trim() : '')
        .filter(Boolean);

    if (next.length < 2) return null;
    if (new Set(next).size !== next.length) return null;

    return next;
}

function sanitizeTrainerRecords(value) {
    if (!Array.isArray(value)) return [];

    const allowedPenalties = new Set(['ok', 'plus2', 'dnf']);

    return value.map((record, index) => {
        if (!isPlainObject(record)) return null;

        const rawTimeMs = Number(record.rawTimeMs);
        if (!Number.isFinite(rawTimeMs) || rawTimeMs < 0) return null;

        return {
            id: typeof record.id === 'string' && record.id ? record.id : `trainer-legacy-${index}`,
            rawTimeMs,
            penalty: allowedPenalties.has(record.penalty) ? record.penalty : 'ok',
            scramble: typeof record.scramble === 'string' ? record.scramble : '',
            pair: typeof record.pair === 'string' ? record.pair : '',
            algorithm: typeof record.algorithm === 'string' ? record.algorithm : '',
            algorithmType: record.algorithmType === 'edge' ? 'edge' : 'corner',
            createdAt: Number.isFinite(Number(record.createdAt)) ? Number(record.createdAt) : Date.now()
        };
    }).filter(Boolean);
}

function sanitizeAlgorithmBufferSettings(value) {
    if (!isPlainObject(value)) return null;

    const result = {};
    for (const type of ['corner', 'edge']) {
        if (value[type] == null) continue;
        const index = Number(value[type]);
        if (!Number.isInteger(index) || index < 0 || index >= 24) return null;
        result[type] = index;
    }
    return Object.keys(result).length > 0 ? result : null;
}

function normalizeBackupPayload(value) {
    if (!isPlainObject(value)) throw new Error('Invalid backup payload');

    const sections = isPlainObject(value.sections) ? value.sections : null;
    const letterPairsSection = sections && isPlainObject(sections.letterPairs) ? sections.letterPairs : {};
    const statusSection = sections && isPlainObject(sections.status) ? sections.status : {};
    const trainerSection = sections && isPlainObject(sections.trainer) ? sections.trainer : {};
    const settingsSection = sections && isPlainObject(sections.settings) ? sections.settings : {};

    const rawDict = letterPairsSection.word ?? value.dict;
    const rawCornerFormulaDict = letterPairsSection.corner ?? value.cornerFormulaDict ?? value.formulaDict;
    const rawEdgeFormulaDict = letterPairsSection.edge ?? value.edgeFormulaDict;
    const rawParityFormulaDict = letterPairsSection.parity;
    const rawStatus = statusSection.word ?? value.status;
    const rawCornerFormulaStatus = statusSection.corner ?? value.cornerFormulaStatus ?? value.formulaStatus;
    const rawEdgeFormulaStatus = statusSection.edge ?? value.edgeFormulaStatus;
    const rawTrainerRecords = trainerSection.records ?? value.trainerRecords;
    const rawChars = settingsSection.chars ?? value.chars;
    const rawLang = settingsSection.lang ?? value.lang;
    const rawAlgorithmBuffers = settingsSection.algorithmBuffers ?? value.algorithmBuffers;

    const dataMaps = [
        letterPairsSection.edgeWord ?? value.edgeWordDict,
        statusSection.edgeWord ?? value.edgeWordStatus,
        rawDict,
        rawCornerFormulaDict,
        rawEdgeFormulaDict,
        rawStatus,
        rawCornerFormulaStatus,
        rawEdgeFormulaStatus
    ];
    const isValidBackup = value.version === 3
        ? dataMaps.every(isPlainObject) && Array.isArray(rawTrainerRecords)
        : (dataMaps.some(isPlainObject) || Array.isArray(rawTrainerRecords)) &&
            dataMaps.every(map => map == null || isPlainObject(map)) &&
            (rawTrainerRecords == null || Array.isArray(rawTrainerRecords));
    if (!isValidBackup) throw new Error('Invalid or incomplete backup');
    if (rawParityFormulaDict != null && !isPlainObject(rawParityFormulaDict)) throw new Error('Invalid parity formulas');

    if (settingsSection.lettering != null && !sanitizeLetteringState(settingsSection.lettering)) throw new Error('Invalid lettering');
    const normalizedChars = rawChars == null ? null : validateLetteringScheme(rawChars);
    if (rawChars != null && !normalizedChars) throw new Error('Invalid chars');

    const normalizedLang = rawLang === 'zh-TW' || rawLang === 'en' ? rawLang : null;
    const normalizedAlgorithmBuffers = rawAlgorithmBuffers == null ? null : sanitizeAlgorithmBufferSettings(rawAlgorithmBuffers);
    if (rawAlgorithmBuffers != null && !normalizedAlgorithmBuffers) throw new Error('Invalid algorithm buffers');

    return {
        dict: sanitizeStringMap(rawDict),
        edgeWordDict: sanitizeStringMap(letterPairsSection.edgeWord ?? value.edgeWordDict),
        edgeWordStatus: sanitizeStatusMap(statusSection.edgeWord ?? value.edgeWordStatus),
        cornerFormulaDict: sanitizeStringMap(rawCornerFormulaDict),
        edgeFormulaDict: sanitizeStringMap(rawEdgeFormulaDict),
        parityFormulaDict: rawParityFormulaDict == null ? null : sanitizeStringMap(rawParityFormulaDict),
        status: sanitizeStatusMap(rawStatus),
        cornerFormulaStatus: sanitizeStatusMap(rawCornerFormulaStatus),
        edgeFormulaStatus: sanitizeStatusMap(rawEdgeFormulaStatus),
        trainerRecords: sanitizeTrainerRecords(rawTrainerRecords),
        lettering: settingsSection.lettering == null ? null : sanitizeLetteringState(settingsSection.lettering),
        chars: normalizedChars,
        lang: normalizedLang,
        algorithmBuffers: normalizedAlgorithmBuffers
    };
}

function clearAppStorageData() {
    APP_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

function getTrainerRecords() {
    return sanitizeTrainerRecords(readStoredJson(TRAINER_RECORDS_KEY, []));
}

function normalizeTrainerAlgorithmType(type = 'corner') {
    return type === 'edge' ? 'edge' : 'corner';
}

function getTrainerSessionRecords(type = currentTrainerAlgorithmType) {
    const sessionType = normalizeTrainerAlgorithmType(type);
    return trainerRecords.filter((record) => normalizeTrainerAlgorithmType(record.algorithmType) === sessionType);
}

function getLatestTrainerSessionRecord(type = currentTrainerAlgorithmType) {
    return getTrainerSessionRecords(type)[0] || null;
}

function syncLatestTrainerRecordId() {
    latestTrainerRecordId = getLatestTrainerSessionRecord()?.id || null;
    return latestTrainerRecordId;
}

function resetTrainerScrambleNavigation() {
    trainerScrambleNavigation = {
        corner: { items: [], index: -1 },
        edge: { items: [], index: -1 }
    };
    trainerAlgorithmDrawState = {
        corner: {},
        edge: {}
    };
    trainerPairDrawState = {
        corner: { signature: '', total: 0, drawOrder: [] },
        edge: { signature: '', total: 0, drawOrder: [] }
    };
    updateTrainerScrambleNavButtons();
}

function refreshTrainerRecords(records) {
    trainerRecords = records;
    syncLatestTrainerRecordId();
    trainerDeleteConfirmArmed = false;
    if (expandedTrainerRecordId && !trainerRecords.some((record) => record.id === expandedTrainerRecordId)) {
        expandedTrainerRecordId = null;
    }
    if (trainerHistoryDeleteConfirmRecordId && !trainerRecords.some((record) => record.id === trainerHistoryDeleteConfirmRecordId)) {
        trainerHistoryDeleteConfirmRecordId = null;
    }
    renderTrainerRecords();
}

function withTrainerRecordsLock(action) {
    const locks = typeof navigator === 'undefined' ? null : navigator.locks;
    return locks ? locks.request(TRAINER_RECORDS_KEY, action) : action();
}

function updateTrainerRecords(update) {
    return withTrainerRecordsLock(() => {
        const records = update(getTrainerRecords());
        localStorage.setItem(TRAINER_RECORDS_KEY, JSON.stringify(records));
        refreshTrainerRecords(records);
    });
}

function migrateLegacyFormulaData() {
    const hasCornerFormula = !!localStorage.getItem(CORNER_FORMULA_STORAGE_KEY);
    const hasCornerStatus = !!localStorage.getItem(CORNER_FORMULA_STATUS_KEY);
    const legacyFormula = readStoredJson(LEGACY_FORMULA_STORAGE_KEY, {});
    const legacyStatus = readStoredJson(LEGACY_FORMULA_STATUS_KEY, {});

    if (!hasCornerFormula && Object.keys(legacyFormula).length > 0) {
        localStorage.setItem(CORNER_FORMULA_STORAGE_KEY, JSON.stringify(legacyFormula));
    }
    if (!hasCornerStatus && Object.keys(legacyStatus).length > 0) {
        localStorage.setItem(CORNER_FORMULA_STATUS_KEY, JSON.stringify(legacyStatus));
    }
}

function completeBootTransition() {
    if (bootTransitionCompleted) return;
    bootTransitionCompleted = true;

    const body = document.body;
    const overlay = document.getElementById('boot-overlay');

    if (body) body.classList.remove('app-booting');
    if (!overlay) return;

    overlay.classList.add('is-exiting');
    window.setTimeout(() => {
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 380);
}

function init() {
    if (appInitCompleted) return;

    const savedChars = sanitizeChars(readStoredJson(CHARS_KEY, null));
    if (savedChars) chars = savedChars;
    if (getCurrentCharScheme() === 'custom') saveCustomChars(chars);
    ensureLetteringState();
    chars = [...getPieceChars()];
    trainerRecords = getTrainerRecords();
    loadAlgorithmBufferSettings();
    setupPwa();
    syncLatestTrainerRecordId();
    resetTrainerScrambleNavigation();
    migrateLegacyFormulaData();
    currentTab = document.querySelector('.view-section.active')?.id?.replace('view-', '') || 'list';
    initUI(); setupDynamicUI(); enhanceMemoryCardLayout(); applyLanguage(); updateLayoutMode();
    setupEventListeners();
    updateMemoryContentModeButtons();
    updateTrainerAlgorithmButtons();
    renderTrainerRecords();
    generateTrainerScramble({ silent: true });
    appInitCompleted = true;
    completeBootTransition();
}

function bootApp() {
    if (appInitCompleted) return;

    try {
        init();
    } catch (error) {
        console.error('App initialization failed:', error);
        // Keep the app recoverable instead of showing an uninitialized static shell forever.
        appInitCompleted = false;

        try {
            chars = [...CHARS_ZH];
            currentLang = localStorage.getItem(LANG_KEY) || DEFAULT_LANGUAGE;
            init();
        } catch (retryError) {
            console.error('App initialization retry failed:', retryError);
            completeBootTransition();
        }
    }
}

function isPwaStandalone() {
    return window.matchMedia?.('(display-mode: standalone)').matches === true
        || window.navigator.standalone === true;
}

function isIosDevice() {
    const userAgent = window.navigator.userAgent || '';
    return /iPad|iPhone|iPod/.test(userAgent)
        || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
}

function updatePwaInstallUi() {
    const group = document.getElementById('pwa-install-group');
    const button = document.getElementById('pwa-install-btn');
    const hint = document.getElementById('pwa-install-hint');
    if (!group || !button || !hint) return;

    if (isPwaStandalone()) {
        group.classList.add('hidden');
        return;
    }

    const showIosInstructions = isIosDevice();
    const canPromptInstall = !!deferredPwaInstallPrompt;
    group.classList.toggle('hidden', !showIosInstructions && !canPromptInstall);

    const hintKey = showIosInstructions ? 'settings_install_ios_hint' : 'settings_install_hint';
    const buttonKey = showIosInstructions ? 'settings_install_ios_button' : 'settings_install_button';
    hint.setAttribute('data-i18n', hintKey);
    button.setAttribute('data-i18n', buttonKey);
    hint.innerText = t(hintKey);
    button.innerText = t(buttonKey);
}

async function requestPwaInstall() {
    if (deferredPwaInstallPrompt) {
        const installPrompt = deferredPwaInstallPrompt;
        deferredPwaInstallPrompt = null;
        await installPrompt.prompt();

        try {
            await installPrompt.userChoice;
        } finally {
            updatePwaInstallUi();
        }
        return;
    }

    if (isIosDevice()) {
        alert(t('settings_install_ios_instructions'));
    }
}

function setupPwa() {
    if (pwaSetupCompleted || typeof window === 'undefined') return;
    pwaSetupCompleted = true;

    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredPwaInstallPrompt = event;
        updatePwaInstallUi();
    });

    window.addEventListener('appinstalled', () => {
        deferredPwaInstallPrompt = null;
        updatePwaInstallUi();
    });

    if ('serviceWorker' in navigator && window.isSecureContext) {
        navigator.serviceWorker.register('./service-worker.js').catch((error) => {
            console.warn('Service worker registration failed:', error);
        });
    }

    updatePwaInstallUi();
}

function setupEventListeners() {
    window.addEventListener('storage', (event) => {
        if (event.key === TRAINER_RECORDS_KEY || event.key === null) {
            refreshTrainerRecords(getTrainerRecords());
        }
    });
    document.addEventListener('click', function (e) {
        const targetEl = e.target instanceof Element ? e.target : null;

        if (!targetEl || !targetEl.closest('.dropdown-wrapper')) {
            closeAllDropdowns();
        }

        if (!targetEl || !targetEl.closest('#trainer-history-clear-group')) {
            setTrainerClearMenuOpen(false);
        }

        const activeTab = document.querySelector('.view-section.active')?.id;
        if (activeTab !== 'view-trainer') return;
        if (!expandedTrainerRecordId) return;
        if (targetEl && targetEl.closest('#trainer-history-clear-group')) return;
        if (targetEl && targetEl.closest('#trainer-history .trainer-history-item')) return;

        expandedTrainerRecordId = null;
        trainerHistoryDeleteConfirmRecordId = null;
        renderTrainerRecords();
    });

    document.addEventListener('keydown', function (e) {
        const activeTab = document.querySelector('.view-section.active')?.id;
        if (e.defaultPrevented || e.isComposing) return;
        if (activeTab === 'view-list' && isMatrixListView() && matrixMarkingGrade && e.key === 'Escape') {
            e.preventDefault();
            setMatrixMarkingGrade(null);
            return;
        }
        if (activeTab !== 'view-trainer' && activeTab !== 'view-memory') return;
        if (e.target.closest?.('button:focus-visible, a:focus-visible')) return;
        if (activeTab === 'view-trainer' && handleTrainerKeyDown(e)) return;
        if (e.code === 'Space' || e.key === 'Enter') {
            if (isEditableElement(document.activeElement)) return;
            e.preventDefault(); triggerAction(activeTab);
        }
    });

    document.addEventListener('keyup', function (e) {
        const activeTab = document.querySelector('.view-section.active')?.id;
        if (activeTab === 'view-trainer') handleTrainerKeyUp(e);
    });

    const trainerTimerEl = document.getElementById('trainer-timer');
    if (trainerTimerEl) {
        trainerTimerEl.addEventListener('click', handleTrainerTimerTap);
    }
    const trainerCardEl = document.querySelector('#view-trainer .trainer-card');
    if (trainerCardEl) {
        trainerCardEl.addEventListener('click', handleTrainerCardTap);
        trainerCardEl.addEventListener('touchstart', handleTrainerCardTouchStart, { passive: false });
        trainerCardEl.addEventListener('touchmove', handleTrainerCardTouchMove, { passive: true });
        trainerCardEl.addEventListener('touchend', handleTrainerCardTouchEnd, { passive: false });
        trainerCardEl.addEventListener('touchcancel', handleTrainerCardTouchCancel, { passive: true });
    }

    const listContainer = document.getElementById('grid-area');
    listContainer.addEventListener('input', (e) => {
        if (e.target.matches('.pair-input')) {
            const pair = e.target.dataset.pair;
            savePairData(pair, e.target.value, e.target.dataset.store || 'word');
        }
    });

    const formulaContainer = document.getElementById('formula-area');
    formulaContainer.addEventListener('input', (e) => {
        if (e.target.matches('.formula-input')) {
            const pair = e.target.dataset.pair;
            savePairData(pair, e.target.value, e.target.dataset.store || getCurrentListContentMode());
        }
    });

    const matrixContainer = document.getElementById('matrix-area');
    matrixContainer.addEventListener('input', (e) => {
        if (e.target.matches('.matrix-input')) {
            const pair = e.target.dataset.pair;
            savePairData(pair, e.target.value, e.target.dataset.store || 'word');
        }
    });
    matrixContainer.addEventListener('focusin', (e) => {
        if (!matrixMarkingGrade && e.target.matches('.matrix-input')) {
            handleMatrixFocus(e.target);
        }
    });
    matrixContainer.addEventListener('focusout', (e) => {
        if (e.target.matches('.matrix-input')) {
            handleMatrixBlur();
        }
    });
    matrixContainer.addEventListener('pointerdown', (e) => {
        if (matrixMarkingGrade && e.pointerType === 'mouse' && e.button === 0 && e.target.closest('td')) {
            e.preventDefault();
        }
    });
    matrixContainer.addEventListener('click', handleMatrixCellClick);
    matrixContainer.addEventListener('keydown', (e) => {
        if (!matrixMarkingGrade || e.isComposing || e.repeat || !e.target.matches('.matrix-input')) return;
        if (e.key === 'Enter' || e.code === 'Space') {
            e.preventDefault();
            applyMatrixGrade(e.target, matrixMarkingGrade);
        }
    });
}

function updateLayoutMode() {
    if (chars.includes('A') || chars.includes('a')) { document.body.classList.remove('mode-zh'); document.body.classList.add('mode-en'); }
    else { document.body.classList.remove('mode-en'); document.body.classList.add('mode-zh'); }
}

function initUI() {
    const chars = getPieceChars(currentAlgorithmType);
    const listSel = document.getElementById('char-select');
    if (!listSel) return;

    listSel.innerHTML = '';
    chars.forEach(c => { let opt1 = document.createElement('option'); opt1.value = c; opt1.innerText = `${c.toUpperCase()}`; listSel.appendChild(opt1); });

    // Init checkboxes for Start/End in Memory and Trainer
    renderCheckboxes('mem-start-range-grid', 'mem_start');
    renderCheckboxes('mem-end-range-grid', 'mem_end');
    renderCheckboxes('trainer-start-range-grid', 'trainer_start');
    renderCheckboxes('trainer-end-range-grid', 'trainer_end');

    updateDropdownLabel('mem_start');
    updateDropdownLabel('mem_end');
    updateDropdownLabel('trainer_start');
    updateDropdownLabel('trainer_end');
    renderAlgorithmBufferSettings();
}

function setupDynamicUI() {
    const charSelect = document.getElementById('char-select');
    if (charSelect) {
        charSelect.onchange = () => {
            document.getElementById('list-search').value = '';
            renderCurrentListView();
        };
    }

    const listControls = document.getElementById('list-mode-controls');
    if (listControls && !document.getElementById('formula-mode-hint')) {
        const formulaHint = document.createElement('div');
        formulaHint.id = 'formula-mode-hint';
        formulaHint.className = 'mode-hint hidden';
        formulaHint.setAttribute('data-i18n', 'hint_formula_edit');
        formulaHint.innerText = t('hint_formula_edit');
        listControls.insertAdjacentElement('afterend', formulaHint);
    }

    const gridArea = document.getElementById('grid-area');
    if (gridArea && !document.getElementById('formula-area')) {
        const formulaArea = document.createElement('div');
        formulaArea.id = 'formula-area';
        formulaArea.className = 'grid-container formula-grid hidden';
        gridArea.insertAdjacentElement('afterend', formulaArea);
    }

    const matrixFooter = document.getElementById('matrix-footer');
    if (matrixFooter) {
        matrixFooter.classList.add('matrix-footer');
        matrixFooter.innerHTML = `
            <span class="matrix-footer-label" data-i18n="btn_reset_color">${t('btn_reset_color')}</span>
            <div class="matrix-footer-actions">
                <button class="btn-grade" onclick="resetAllColors('all')" data-i18n="btn_reset_all">${t('btn_reset_all')}</button>
                <button class="btn-grade bg-green" onclick="resetAllColors('green')" data-i18n="fb_good">${t('fb_good')}</button>
                <button class="btn-grade bg-yellow" onclick="resetAllColors('yellow')" data-i18n="fb_slow">${t('fb_slow')}</button>
                <button class="btn-grade bg-red" onclick="resetAllColors('red')" data-i18n="fb_wrong">${t('fb_wrong')}</button>
                <button class="btn-grade bg-gray" onclick="resetAllColors('gray')" data-i18n="btn_hide">${t('btn_hide')}</button>
            </div>
        `;
    }

    const memoryPanel = document.querySelector('#view-memory .control-panel');
    if (memoryPanel && !document.getElementById('btn-mem-content-word')) {
        const modeRow = document.createElement('div');
        modeRow.className = 'control-row control-row-wrap memory-mode-row';
        modeRow.id = 'memory-mode-row';

        const leftGroup = document.createElement('div');
        leftGroup.className = 'memory-mode-group memory-mode-group-left';

        const rightGroup = document.createElement('div');
        rightGroup.className = 'memory-mode-group memory-mode-group-right';

        const wordButton = document.createElement('button');
        wordButton.id = 'btn-mem-content-word';
        wordButton.className = 'action-btn';
        wordButton.onclick = () => toggleMemoryContentMode('word');
        wordButton.setAttribute('data-i18n', 'switch_words');
        wordButton.innerText = t('switch_words');

        const cornerButton = document.createElement('button');
        cornerButton.id = 'btn-mem-content-corner';
        cornerButton.className = 'action-btn';
        cornerButton.onclick = () => toggleMemoryContentMode('corner');
        cornerButton.setAttribute('data-i18n', 'study_corner_mode');
        cornerButton.innerText = t('study_corner_mode');

        const edgeButton = document.createElement('button');
        edgeButton.id = 'btn-mem-content-edge';
        edgeButton.className = 'action-btn';
        edgeButton.onclick = () => toggleMemoryContentMode('edge');
        edgeButton.setAttribute('data-i18n', 'study_edge_mode');
        edgeButton.innerText = t('study_edge_mode');

        const formulaButton = document.createElement('button');
        formulaButton.id = 'btn-mem-content-formula';
        formulaButton.className = 'action-btn';
        formulaButton.onclick = () => toggleMemoryContentMode('formula');
        formulaButton.setAttribute('data-i18n', 'switch_algorithm');
        formulaButton.innerText = t('switch_algorithm');
        leftGroup.append(wordButton, formulaButton);
        rightGroup.append(cornerButton, edgeButton);

        modeRow.appendChild(leftGroup);
        modeRow.appendChild(rightGroup);

        const rangeRow = memoryPanel.querySelector('.control-row');
        if (rangeRow) rangeRow.insertAdjacentElement('afterend', modeRow);
        else memoryPanel.insertBefore(modeRow, memoryPanel.firstElementChild);
    }
}

function enhanceMemoryCardLayout() {
    const memoryCard = document.getElementById('memory-card');
    const gradingArea = document.getElementById('mem-grading-area');
    const questionEl = document.getElementById('mem-q');
    const answerEl = document.getElementById('mem-a');
    const hintEl = document.getElementById('mem-hint');

    if (!memoryCard || !gradingArea || !questionEl || !answerEl || !hintEl) return;
    if (memoryCard.querySelector('.flashcard-stage')) return;

    const stage = document.createElement('div');
    stage.className = 'flashcard-stage';

    const scene = document.createElement('div');
    scene.className = 'flashcard-3d';

    const front = document.createElement('div');
    front.className = 'flashcard-face flashcard-front';

    const back = document.createElement('div');
    back.className = 'flashcard-face flashcard-back';

    hintEl.classList.add('flashcard-subtext');
    answerEl.classList.add('flashcard-answer');

    front.appendChild(questionEl);
    front.appendChild(hintEl);
    back.appendChild(answerEl);
    back.appendChild(gradingArea);
    scene.appendChild(front);
    scene.appendChild(back);
    stage.appendChild(scene);
    memoryCard.appendChild(stage);
}

function setActionButtonActive(button, isActive) {
    if (!button) return;
    button.style.borderColor = '';
    button.style.color = '';
    button.style.backgroundColor = '';
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
}

function normalizeContentModes(contentModes = ['word']) {
    const modes = Array.isArray(contentModes) ? contentModes : [contentModes];
    return [...new Set(modes.filter(Boolean))];
}

function getSelectedMemoryContentModes() {
    return normalizeContentModes(currentMemoryContentModes).map(mode => mode === 'word' ? (currentMemoryPieceType === 'edge' ? 'edge-word' : 'word') : currentMemoryPieceType);
}

function getMemoryStatusTargetModes(contentModes = ['word']) {
    const normalizedModes = normalizeContentModes(contentModes);
    const algorithmModes = normalizedModes.filter(isAlgorithmContentMode);
    return algorithmModes.length > 0 ? algorithmModes : normalizedModes;
}

function getContentLabelKey(mode) {
    if (mode === 'corner') return 'content_corner_label';
    if (mode === 'edge') return 'content_edge_label';
    return 'content_word_label';
}

function normalizeAlgorithmBufferIndex(value, fallback = 2) {
    const index = Number(value);
    return Number.isInteger(index) && index >= 0 && index < chars.length ? index : fallback;
}

function getAlgorithmBufferStorageKey(contentMode = 'corner') {
    return contentMode === 'edge' ? EDGE_BUFFER_STORAGE_KEY : CORNER_BUFFER_STORAGE_KEY;
}

function loadAlgorithmBufferSettings() {
    currentAlgorithmBufferIndices = {
        corner: normalizeAlgorithmBufferIndex(readStoredJson(CORNER_BUFFER_STORAGE_KEY, 2)),
        edge: normalizeAlgorithmBufferIndex(readStoredJson(EDGE_BUFFER_STORAGE_KEY, 2))
    };
}

function getAlgorithmBufferIndex(contentMode = 'corner') {
    const type = contentMode === 'edge' ? 'edge' : 'corner';
    return normalizeAlgorithmBufferIndex(currentAlgorithmBufferIndices[type]);
}

function getContentPieceType(contentMode) {
    return contentMode === 'edge' || contentMode === 'edge-word' ? 'edge' : 'corner';
}

function getBufferPiece(contentMode) {
    const type = getContentPieceType(contentMode);
    const bufferIndex = getAlgorithmBufferIndex(type);
    const sticker = BUFFER_STICKER_NAMES[type][bufferIndex];
    const keys = PIECE_KEYS_BY_STICKER[type];
    const labels = getPieceChars(type).filter((_, index) => keys[index] === keys[bufferIndex]);
    return { sticker, labels };
}

function isBufferPairHidden(pair, contentMode, bufferLabels) {
    const labels = bufferLabels ?? (localStorage.getItem(MATRIX_BUFFER_FILTER_KEY) === 'true'
        ? getBufferPiece(contentMode).labels : []);
    return labels.some(letter => pair.startsWith(letter) || pair.endsWith(letter));
}

function isOrientationPairHidden(pair, contentMode, hideOrientation) {
    const type = getContentPieceType(contentMode);
    if (!(hideOrientation ?? (localStorage.getItem(MATRIX_ORIENTATION_FILTER_KEYS[type]) === 'true'))) return false;

    const [startIndex, endIndex] = getPairIndices(pair, type);
    if (startIndex < 0 || endIndex < 0 || startIndex === endIndex) return false;
    const keys = PIECE_KEYS_BY_STICKER[type];
    return keys[startIndex] === keys[endIndex];
}

function renderAlgorithmBufferSettings() {
    ['corner', 'edge'].forEach((type) => {
        const select = document.getElementById(`${type}-buffer-select`);
        if (!select) return;

        const selectedIndex = getAlgorithmBufferIndex(type);
        select.innerHTML = '';
        BUFFER_STICKER_NAMES[type].forEach((sticker, index) => {
            const option = document.createElement('option');
            option.value = String(index);
            option.innerText = t('settings_buffer_option', { sticker });
            option.selected = index === selectedIndex;
            select.appendChild(option);
        });
    });
}

function setAlgorithmBuffer(contentMode, value) {
    const type = contentMode === 'edge' ? 'edge' : 'corner';
    const nextIndex = normalizeAlgorithmBufferIndex(value, getAlgorithmBufferIndex(type));
    currentAlgorithmBufferIndices[type] = nextIndex;
    localStorage.setItem(getAlgorithmBufferStorageKey(type), JSON.stringify(nextIndex));
    renderAlgorithmBufferSettings();
    renderCurrentListView();

    trainerScrambleNavigation[type] = { items: [], index: -1 };
    trainerAlgorithmDrawState[type] = {};
    trainerPairDrawState[type] = { signature: '', total: 0, drawOrder: [] };
    if (currentTrainerAlgorithmType === type) {
        currentTrainerPair = null;
        currentTrainerAlgorithm = '';
        generateTrainerScramble({ silent: true, resetTimerDisplay: true });
    }
}

function getBuiltInCaseVariants(contentMode, bufferIndex, startIndex, endIndex) {
    const orientationCodes = BUILT_IN_ALGORITHMS.orientationCodes?.[contentMode];
    if (!Array.isArray(orientationCodes)) return [];

    const variants = [];
    orientationCodes.forEach((codes) => {
        if (typeof codes !== 'string' || codes.length < chars.length) return;
        const caseCode = `${codes[bufferIndex]}${codes[startIndex]}${codes[endIndex]}`;
        variants.push(
            caseCode,
            `${caseCode.slice(1)}${caseCode[0]}`,
            `${caseCode[2]}${caseCode.slice(0, 2)}`
        );
    });
    return variants;
}

function getBuiltInAlgorithmMap(contentMode = 'corner') {
    return isAlgorithmContentMode(contentMode) ? (BUILT_IN_ALGORITHMS[contentMode] || {}) : {};
}

function getPairIndices(pair, type = 'corner') {
    const chars = getPieceChars(type);
    for (let startIndex = 0; startIndex < chars.length; startIndex++) {
        const startLabel = chars[startIndex];
        if (!pair.startsWith(startLabel)) continue;

        const endLabel = pair.slice(startLabel.length);
        const endIndex = chars.indexOf(endLabel);
        if (endIndex !== -1) return [startIndex, endIndex];
    }

    return [-1, -1];
}

function isSameCharPair(pair, type = 'corner') {
    const [startIndex, endIndex] = getPairIndices(pair, type);
    return startIndex !== -1 && startIndex === endIndex;
}

function getBlddbCaseUrl(pair, type) {
    const indices = [getAlgorithmBufferIndex(type), ...getPairIndices(pair, type)];
    const pieceKeys = indices.map(index => PIECE_KEYS_BY_STICKER[type][index]);
    if (pieceKeys.includes(undefined) || new Set(pieceKeys).size !== 3) return '';

    return getBlddbUrl(type, indices.map(index => getBlddbStickerName(type, index)), 'manmade');
}

function getBlddbStickerName(type, index) {
    // Keep the sticker face first. BLDDB orders the other faces by U/D, F/B, L/R.
    const faceOrder = 'UDFBLR';
    const [face, ...otherFaces] = BUFFER_STICKER_NAMES[type][index];
    otherFaces.sort((a, b) => faceOrder.indexOf(a) - faceOrder.indexOf(b));
    return face + otherFaces.join('');
}

function getBlddbUrl(page, positions, mode) {
    const url = new URL(page, 'https://v2.blddb.net/');
    url.searchParams.set('position', positions.join('-'));
    url.searchParams.set('mode', mode);
    return url.href;
}

function getParityCase(edgeTarget, cornerTarget) {
    const pairs = { edge: [getAlgorithmBufferIndex('edge'), edgeTarget], corner: [getAlgorithmBufferIndex('corner'), cornerTarget] };
    for (const type of ['edge', 'corner']) {
        const [buffer, target] = pairs[type];
        const keys = PIECE_KEYS_BY_STICKER[type];
        if (!Number.isInteger(target) || !keys[target] || keys[buffer] === keys[target]) return null;
    }
    const positions = ['edge', 'corner'].flatMap(type => pairs[type].map(index => getBlddbStickerName(type, index)));
    const key = [...pairs.edge, ...pairs.corner].join('-');
    const variants = type => (BUILT_IN_ALGORITHMS.orientationCodes?.[type] ?? []).flatMap(codes => {
        const [buffer, target] = pairs[type].map(index => codes[index]);
        return [buffer + target, target + buffer];
    });
    const selected = BUILT_IN_ALGORITHMS.parity ?? {};
    const cornerVariants = variants('corner');
    const reference = variants('edge').flatMap(edge => cornerVariants.map(corner => selected[edge + corner])).find(Boolean);
    return { key, reference, url: getBlddbUrl('parity', positions, 'nightmare') };
}

function renderParityEditor() {
    const buffers = {};
    for (const type of ['corner', 'edge']) {
        const select = document.getElementById(`parity-${type}-target`);
        const previous = select.value;
        const buffer = getAlgorithmBufferIndex(type);
        const keys = PIECE_KEYS_BY_STICKER[type];
        buffers[type] = BUFFER_STICKER_NAMES[type][buffer];
        select.replaceChildren();
        getPieceChars(type).forEach((label, index) => {
            if (keys[index] === keys[buffer]) return;
            const option = document.createElement('option');
            option.value = String(index);
            option.textContent = `${label.toUpperCase()} · ${BUFFER_STICKER_NAMES[type][index]}`;
            select.appendChild(option);
        });
        if (Array.from(select.options).some(option => option.value === previous)) select.value = previous;
    }
    document.getElementById('parity-buffers').textContent = t('parity_buffers', buffers);
    renderParityCase();
}

function getSelectedParityCase() {
    const getTarget = type => Number.parseInt(document.getElementById(`parity-${type}-target`).value, 10);
    return getParityCase(getTarget('edge'), getTarget('corner'));
}

function renderParityCase() {
    const selected = getSelectedParityCase();
    const editor = document.getElementById('parity-formula');
    const link = document.getElementById('parity-blddb-link');
    editor.value = selected ? readStoredJson(PARITY_FORMULA_STORAGE_KEY, {})[selected.key] || '' : '';
    editor.disabled = !selected;
    if (selected) link.href = selected.url;
    else link.removeAttribute('href');
    document.getElementById('parity-reference').textContent = selected?.reference
        ? t('parity_reference', { algorithm: selected.reference }) : t('parity_no_reference');
}

function saveParityFormula() {
    const selected = getSelectedParityCase();
    if (!selected) return;
    const dict = readStoredJson(PARITY_FORMULA_STORAGE_KEY, {});
    const value = document.getElementById('parity-formula').value.trim();
    if (value) dict[selected.key] = value;
    else delete dict[selected.key];
    localStorage.setItem(PARITY_FORMULA_STORAGE_KEY, JSON.stringify(dict));
}

function getBuiltInAlgorithm(pair, contentMode = 'corner') {
    if (!isAlgorithmContentMode(contentMode)) return '';

    const [startIndex, endIndex] = getPairIndices(pair, contentMode);
    if (startIndex === -1 || endIndex === -1) return '';

    const algorithmMap = getBuiltInAlgorithmMap(contentMode);
    const orientationCodes = BUILT_IN_ALGORITHMS.orientationCodes?.[contentMode];

    // Backward compatibility for older generated data.
    if (!Array.isArray(orientationCodes)) {
        const legacyValue = algorithmMap[`${startIndex}-${endIndex}`] || '';
        return /^not found\.?$/i.test(String(legacyValue).trim()) ? '' : legacyValue;
    }

    const bufferIndex = getAlgorithmBufferIndex(contentMode);
    const caseCodes = getBuiltInCaseVariants(contentMode, bufferIndex, startIndex, endIndex);
    for (const caseCode of caseCodes) {
        const value = String(algorithmMap[caseCode] || '').trim();
        if (value && !/^not found\.?$/i.test(value)) return value;
    }

    return '';
}

function getAlgorithmPlaceholder(pair, contentMode = 'corner') {
    return getBuiltInAlgorithm(pair, contentMode) || t('ph_algorithm');
}

function getNoDataErrorKey(contentModes = ['word']) {
    return normalizeContentModes(contentModes).every(isAlgorithmContentMode) ? 'alert_no_algorithm_data' : 'alert_no_data';
}

function getPairContentValue(pair, contentMode, options = {}) {
    const dict = getContentDict(contentMode);
    const storedValue = (dict[pair] || '').trim();
    if (storedValue) return storedValue;

    if (isAlgorithmContentMode(contentMode)) {
        const builtInValue = options.includeBuiltIn === false ? '' : getBuiltInAlgorithm(pair, contentMode);
        if (builtInValue) return builtInValue;

        if (options.includePlaceholder && !isSameCharPair(pair, contentMode)) {
            return getAlgorithmPlaceholder(pair, contentMode);
        }
    }

    return '';
}

function splitTopLevelExpression(expression, separator) {
    let depth = 0;

    for (let index = 0; index < expression.length; index++) {
        const char = expression[index];
        if (char === '[') depth += 1;
        else if (char === ']') depth -= 1;
        else if (char === separator && depth === 0) {
            return [
                expression.slice(0, index).trim(),
                expression.slice(index + 1).trim()
            ];
        }
    }

    return null;
}

function parseMoveToken(token) {
    const normalized = String(token || '').trim();
    if (!normalized) return null;

    const match = normalized.match(/^([A-Za-z]+w?)(2)?('?){0,1}$/);
    if (match) {
        const base = match[1];
        const amount = match[2] ? 2 : (match[3] ? 3 : 1);
        return { base, amount };
    }

    const altMatch = normalized.match(/^([A-Za-z]+w?)('?)(2)$/);
    if (altMatch) {
        return { base: altMatch[1], amount: 2 };
    }

    return null;
}

function normalizeMoveToken({ base, amount }) {
    if (amount === 2) return `${base}2`;
    if (amount === 3) return `${base}'`;
    return base;
}

function parseMoveSequence(sequence) {
    const normalized = String(sequence || '').trim();
    if (!normalized) return [];

    return normalized.split(/\s+/).map((token) => {
        const parsed = parseMoveToken(token);
        if (!parsed) throw new Error(`Invalid move token: ${token}`);
        return normalizeMoveToken(parsed);
    });
}

function invertMoveToken(token) {
    const parsed = parseMoveToken(token);
    if (!parsed) throw new Error(`Invalid move token: ${token}`);
    return normalizeMoveToken({
        base: parsed.base,
        amount: parsed.amount === 2 ? 2 : (parsed.amount === 3 ? 1 : 3)
    });
}

function invertMoveSequence(moves = []) {
    return moves.slice().reverse().map(invertMoveToken);
}

function mergeAdjacentSameBaseMoves(moves = []) {
    const normalized = [];

    moves.forEach((move) => {
        const parsedMove = parseMoveToken(move);
        if (!parsedMove) {
            normalized.push(move);
            return;
        }

        const currentMove = normalizeMoveToken(parsedMove);
        const lastMove = normalized[normalized.length - 1];
        const parsedLastMove = parseMoveToken(lastMove);

        if (!parsedLastMove || parsedLastMove.base !== parsedMove.base) {
            normalized.push(currentMove);
            return;
        }

        const combinedAmount = (parsedLastMove.amount + parsedMove.amount) % 4;
        normalized.pop();
        if (combinedAmount !== 0) {
            normalized.push(normalizeMoveToken({
                base: parsedMove.base,
                amount: combinedAmount
            }));
        }
    });

    return normalized;
}

function getMoveAxis(base = '') {
    const face = String(base || '').trim().charAt(0).toUpperCase();
    if (face === 'U' || face === 'D') return 'UD';
    if (face === 'R' || face === 'L') return 'RL';
    if (face === 'F' || face === 'B') return 'FB';
    return null;
}

function collapseSameAxisMoves(parsedMoves = []) {
    if (parsedMoves.length <= 1) {
        return parsedMoves.map((move) => normalizeMoveToken(move));
    }

    const amountByBase = new Map();
    const order = [];
    parsedMoves.forEach((move) => {
        if (!amountByBase.has(move.base)) {
            amountByBase.set(move.base, 0);
            order.push(move.base);
        }
        amountByBase.set(move.base, (amountByBase.get(move.base) + move.amount) % 4);
    });

    const collapsed = [];
    order.forEach((base) => {
        const amount = amountByBase.get(base);
        if (!amount) return;
        collapsed.push(normalizeMoveToken({ base, amount }));
    });
    return collapsed;
}

function normalizeTrainerScrambleMoves(moves = []) {
    const adjacentNormalized = mergeAdjacentSameBaseMoves(moves);
    const normalized = [];
    let axisBuffer = [];
    let currentAxis = null;

    const flushAxisBuffer = () => {
        if (axisBuffer.length === 0) return;
        normalized.push(...collapseSameAxisMoves(axisBuffer));
        axisBuffer = [];
        currentAxis = null;
    };

    adjacentNormalized.forEach((move) => {
        const parsedMove = parseMoveToken(move);
        if (!parsedMove) {
            flushAxisBuffer();
            normalized.push(move);
            return;
        }

        const axis = getMoveAxis(parsedMove.base);
        if (!axis) {
            flushAxisBuffer();
            normalized.push(normalizeMoveToken(parsedMove));
            return;
        }

        if (currentAxis && axis !== currentAxis) {
            flushAxisBuffer();
        }

        currentAxis = axis;
        axisBuffer.push(parsedMove);
    });

    flushAxisBuffer();
    return mergeAdjacentSameBaseMoves(normalized);
}

function expandAlgorithmExpression(expression) {
    const normalized = String(expression || '').trim();
    if (!normalized) return [];

    const conjugateParts = splitTopLevelExpression(normalized, ':');
    if (conjugateParts) {
        const setupMoves = expandAlgorithmExpression(conjugateParts[0]);
        const bodyMoves = expandAlgorithmExpression(conjugateParts[1]);
        return [...setupMoves, ...bodyMoves, ...invertMoveSequence(setupMoves)];
    }

    if (normalized.startsWith('[') && normalized.endsWith(']')) {
        const inner = normalized.slice(1, -1).trim();
        const commutatorParts = splitTopLevelExpression(inner, ',');
        if (!commutatorParts) throw new Error(`Invalid commutator: ${normalized}`);

        const aMoves = expandAlgorithmExpression(commutatorParts[0]);
        const bMoves = expandAlgorithmExpression(commutatorParts[1]);
        return [...aMoves, ...bMoves, ...invertMoveSequence(aMoves), ...invertMoveSequence(bMoves)];
    }

    return parseMoveSequence(normalized);
}

function getAvailablePairContentModes(pair, contentModes = ['word'], options = {}) {
    return normalizeContentModes(contentModes).filter((mode) => {
        const value = getPairContentValue(pair, mode, options);
        if (!value) return false;
        return getPairColor(pair, mode) !== 'gray';
    });
}

function formatMemoryAnswer(pair, contentModes = ['word']) {
    const answerOptions = { includePlaceholder: true };
    const availableModes = getAvailablePairContentModes(pair, contentModes, answerOptions);
    if (availableModes.length === 0) return "N/A";

    if (availableModes.length === 1) {
        return getPairContentValue(pair, availableModes[0], answerOptions);
    }

    return availableModes.map((mode) => {
        const title = t(getContentLabelKey(mode));
        const value = getPairContentValue(pair, mode, answerOptions);
        return `${title}: ${value}`;
    }).join('\n\n');
}

function isMatrixListView(mode = currentListViewMode) {
    return mode === 'matrix' || mode === 'formula-matrix';
}

function isFormulaListView(mode = currentListViewMode) {
    return mode === 'formula' || mode === 'formula-matrix';
}

function getCurrentListContentGroup(mode = currentListViewMode) {
    if (mode === 'parity') return mode;
    return isFormulaListView(mode) ? 'formula' : 'word';
}

function getCurrentListContentMode(mode = currentListViewMode) {
    return isFormulaListView(mode) ? currentAlgorithmType : (currentAlgorithmType === 'edge' ? 'edge-word' : 'word');
}

function getCurrentListLayoutMode(mode = currentListViewMode) {
    return isMatrixListView(mode) ? 'matrix' : 'list';
}

function buildListViewMode(layout = 'list', contentGroup = 'word') {
    if (contentGroup === 'parity') return contentGroup;
    if (contentGroup === 'formula') {
        return layout === 'matrix' ? 'formula-matrix' : 'formula';
    }
    return layout === 'matrix' ? 'matrix' : 'list';
}

function setListLayoutMode(layout) {
    toggleViewMode(buildListViewMode(layout, getCurrentListContentGroup()));
}

function setListContentMode(contentGroup) {
    toggleViewMode(buildListViewMode(getCurrentListLayoutMode(), contentGroup));
}

function setAlgorithmType(type) {
    currentAlgorithmType = type === 'edge' ? 'edge' : 'corner';
    initUI();
    toggleViewMode(currentListViewMode);
}

function renderCurrentListView() {
    if (currentListViewMode === 'parity') renderParityEditor();
    else if (isMatrixListView()) renderMatrix(getCurrentListContentMode());
    else if (getCurrentListContentGroup() === 'formula') renderFormulaList();
    else renderList();
}

function stepListCharacter(direction) {
    const select = document.getElementById('char-select');
    const nextIndex = select.selectedIndex + direction;
    if (nextIndex < 0 || nextIndex >= select.options.length) return;
    select.selectedIndex = nextIndex;
    select.onchange();
}

function matchesListEntry(pair, value, query = '', filter = 'all') {
    const filled = String(value || '').trim().length > 0;
    if (filter === 'empty' && filled) return false;
    if (filter === 'filled' && !filled) return false;
    const needle = query.trim().toLocaleLowerCase();
    return !needle || `${pair} ${value || ''}`.toLocaleLowerCase().includes(needle);
}

function isListEntryVisible(pair, value) {
    return matchesListEntry(pair, value,
        document.getElementById('list-search')?.value || '',
        document.getElementById('list-entry-filter')?.value || 'all');
}

function updateListEditorSummary() {
    const select = document.getElementById('char-select');
    const progress = document.getElementById('list-progress');
    if (!select || !progress) return;
    const dict = getContentDict(getCurrentListContentMode());
    const ends = getPieceChars(currentAlgorithmType).filter(char => char !== select.value);
    const done = ends.filter(char => String(dict[select.value + char] || '').trim()).length;
    progress.textContent = t('list_progress', {done, total: ends.length});
    const meter = document.getElementById('list-progress-meter');
    meter.max = ends.length || 1;
    meter.value = done;
    document.getElementById('list-char-prev').disabled = select.selectedIndex <= 0;
    document.getElementById('list-char-next').disabled = select.selectedIndex >= select.options.length - 1;
}

function finishListRender(container) {
    updateListEditorSummary();
    document.getElementById('list-empty-state')?.classList.toggle('hidden', container.children.length > 0);
}

function configurePairInput(input, pair, isFormula = false) {
    input.setAttribute('aria-label', `${pair.toUpperCase()} — ${t(isFormula ? 'switch_algorithm' : 'switch_words')}`);
    input.autocomplete = 'off';
    input.spellcheck = false;
    if (!isFormula) {
        input.placeholder = t('list_word_placeholder');
        input.setAttribute('enterkeyhint', 'next');
    }
    input.addEventListener('keydown', event => {
        if (event.isComposing || event.key !== 'Enter') return;
        if (isFormula && !event.ctrlKey && !event.metaKey) return;
        const inputs = Array.from(input.closest('.grid-container').querySelectorAll('.pair-input'));
        const next = inputs[inputs.indexOf(input) + 1];
        if (next) {
            event.preventDefault();
            next.focus();
        }
    });
}

function updateMemoryContentModeButtons() {
    setActionButtonActive(document.getElementById('btn-mem-content-word'), currentMemoryContentModes.includes('word'));
    setActionButtonActive(document.getElementById('btn-mem-content-formula'), currentMemoryContentModes.includes('formula'));
    setActionButtonActive(document.getElementById('btn-mem-content-corner'), currentMemoryPieceType === 'corner');
    setActionButtonActive(document.getElementById('btn-mem-content-edge'), currentMemoryPieceType === 'edge');
}

function updateTrainerAlgorithmButtons() {
    setActionButtonActive(document.getElementById('btn-trainer-content-word'), currentTrainerContentGroup === 'word');
    setActionButtonActive(document.getElementById('btn-trainer-content-formula'), currentTrainerContentGroup === 'formula');
    setActionButtonActive(document.getElementById('btn-trainer-type-corner'), currentTrainerAlgorithmType === 'corner');
    setActionButtonActive(document.getElementById('btn-trainer-type-edge'), currentTrainerAlgorithmType === 'edge');
}

function updateTrainerTypeBadge() {
    const modeLabel = t(currentTrainerAlgorithmType === 'edge' ? 'algorithm_edges' : 'algorithm_corners');
    const displayText = modeLabel;
    const badge = document.getElementById('trainer-type-badge');
    if (badge) badge.innerText = displayText;
}

function updateAlgorithmTypeButtons() {
    setActionButtonActive(document.getElementById('btn-algorithm-type-corner'), currentAlgorithmType === 'corner');
    setActionButtonActive(document.getElementById('btn-algorithm-type-edge'), currentAlgorithmType === 'edge');
}

function toggleMemoryContentMode(mode) {
    if (mode === 'corner' || mode === 'edge') currentMemoryPieceType = mode;
    else if (currentMemoryContentModes.includes(mode)) {
        if (currentMemoryContentModes.length === 1) return;
        currentMemoryContentModes = currentMemoryContentModes.filter(item => item !== mode);
    } else currentMemoryContentModes.push(mode);
    renderCheckboxes('mem-start-range-grid', 'mem_start');
    renderCheckboxes('mem-end-range-grid', 'mem_end');
    updateDropdownLabel('mem_start'); updateDropdownLabel('mem_end');
    updateMemoryContentModeButtons();
    nextMemoryCard();
}

function setTrainerContentGroup(group) {
    currentTrainerContentGroup = group === 'word' ? 'word' : 'formula';
    updateTrainerAlgorithmButtons();
    setTrainerScrambleDisplay(currentTrainerScramble, currentTrainerPair);
}

function setTrainerAlgorithmType(type) {
    currentTrainerAlgorithmType = type === 'edge' ? 'edge' : 'corner';
    renderCheckboxes('trainer-start-range-grid', 'trainer_start');
    renderCheckboxes('trainer-end-range-grid', 'trainer_end');
    updateDropdownLabel('trainer_start'); updateDropdownLabel('trainer_end');
    currentTrainerAlgorithm = '';
    clearTrainerInlineStates();
    updateTrainerAlgorithmButtons();
    updateTrainerTypeBadge();
    renderTrainerRecords();
    updateTrainerScrambleNavButtons();
    generateTrainerScramble({ silent: true, resetTimerDisplay: true });
}

function getTrainerCandidatePairs() {
    const chars = getPieceChars(currentTrainerAlgorithmType);
    const startChars = getSelectedRanges('trainer_start');
    const endChars = getSelectedRanges('trainer_end');

    if (startChars.length === 0 || endChars.length === 0) {
        return { error: 'alert_sel_range' };
    }

    const pairs = [];
    chars.forEach((start) => {
        if (!startChars.includes(start)) return;
        chars.forEach((end) => {
            if (!endChars.includes(end)) return;

            const pair = start + end;
            if (!getPairContentValue(pair, currentTrainerAlgorithmType)) return;

            if (getPairColor(pair, currentTrainerAlgorithmType) === 'gray') return;

            pairs.push(pair);
        });
    });

    if (pairs.length === 0) {
        return { error: 'alert_no_algorithm_data' };
    }

    return { pairs };
}

function getTrainerPairScrambleMoves(pair, algorithmText = '') {
    const selectedAlgorithmText = String(algorithmText || '').trim() || getPairContentValue(pair, currentTrainerAlgorithmType);
    if (!selectedAlgorithmText) return [];
    const expandedMoves = expandAlgorithmExpression(selectedAlgorithmText);
    return invertMoveSequence(expandedMoves);
}

function getTrainerPairAlgorithmCandidates(pair) {
    const algorithmText = getPairContentValue(pair, currentTrainerAlgorithmType);
    const normalized = String(algorithmText || '').replace(/\r/g, '').trim();
    if (!normalized) return [];

    const lineCandidates = normalized
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

    if (lineCandidates.length > 1) return lineCandidates;
    return [normalized];
}

function getTrainerDrawStateStore(type = currentTrainerAlgorithmType) {
    const algorithmType = normalizeTrainerAlgorithmType(type);
    if (!trainerAlgorithmDrawState[algorithmType]) trainerAlgorithmDrawState[algorithmType] = {};
    return trainerAlgorithmDrawState[algorithmType];
}

function buildTrainerAlgorithmCycleSignature(algorithmEntries = []) {
    return algorithmEntries.map((entry) => entry.algorithm).join('\u241E');
}

function shuffleTrainerArray(items = []) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        const current = result[index];
        result[index] = result[randomIndex];
        result[randomIndex] = current;
    }
    return result;
}

function chooseTrainerAlgorithmFromPool(pair, algorithmEntries = []) {
    if (!pair || algorithmEntries.length === 0) return null;

    const store = getTrainerDrawStateStore();
    const signature = buildTrainerAlgorithmCycleSignature(algorithmEntries);
    let state = store[pair];
    if (!state || state.signature !== signature || state.total !== algorithmEntries.length) {
        state = {
            signature,
            total: algorithmEntries.length,
            drawOrder: []
        };
        store[pair] = state;
    }

    if (state.drawOrder.length === 0) {
        state.drawOrder = shuffleTrainerArray(algorithmEntries.map((_, index) => index));
    }

    const nextIndex = state.drawOrder.pop();
    if (!Number.isInteger(nextIndex) || !algorithmEntries[nextIndex]) return null;

    return { ...algorithmEntries[nextIndex] };
}

function getTrainerPairAlgorithmEntries(pair) {
    const candidates = getTrainerPairAlgorithmCandidates(pair);
    if (candidates.length === 0) return [];

    const validEntries = [];
    candidates.forEach((candidateText) => {
        const candidateVariants = [candidateText];
        const trimmedNumberPrefix = String(candidateText)
            .replace(/^\s*\d+\s*[\.\)\]:：、-]\s*/, '')
            .trim();
        if (trimmedNumberPrefix && trimmedNumberPrefix !== candidateText) candidateVariants.push(trimmedNumberPrefix);

        try {
            let parsedEntry = null;
            for (const candidateVariant of candidateVariants) {
                try {
                    const moves = getTrainerPairScrambleMoves(pair, candidateVariant);
                    if (moves.length === 0) continue;
                    parsedEntry = {
                        algorithm: formatTrainerCommutatorText(candidateVariant),
                        moves
                    };
                    break;
                } catch (innerError) {
                    // Keep trying fallback variants.
                }
            }
            if (parsedEntry) validEntries.push(parsedEntry);
        } catch (outerError) {
            // Ignore invalid lines so a single bad algorithm does not block the whole case.
        }
    });

    return validEntries;
}

function getTrainerPairMovesWithCycle(pair, algorithmEntries = null) {
    const validEntries = Array.isArray(algorithmEntries) ? algorithmEntries : getTrainerPairAlgorithmEntries(pair);
    if (validEntries.length === 0) return null;
    return chooseTrainerAlgorithmFromPool(pair, validEntries);
}

function formatTrainerCommutatorText(text = '') {
    return String(text || '')
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/\s*:\s*/g, ': ')
        .replace(/\s*,\s*/g, ', ')
        .replace(/\[\s*/g, '[')
        .replace(/\s*\]/g, ']');
}

function getTrainerRecordAlgorithmText(record) {
    if (!record) return '';
    const storedAlgorithm = formatTrainerCommutatorText(record.algorithm || '');
    if (storedAlgorithm) return storedAlgorithm;

    if (!record.pair) return '';
    const fallbackAlgorithm = getPairContentValue(record.pair, record.algorithmType);
    return formatTrainerCommutatorText(fallbackAlgorithm);
}

function buildTrainerPairCycleSignature(pool = []) {
    return pool.join('\u241E');
}

function chooseTrainerPairFromPool(pool, type = currentTrainerAlgorithmType) {
    if (!Array.isArray(pool) || pool.length === 0) return null;

    const algorithmType = normalizeTrainerAlgorithmType(type);
    if (!trainerPairDrawState[algorithmType]) {
        trainerPairDrawState[algorithmType] = { signature: '', total: 0, drawOrder: [] };
    }

    const state = trainerPairDrawState[algorithmType];
    const signature = buildTrainerPairCycleSignature(pool);
    if (state.signature !== signature || state.total !== pool.length) {
        state.signature = signature;
        state.total = pool.length;
        state.drawOrder = [];
    }

    if (state.drawOrder.length === 0) {
        state.drawOrder = shuffleTrainerArray(pool.map((_, index) => index));
    }

    const nextIndex = state.drawOrder.pop();
    if (!Number.isInteger(nextIndex) || !pool[nextIndex]) return pool[0];
    return pool[nextIndex];
}

function getTrainerScrambleNavState(type = currentTrainerAlgorithmType) {
    const algorithmType = normalizeTrainerAlgorithmType(type);
    if (!trainerScrambleNavigation[algorithmType]) {
        trainerScrambleNavigation[algorithmType] = { items: [], index: -1 };
    }
    return trainerScrambleNavigation[algorithmType];
}

function updateTrainerScrambleNavButtons() {
    const prevBtn = document.getElementById('trainer-prev-btn');
    if (!prevBtn) return;

    const navState = getTrainerScrambleNavState();
    prevBtn.disabled = navState.index <= 0;
}

function normalizeTrainerPairValue(pair = '') {
    const normalized = String(pair || '').trim();
    return normalized || '';
}

function formatTrainerPairCaseLabel(pair = '') {
    const chars = getPieceChars(currentTrainerAlgorithmType);
    const normalizedPair = normalizeTrainerPairValue(pair);
    if (!normalizedPair) return '';

    const [startIndex, endIndex] = getPairIndices(normalizedPair, currentTrainerAlgorithmType);
    if (startIndex === -1 || endIndex === -1) return normalizedPair.toUpperCase();

    const startLabel = chars[startIndex];
    const endLabel = chars[endIndex];
    if (!startLabel || !endLabel) return normalizedPair.toUpperCase();

    return `${String(startLabel).toUpperCase()}${String(endLabel).toUpperCase()}`;
}

function setTrainerScrambleDisplay(scramble = '', pair = currentTrainerPair) {
    const scrambleEl = document.getElementById('trainer-scramble');
    if (!scrambleEl) return;

    const scrambleText = String(scramble || '').trim();
    if (!scrambleText) {
        scrambleEl.innerText = t('trainer_scramble_placeholder');
        return;
    }

    let resolvedPair = normalizeTrainerPairValue(pair);
    if (!resolvedPair) {
        const navState = getTrainerScrambleNavState();
        const currentSnapshot = navState.items[navState.index];
        resolvedPair = normalizeTrainerPairValue(currentSnapshot?.pair || '');
    }

    const caseLabel = formatTrainerPairCaseLabel(resolvedPair);
    const wordMode = currentTrainerAlgorithmType === 'edge' ? 'edge-word' : 'word';
    const cue = currentTrainerContentGroup === 'word' ? getPairContentValue(resolvedPair, wordMode) : '';
    scrambleEl.innerText = caseLabel ? `${scrambleText} (${caseLabel}${cue ? ': ' + cue : ''})` : scrambleText;
}

function applyTrainerScrambleSnapshot(snapshot, options = {}) {
    if (!snapshot || !snapshot.scramble) return false;

    const snapshotPair = normalizeTrainerPairValue(snapshot.pair || '');
    if (snapshotPair) currentTrainerPair = snapshotPair;
    else if (!currentTrainerPair) currentTrainerPair = null;
    currentTrainerScramble = snapshot.scramble;
    currentTrainerAlgorithm = formatTrainerCommutatorText(snapshot.algorithm || '');

    setTrainerScrambleDisplay(currentTrainerScramble, currentTrainerPair);
    updateTrainerTypeBadge();

    if (options.preserveStatus !== true) setTrainerStatus('trainer_status_idle');
    updateTrainerScrambleNavButtons();
    return true;
}

function rememberTrainerScrambleSnapshot(pair, scramble, type = currentTrainerAlgorithmType, options = {}) {
    const normalizedPair = normalizeTrainerPairValue(pair);
    const normalizedScramble = String(scramble || '').trim();
    if (!normalizedPair || !normalizedScramble) return;

    const navState = getTrainerScrambleNavState(type);
    if (navState.index < navState.items.length - 1) {
        navState.items = navState.items.slice(0, navState.index + 1);
    }

    navState.items.push({
        pair: normalizedPair,
        scramble: normalizedScramble,
        algorithm: formatTrainerCommutatorText(options.algorithm || ''),
        algorithmType: normalizeTrainerAlgorithmType(type)
    });

    if (navState.items.length > TRAINER_SCRAMBLE_HISTORY_LIMIT) {
        navState.items.shift();
    }

    navState.index = navState.items.length - 1;
    updateTrainerScrambleNavButtons();
}

function clearTrainerInlineStates() {
    trainerDeleteConfirmArmed = false;
    trainerHistoryDeleteConfirmRecordId = null;
    expandedTrainerRecordId = null;
    updateTrainerDeleteButtons();
}

function goToPreviousTrainerScramble() {
    if (trainerTimerState === 'running') return;

    const navState = getTrainerScrambleNavState();
    if (navState.index <= 0) return;

    clearTrainerInlineStates();
    resetTrainerTimerState({ keepStatus: true, resetTimerDisplay: true });

    navState.index -= 1;
    applyTrainerScrambleSnapshot(navState.items[navState.index]);
}

function goToNextTrainerScramble() {
    if (trainerTimerState === 'running') return;

    const navState = getTrainerScrambleNavState();
    if (navState.index < navState.items.length - 1) {
        clearTrainerInlineStates();
        resetTrainerTimerState({ keepStatus: true, resetTimerDisplay: true });

        navState.index += 1;
        applyTrainerScrambleSnapshot(navState.items[navState.index]);
        return;
    }

    generateTrainerScramble();
}

function getTrainerCubeSolverConstructor() {
    if (typeof window !== 'undefined' && typeof window.Cube === 'function') return window.Cube;
    if (typeof Cube === 'function') return Cube;
    return null;
}

function ensureTrainerCubeSolverReady() {
    if (trainerCubeSolverInitState === 'ready') return true;
    if (trainerCubeSolverInitState === 'failed') return false;

    const solver = getTrainerCubeSolverConstructor();
    if (!solver || typeof solver.initSolver !== 'function' || typeof solver.inverse !== 'function') {
        trainerCubeSolverInitState = 'failed';
        return false;
    }

    try {
        solver.initSolver();
        trainerCubeSolverInitState = 'ready';
        return true;
    } catch (error) {
        trainerCubeSolverInitState = 'failed';
        return false;
    }
}

function normalizeTrainerCubeSolverMoveBase(base = '') {
    const rawBase = String(base || '').trim();
    if (!rawBase) return '';

    if (/^[URFDLB]$/.test(rawBase)) return rawBase;

    const lowerBase = rawBase.toLowerCase();
    if (lowerBase === 'm') return 'M';
    if (lowerBase === 'e') return 'E';
    if (lowerBase === 's') return 'S';
    if (lowerBase === 'x' || lowerBase === 'y' || lowerBase === 'z') return lowerBase;
    if (lowerBase === 'u' || lowerBase === 'uw') return 'u';
    if (lowerBase === 'r' || lowerBase === 'rw') return 'r';
    if (lowerBase === 'f' || lowerBase === 'fw') return 'f';
    if (lowerBase === 'd' || lowerBase === 'dw') return 'd';
    if (lowerBase === 'l' || lowerBase === 'lw') return 'l';
    if (lowerBase === 'b' || lowerBase === 'bw') return 'b';

    return '';
}

function toTrainerCubeSolverMoves(moves = []) {
    const convertedMoves = [];
    for (const move of moves) {
        const parsedMove = parseMoveToken(move);
        if (!parsedMove) return null;

        const normalizedBase = normalizeTrainerCubeSolverMoveBase(parsedMove.base);
        if (!normalizedBase) return null;

        convertedMoves.push(normalizeMoveToken({
            base: normalizedBase,
            amount: parsedMove.amount
        }));
    }
    return convertedMoves;
}

function buildCubeSolverTrainerScrambleMoves(baseMoves = []) {
    const normalizedMoves = normalizeTrainerScrambleMoves(baseMoves);
    if (normalizedMoves.length === 0) return normalizedMoves;

    if (!ensureTrainerCubeSolverReady()) return null;

    const solverMoves = toTrainerCubeSolverMoves(normalizedMoves);
    if (!solverMoves || solverMoves.length === 0) return null;

    const solver = getTrainerCubeSolverConstructor();
    if (!solver) return null;

    try {
        const cube = new solver();
        cube.move(solverMoves.join(' '));

        const solution = cube.solve(TRAINER_CUBE_SOLVER_MAX_DEPTH);
        const scrambleText = solver.inverse(solution || '');
        const scrambleMoves = normalizeTrainerScrambleMoves(parseMoveSequence(scrambleText));

        if (scrambleMoves.length > 0) return scrambleMoves;
    } catch (error) {
        return null;
    }

    return null;
}

function isEditableElement(element) {
    return !!element && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT' || element.isContentEditable);
}

function getTrainerNow() {
    return (typeof performance !== 'undefined' && typeof performance.now === 'function') ? performance.now() : Date.now();
}

function requestAnimationFrameSafe(callback) {
    if (typeof requestAnimationFrame === 'function') return requestAnimationFrame(callback);
    return setTimeout(() => callback(getTrainerNow()), 16);
}

function cancelAnimationFrameSafe(frameId) {
    if (frameId == null) return;
    if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frameId);
    else clearTimeout(frameId);
}

function formatTrainerTime(rawTimeMs = 0) {
    const totalCentiseconds = Math.round(rawTimeMs / 10);
    const minutes = Math.floor(totalCentiseconds / 6000);
    const seconds = Math.floor((totalCentiseconds % 6000) / 100);
    const centiseconds = totalCentiseconds % 100;

    if (minutes > 0) {
        return `${minutes}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
    }

    return `${seconds}.${String(centiseconds).padStart(2, '0')}`;
}

function getTrainerDisplayTime(record) {
    if (!record) return '0.00';
    if (record.penalty === 'dnf') return `DNF (${formatTrainerTime(record.rawTimeMs)})`;
    if (record.penalty === 'plus2') return `${formatTrainerTime(record.rawTimeMs + 2000)}+`;
    return formatTrainerTime(record.rawTimeMs);
}

function getTrainerRecordFinalTime(record) {
    if (!record) return Infinity;
    if (record.penalty === 'dnf') return Infinity;
    return record.rawTimeMs + (record.penalty === 'plus2' ? 2000 : 0);
}

function calculateTrainerAverage(count) {
    const recentRecords = getTrainerSessionRecords().slice(0, count);
    if (recentRecords.length < count) return null;

    const trimCount = Math.ceil(count * 0.05);
    const times = recentRecords.map(getTrainerRecordFinalTime);
    const dnfCount = times.filter((time) => !Number.isFinite(time)).length;

    if (dnfCount > trimCount) return 'DNF';

    const sortedTimes = [...times].sort((left, right) => left - right);
    const keptTimes = sortedTimes.slice(trimCount, sortedTimes.length - trimCount);

    if (keptTimes.length === 0 || keptTimes.some((time) => !Number.isFinite(time))) {
        return 'DNF';
    }

    const averageMs = keptTimes.reduce((sum, time) => sum + time, 0) / keptTimes.length;
    return formatTrainerTime(averageMs);
}

function renderTrainerAverages() {
    TRAINER_AVERAGE_COUNTS.forEach((count) => {
        const valueEl = document.getElementById(`trainer-avg-${count}`);
        if (!valueEl) return;

        const averageValue = calculateTrainerAverage(count);
        const displayValue = averageValue ?? '--';

        valueEl.innerText = displayValue;
        valueEl.classList.toggle('is-empty', averageValue == null);
        valueEl.classList.toggle('is-dnf', averageValue === 'DNF');
    });
}

function setTrainerStatus(statusKey = 'trainer_status_idle') {
    currentTrainerStatusKey = statusKey;
    const status = document.getElementById('trainer-status');
    if (status) status.textContent = t(statusKey);
}

function setTrainerTimerDisplay(value = '0.00') {
    const timerEl = document.getElementById('trainer-timer');
    if (timerEl) timerEl.innerText = value;
}

function setTrainerActionButtonIcon(buttonEl, icon = '', label = '') {
    if (!buttonEl) return;
    buttonEl.classList.add('trainer-icon-btn');
    buttonEl.innerText = icon;
    if (label) {
        buttonEl.setAttribute('aria-label', label);
        buttonEl.title = label;
    } else {
        buttonEl.removeAttribute('aria-label');
        buttonEl.removeAttribute('title');
    }
}

function updateTrainerPenaltyButtonIcons() {
    setTrainerActionButtonIcon(document.getElementById('trainer-plus2-btn'), TRAINER_ACTION_ICONS.plus2, t('btn_penalty_plus2'));
    setTrainerActionButtonIcon(document.getElementById('trainer-dnf-btn'), TRAINER_ACTION_ICONS.dnf, t('btn_penalty_dnf'));
}

function updateTrainerTimerVisualState() {
    const timerEl = document.getElementById('trainer-timer');
    if (!timerEl) return;

    timerEl.classList.remove('is-holding', 'is-ready', 'is-running');
    if (trainerTimerState === 'holding') timerEl.classList.add('is-holding');
    if (trainerTimerState === 'ready') timerEl.classList.add('is-ready');
    if (trainerTimerState === 'running') timerEl.classList.add('is-running');
}

function syncTrainerTimerToLatestRecord() {
    setTrainerTimerDisplay(getTrainerDisplayTime(getLatestTrainerSessionRecord()));
    updateTrainerTimerVisualState();
}

function updateTrainerDeleteButtons() {
    const deleteBtn = document.getElementById('trainer-delete-btn');
    const confirmBtn = document.getElementById('trainer-delete-confirm-btn');
    if (!deleteBtn || !confirmBtn) return;

    const deleteLabelKey = trainerDeleteConfirmArmed ? 'btn_delete_cancel' : 'btn_delete_solve';
    const deleteIcon = trainerDeleteConfirmArmed ? TRAINER_ACTION_ICONS.cancel : TRAINER_ACTION_ICONS.delete;
    setTrainerActionButtonIcon(deleteBtn, deleteIcon, t(deleteLabelKey));
    setTrainerActionButtonIcon(confirmBtn, TRAINER_ACTION_ICONS.confirm, t('btn_delete_confirm'));
    deleteBtn.classList.toggle('is-armed', trainerDeleteConfirmArmed);
    confirmBtn.classList.toggle('hidden', !trainerDeleteConfirmArmed);
}

function setTrainerClearMenuOpen(isOpen) {
    trainerClearMenuOpen = !!isOpen;

    const menuEl = document.getElementById('trainer-clear-menu');
    const buttonEl = document.getElementById('trainer-clear-menu-btn');
    if (menuEl) menuEl.classList.toggle('hidden', !trainerClearMenuOpen);
    if (buttonEl) {
        buttonEl.setAttribute('aria-expanded', String(trainerClearMenuOpen));
        setActionButtonActive(buttonEl, trainerClearMenuOpen);
    }
}

function toggleTrainerClearMenu(event) {
    if (event) {
        if (event.cancelable) event.preventDefault();
        event.stopPropagation();
    }
    setTrainerClearMenuOpen(!trainerClearMenuOpen);
}

function requestClearTrainerRecords(type) {
    const normalizedType = normalizeTrainerAlgorithmType(type);
    const typeLabel = t(normalizedType === 'edge' ? 'algorithm_edges' : 'algorithm_corners');
    const targetRecords = getTrainerRecords().filter((record) => normalizeTrainerAlgorithmType(record.algorithmType) === normalizedType);

    setTrainerClearMenuOpen(false);
    if (targetRecords.length === 0) {
        alert(t('alert_no_trainer_records_type', { type: typeLabel }));
        return;
    }

    const confirmed = confirm(t('confirm_clear_trainer_records', { type: typeLabel, count: targetRecords.length }));
    if (!confirmed) return;

    trainerDeleteConfirmArmed = false;
    trainerHistoryDeleteConfirmRecordId = null;
    expandedTrainerRecordId = null;
    const targetIds = new Set(targetRecords.map(record => record.id));
    updateTrainerRecords(records => records.filter(record => !targetIds.has(record.id)));
    setTrainerStatus(currentTrainerScramble ? 'trainer_status_idle' : 'trainer_status_no_scramble');
}

function toggleTrainerRecordExpanded(recordId) {
    if (!recordId) return;

    trainerDeleteConfirmArmed = false;
    updateTrainerDeleteButtons();

    if (expandedTrainerRecordId === recordId) {
        expandedTrainerRecordId = null;
        trainerHistoryDeleteConfirmRecordId = null;
    } else {
        expandedTrainerRecordId = recordId;
        trainerHistoryDeleteConfirmRecordId = null;
    }

    renderTrainerRecords();
}

function resolveTrainerRecordActionTarget(recordId = null) {
    if (recordId) {
        const targetRecord = trainerRecords.find((record) => record.id === recordId);
        return targetRecord?.id || null;
    }

    return syncLatestTrainerRecordId();
}

function toggleTrainerHistoryDeleteConfirm(recordId) {
    if (!recordId) return;

    trainerDeleteConfirmArmed = false;
    updateTrainerDeleteButtons();
    trainerHistoryDeleteConfirmRecordId = trainerHistoryDeleteConfirmRecordId === recordId ? null : recordId;
    renderTrainerRecords();
}

function confirmDeleteTrainerRecord(recordId) {
    const targetRecordId = resolveTrainerRecordActionTarget(recordId);
    if (!targetRecordId) return;

    trainerHistoryDeleteConfirmRecordId = null;
    if (expandedTrainerRecordId === targetRecordId) expandedTrainerRecordId = null;
    updateTrainerRecords(records => records.filter(record => record.id !== targetRecordId));
    setTrainerStatus(currentTrainerScramble ? 'trainer_status_idle' : 'trainer_status_no_scramble');
}

function renderTrainerRecords() {
    const sessionRecords = getTrainerSessionRecords();
    const latestRecord = sessionRecords[0] || null;
    latestTrainerRecordId = latestRecord?.id || null;
    const penaltyShellEl = document.getElementById('trainer-penalty-shell');
    const historyEl = document.getElementById('trainer-history');

    if (expandedTrainerRecordId && !sessionRecords.some((record) => record.id === expandedTrainerRecordId)) {
        expandedTrainerRecordId = null;
        trainerHistoryDeleteConfirmRecordId = null;
    }

    if (penaltyShellEl) penaltyShellEl.classList.toggle('hidden', !latestRecord);

    updateTrainerPenaltyButtonIcons();
    setActionButtonActive(document.getElementById('trainer-plus2-btn'), latestRecord?.penalty === 'plus2');
    setActionButtonActive(document.getElementById('trainer-dnf-btn'), latestRecord?.penalty === 'dnf');
    updateTrainerDeleteButtons();

    if (historyEl) {
        historyEl.innerHTML = '';

        if (!latestRecord) {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'trainer-history-empty';
            emptyEl.innerText = t('trainer_history_empty');
            historyEl.appendChild(emptyEl);
        } else {
            const fragment = document.createDocumentFragment();
            sessionRecords.forEach((record, index) => {
                const isExpanded = record.id === expandedTrainerRecordId;
                const itemEl = document.createElement('div');
                itemEl.className = `trainer-history-item${index === 0 ? ' is-latest' : ''}${isExpanded ? ' is-expanded' : ''}`;
                itemEl.addEventListener('click', (event) => {
                    event.stopPropagation();
                    toggleTrainerRecordExpanded(record.id);
                });

                const headEl = document.createElement('div');
                headEl.className = 'trainer-history-head';

                const timeEl = document.createElement('div');
                timeEl.className = 'trainer-history-time';
                timeEl.innerText = getTrainerDisplayTime(record);

                const metaEl = document.createElement('div');
                metaEl.className = 'trainer-history-meta';
                const metaParts = [];
                if (record.pair) metaParts.push(record.pair.toUpperCase());
                metaParts.push(t(record.algorithmType === 'edge' ? 'algorithm_edges' : 'algorithm_corners'));
                const algorithmText = getTrainerRecordAlgorithmText(record);
                if (algorithmText) metaParts.push(algorithmText);
                metaEl.innerText = metaParts.join(' / ');
                if (record.scramble) itemEl.title = record.scramble;

                headEl.appendChild(timeEl);
                headEl.appendChild(metaEl);
                itemEl.appendChild(headEl);

                if (isExpanded) {
                    const algorithmText = getTrainerRecordAlgorithmText(record);
                    const isDeleteConfirming = trainerHistoryDeleteConfirmRecordId === record.id;

                    const detailsEl = document.createElement('div');
                    detailsEl.className = 'trainer-history-details';

                    const scrambleLabelEl = document.createElement('div');
                    scrambleLabelEl.className = 'trainer-history-detail-label';
                    scrambleLabelEl.innerText = t('trainer_scramble_label');

                    const scrambleValueEl = document.createElement('div');
                    scrambleValueEl.className = 'trainer-history-detail-value';
                    scrambleValueEl.innerText = record.scramble || '--';

                    const solutionLabelEl = document.createElement('div');
                    solutionLabelEl.className = 'trainer-history-detail-label';
                    solutionLabelEl.innerText = t('trainer_solution_label');

                    const solutionValueEl = document.createElement('div');
                    solutionValueEl.className = 'trainer-history-detail-value';
                    solutionValueEl.innerText = algorithmText || '--';

                    const actionRowEl = document.createElement('div');
                    actionRowEl.className = 'trainer-history-action-row';

                    const plus2Btn = document.createElement('button');
                    plus2Btn.type = 'button';
                    plus2Btn.className = 'action-btn trainer-history-action-btn trainer-icon-btn';
                    setTrainerActionButtonIcon(plus2Btn, TRAINER_ACTION_ICONS.plus2, t('btn_penalty_plus2'));
                    setActionButtonActive(plus2Btn, record.penalty === 'plus2');
                    plus2Btn.addEventListener('click', (event) => {
                        event.stopPropagation();
                        toggleTrainerPenalty('plus2', record.id);
                    });

                    const dnfBtn = document.createElement('button');
                    dnfBtn.type = 'button';
                    dnfBtn.className = 'action-btn trainer-history-action-btn trainer-icon-btn';
                    setTrainerActionButtonIcon(dnfBtn, TRAINER_ACTION_ICONS.dnf, t('btn_penalty_dnf'));
                    setActionButtonActive(dnfBtn, record.penalty === 'dnf');
                    dnfBtn.addEventListener('click', (event) => {
                        event.stopPropagation();
                        toggleTrainerPenalty('dnf', record.id);
                    });

                    const deleteBtn = document.createElement('button');
                    deleteBtn.type = 'button';
                    deleteBtn.className = 'action-btn trainer-history-action-btn trainer-delete-btn trainer-icon-btn';
                    setTrainerActionButtonIcon(
                        deleteBtn,
                        isDeleteConfirming ? TRAINER_ACTION_ICONS.cancel : TRAINER_ACTION_ICONS.delete,
                        t(isDeleteConfirming ? 'btn_delete_cancel' : 'btn_delete_solve')
                    );
                    deleteBtn.classList.toggle('is-armed', isDeleteConfirming);
                    deleteBtn.addEventListener('click', (event) => {
                        event.stopPropagation();
                        toggleTrainerHistoryDeleteConfirm(record.id);
                    });

                    const confirmBtn = document.createElement('button');
                    confirmBtn.type = 'button';
                    confirmBtn.className = `action-btn trainer-history-action-btn trainer-delete-confirm-btn trainer-icon-btn${isDeleteConfirming ? '' : ' hidden'}`;
                    setTrainerActionButtonIcon(confirmBtn, TRAINER_ACTION_ICONS.confirm, t('btn_delete_confirm'));
                    confirmBtn.addEventListener('click', (event) => {
                        event.stopPropagation();
                        confirmDeleteTrainerRecord(record.id);
                    });

                    actionRowEl.appendChild(plus2Btn);
                    actionRowEl.appendChild(dnfBtn);
                    actionRowEl.appendChild(deleteBtn);
                    actionRowEl.appendChild(confirmBtn);

                    detailsEl.appendChild(scrambleLabelEl);
                    detailsEl.appendChild(scrambleValueEl);
                    detailsEl.appendChild(solutionLabelEl);
                    detailsEl.appendChild(solutionValueEl);
                    detailsEl.appendChild(actionRowEl);
                    itemEl.appendChild(detailsEl);
                }

                fragment.appendChild(itemEl);
            });
            historyEl.appendChild(fragment);
        }
    }

    updateTrainerScrambleNavButtons();
    renderTrainerAverages();

    if (trainerTimerState === 'idle') syncTrainerTimerToLatestRecord();
}

function stopTrainerHold() {
    if (trainerHoldTimeoutId) {
        clearTimeout(trainerHoldTimeoutId);
        trainerHoldTimeoutId = null;
    }
}

function stopTrainerAnimation() {
    cancelAnimationFrameSafe(trainerAnimationFrameId);
    trainerAnimationFrameId = null;
}

function resetTrainerTimerState(options = {}) {
    stopTrainerHold();
    stopTrainerAnimation();
    trainerStartTimestamp = 0;
    trainerTimerState = 'idle';
    updateTrainerTimerVisualState();
    if (options.keepStatus !== true) setTrainerStatus(options.statusKey || 'trainer_status_idle');
    if (options.resetTimerDisplay === true) syncTrainerTimerToLatestRecord();
}

function tickTrainerTimer() {
    if (trainerTimerState !== 'running') return;
    setTrainerTimerDisplay(formatTrainerTime(getTrainerNow() - trainerStartTimestamp));
    trainerAnimationFrameId = requestAnimationFrameSafe(tickTrainerTimer);
}

function startTrainerTimer() {
    stopTrainerHold();
    trainerTimerState = 'running';
    trainerStartTimestamp = getTrainerNow();
    setTrainerStatus('trainer_status_running');
    setTrainerTimerDisplay('0.00');
    updateTrainerTimerVisualState();
    stopTrainerAnimation();
    trainerAnimationFrameId = requestAnimationFrameSafe(tickTrainerTimer);
}

function stopTrainerTimer() {
    if (trainerTimerState !== 'running') return;

    const rawTimeMs = Math.max(0, Math.round(getTrainerNow() - trainerStartTimestamp));
    stopTrainerAnimation();
    trainerTimerState = 'idle';
    updateTrainerTimerVisualState();

    const recordAlgorithm = formatTrainerCommutatorText(
        currentTrainerAlgorithm || getPairContentValue(currentTrainerPair || '', currentTrainerAlgorithmType)
    );

    const nextRecord = {
        id: `trainer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        rawTimeMs,
        penalty: 'ok',
        scramble: currentTrainerScramble,
        pair: currentTrainerPair || '',
        algorithm: recordAlgorithm,
        algorithmType: currentTrainerAlgorithmType,
        createdAt: Date.now()
    };

    updateTrainerRecords(records => [nextRecord, ...records]);
    setTrainerStatus('trainer_status_stopped');
    setTrainerTimerDisplay(getTrainerDisplayTime(nextRecord));
    generateTrainerScramble({ silent: true, preserveStatus: true });
}

function toggleTrainerPenalty(penalty, recordId = null) {
    const targetRecordId = resolveTrainerRecordActionTarget(recordId);
    if (!targetRecordId) return;

    trainerHistoryDeleteConfirmRecordId = null;
    updateTrainerRecords(records => records.map((record) => {
        if (record.id !== targetRecordId) return record;
        return {
            ...record,
            penalty: record.penalty === penalty ? 'ok' : penalty
        };
    }));
    setTrainerStatus('trainer_status_stopped');
}

function toggleTrainerDeleteConfirm() {
    if (!syncLatestTrainerRecordId()) return;
    trainerDeleteConfirmArmed = !trainerDeleteConfirmArmed;
    trainerHistoryDeleteConfirmRecordId = null;
    updateTrainerDeleteButtons();
    setTrainerStatus(trainerDeleteConfirmArmed ? 'trainer_status_delete_confirm' : 'trainer_status_stopped');
}

function confirmDeleteLatestTrainerRecord() {
    confirmDeleteTrainerRecord(syncLatestTrainerRecordId());
}

function handleTrainerKeyDown(event) {
    if (isEditableElement(document.activeElement)) return false;

    if (trainerTimerState === 'running') {
        if (event.repeat) return true;
        event.preventDefault();
        stopTrainerTimer();
        return true;
    }

    if (event.code !== 'Space') return false;

    event.preventDefault();
    if (event.repeat) return true;

    if (trainerTimerState === 'idle') {
        if (!currentTrainerScramble) {
            generateTrainerScramble();
        } else {
            startTrainerTimer();
        }
    }

    return true;
}

function handleTrainerKeyUp(event) {
    if (event.code !== 'Space') return false;
    if (isEditableElement(document.activeElement)) return false;
    return false;
}

function shouldSuppressTrainerGhostClick(event) {
    if (event?.type !== 'click') return false;
    if (Date.now() > trainerTouchSuppressClickUntil) return false;

    if (event.cancelable) event.preventDefault();
    event.stopPropagation();
    return true;
}

function canHandleTrainerCardTapTarget(targetEl) {
    if (!(targetEl instanceof Element)) return false;
    if (targetEl.closest('.trainer-panel')) return false;
    if (targetEl.closest('#trainer-penalty-shell')) return false;
    if (targetEl.closest('button, a, input, textarea, select, label')) return false;
    return true;
}

function readTrainerTouchPoint(event, identifier = null) {
    if (!event) return null;

    const touchLists = [event.touches, event.changedTouches];
    for (const touchList of touchLists) {
        if (!touchList || touchList.length === 0) continue;
        if (identifier == null) return touchList[0];
        for (const touch of touchList) {
            if (touch.identifier === identifier) return touch;
        }
    }
    return null;
}

function getTrainerTouchMoveDistance(touchPoint, touchState) {
    if (!touchPoint || !touchState) return Infinity;
    const deltaX = touchPoint.clientX - touchState.startX;
    const deltaY = touchPoint.clientY - touchState.startY;
    return Math.hypot(deltaX, deltaY);
}

function handleTrainerCardTouchStart(event) {
    const activeTab = document.querySelector('.view-section.active')?.id;
    if (activeTab !== 'view-trainer') return;

    const targetEl = event?.target instanceof Element ? event.target : null;
    if (!canHandleTrainerCardTapTarget(targetEl)) {
        trainerTouchTapState = null;
        return;
    }

    const touchPoint = readTrainerTouchPoint(event);
    if (!touchPoint) {
        trainerTouchTapState = null;
        return;
    }

    if (event.cancelable) event.preventDefault();
    trainerTouchTapState = {
        identifier: touchPoint.identifier,
        startX: touchPoint.clientX,
        startY: touchPoint.clientY,
        moved: false
    };
}

function handleTrainerCardTouchMove(event) {
    if (!trainerTouchTapState) return;

    const touchPoint = readTrainerTouchPoint(event, trainerTouchTapState.identifier);
    if (!touchPoint) return;

    if (getTrainerTouchMoveDistance(touchPoint, trainerTouchTapState) > TRAINER_TOUCH_TAP_MAX_MOVE_PX) {
        trainerTouchTapState.moved = true;
    }
}

function handleTrainerCardTouchEnd(event) {
    if (!trainerTouchTapState) return;

    const touchPoint = readTrainerTouchPoint(event, trainerTouchTapState.identifier);
    const movedTooFar = !touchPoint || trainerTouchTapState.moved || getTrainerTouchMoveDistance(touchPoint, trainerTouchTapState) > TRAINER_TOUCH_TAP_MAX_MOVE_PX;
    trainerTouchTapState = null;

    if (movedTooFar) return;

    const targetEl = event?.target instanceof Element ? event.target : null;
    if (!canHandleTrainerCardTapTarget(targetEl)) return;

    trainerTouchSuppressClickUntil = Date.now() + TRAINER_TOUCH_GHOST_CLICK_SUPPRESS_MS;
    if (event.cancelable) event.preventDefault();
    event.stopPropagation();
    handleTrainerTimerTap(event);
}

function handleTrainerCardTouchCancel() {
    trainerTouchTapState = null;
}

function handleTrainerTimerTap(event) {
    if (shouldSuppressTrainerGhostClick(event)) return true;

    if (event) {
        if (event.cancelable) event.preventDefault();
        event.stopPropagation();
    }

    const activeTab = document.querySelector('.view-section.active')?.id;
    if (activeTab !== 'view-trainer') return false;

    if (trainerTimerState === 'running') {
        stopTrainerTimer();
        return true;
    }

    if (trainerTimerState !== 'idle') return false;

    if (!currentTrainerScramble) {
        generateTrainerScramble();
        return true;
    }

    startTrainerTimer();
    return true;
}

function handleTrainerCardTap(event) {
    if (shouldSuppressTrainerGhostClick(event)) return true;

    const targetEl = event?.target instanceof Element ? event.target : null;
    if (!targetEl) return false;

    if (!canHandleTrainerCardTapTarget(targetEl)) return false;

    return handleTrainerTimerTap(event);
}

function resetTrainerView(options = {}) {
    stopTrainerHold();
    stopTrainerAnimation();
    trainerTimerState = 'idle';
    currentTrainerPair = null;
    currentTrainerScramble = '';
    currentTrainerAlgorithm = '';

    setTrainerScrambleDisplay('');
    updateTrainerTypeBadge();

    if (options.showNoScramble) {
        setTrainerStatus('trainer_status_no_scramble');
    } else {
        setTrainerStatus('trainer_status_idle');
    }
    if (options.resetTimerDisplay !== false) syncTrainerTimerToLatestRecord();
    updateTrainerScrambleNavButtons();
}

function generateTrainerScramble(options = {}) {
    if (trainerTimerState === 'running') return;
    clearTrainerInlineStates();

    resetTrainerTimerState({
        keepStatus: true,
        resetTimerDisplay: options.resetTimerDisplay !== false
    });

    const result = getTrainerCandidatePairs();
    if (result.error) {
        resetTrainerView({ showNoScramble: true, resetTimerDisplay: options.resetTimerDisplay !== false });
        if (!options.silent) alert(t(result.error));
        return;
    }

    const pairAlgorithmEntriesMap = {};
    const validPairs = [];
    result.pairs.forEach((pair) => {
        try {
            const algorithmEntries = getTrainerPairAlgorithmEntries(pair);
            if (algorithmEntries.length === 0) return;
            pairAlgorithmEntriesMap[pair] = algorithmEntries;
            validPairs.push(pair);
        } catch (error) {
            // Ignore invalid algorithms so one bad entry does not block all scramble generation.
        }
    });

    if (validPairs.length === 0) {
        resetTrainerView({ showNoScramble: true, resetTimerDisplay: options.resetTimerDisplay !== false });
        if (!options.silent) alert(t('alert_invalid_algorithm_format'));
        return;
    }

    const pair = chooseTrainerPairFromPool(validPairs, currentTrainerAlgorithmType);
    const pickedAlgorithm = getTrainerPairMovesWithCycle(pair, pairAlgorithmEntriesMap[pair]);
    const scrambleMoves = buildCubeSolverTrainerScrambleMoves(pickedAlgorithm?.moves || []);

    if (!scrambleMoves || scrambleMoves.length === 0) {
        resetTrainerView({ showNoScramble: true, resetTimerDisplay: options.resetTimerDisplay !== false });
        if (!options.silent) alert(t('alert_invalid_algorithm_format'));
        return;
    }

    currentTrainerAlgorithm = formatTrainerCommutatorText(pickedAlgorithm?.algorithm || '');
    const nextScramble = scrambleMoves.join(' ');
    currentTrainerPair = normalizeTrainerPairValue(pair) || null;
    currentTrainerScramble = nextScramble;
    rememberTrainerScrambleSnapshot(pair, nextScramble, currentTrainerAlgorithmType, {
        algorithm: currentTrainerAlgorithm
    });
    const navState = getTrainerScrambleNavState();
    applyTrainerScrambleSnapshot(navState.items[navState.index], {
        preserveStatus: options.preserveStatus === true
    });
}

function toggleViewMode(mode) {
    currentListViewMode = mode;
    isMatrixMode = isMatrixListView(mode);
    const isParity = mode === 'parity';
    const listBtn = document.getElementById('btn-mode-list');
    const matrixBtn = document.getElementById('btn-mode-matrix');
    const wordBtn = document.getElementById('btn-mode-content-word');
    const formulaBtn = document.getElementById('btn-mode-content-formula');
    const parityBtn = document.getElementById('btn-mode-content-parity');
    const listControls = document.getElementById('list-mode-controls');
    const formulaHint = document.getElementById('formula-mode-hint');
    const matrixSettings = document.getElementById('matrix-settings');
    const gridArea = document.getElementById('grid-area');
    const formulaArea = document.getElementById('formula-area');
    const matrixArea = document.getElementById('matrix-area');
    const matrixFooter = document.getElementById('matrix-footer');
    const container = document.getElementById('main-container');
    const currentLayout = getCurrentListLayoutMode(mode);
    const currentContentGroup = getCurrentListContentGroup(mode);
    const showList = !isMatrixMode && !isParity;
    const showFormulas = showList && currentContentGroup === 'formula';
    document.getElementById('list-editor-toolbar')?.classList.toggle('hidden', !showList);
    document.getElementById('list-keyboard-hint')?.classList.toggle('hidden', !showList);
    document.getElementById('list-empty-state')?.classList.add('hidden');
    document.getElementById('parity-area').classList.toggle('hidden', !isParity);
    document.getElementById('list-piece-label').parentElement.classList.toggle('hidden', isParity);
    document.getElementById('list-layout-label').parentElement.classList.toggle('hidden', isParity);

    setActionButtonActive(listBtn, currentLayout === 'list');
    setActionButtonActive(matrixBtn, currentLayout === 'matrix');
    setActionButtonActive(wordBtn, currentContentGroup === 'word');
    setActionButtonActive(formulaBtn, currentContentGroup === 'formula');
    setActionButtonActive(parityBtn, isParity);
    updateAlgorithmTypeButtons();

    container.classList.toggle('wide-mode', isMatrixMode);
    listControls.classList.toggle('hidden', !showList);
    formulaHint.classList.toggle('hidden', !showFormulas);
    matrixSettings.classList.toggle('hidden', !isMatrixMode);
    gridArea.classList.toggle('hidden', !showList || showFormulas);
    formulaArea.classList.toggle('hidden', !showFormulas);
    matrixArea.classList.toggle('hidden', !isMatrixMode);
    matrixFooter?.classList.toggle('hidden', !isMatrixMode);
    renderCurrentListView();
}

function renderList() {
    const chars = getPieceChars(currentAlgorithmType);
    const startChar = document.getElementById('char-select').value;
    const container = document.getElementById('grid-area');
    const contentMode = getCurrentListContentMode();
    const dict = getContentDict(contentMode);
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();

    chars.forEach((endChar) => {
        if (startChar === endChar) return;
        const pair = startChar + endChar;
        if (!isListEntryVisible(pair, dict[pair])) return;
        const div = document.createElement('div'); div.className = 'pair-item';
        div.innerHTML = `<div class="pair-label">${pair.toUpperCase()}</div>`;

        const input = document.createElement('input');
        input.className = 'pair-input';
        input.dataset.pair = pair;
        input.dataset.store = contentMode;
        configurePairInput(input, pair);

        const stColor = getPairColor(pair, contentMode);
        if (stColor) input.classList.add(`status-${stColor}`);
        input.value = dict[pair] || "";

        div.appendChild(input);
        fragment.appendChild(div);
    });
    container.appendChild(fragment);
    finishListRender(container);
}

function renderFormulaList() {
    const chars = getPieceChars(currentAlgorithmType);
    const startChar = document.getElementById('char-select').value;
    const container = document.getElementById('formula-area');
    const contentMode = getCurrentListContentMode();
    const formulaDict = getContentDict(contentMode);
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();

    chars.forEach((endChar) => {
        if (startChar === endChar) return;
        const pair = startChar + endChar;
        if (!isListEntryVisible(pair, formulaDict[pair])) return;
        const div = document.createElement('div');
        div.className = 'pair-item pair-item-formula';
        const caseUrl = getBlddbCaseUrl(pair, contentMode);
        const label = document.createElement(caseUrl ? 'a' : 'div');
        label.className = 'pair-label';
        label.textContent = pair.toUpperCase();
        if (caseUrl) {
            label.href = caseUrl;
            label.target = '_blank';
            label.rel = 'noopener noreferrer';
            label.title = t('blddb_pair_lookup', { pair: label.textContent });
            label.setAttribute('aria-label', label.title);
        }
        div.appendChild(label);

        const textarea = document.createElement('textarea');
        textarea.className = 'pair-input formula-input';
        textarea.dataset.pair = pair;
        textarea.dataset.store = contentMode;
        textarea.rows = 3;
        textarea.placeholder = getAlgorithmPlaceholder(pair, contentMode);
        configurePairInput(textarea, pair, true);

        const stColor = getPairColor(pair, contentMode);
        if (stColor) textarea.classList.add(`status-${stColor}`);
        textarea.value = formulaDict[pair] || "";

        div.appendChild(textarea);
        fragment.appendChild(div);
    });

    container.appendChild(fragment);
    finishListRender(container);
}

function toggleMatrixBufferPairs() {
    const hidden = localStorage.getItem(MATRIX_BUFFER_FILTER_KEY) === 'true';
    localStorage.setItem(MATRIX_BUFFER_FILTER_KEY, String(!hidden));
    resetTrainerScrambleNavigation();
    renderCurrentListView();
}

function toggleMatrixOrientationPairs() {
    const type = getContentPieceType(getCurrentListContentMode());
    const key = MATRIX_ORIENTATION_FILTER_KEYS[type];
    localStorage.setItem(key, String(localStorage.getItem(key) !== 'true'));
    resetTrainerScrambleNavigation();
    renderCurrentListView();
}

function renderMatrix(contentMode = 'word') {
    const chars = getPieceChars(contentMode);
    const type = getContentPieceType(contentMode);
    const hideOrientation = localStorage.getItem(MATRIX_ORIENTATION_FILTER_KEYS[type]) === 'true';
    const orientationButton = document.getElementById('matrix-orientation-filter-btn');
    if (orientationButton) {
        orientationButton.textContent = t(type === 'corner' ? 'matrix_hide_twist' : 'matrix_hide_flip');
        setActionButtonActive(orientationButton, hideOrientation);
    }
    const hideBuffer = localStorage.getItem(MATRIX_BUFFER_FILTER_KEY) === 'true';
    const bufferButton = document.getElementById('matrix-buffer-filter-btn');
    const { sticker, labels } = getBufferPiece(contentMode);
    setActionButtonActive(bufferButton, hideBuffer);
    if (bufferButton) {
        bufferButton.title = `${sticker} · ${labels.map(label => label.toUpperCase()).join(' / ')}`;
    }

    const readOnly = document.getElementById('matrix-edit-toggle')?.checked === false ? ' readonly' : '';
    const table = document.getElementById('full-matrix');
    const matrixWrapper = document.getElementById('matrix-area');
    const dict = getContentDict(contentMode);
    const snapshot = { dict, statusMap: getStatusMap(contentMode), bufferLabels: hideBuffer ? labels : [], hideOrientation };
    if (matrixWrapper) {
        matrixWrapper.classList.toggle('formula-matrix-mode', isAlgorithmContentMode(contentMode));
        matrixWrapper.classList.remove('is-marking');
    }
    matrixMarkingGrade = null;

    updateMatrixToolbar();

    const rows = [];
    const escapeHtmlAttribute = (value = '') => value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    const escapeHtmlText = (value = '') => value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    let headerHtml = '<thead><tr><th></th>';
    chars.forEach((char, index) => {
        headerHtml += `<th><input value="${escapeHtmlAttribute(char.toUpperCase())}" onchange="updateGlobalChar(${index}, this.value)" class="header-input char-idx-${index}"${readOnly}></th>`;
    });
    headerHtml += '</tr></thead><tbody>';
    rows.push(headerHtml);

    chars.forEach((rowChar, rowIndex) => {
        let rowHtml = `<tr><th><input value="${escapeHtmlAttribute(rowChar.toUpperCase())}" onchange="updateGlobalChar(${rowIndex}, this.value)" class="header-input char-idx-${rowIndex}"${readOnly}></th>`;
        chars.forEach(colChar => {
            const pair = rowChar + colChar;
            const stColor = getPairColor(pair, contentMode, snapshot);
            let cellClass = stColor ? `status-${stColor}` : '';
            const val = dict[pair] || '';
            const placeholder = isAlgorithmContentMode(contentMode) ? getAlgorithmPlaceholder(pair, contentMode) : '';
            const accessibleLabel = escapeHtmlAttribute(pair.toUpperCase());
            const inputMarkup = isAlgorithmContentMode(contentMode)
                ? `<textarea class="matrix-input" data-pair="${escapeHtmlAttribute(pair)}" data-store="${escapeHtmlAttribute(contentMode)}" aria-label="${accessibleLabel}" placeholder="${escapeHtmlAttribute(placeholder)}" rows="3"${readOnly}>${escapeHtmlText(val)}</textarea>`
                : `<input class="matrix-input" value="${escapeHtmlAttribute(val)}" data-pair="${escapeHtmlAttribute(pair)}" data-store="${escapeHtmlAttribute(contentMode)}" aria-label="${accessibleLabel}"${readOnly}>`;

            if (rowChar === colChar) {
                rowHtml += `<td class="cell-diagonal ${cellClass}">
                    <div class="diagonal-wrapper">
                        ${inputMarkup}
                        <button class="btn-diagonal-check" data-pair="${escapeHtmlAttribute(pair)}" data-char="${escapeHtmlAttribute(rowChar)}" data-store="${contentMode}">${t('btn_same')}</button>
                    </div>
                </td>`;
            } else {
                rowHtml += `<td class="${cellClass}">
                    ${inputMarkup}
                </td>`;
            }
        });
        rowHtml += '</tr>';
        rows.push(rowHtml);
    });
    rows.push('</tbody>');
    table.innerHTML = rows.join('');
}

// --- [核心修改] 矩陣聚焦邏輯 (僅保留十字線) ---
function handleMatrixFocus(el) {
    // 十字線高亮
    const td = el.closest('td'); if (!td) return;
    const tr = td.parentElement; const table = document.getElementById('full-matrix');
    if (!tr || !table) return;
    const colIndex = td.cellIndex;
    for (let c = 0; c < tr.cells.length; c++) { if (tr.cells[c]) tr.cells[c].classList.add('highlight-guide'); }
    for (let r = 0; r < table.rows.length; r++) { if (table.rows[r] && table.rows[r].cells[colIndex]) { table.rows[r].cells[colIndex].classList.add('highlight-guide'); } }
}


function updateMatrixToolbar() {
    const label = document.getElementById('active-pair-label');
    const gradeActions = document.getElementById('matrix-grade-actions');
    const gradeButtons = gradeActions?.querySelectorAll('[data-grade]') || [];
    for (const button of gradeButtons) {
        button.setAttribute('aria-pressed', String(button.dataset.grade === matrixMarkingGrade));
    }
    document.getElementById('matrix-marking-done')?.classList.toggle('hidden', !matrixMarkingGrade);

    if (!label) return;
    if (matrixMarkingGrade) {
        const button = Array.from(gradeButtons).find(option => option.dataset.grade === matrixMarkingGrade);
        label.textContent = t('matrix_marking_active', { grade: t(button?.dataset.i18n || 'matrix_familiarity') });
    } else {
        label.textContent = t('matrix_marking_hint');
    }
}

function handleMatrixBlur() {
    document.querySelectorAll('.highlight-guide').forEach(el => el.classList.remove('highlight-guide'));
}

function handleMatrixCellClick(event) {
    if (!matrixMarkingGrade && !event.target.matches('.btn-diagonal-check')) return;

    const cell = event.target.closest('td');
    const input = cell?.querySelector('.matrix-input');
    if (!input) return;

    if (matrixMarkingGrade) {
        event.preventDefault();
        applyMatrixGrade(input, matrixMarkingGrade);
    } else if (event.target.matches('.btn-diagonal-check')) {
        if (input.readOnly) return;
        input.value = event.target.dataset.char;
        savePairData(input.dataset.pair, input.value, input.dataset.store || 'word');
    }
}

function setMatrixMarkingGrade(statusType) {
    matrixMarkingGrade = statusType;
    const matrixArea = document.getElementById('matrix-area');
    if (matrixArea) {
        matrixArea.classList.toggle('is-marking', Boolean(statusType));
        const readOnly = Boolean(statusType) || document.getElementById('matrix-edit-toggle')?.checked === false;
        matrixArea.querySelectorAll('.matrix-input').forEach(input => input.readOnly = readOnly);
    }
    updateMatrixToolbar();
}

function applyMatrixGrade(input, statusType) {
    const pair = input.dataset.pair;
    const contentMode = input.dataset.store || getCurrentListContentMode();
    let nextStatus;
    if (statusType === 'gray') {
        nextStatus = { interval: -1, repetition: 0, ef: 2.5, dueDate: 0, color: 'gray' };
    } else {
        const grade = { green: 5, yellow: 3, red: 1 }[statusType];
        nextStatus = calculateNextReview(getPairData(pair, contentMode), grade);
    }
    saveStatusData(pair, nextStatus, contentMode);

    const cell = input.closest('td');
    cell.classList.remove('status-green', 'status-yellow', 'status-red', 'status-gray');
    const color = getPairColor(pair, contentMode);
    if (color) cell.classList.add('status-' + color);
}

window.setMatrixStatus = function (statusType) {
    setMatrixMarkingGrade(matrixMarkingGrade === statusType ? null : statusType);
};

window.updateGlobalChar = function(index, newValue) {
    const type = currentAlgorithmType;
    const state = ensureLetteringState();
    const next = [...state.active[type]];
    next[index] = newValue.trim().toLowerCase();
    if (!validateLetteringScheme(next)) { alert(letteringText('請填入不重複的單字元。', 'Use a unique single character.')); renderCurrentListView(); return; }
    state.custom = { corner: [...state.active.corner], edge: [...state.active.edge] };
    state.custom[type] = next;
    applyLetteringScheme('custom');
};

window.toggleMatrixEdit = function (editable) {
    if (matrixMarkingGrade) setMatrixMarkingGrade(null);
    document.querySelectorAll('.matrix-input').forEach(inp => inp.readOnly = !editable);
    document.querySelectorAll('.header-input').forEach(inp => inp.readOnly = !editable);
};;

function isSameCharScheme(candidate = [], reference = []) {
    if (!Array.isArray(candidate) || !Array.isArray(reference)) return false;
    if (candidate.length !== reference.length) return false;
    return candidate.every((value, index) => String(value).toLowerCase() === String(reference[index]).toLowerCase());
}

function getCurrentCharScheme() {
    if (letteringState) return letteringState.selected;
    if (isSameCharScheme(chars, CHARS_EN)) return 'en';
    if (isSameCharScheme(chars, CHARS_ZH)) return 'zh';
    return 'custom';
}

function getSavedCustomChars() {
    const saved = readStoredJson(CUSTOM_CHARS_KEY, null);
    const normalized = sanitizeChars(saved);
    return normalized ? normalized : null;
}

function saveCustomChars(nextChars = chars) {
    const normalized = sanitizeChars(nextChars);
    if (!normalized) return;
    localStorage.setItem(CUSTOM_CHARS_KEY, JSON.stringify(normalized));
}

function updateCharSchemeButtons() {
    const currentScheme = getCurrentCharScheme();
    setActionButtonActive(document.getElementById('chars-zh-btn'), currentScheme === 'zh');
    setActionButtonActive(document.getElementById('chars-en-btn'), currentScheme === 'en');
    setActionButtonActive(document.getElementById('chars-custom-btn'), currentScheme === 'custom');
}

function setCharScheme(scheme = 'zh') {
    applyLetteringScheme(['en', 'custom'].includes(scheme) ? scheme : 'zh');
}

function resetDefaultChars() {
    if (confirm(t('alert_reset'))) applyLetteringScheme(currentLang === 'en' ? 'en' : 'zh');
}

function toggleLanguage() {
    currentLang = currentLang === 'zh-TW' ? 'en' : 'zh-TW';
    localStorage.setItem(LANG_KEY, currentLang);
    applyLanguage();
    updateLayoutMode();
    renderCurrentListView();
}
function applyLanguage() {
    const chars = getPieceChars(currentAlgorithmType);
    document.querySelectorAll('[data-i18n]').forEach(el => { const key = el.getAttribute('data-i18n'); if (translations[currentLang][key]) el.innerText = translations[currentLang][key]; });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { const key = el.getAttribute('data-i18n-placeholder'); if (translations[currentLang][key]) el.placeholder = translations[currentLang][key]; });
    document.documentElement.lang = currentLang === 'zh-TW' ? 'zh-TW' : 'en';
    document.title = t('page_title');
    document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
        el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel));
    });
    const listSel = document.getElementById('char-select');
    if (listSel) {
        const currentVal = listSel.value;
        listSel.innerHTML = '';
        chars.forEach(c => { let opt = document.createElement('option'); opt.value = c; opt.innerText = c.toUpperCase(); listSel.appendChild(opt); });
        if (currentVal && chars.includes(currentVal)) listSel.value = currentVal;
    }
    setMemoryCardFlipped(isMemAnswerShown);
    updateDropdownLabel('mem_start'); updateDropdownLabel('mem_end');
    updateDropdownLabel('trainer_start'); updateDropdownLabel('trainer_end');
    updateMemoryContentModeButtons();
    updateTrainerAlgorithmButtons();
    updateCharSchemeButtons();
    renderLetteringNet();
    renderAlgorithmBufferSettings();
    updateTrainerTypeBadge();
    setTrainerScrambleDisplay(currentTrainerScramble, currentTrainerPair);
    setTrainerStatus(currentTrainerStatusKey);
    renderTrainerRecords();
    toggleViewMode(currentListViewMode);
    updatePwaInstallUi();
}

function setMemoryCardFlipped(isFlipped) {
    const memoryCard = document.getElementById('memory-card');
    const hintEl = document.getElementById('mem-hint');
    if (memoryCard) memoryCard.classList.toggle('is-flipped', isFlipped);
    if (hintEl) hintEl.classList.toggle('is-hidden', isFlipped);
}

function updateMemoryAnswerSize(answerEl, answerText = '') {
    if (!answerEl) return;

    const normalizedText = String(answerText ?? '').trim();
    const compactText = normalizedText.replace(/\s+/g, ' ');
    const lineLengths = normalizedText.split('\n').map((line) => line.trim().length);
    const longestLine = lineLengths.length > 0 ? Math.max(...lineLengths) : 0;
    const totalLength = compactText.length;

    answerEl.classList.remove('answer-size-short', 'answer-size-medium', 'answer-size-long', 'answer-size-dense');

    if (longestLine <= 8 && totalLength <= 18) {
        answerEl.classList.add('answer-size-short');
    } else if (longestLine <= 22 && totalLength <= 52) {
        answerEl.classList.add('answer-size-medium');
    } else if (longestLine <= 38 && totalLength <= 90) {
        answerEl.classList.add('answer-size-long');
    } else {
        answerEl.classList.add('answer-size-dense');
    }
}

function setDropdownOpenState(content, isOpen) {
    if (!content) return;
    content.classList.toggle('show', isOpen);
    const wrapper = content.closest('.dropdown-wrapper');
    if (wrapper) wrapper.classList.toggle('is-open', isOpen);
    const toggleButton = wrapper?.querySelector('.dropdown-toggle-btn');
    if (toggleButton) toggleButton.setAttribute('aria-expanded', String(isOpen));
}

function toggleDropdown(id) {
    const content = document.getElementById(`${id}-content`);
    if (!content) return;
    const isShown = content.classList.contains('show');
    closeAllDropdowns();
    if (!isShown) setDropdownOpenState(content, true);
}

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-content').forEach(el => setDropdownOpenState(el, false));
}

// Modified to handle generic ID
function updateDropdownLabel(key) {
    // key ex: mem_start
    const selected = getSelectedRanges(key);
    const btn = document.getElementById(`${key}-btn`);
    if (!btn) return;

    const displaySelected = selected.map(s => s.toUpperCase());

    if (selected.length === chars.length) btn.innerText = t('sel_full');
    else if (selected.length === 0) btn.innerText = t('sel_none');
    else btn.innerText = selected.length <= 5 ? `${t('sel_prefix')}${displaySelected.join(', ')}` : t('sel_count', { n: selected.length });
}

function renderCheckboxes(containerId, inputName) {
    const chars = getPieceChars(inputName.startsWith('trainer') ? currentTrainerAlgorithmType : currentMemoryPieceType);
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    chars.forEach((c) => {
        const label = document.createElement('label');
        label.className = 'checkbox-chip';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = c;
        input.name = inputName + '_range'; // ex: mem_start_range
        input.checked = true;
        input.onchange = () => {
            updateDropdownLabel(inputName);
            handleRangeSelectionChange(inputName);
        };
        label.appendChild(input);
        label.appendChild(document.createTextNode(c.toUpperCase()));
        container.appendChild(label);
    });
}
function toggleAll(inputName, state) {
    document.querySelectorAll(`input[name="${inputName}_range"]`).forEach(input => input.checked = state);
    updateDropdownLabel(inputName);
    handleRangeSelectionChange(inputName);
}
function getSelectedRanges(inputName) {
    return Array.from(document.querySelectorAll(`input[name="${inputName}_range"]:checked`)).map(i => i.value);
}

function handleRangeSelectionChange(inputName) {
    if (!inputName.startsWith('trainer_')) return;
    generateTrainerScramble({ silent: true, resetTimerDisplay: true });
}

function triggerAction(tabId) {
    if (tabId === 'view-memory') {
        if (isMemAnswerShown) nextMemoryCard(); else toggleMemoryAnswer();
    } else if (tabId === 'view-trainer') {
        generateTrainerScramble();
    }
}

function switchTab(tab) {
    if (tab === currentTab) return;

    closeAllDropdowns();
    setTrainerClearMenuOpen(false);
    const currentIndex = TAB_ORDER.indexOf(currentTab);
    const nextIndex = TAB_ORDER.indexOf(tab);
    const enterClass = nextIndex >= currentIndex ? 'tab-enter-forward' : 'tab-enter-backward';

    document.querySelectorAll('.view-section').forEach(e => e.classList.remove('active', 'tab-enter-forward', 'tab-enter-backward'));
    document.querySelectorAll('.nav-btn').forEach(button => {
        const isCurrent = button.dataset.view === tab;
        button.classList.toggle('active', isCurrent);
        if (isCurrent) button.setAttribute('aria-current', 'page');
        else button.removeAttribute('aria-current');
    });
    const nextSection = document.getElementById(`view-${tab}`);
    nextSection.classList.add('active');
    void nextSection.offsetWidth;
    nextSection.classList.add(enterClass);
    const container = document.getElementById('main-container');
    if (tab === 'list' && isMatrixListView()) container.classList.add('wide-mode'); else container.classList.remove('wide-mode');
    currentTab = tab;
    if (tab === 'list') renderCurrentListView();
    if (tab === 'memory') nextMemoryCard();
    if (tab === 'trainer') {
        generateTrainerScramble({ silent: true });
        applyLanguage();
    }
    window.scrollTo(0, 0);
}

function resetAllColors(targetColor = 'all') {
    if (confirm(t('alert_reset'))) {
        const contentMode = getCurrentListContentMode();
        const statusKey = getStatusStorageKey(contentMode);

        if (targetColor === 'all') {
            localStorage.setItem(statusKey, JSON.stringify({}));
        } else {
            const currentMap = getStatusMap(contentMode);
            const nextMap = {};

            Object.entries(currentMap).forEach(([pair, data]) => {
                const color = typeof data === 'string' ? data : data?.color;
                if (color !== targetColor) nextMap[pair] = data;
            });

            localStorage.setItem(statusKey, JSON.stringify(nextMap));
        }

        renderCurrentListView();
        alert(t('alert_reset_done'));
    }
}

function markMemStatus(gradeType) {
    if (!currentPair) return;
    let grade = gradeType === 'red' ? 1 : (gradeType === 'yellow' ? 3 : 5);
    const selectedModes = getMemoryStatusTargetModes(getAvailablePairContentModes(
        currentPair,
        getSelectedMemoryContentModes(),
        { includePlaceholder: true }
    ));
    if (selectedModes.length === 0) return;
    selectedModes.forEach((mode) => {
        const currentData = getPairData(currentPair, mode);
        const newData = calculateNextReview(currentData, grade);
        saveStatusData(currentPair, newData, mode);
    });
    nextMemoryCard();
}

function getPairDueDate(pair, contentModes = ['word']) {
    const normalizedModes = normalizeContentModes(contentModes);
    const dueDates = normalizedModes.map((mode) => {
        const status = getPairData(pair, mode);
        if (!status) return 0;

        const dueDate = Number(status.dueDate);
        return Number.isFinite(dueDate) ? dueDate : 0;
    });

    return dueDates.length > 0 ? Math.min(...dueDates) : 0;
}

function getStudyCandidatePool(mode, contentModes = ['word']) {
    const chars = getPieceChars(mode === 'mem' ? currentMemoryPieceType : 'corner');
    const startChars = getSelectedRanges(`${mode}_start`);
    const endChars = getSelectedRanges(`${mode}_end`);
    const normalizedModes = normalizeContentModes(contentModes);
    const contentValueOptions = mode === 'mem' ? { includePlaceholder: true } : {};
    const requireAllModes = mode === 'mem' && normalizedModes.length > 1;
    const now = Date.now();

    if (startChars.length === 0 || endChars.length === 0) return { error: 'alert_sel_range' };

    const candidates = [];

    chars.forEach(start => {
        if (!startChars.includes(start)) return;
        chars.forEach(end => {
            if (!endChars.includes(end)) return;

            const pair = start + end;
            const availableModes = getAvailablePairContentModes(pair, normalizedModes, contentValueOptions);
            if (availableModes.length === 0) return;
            if (requireAllModes && availableModes.length !== normalizedModes.length) return;

            candidates.push({
                pair,
                dueDate: getPairDueDate(pair, availableModes)
            });
        });
    });

    if (candidates.length === 0) {
        return { error: getNoDataErrorKey(normalizedModes) };
    }

    const dueCandidates = candidates.filter((candidate) => candidate.dueDate <= now);
    const earliestDueDate = Math.min(...candidates.map((candidate) => candidate.dueDate));
    const pool = dueCandidates.length > 0
        ? dueCandidates.map((candidate) => candidate.pair)
        : candidates
            .filter((candidate) => candidate.dueDate === earliestDueDate)
            .map((candidate) => candidate.pair);

    return {
        pool,
        dueDate: earliestDueDate,
        hasDueCandidates: dueCandidates.length > 0,
        candidates
    };
}


function nextMemoryCard() {
    const result = getStudyCandidatePool('mem', getSelectedMemoryContentModes());
    if (result.error) {
        currentPair = null;
        document.getElementById('mem-q').innerText = '--';
        document.getElementById('mem-a').innerText = '';
        document.getElementById('mem-a').classList.remove('show', 'answer-size-short', 'answer-size-medium', 'answer-size-long', 'answer-size-dense');
        document.getElementById('mem-grading-area').classList.add('hidden');
        setMemoryCardFlipped(false);
        isMemAnswerShown = false;
        alert(t(result.error));
        return;
    }

    let pool = result.pool;
    if (recentMemPairs.length > 0) {
        const recentSet = new Set(recentMemPairs.slice(-MEMORY_REPEAT_GAP));
        const eligiblePool = pool.filter((pair) => !recentSet.has(pair));

        if (eligiblePool.length > 0) {
            pool = eligiblePool;
        } else if (Array.isArray(result.candidates)) {
            const eligibleCandidates = result.candidates.filter((candidate) => !recentSet.has(candidate.pair));
            if (eligibleCandidates.length > 0) {
                const earliestEligibleDueDate = Math.min(...eligibleCandidates.map((candidate) => candidate.dueDate));
                pool = eligibleCandidates
                    .filter((candidate) => candidate.dueDate === earliestEligibleDueDate)
                    .map((candidate) => candidate.pair);
            }
        }
    }

    if (pool.length > 1 && lastMemPair) {
        const withoutLastPair = pool.filter((pair) => pair !== lastMemPair);
        if (withoutLastPair.length > 0) pool = withoutLastPair;
    }

    currentPair = pool[Math.floor(Math.random() * pool.length)];
    lastMemPair = currentPair;
    recentMemPairs.push(currentPair);
    if (recentMemPairs.length > MEMORY_REPEAT_GAP) recentMemPairs = recentMemPairs.slice(-MEMORY_REPEAT_GAP);

    document.getElementById('mem-q').innerText = currentPair.toUpperCase();
    document.getElementById('mem-a').classList.remove('show', 'answer-size-short', 'answer-size-medium', 'answer-size-long', 'answer-size-dense');
    document.getElementById('mem-grading-area').classList.add('hidden');
    setMemoryCardFlipped(false);

    isMemAnswerShown = false; applyLanguage();
}

function toggleMemoryAnswer() {
    if (!currentPair || isMemAnswerShown) return;
    const answerEl = document.getElementById('mem-a');
    const answerText = formatMemoryAnswer(currentPair, getSelectedMemoryContentModes());
    answerEl.innerText = answerText;
    updateMemoryAnswerSize(answerEl, answerText);

    answerEl.classList.add('show');
    document.getElementById('mem-grading-area').classList.remove('hidden');
    setMemoryCardFlipped(true);
    isMemAnswerShown = true; applyLanguage();
}

async function saveExportFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 0);
    return { saved: true };
}

async function exportData() {
    const exportType = document.getElementById('export-type').value;
    const chars = getPieceChars(currentAlgorithmType);
    const dict = exportType === 'csv' ? getContentDict(currentAlgorithmType === 'edge' ? 'edge-word' : 'word') : getDict();
    const edgeWordDict = getContentDict('edge-word');
    const edgeWordStatus = getStatusMap('edge-word');
    const cornerFormulaDict = getFormulaDict('corner');
    const edgeFormulaDict = getFormulaDict('edge');

    if (exportType === 'csv') {
        let csvContent = "\ufeff";
        csvContent += "," + chars.map(escapeCsvCell).join(",") + "\n";
        chars.forEach(rowChar => {
            let row = [escapeCsvCell(rowChar)];
            chars.forEach(colChar => {
                const pair = rowChar + colChar;
                if (rowChar === colChar) {
                    row.push("");
                } else {
                    row.push(escapeCsvCell(dict[pair] || ""));
                }
            });
            csvContent += row.join(",") + "\n";
        });

        await saveExportFile(
            csvContent,
            `letter_pairs_table_${new Date().toISOString().slice(0, 10)}.csv`,
            'text/csv'
        );

    } else {
        const statusMap = getStatusMap();
        const cornerFormulaStatusMap = getStatusMap('corner');
        const edgeFormulaStatusMap = getStatusMap('edge');
        const backupPayload = {
            version: 3,
            exportedAt: new Date().toISOString(),
            sections: {
                letterPairs: {
                    word: dict,
                    edgeWord: edgeWordDict,
                    corner: cornerFormulaDict,
                    edge: edgeFormulaDict,
                    parity: readStoredJson(PARITY_FORMULA_STORAGE_KEY, {})
                },
                status: {
                    word: statusMap,
                    edgeWord: edgeWordStatus,
                    corner: cornerFormulaStatusMap,
                    edge: edgeFormulaStatusMap
                },
                trainer: {
                    records: getTrainerRecords()
                },
                settings: {
                    chars: getPieceChars(),
                    lettering: ensureLetteringState(),
                    lang: currentLang,
                    algorithmBuffers: {
                        corner: getAlgorithmBufferIndex('corner'),
                        edge: getAlgorithmBufferIndex('edge')
                    }
                }
            }
        };

        await saveExportFile(
            JSON.stringify(backupPayload),
            `backup_${new Date().toISOString().slice(0, 10)}.json`,
            'application/json'
        );
    }
}

function importData() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onerror = () => {
        fileInput.value = '';
        alert(t('alert_import_error'));
    };
    reader.onload = async () => {
        try {
            const backup = normalizeBackupPayload(JSON.parse(reader.result));
            if (!confirm(t('confirm_restore_backup'))) return;
            await withTrainerRecordsLock(() => restoreBackup(backup));

            letteringState = null;
            chars = readStoredJson(CHARS_KEY, chars);
            chars = [...getPieceChars()];
            currentLang = backup.lang ?? currentLang;
            loadAlgorithmBufferSettings();
            expandedTrainerRecordId = null;
            trainerHistoryDeleteConfirmRecordId = null;
            refreshTrainerRecords(getTrainerRecords());
            resetTrainerScrambleNavigation();
            initUI();
            applyLanguage();
            updateLayoutMode();
            renderCurrentListView();
            generateTrainerScramble({ silent: true, resetTimerDisplay: true });
            alert(t('alert_import_success'));
        } catch (error) {
            alert(t('alert_import_error'));
        } finally {
            fileInput.value = '';
        }
    };
    reader.readAsText(file);
}

function restoreBackup(backup) {
    const data = {
        [STORAGE_KEY]: backup.dict,
        [EDGE_WORD_STORAGE_KEY]: backup.edgeWordDict,
        [EDGE_WORD_STATUS_KEY]: backup.edgeWordStatus,
        [CORNER_FORMULA_STORAGE_KEY]: backup.cornerFormulaDict,
        [EDGE_FORMULA_STORAGE_KEY]: backup.edgeFormulaDict,
        [STATUS_KEY]: backup.status,
        [CORNER_FORMULA_STATUS_KEY]: backup.cornerFormulaStatus,
        [EDGE_FORMULA_STATUS_KEY]: backup.edgeFormulaStatus,
        [TRAINER_RECORDS_KEY]: backup.trainerRecords
    };
    if (backup.parityFormulaDict != null) data[PARITY_FORMULA_STORAGE_KEY] = backup.parityFormulaDict;
    if (backup.lettering || backup.chars) {
        data[LETTERING_KEY] = backup.lettering;
        data[CHARS_KEY] = backup.lettering?.active.corner ?? backup.chars;
        if (backup.lettering || (!isSameCharScheme(backup.chars, CHARS_EN) && !isSameCharScheme(backup.chars, CHARS_ZH))) {
            data[CUSTOM_CHARS_KEY] = backup.lettering?.custom.corner ?? backup.chars;
        }
    }
    for (const [type, index] of Object.entries(backup.algorithmBuffers ?? {})) {
        data[getAlgorithmBufferStorageKey(type)] = index;
    }

    const writes = Object.entries(data).map(([key, value]) => [key, value === null ? null : JSON.stringify(value)]);
    if (backup.lang) writes.push([LANG_KEY, backup.lang]);
    const applied = [];
    try {
        for (const [key, value] of writes) {
            const previous = localStorage.getItem(key);
            writeBackupEntry(key, value);
            applied.push([key, previous]);
        }
    } catch (error) {
        for (const [key, value] of applied.reverse()) writeBackupEntry(key, value);
        throw error;
    }
}

function writeBackupEntry(key, value) {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
}
function clearAllData() {
    if (confirm(t('alert_reset'))) {
        clearAppStorageData();
        location.reload();
    }
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootApp, { once: true });
    } else {
        bootApp();
    }
}
