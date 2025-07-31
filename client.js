/*======================================================================
// QUYỀN LỰC BÓNG TỐI - STYLESHEET (PHIÊN BẢN HOÀN CHỈNH)
//
// TÍNH NĂNG:
// - Sử dụng biến màu (CSS Variables) để dễ dàng thay đổi theme.
// - Định dạng code dễ đọc, có chú thích rõ ràng.
// - Style cho Modal (cửa sổ pop-up) và các hiệu ứng.
// - Responsive, hiển thị tốt trên các kích thước màn hình.
//======================================================================*/

/* --- I. Cài đặt chung & Theme --- */
:root {
    --bg-dark: #1a1a1a;
    --bg-medium: #2c2c2c;
    --bg-light: #3a3a3a;
    --text-light: #f0f0f0;
    --text-medium: #bdbdbd;
    --primary-gold: #ffd700;
    --accent-blue: #00c0ff;
    --success-green: #28a745;
    --danger-red: #dc3545;
    --warning-yellow: #ffc107;
    --neutral-gray: #6c757d;
}

/* Áp dụng box-sizing cho tất cả các phần tử */
*, *::before, *::after {
    box-sizing: border-box;
}

body {
    background-color: var(--bg-dark);
    color: var(--text-light);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
    padding: 20px 0;
}

.container {
    background-color: var(--bg-medium);
    padding: 20px 40px;
    border-radius: 12px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.6);
    width: 95%;
    max-width: 900px;
    text-align: center;
    border: 1px solid #444;
}

/* --- II. Typography (Kiểu chữ) --- */
h1 {
    color: var(--primary-gold);
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.7);
    font-size: 2.5em;
    margin-bottom: 25px;
}
h2 {
    color: var(--accent-blue);
    margin-bottom: 20px;
}
h3 {
    color: var(--text-light);
    margin-top: 0;
    word-wrap: break-word;
}
hr {
    border: none;
    border-top: 1px solid #555;
    margin: 20px 0;
}

/* --- III. Các thành phần dùng chung (Nút, Input) --- */
button {
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    border: none;
    border-radius: 6px;
    font-size: 1.1em;
    padding: 12px 20px;
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.4);
}
button:active:not(:disabled) {
    transform: translateY(0px);
}
button:disabled {
    background-color: #424242 !important;
    color: #9e9e9e !important;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

input[type="text"] {
    display: block;
    width: 100%;
    margin: 15px 0;
    padding: 12px;
    font-size: 1.2em;
    font-weight: bold;
    background-color: #444;
    color: var(--text-light);
    border: 1px solid #666;
    border-radius: 6px;
    text-align: center;
    transition: border-color 0.2s;
}
input[type="text"]:focus {
    outline: none;
    border-color: var(--primary-gold);
}
input[type="text"]::placeholder { color: var(--text-medium); text-transform: none; }
#room-code-input { text-transform: uppercase; }

/* --- IV. Màn hình chính & Phòng chờ --- */
.menu button, .controls-wrapper button {
    display: inline-block;
    width: auto;
    margin: 10px 5px;
}
#create-room-btn { background-color: var(--success-green); color: white; }
#join-room-btn { background-color: var(--accent-blue); color: white; }

#player-list {
    list-style-type: none;
    padding: 0;
    margin-bottom: 20px;
    text-align: left;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
}
#player-list li {
    background-color: var(--bg-light);
    margin: 8px 0;
    padding: 12px 15px;
    border-radius: 6px;
    border-left: 5px solid var(--accent-blue);
    display: flex;
    justify-content: space-between;
    align-items: center;
}
#player-list li.bot { border-left-color: #00e676; }
#player-list li em { color: var(--text-medium); font-style: normal; }
#player-list .host-tag { color: var(--primary-gold); font-weight: bold; }
#player-list .disconnected-tag { color: var(--danger-red); font-style: italic; }

/* --- V. Màn hình chơi game --- */
.round-indicator { font-size: 1.2em; color: var(--text-medium); }

#decree-display {
    background: linear-gradient(145deg, #4a148c, #880e4f);
    border: 2px solid var(--warning-yellow);
    border-radius: 8px;
    padding: 15px;
    margin: 20px auto;
    max-width: 80%;
    box-shadow: 0 0 15px rgba(255, 171, 0, 0.5);
}
#decree-title { color: var(--warning-yellow); font-weight: bold; font-size: 1.3em; }
#decree-description { font-style: italic; color: var(--text-light); }

