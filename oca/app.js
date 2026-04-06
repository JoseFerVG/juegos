// ==========================================
// EL JUEGO DE LA OCA - FINAL DEFINITIVE EDITION
// (Virtual Camera & Perfect Geometry Spiral)
// ==========================================

const UI = {
    setupScreen: document.getElementById('setup-screen'),
    gameScreen: document.getElementById('game-screen'),
    playersForms: document.getElementById('players-forms'),
    startBtn: document.getElementById('start-btn'),
    playersToggle: document.querySelectorAll('#players-toggle .toggle-btn'),
    diceToggle: document.querySelectorAll('#dice-toggle .toggle-btn'),
    rollBtn: document.getElementById('roll-btn'),
    diceOverlay: document.getElementById('dice-overlay'),
    dice1: document.getElementById('dice-1'),
    dice2: document.getElementById('dice-2'),
    boardCanvas: document.getElementById('board-canvas'),
    messageOverlay: document.getElementById('message-overlay'),
    messageTitle: document.getElementById('message-title'),
    messageDesc: document.getElementById('message-desc'),
    restartBtn: document.getElementById('restart-game-btn')
};

const SKINS = ['🦆', '🐸', '🦄', '🐶', '🐱', '🦖', '🐻', '🐼', '🦊', '🐢'];
const COLORS = ['#F44336', '#2196F3', '#4CAF50', '#FF9800'];
const BOARD_SIZE = 63;
const VIRTUAL_SIZE = 1000;

const SPECIAL_SQUARES = {
    5: { type: 'OCA', title: 'Oca', desc: 'Tiras porque te toca', target: 9, extraTurn: true },
    9: { type: 'OCA', title: 'Oca', desc: 'Tiras porque te toca', target: 14, extraTurn: true },
    14: { type: 'OCA', title: 'Oca', desc: 'Tiras porque te toca', target: 18, extraTurn: true },
    18: { type: 'OCA', title: 'Oca', desc: 'Tiras porque te toca', target: 23, extraTurn: true },
    23: { type: 'OCA', title: 'Oca', desc: 'Tiras porque te toca', target: 27, extraTurn: true },
    27: { type: 'OCA', title: 'Oca', desc: 'Tiras porque te toca', target: 32, extraTurn: true },
    32: { type: 'OCA', title: 'Oca', desc: 'Tiras porque te toca', target: 36, extraTurn: true },
    36: { type: 'OCA', title: 'Oca', desc: 'Tiras porque te toca', target: 41, extraTurn: true },
    41: { type: 'OCA', title: 'Oca', desc: 'Tiras porque te toca', target: 45, extraTurn: true },
    45: { type: 'OCA', title: 'Oca', desc: 'Tiras porque te toca', target: 50, extraTurn: true },
    50: { type: 'OCA', title: 'Oca', desc: 'Tiras porque te toca', target: 54, extraTurn: true },
    54: { type: 'OCA', title: 'Oca', desc: 'Tiras porque te toca', target: 59, extraTurn: true },
    59: { type: 'OCA', title: 'Oca', desc: 'Tiras porque te toca', target: 63, extraTurn: false },
    6: { type: 'PUENTE', title: 'Puente', desc: 'Saltas al otro puente', target: 12, extraTurn: true },
    12: { type: 'PUENTE', title: 'Puente', desc: 'Saltas al puente 6', target: 6, extraTurn: true },
    19: { type: 'POSADA', title: 'Posada 🛌', desc: 'Descansas un turno', skipTurns: 1 },
    31: { type: 'POZO', title: 'Pozo 🕳️', desc: 'Atrapado hasta que vengan', block: true },
    42: { type: 'LABERINTO', title: 'Laberinto 🌀', desc: 'Te pierdes. Al 30', target: 30 },
    52: { type: 'CARCEL', title: 'Cárcel ⛓️', desc: 'Pierdes 2 turnos', skipTurns: 2 },
    58: { type: 'CALAVERA', title: 'Calavera 💀', desc: 'Al inicio.', target: 1 }
};

