//======================================================================
// QUYỀN LỰC BÓNG TỐI - CLIENT LOGIC (NÂNG CẤP LỚN)
//======================================================================

const socket = io();

// --- I. DOM Elements ---
const screens = { home: document.getElementById('home-screen'), room: document.getElementById('room-screen'), game: document.getElementById('game-screen') };
const homeElements = { createRoomBtn: document.getElementById('create-room-btn'), joinRoomBtn: document.getElementById('join-room-btn'), roomCodeInput: document.getElementById('room-code-input'), nameInput: document.getElementById('player-name-input') };
const roomElements = { roomCodeDisplay: document.getElementById('room-code-display'), playerList: document.getElementById('player-list'), hostControls: document.getElementById('host-controls'), addBotBtn: document.getElementById('add-bot-btn'), startGameBtn: document.getElementById('start-game-btn') };
const gameElements = { roundIndicator: document.getElementById('current-round'), decreeDisplay: document.getElementById('decree-display'), decreeTitle: document.getElementById('decree-title'), decreeDescription: document.getElementById('decree-description'), playersContainer: document.getElementById('players-container'), phaseTitle: document.getElementById('phase-title'), chaosControls: document.getElementById('chaos-phase-controls'), choiceButtons: document.getElementById('player-choice-buttons'), messageArea: document.getElementById('message-area') };

// --- II. Client State ---
let state = { myId: null, currentRoomCode: null, currentHostId: null, players: [], gamePhase: null, countdownTimer: null };

// --- III. Helper Functions ---
function showScreen(screenName) { Object.keys(screens).forEach(key => { screens[key].style.display = (key === screenName) ? 'block' : 'none'; }); }
function logMessage(type, message) { const p = document.createElement('p'); p.className = type; p.innerHTML = message; gameElements.messageArea.prepend(p); }
function createModal(title, contentHTML) { const e = document.querySelector('.modal-overlay'); if (e) e.remove(); const m = document.createElement('div'); m.className = 'modal-overlay'; const c = document.createElement('div'); c.className = 'modal-content'; c.innerHTML = `<h2>${title}</h2>${contentHTML}`; m.appendChild(c); document.body.appendChild(m); }
function closeModal() { const e = document.querySelector('.modal-overlay'); if (e) e.remove(); }
function getChoiceClass(choice) { switch (choice) { case 'Cống Hiến': return 'loyal-text'; case 'Tham Nhũng': return 'corrupt-text'; case 'Phiếu Trống': return 'blank-text'; default: return 'info'; } }

// --- IV. Render Functions ---
function renderPlayerList() {
    roomElements.playerList.innerHTML = '';
    const isHost = state.myId === state.currentHostId;

    state.players.forEach(p => {
        const li = document.createElement('li');
        let text = `<span>${p.name}</span>`;
        let controls = '';

        if (p.id === state.myId) text += ' <em>(Bạn)</em>';
        if (p.id === state.currentHostId) text += ' <strong class="host-tag">[Host]</strong>';
        if (p.disconnected) text += ' <span class="disconnected-tag">(Mất kết nối)</span>';

        // [TÍNH NĂNG MỚI] Thêm nút Kick nếu bạn là Host và người chơi đó không phải là bạn
        if (isHost && p.id !== state.myId) {
            controls = `<button class="kick-btn" onclick="kickPlayer('${p.id}')">Kick</button>`;
        }
        
        li.innerHTML = `<div>${text}</div><div>${controls}</div>`;
        if (p.isBot) li.classList.add('bot');
        roomElements.playerList.appendChild(li);
    });

    roomElements.hostControls.style.display = isHost ? 'block' : 'none';
    if (roomElements.startGameBtn) {
        roomElements.startGameBtn.disabled = state.players.length < 2;
    }
}
function renderPlayerCards() { gameElements.playersContainer.innerHTML = ''; state.players.forEach(player => { const card = document.createElement('div'); card.className = 'player-card'; card.id = `player-card-${player.id}`; card.innerHTML = `<h3>${player.name}</h3><p>Điểm: <span class="player-score">${player.score}</span></p><div class="chosen-action-wrapper"><p class="chosen-action info">Đang chọn...</p></div>`; if (player.disconnected) card.classList.add('disconnected'); gameElements.playersContainer.appendChild(card); }); }