#players-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
    margin: 30px 0;
}
.player-card {
    background-color: #383838;
    padding: 15px;
    border-radius: 8px;
    width: 200px;
    box-shadow: 0 2px 8px rgba(0,0,0,.5);
    border-top: 5px solid var(--neutral-gray);
    transition: all 0.3s ease;
}
.player-card.disconnected { opacity: 0.5; background-color: #303030; border-top-color: var(--danger-red); }

.player-score { font-size: 2em; font-weight: 700; color: var(--primary-gold); transition: all 0.3s; }
.chosen-action-wrapper { min-height: 24px; margin-top: 10px; font-weight: 700; }
.loyal-text { color: var(--success-green); }
.corrupt-text { color: var(--danger-red); }
.blank-text { color: var(--text-medium); }
.info { color: var(--accent-blue); }

#round-phase { margin-top: 30px; padding: 20px; background-color: #2a2a2a; border-radius: 8px; }
#timer-display { font-size: 3em; font-weight: bold; color: var(--danger-red); margin-bottom: 15px; text-shadow: 0 0 8px rgba(220, 53, 69, 0.7); }

#player-choice-buttons button, #chaos-phase-controls button { margin: 5px; color: white; }
.choice-buttons.loyal { background-color: var(--success-green); }
.choice-buttons.corrupt { background-color: var(--danger-red); }
.choice-buttons.blank { background-color: var(--neutral-gray); }
.skip-button { background-color: var(--neutral-gray); margin-top: 20px; }

/* --- VI. Khu vực Log/Thông báo --- */
#message-area {
    background-color: #1f1f1f;
    padding: 15px;
    border-radius: 8px;
    margin-top: 25px;
    min-height: 100px;
    text-align: left;
    overflow-y: auto;
    max-height: 250px;
    border: 1px solid #444;
    display: flex;
    flex-direction: column-reverse;
}
#message-area p {
    margin: 8px 0;
    line-height: 1.5;
    border-left: 3px solid;
    padding-left: 10px;
    animation: fadeIn 0.5s ease-in-out;
}
#message-area p.info { border-color: var(--accent-blue); color: var(--accent-blue); }
#message-area p.success { border-color: var(--success-green); color: var(--success-green); }
#message-area p.error { border-color: var(--danger-red); color: var(--danger-red); }
#message-area p.warning { border-color: var(--warning-yellow); color: var(--warning-yellow); }

/* --- VII. Styles cho Modal (Cửa sổ Pop-up) --- */
.modal-overlay {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background-color: rgba(0, 0, 0, 0.75);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
}
.modal-content {
    background-color: var(--bg-medium);
    padding: 25px 40px;
    border-radius: 12px;
    border: 2px solid var(--primary-gold);
    box-shadow: 0 5px 25px rgba(0,0,0,0.5);
    text-align: center;
    max-width: 90%;
    width: 500px;
}
.player-selection-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 10px;
    margin: 20px 0;
}
.player-selection-grid button, .modal-content button {
    background-color: var(--accent-blue); color: white;
}
.modal-content button.selected {
    background-color: var(--success-green);
    border: 2px solid white;
    transform: scale(1.05);
}
.modal-content button#amnesia-confirm-btn {
    background-color: var(--danger-red);
    margin-top: 15px;
}

/* --- VIII. Keyframes cho Animations --- */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scoreUp {
    from { transform: scale(1.6); color: var(--success-green); }
    to { transform: scale(1); color: var(--primary-gold); }
}
.score-up { animation: scoreUp 0.5s ease-out; }

@keyframes scoreDown {
    from { transform: scale(1.6); color: var(--danger-red); }
    to { transform: scale(1); color: var(--primary-gold); }
}
.score-down { animation: scoreDown 0.5s ease-out; }

/* --- IX. Responsive Design --- */
@media (max-width: 768px) {
    .container { padding: 15px 20px; }
    h1 { font-size: 2em; }
    #players-container { flex-direction: column; align-items: center; }
    .player-card { width: 90%; max-width: 300px; }
    .modal-content { padding: 20px; }
}
@media (max-width: 480px) {
    body { padding: 10px 0; }
    .container { padding: 10px; }
    h1 { font-size: 1.8em; }
    button { padding: 10px 15px; font-size: 1em; }
    input[type="text"] { padding: 10px; font-size: 1em; }
    .player-selection-grid { grid-template-columns: 1fr 1fr; }
}