let GameState = {
    phase: 'SETUP',
    numPlayers: 2,
    numDice: 1,
    players: [],
    currentPlayerIndex: 0,
    boardCells: []
};

// ==========================================
// INIT & SETUP
// ==========================================
function initSetup() {
    setupPlayerForms(2);
    
    UI.playersToggle.forEach(btn => {
        btn.addEventListener('click', (e) => {
            UI.playersToggle.forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
            GameState.numPlayers = parseInt(e.target.dataset.value);
            setupPlayerForms(GameState.numPlayers);
        });
    });

    UI.diceToggle.forEach(btn => {
        btn.addEventListener('click', (e) => {
            UI.diceToggle.forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
            GameState.numDice = parseInt(e.target.dataset.value);
        });
    });

    UI.startBtn.addEventListener('click', startGame);
    UI.restartBtn.addEventListener('click', () => location.reload());
}

function setupPlayerForms(n) {
    UI.playersForms.innerHTML = '';
    for(let i=0; i<n; i++) {
        const row = document.createElement('div');
        row.className = 'player-form-row';
        row.innerHTML = `
            <div class="skin-selector" id="skin-btn-${i}" data-skin-idx="${i}">${SKINS[i]}</div>
            <input type="text" class="name-input" id="player-name-${i}" placeholder="Jugador ${i+1}" value="Jugador ${i+1}">
        `;
        UI.playersForms.appendChild(row);
        
        document.getElementById(`skin-btn-${i}`).addEventListener('click', function() {
            let idx = parseInt(this.dataset.skinIdx);
            idx = (idx + 1) % SKINS.length;
            this.dataset.skinIdx = idx;
            this.textContent = SKINS[idx];
        });
    }
}

function startGame() {
    GameState.players = [];
    for(let i=0; i<GameState.numPlayers; i++) {
        const input = document.getElementById(`player-name-${i}`);
        const skinBtn = document.getElementById(`skin-btn-${i}`);
        GameState.players.push({
            id: i,
            name: input.value.trim() || `Jugador ${i+1}`,
            skin: skinBtn.textContent,
            color: COLORS[i % COLORS.length],
            pos: 1,
            visualPos: { x: 0, y: 0 },
            skipTurns: 0,
            isBlocked: false,
            isWinner: false
        });
    }
    
    if(GameState.numDice === 2) UI.dice2.classList.remove('hidden');
    else UI.dice2.classList.add('hidden');

    UI.setupScreen.classList.remove('active');
    UI.gameScreen.classList.add('active');
    GameState.phase = 'IDLE';
    
    initBoard();
    updateHUD();
    
    // Position Pieces
    GameState.players.forEach(p => {
        const cell = GameState.boardCells[1];
        if(cell) { p.visualPos.x = cell.x; p.visualPos.y = cell.y; }
    });

    requestAnimationFrame(renderLoop);
}

// ==========================================
// VIRTUAL CAMERA SPIRAL MAP (100% Unbreakable geometry)
// ==========================================
const ctx = UI.boardCanvas.getContext('2d', { alpha: false });

function initBoard() {
    // 1. Establish Virtual Size. 
    // The CSS logic dynamically scales this virtual box without altering our pixels or coordinates.
    UI.boardCanvas.width = VIRTUAL_SIZE;
    UI.boardCanvas.height = VIRTUAL_SIZE;
    
    generateSquareSpiral();
}