// --- V. EVENT LISTENERS ---
homeElements.createRoomBtn.addEventListener('click', () => socket.emit('createRoom', { name: homeElements.nameInput.value }));
homeElements.joinRoomBtn.addEventListener('click', () => { const code = homeElements.roomCodeInput.value; if (code) socket.emit('joinRoom', { roomCode: code, name: homeElements.nameInput.value }); });
roomElements.addBotBtn.addEventListener('click', () => socket.emit('addBot', state.currentRoomCode));
roomElements.startGameBtn.addEventListener('click', () => socket.emit('startGame', state.currentRoomCode));

// --- VI. SOCKET.IO EVENT HANDLERS ---
socket.on('connect', () => { state.myId = socket.id; console.log('✅ Đã kết nối tới server với ID:', state.myId); showScreen('home'); });
socket.on('roomError', msg => alert(`Lỗi: ${msg}`));
socket.on('joinedRoom', data => { state.currentRoomCode = data.roomCode; state.currentHostId = data.hostId; state.players = data.players; roomElements.roomCodeDisplay.textContent = state.currentRoomCode; showScreen('room'); renderPlayerList(); });
socket.on('updatePlayerList', (players, hostId) => { state.players = players; state.currentHostId = hostId; renderPlayerList(); });
socket.on('kicked', () => { alert("Bạn đã bị chủ phòng kick!"); showScreen('home'); });
socket.on('gameStarted', () => { showScreen('game'); gameElements.messageArea.innerHTML = ''; });

// [NÂNG CẤP] Thêm đồng hồ đếm ngược cho Giai đoạn 1
socket.on('newRound', data => {
    state.gamePhase = 'choice'; state.players = data.players; gameElements.roundIndicator.textContent = data.roundNumber;
    gameElements.phaseTitle.textContent = 'Bước 1: Lựa Chọn Bí Mật';
    gameElements.decreeDisplay.style.display = 'none'; gameElements.chaosControls.style.display = 'none';
    clearInterval(state.countdownTimer); renderPlayerCards();
    
    let choiceTimerHTML = `<div id="timer-display">${data.duration}</div>`;
    gameElements.phaseTitle.insertAdjacentHTML('afterend', choiceTimerHTML);

    gameElements.choiceButtons.innerHTML = `<button class="choice-buttons loyal" onclick="sendPlayerChoice('Cống Hiến')">Cống Hiến</button><button class="choice-buttons corrupt" onclick="sendPlayerChoice('Tham Nhũng')">Tham Nhũng</button><button class="choice-buttons blank" onclick="sendPlayerChoice('Phiếu Trống')">Phiếu Trống</button>`;
    logMessage('info', `--- Vòng ${data.roundNumber} bắt đầu! Hãy đưa ra lựa chọn của bạn. ---`);

    let t = data.duration;
    state.countdownTimer = setInterval(() => {
        t--; const timerEl = document.getElementById('timer-display');
        if (timerEl) timerEl.textContent = t >= 0 ? t : 0;
        if (t < 0) clearInterval(state.countdownTimer);
    }, 1000);
});

socket.on('playerChose', playerId => { const card = document.getElementById(`player-card-${playerId}`); if (card) { const a = card.querySelector('.chosen-action'); a.textContent = '✅ Đã chọn!'; a.className = 'chosen-action info'; } });
socket.on('decreeRevealed', data => { playSound('decree.mp3'); gameElements.decreeTitle.textContent = data.decree.name; gameElements.decreeDescription.textContent = data.decree.description; gameElements.decreeDisplay.style.display = 'block'; logMessage('warning', `📜 **${data.drawerName}** đã bốc được Sắc Lệnh: **${data.decree.name}**!`); });
socket.on('chaosPhaseStarted', data => { state.gamePhase = 'chaos'; gameElements.phaseTitle.textContent = "Bước 2: Giai Đoạn Hỗn Loạn!"; gameElements.choiceButtons.innerHTML = ''; gameElements.chaosControls.style.display = 'block'; const totalPlayers = state.players.filter(p => !p.disconnected).length; let h = `<div id="timer-display">${data.duration}</div><div class="chaos-actions"><button id="challenge-btn" onclick="showTargetSelection('challenge')">Thách Đấu</button><button id="teamup-btn" onclick="showTargetSelection('teamup')">Ghép Đội</button></div><button id="skip-chaos-btn" class="skip-button" onclick="voteToSkipChaos()">Bỏ Qua <span id="skip-vote-count">(0/${totalPlayers})</span></button>`; gameElements.chaosControls.innerHTML = h; let t = data.duration; clearInterval(state.countdownTimer); state.countdownTimer = setInterval(() => { t--; const timerEl = document.getElementById('timer-display'); if (timerEl) timerEl.textContent = t >= 0 ? t : 0; if (t < 0) clearInterval(state.countdownTimer); }, 1000); });
socket.on('chaosActionResolved', data => { state.gamePhase = 'reveal_pending'; clearInterval(state.countdownTimer); gameElements.chaosControls.style.display = 'none'; gameElements.phaseTitle.textContent = "Hỗn loạn kết thúc!"; logMessage('warning', data.message); closeModal(); });
socket.on('updateSkipVoteCount', (count, total) => { const countEl = document.getElementById('skip-vote-count'); if(countEl) countEl.textContent = `(${count}/${total})`; });
socket.on('updateScores', updatedPlayers => { updatedPlayers.forEach(p => { const scoreEl = document.querySelector(`#player-card-${p.id} .player-score`); if (scoreEl) scoreEl.textContent = p.score; }); });
socket.on('roundResult', data => { state.gamePhase = 'reveal'; gameElements.phaseTitle.textContent = 'Bước 3: Công Bố Kết Quả Vòng'; gameElements.choiceButtons.innerHTML = ''; const { finalVoteCounts: counts } = data; logMessage('info', `Kết quả: ${counts['Cống Hiến'] || 0} Cống Hiến, ${counts['Tham Nhũng'] || 0} Tham Nhũng, ${counts['Phiếu Trống'] || 0} Phiếu Trống.`); data.results.messages.forEach(msg => logMessage('info', msg)); data.players.forEach(p => { const card = document.getElementById(`player-card-${p.id}`); if (card) { const change = data.results.scoreChanges[p.id] || 0; if (change > 0) { playSound('success.mp3'); logMessage('success', `👍 ${p.name} được +${change} điểm.`); } else if (change < 0) { playSound('error.mp3'); logMessage('error', `👎 ${p.name} bị ${change} điểm.`); } const a = card.querySelector('.chosen-action'); a.textContent = `Chọn: ${p.chosenAction || 'Không rõ'}`; a.className = `chosen-action ${getChoiceClass(p.chosenAction)}`; const s = card.querySelector('.player-score'); s.textContent = p.score; s.classList.add(change > 0 ? 'score-up' : 'score-down'); setTimeout(() => s.classList.remove('score-up', 'score-down'), 1000); } }); });
socket.on('promptNextRound', () => { gameElements.choiceButtons.innerHTML = `<button class="skip-button" onclick="socket.emit('nextRound', state.currentRoomCode)">Bắt đầu vòng tiếp theo</button>`; });
socket.on('gameOver', data => { state.gamePhase = 'gameover'; gameElements.phaseTitle.textContent = '🏆 TRÒ CHƠI KẾT THÚC 🏆'; gameElements.choiceButtons.innerHTML = ''; let message = ''; if (data.winner) { message = `🎉 **${data.winner.name}** đã chiến thắng! 🎉`; } else if (data.loser) { message = `☠️ **${data.loser.name}** đã thất bại! ☠️`; } logMessage('warning', message); let finalHTML = `<h2 class="warning">${message}</h2>`; if (state.myId === state.currentHostId) { finalHTML += `<button class="skip-button" onclick="socket.emit('playAgain', state.currentRoomCode)">Chơi Lại</button>`; } else { finalHTML += `<p class="info">Đang chờ chủ phòng bắt đầu ván mới...</p>`; } gameElements.choiceButtons.innerHTML = finalHTML; });
socket.on('actionsSwapped', data => logMessage('warning', data.message));
socket.on('promptAmnesiaAction', data => { let c = '<h4>Chọn 2 người chơi để hoán đổi:</h4><div class="player-selection-grid">'; data.players.forEach(p => c += `<button id="amnesia-target-${p.id}" onclick="selectAmnesiaTarget('${p.id}')">${p.name}</button>`); c += '</div><p id="amnesia-status">Đã chọn: (Chưa ai)</p><button id="amnesia-confirm-btn" disabled>Xác nhận</button>'; createModal("Quyền Năng Mất Trí", c); });
socket.on('playerDisconnected', data => { logMessage('error', `Người chơi ${data.newName} đã mất kết nối.`); const c = document.getElementById(`player-card-${data.playerId}`); if (c) { c.querySelector('h3').textContent = data.newName; c.classList.add('disconnected'); } });