function generateSquareSpiral() {
    GameState.boardCells = [];
    GameState.boardCells[0] = null;

    // An 8x8 Concentric Grid perfectly fits exactly 64 items (63 is our target)
    const GRID_SIZE = 8; 
    const padding = 20; // Internal padding
    const innerSize = VIRTUAL_SIZE - padding * 2;
    const cellSize = innerSize / GRID_SIZE;
    
    const startX = padding;
    const startY = padding;

    // Spiral tracking bounds
    let minR = 0, maxR = 7, minC = 0, maxC = 7;
    // We start visually around the Bottom-Left
    let r = 7, c = 0;
    // Move Right initially
    let dirX = 1, dirY = 0;

    for (let i = 1; i <= BOARD_SIZE; i++) {
        GameState.boardCells[i] = {
            id: i,
            x: startX + c * cellSize + cellSize / 2,
            y: startY + r * cellSize + cellSize / 2,
            radius: cellSize * 0.42 
        };
        
        let nextC = c + dirX;
        let nextR = r + dirY;
        
        if (nextC > maxC || nextC < minC || nextR > maxR || nextR < minR) {
            // Turn Action
            if (dirX === 1 && dirY === 0) { 
                dirX = 0; dirY = -1; maxR--;  // Hit right bound -> Turn Up
            }      
            else if (dirX === 0 && dirY === -1) { 
                dirX = -1; dirY = 0; maxC--;  // Hit top bound -> Turn Left
            } 
            else if (dirX === -1 && dirY === 0) { 
                dirX = 0; dirY = 1; minR++;   // Hit left bound -> Turn Down
            } 
            else if (dirX === 0 && dirY === 1) { 
                dirX = 1; dirY = 0; minC++;   // Hit bottom bound -> Turn Right
            }  
            
            nextC = c + dirX;
            nextR = r + dirY;
        }
        c = nextC;
        r = nextR;
    }
}

// ==========================================
// TURN LOGIC
// ==========================================
UI.rollBtn.addEventListener('click', () => {
    if (GameState.phase !== 'IDLE') return;
    
    const player = GameState.players[GameState.currentPlayerIndex];
    if(player.isWinner) return passTurn();
    
    if (player.skipTurns > 0) {
        player.skipTurns--;
        showMessage('Zzz...', `${player.name} pierde este turno.`);
        return setTimeout(() => { hideMessage(); passTurn(); }, 1500);
    }
    
    if (player.isBlocked) {
        showMessage('En el Pozo 🕳️', `Alguien debe caer para rescatar a ${player.name}.`);
        return setTimeout(() => { hideMessage(); passTurn(); }, 1500);
    }

    rollDice();
});

function rollDice() {
    GameState.phase = 'ANIMATING_DICE';
    UI.diceOverlay.classList.remove('hidden');
    UI.rollBtn.classList.add('disabled');
    
    let rolls = 0;
    let v1 = 1, v2 = 1;
    const diceChars = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

    const rollInt = setInterval(() => {
        v1 = Math.floor(Math.random() * 6) + 1;
        UI.dice1.textContent = diceChars[v1-1];
        
        if (GameState.numDice === 2) {
            v2 = Math.floor(Math.random() * 6) + 1;
            UI.dice2.textContent = diceChars[v2-1];
        }

        rolls++;
        if (rolls >= 10) {
            clearInterval(rollInt);
            let result = GameState.numDice === 2 ? (v1 + v2) : v1;
            setTimeout(() => {
                UI.diceOverlay.classList.add('hidden');
                movePlayer(result);
            }, 500);
        }
    }, 60);
}

function updateHUD() {
    const player = GameState.players[GameState.currentPlayerIndex];
    document.getElementById('current-player-skin').textContent = player.skin;
    document.getElementById('current-player-avatar').style.borderColor = player.color;
    document.getElementById('current-player-name').textContent = player.name;
    
    UI.rollBtn.style.backgroundColor = player.color;
    UI.rollBtn.style.borderColor = '#1E2A38'; 
    UI.rollBtn.classList.remove('disabled');
    
    if(player.skipTurns > 0 || player.isBlocked) {
       UI.rollBtn.querySelector('.btn-text').textContent = 'SALTAR TURNO';
    } else {
       UI.rollBtn.querySelector('.btn-text').textContent = 'TIRAR DADOS';
    }
}

function passTurn() {
    const win = GameState.players.find(p => p.pos === 63);
    if(win) {
        showMessage('¡GANADOR!', `¡Felicidades ${win.name} 🏆!`, true);
        GameState.phase = 'END';
        UI.rollBtn.classList.add('disabled');
        return;
    }
    GameState.currentPlayerIndex = (GameState.currentPlayerIndex + 1) % GameState.numPlayers;
    updateHUD();
    GameState.phase = 'IDLE';
}