// --- VII. Functions Called by Inline JS ---
function sendPlayerChoice(choice) { playSound('click.mp3'); gameElements.choiceButtons.innerHTML = '<p class="info">Đã gửi lựa chọn! Đang chờ...</p>'; socket.emit('playerChoice', { roomCode: state.currentRoomCode, choice }); }
function showTargetSelection(actionType) { playSound('click.mp3'); let t = actionType === 'challenge' ? 'Thách Đấu Ai?' : 'Ghép Đội Với Ai?'; let c = '<div class="player-selection-grid">'; state.players.forEach(p => { if (p.id !== state.myId && !p.disconnected) c += `<button onclick="requestChaosAction('${p.id}', '${actionType}')">${p.name}</button>`; }); c += '</div>'; createModal(t, c); }
function requestChaosAction(targetId, actionType) { playSound('click.mp3'); if (actionType === 'challenge') { let g = `<p>Bạn thách đấu <strong>${state.players.find(p=>p.id===targetId).name}</strong>. Đoán:</p><button class="choice-buttons loyal" onclick="submitChallengeGuess('${targetId}', 'Cống Hiến')">Cống Hiến</button><button class="choice-buttons corrupt" onclick="submitChallengeGuess('${targetId}', 'Tham Nhũng')">Tham Nhũng</button><button class="choice-buttons blank" onclick="submitChallengeGuess('${targetId}', 'Phiếu Trống')">Phiếu Trống</button>`; createModal("Đưa Ra Phán Đoán", g); } else { socket.emit('requestChaosAction', { roomCode: state.currentRoomCode, targetId, actionType }); closeModal(); } }
function submitChallengeGuess(targetId, guess) { playSound('click.mp3'); socket.emit('requestChaosAction', { roomCode: state.currentRoomCode, targetId, actionType: 'challenge', guess }); closeModal(); }
function voteToSkipChaos() { playSound('click.mp3'); socket.emit('playerVotedToSkip', state.currentRoomCode); const b = document.getElementById('skip-chaos-btn'); if (b) { b.disabled = true; b.textContent = 'Đã bỏ phiếu...'; } }
function kickPlayer(playerId) { if (confirm("Bạn có chắc muốn kick người chơi này?")) socket.emit('kickPlayer', { roomCode: state.currentRoomCode, playerId }); }
function selectAmnesiaTarget(playerId) { playSound('click.mp3'); if (!window.amnesiaSelection) window.amnesiaSelection = []; const i = window.amnesiaSelection.indexOf(playerId); if (i > -1) { window.amnesiaSelection.splice(i, 1); document.getElementById(`amnesia-target-${playerId}`).classList.remove('selected'); } else if (window.amnesiaSelection.length < 2) { window.amnesiaSelection.push(playerId); document.getElementById(`amnesia-target-${playerId}`).classList.add('selected'); } document.getElementById('amnesia-status').textContent = `Đã chọn: ${window.amnesiaSelection.map(id => state.players.find(p=>p.id===id).name).join(', ') || '(Chưa ai)'}`; const b = document.getElementById('amnesia-confirm-btn'); b.disabled = window.amnesiaSelection.length !== 2; b.onclick = () => { socket.emit('amnesiaAction', { roomCode: state.currentRoomCode, player1Id: window.amnesiaSelection[0], player2Id: window.amnesiaSelection[1] }); closeModal(); delete window.amnesiaSelection; }; }