// ==========================================
// MOVEMENT ENGINE
// ==========================================
let activePath = [];
let pathIndex = 0;
let animatingPlayer = null;
let currentTargetCallback = null;

function movePlayer(diceVal) {
    GameState.phase = 'ANIMATING_PIECE';
    const player = GameState.players[GameState.currentPlayerIndex];
    
    let currentPos = player.pos;
    let targetPos = currentPos + diceVal;
    
    if (targetPos > 63) {
        const excess = targetPos - 63;
        targetPos = 63 - excess;
        activePath = [];
        for(let i=currentPos+1; i<=63; i++) activePath.push(i);
        for(let i=62; i>=targetPos; i--) activePath.push(i);
    } else {
        activePath = [];
        for(let i=currentPos+1; i<=targetPos; i++) activePath.push(i);
    }
    animatingPlayer = player;
    pathIndex = 0;
    currentTargetCallback = () => resolveCellSquare(targetPos);
}

function resolveCellSquare(cellIndex) {
    const player = GameState.players[GameState.currentPlayerIndex];
    player.pos = cellIndex;
    animatingPlayer = null;
    
    // Pozo release
    GameState.players.forEach(p => {
        if (p !== player && p.pos === 31 && cellIndex === 31) p.isBlocked = false;
    });

    const rule = SPECIAL_SQUARES[cellIndex];
    if (rule) {
        showMessage(rule.title, rule.desc);
        setTimeout(() => {
            hideMessage();
            if (rule.target) {
                animatingPlayer = player;
                activePath = [rule.target]; // Direct Teleport Frame
                pathIndex = 0;
                currentTargetCallback = () => {
                    player.pos = rule.target;
                    animatingPlayer = null;
                    if(rule.extraTurn) { GameState.phase = 'IDLE'; updateHUD(); } 
                    else { passTurn(); }
                };
            } else {
                if (rule.skipTurns) player.skipTurns = rule.skipTurns;
                if (rule.block) player.isBlocked = true;
                if (rule.extraTurn) { GameState.phase = 'IDLE'; updateHUD(); } 
                else { passTurn(); }
            }
        }, 1500); // Shorter pause
    } else {
        passTurn();
    }
}

// UI Helpers
function showMessage(title, desc, persistent = false) {
    UI.messageTitle.textContent = title;
    UI.messageDesc.textContent = desc;
    UI.messageOverlay.classList.remove('hidden');
}
function hideMessage() {
    UI.messageOverlay.classList.add('hidden');
}

// ==========================================
// RENDER LOOP
// ==========================================
let lastTime = 0;

function renderLoop(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;

    // The canvas is fully opaque via CSS background-color, but we clear anyway
    ctx.clearRect(0, 0, VIRTUAL_SIZE, VIRTUAL_SIZE);

    // Dibuja la línea de trazado
    if (GameState.boardCells.length > 2) {
        ctx.beginPath();
        ctx.strokeStyle = '#D7CCC8';
        ctx.lineWidth = 35;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.moveTo(GameState.boardCells[1].x, GameState.boardCells[1].y);
        for (let i = 2; i <= BOARD_SIZE; i++) {
            ctx.lineTo(GameState.boardCells[i].x, GameState.boardCells[i].y);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = '#A1887F';
        ctx.lineWidth = 6;
        ctx.lineJoin = 'round';
        ctx.setLineDash([15, 20]);
        ctx.moveTo(GameState.boardCells[1].x, GameState.boardCells[1].y);
        for (let i = 2; i <= BOARD_SIZE; i++) {
            ctx.lineTo(GameState.boardCells[i].x, GameState.boardCells[i].y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Dibujar Casillas
    for (let i = 1; i <= BOARD_SIZE; i++) {
        const cell = GameState.boardCells[i];
        if (!cell) continue;

        ctx.beginPath();
        ctx.arc(cell.x, cell.y, cell.radius, 0, Math.PI * 2);
        
        let color = '#FFF9C4'; 
        let bColor = '#FBC02D'; 
        
        if (i === 1) { color = '#A5D6A7'; bColor = '#388E3C'; }
        else if (i === BOARD_SIZE) { color = '#FFE082'; bColor = '#FF8F00'; }
        else if (SPECIAL_SQUARES[i]) {
             if (SPECIAL_SQUARES[i].type === 'OCA') { color = '#FFCC80'; bColor = '#EF6C00'; }
             else if (SPECIAL_SQUARES[i].type === 'PUENTE') { color = '#81D4FA'; bColor = '#0288D1'; }
             else if (SPECIAL_SQUARES[i].type === 'CALAVERA') { color = '#EEEEEE'; bColor = '#424242'; }
             else { color = '#CE93D8'; bColor = '#8E24AA'; } // Posadas, carcel, etc.
        }

        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = bColor;
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.fillStyle = '#4E342E';
        const fontSize = cell.radius * 0.8;
        ctx.font = `bold ${fontSize}px Fredoka, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let dispText = i;
        if(i === 63) dispText = '🏆';
        else if (SPECIAL_SQUARES[i]) {
            if (SPECIAL_SQUARES[i].type === 'OCA') dispText = '🦆';
            else if (SPECIAL_SQUARES[i].type === 'PUENTE') dispText = '🌉';
            else if (SPECIAL_SQUARES[i].type === 'CALAVERA') dispText = '💀';
            else if (SPECIAL_SQUARES[i].type === 'POSADA') dispText = '🛌';
            else if (SPECIAL_SQUARES[i].type === 'POZO') dispText = '🕳️';
            else if (SPECIAL_SQUARES[i].type === 'LABERINTO') dispText = '🌀';
            else if (SPECIAL_SQUARES[i].type === 'CARCEL') dispText = '⛓️';
        }
        ctx.fillText(dispText, cell.x, cell.y + (dispText == i ? 3 : 0));
    }

    // Animación de jugadores (Velocidad constante ajustada al Virtual Space)
    if (animatingPlayer && activePath.length > 0) {
        const targetInd = activePath[pathIndex];
        const targetCell = GameState.boardCells[targetInd];
        
        if(targetCell) {
            const speed = 600 * dt; // Units per second
            const dx = targetCell.x - animatingPlayer.visualPos.x;
            const dy = targetCell.y - animatingPlayer.visualPos.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < 10) {
                animatingPlayer.visualPos.x = targetCell.x;
                animatingPlayer.visualPos.y = targetCell.y;
                pathIndex++;
                if (pathIndex >= activePath.length) currentTargetCallback();
            } else {
                animatingPlayer.visualPos.x += (dx / dist) * speed;
                animatingPlayer.visualPos.y += (dy / dist) * speed;
            }
        }
    }

    // Dibujar Fichas (Skins) con colisiones visuales
    const grouped = {};
    GameState.players.forEach(p => {
        const posKey = p === animatingPlayer ? 'anim' : p.pos;
        if (!grouped[posKey]) grouped[posKey] = [];
        grouped[posKey].push(p);
    });

    GameState.players.forEach(p => {
        let {x, y} = p.visualPos;
        let pSize = 24;

        const myGroup = p === animatingPlayer ? [] : grouped[p.pos];
        if (myGroup && myGroup.length > 1) {
            const index = myGroup.indexOf(p);
            const total = myGroup.length;
            const angle = (index / total) * Math.PI * 2;
            const distance = pSize * 0.9;
            x += Math.cos(angle) * distance;
            y += Math.sin(angle) * distance;
            pSize *= 0.85;
        }

        ctx.beginPath();
        ctx.arc(x, y, pSize, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();

        ctx.fillStyle = '#000';
        ctx.font = `${pSize * 1.3}px sans-serif`;
        ctx.fillText(p.skin, x, y + pSize * 0.15);
    });

    requestAnimationFrame(renderLoop);
}

// Iniciar app
initSetup();
