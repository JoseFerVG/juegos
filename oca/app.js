// ==========================================
// EL JUEGO DE LA OCA - FINAL CUTE EDITION
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
const COLORS = ['#FF5252', '#29B6F6', '#66BB6A', '#FFB74D'];
const BOARD_SIZE = 63;
const VIRTUAL_SIZE = 1000;

const SPECIAL_SQUARES = {
    5: { type: 'OCA', title: '¡Súper Oca! 🦆', desc: 'Sigue saltando...', target: 9, extraTurn: true },
    9: { type: 'OCA', title: '¡Súper Oca! 🦆', desc: 'Sigue saltando...', target: 14, extraTurn: true },
    14: { type: 'OCA', title: '¡Súper Oca! 🦆', desc: 'Sigue saltando...', target: 18, extraTurn: true },
    18: { type: 'OCA', title: '¡Súper Oca! 🦆', desc: 'Sigue saltando...', target: 23, extraTurn: true },
    23: { type: 'OCA', title: '¡Súper Oca! 🦆', desc: 'Sigue saltando...', target: 27, extraTurn: true },
    27: { type: 'OCA', title: '¡Súper Oca! 🦆', desc: 'Sigue saltando...', target: 32, extraTurn: true },
    32: { type: 'OCA', title: '¡Súper Oca! 🦆', desc: 'Sigue saltando...', target: 36, extraTurn: true },
    36: { type: 'OCA', title: '¡Súper Oca! 🦆', desc: 'Sigue saltando...', target: 41, extraTurn: true },
    41: { type: 'OCA', title: '¡Súper Oca! 🦆', desc: 'Sigue saltando...', target: 45, extraTurn: true },
    45: { type: 'OCA', title: '¡Súper Oca! 🦆', desc: 'Sigue saltando...', target: 50, extraTurn: true },
    50: { type: 'OCA', title: '¡Súper Oca! 🦆', desc: 'Sigue saltando...', target: 54, extraTurn: true },
    54: { type: 'OCA', title: '¡Súper Oca! 🦆', desc: 'Sigue saltando...', target: 59, extraTurn: true },
    59: { type: 'OCA', title: '¡Oca!', desc: 'Ya casi eres el rey', target: 63, extraTurn: false },
    6: { type: 'PUENTE', title: '¡Puente Mágico! 🌈', desc: 'Vuelas al otro', target: 12, extraTurn: true },
    12: { type: 'PUENTE', title: '¡Puente Mágico! 🌈', desc: 'Vuelas al otro', target: 6, extraTurn: true },
    19: { type: 'POSADA', title: 'La Camita 💤', desc: 'Duermes un ratito', skipTurns: 1 },
    31: { type: 'POZO', title: 'Pozo Profundo 🕳️', desc: 'Sálvame porfiiii...', block: true },
    42: { type: 'LABERINTO', title: 'Laberinto 😵', desc: 'Uops, te mareaste', target: 30 },
    52: { type: 'CARCEL', title: 'Jaula ⛓️', desc: 'Atrapado dos turnos', skipTurns: 2 },
    58: { type: 'CALAVERA', title: '¡Pum! 💥', desc: 'A empezar de cero', target: 1 }
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
    
    GameState.players.forEach(p => {
        const cell = GameState.boardCells[1];
        if(cell) { p.visualPos.x = cell.x; p.visualPos.y = cell.y; }
    });

    requestAnimationFrame(renderLoop);
}

// ==========================================
// VIRTUAL CAMERA SPIRAL MAP
// ==========================================
const ctx = UI.boardCanvas.getContext('2d', { alpha: false });

function initBoard() {
    UI.boardCanvas.width = VIRTUAL_SIZE;
    UI.boardCanvas.height = VIRTUAL_SIZE;
    generateSquareSpiral();
}

function generateSquareSpiral() {
    GameState.boardCells = [];
    GameState.boardCells[0] = null;

    const GRID_SIZE = 8; 
    const padding = 25; 
    const innerSize = VIRTUAL_SIZE - padding * 2;
    const cellSize = innerSize / GRID_SIZE;
    
    const startX = padding;
    const startY = padding;

    let minR = 0, maxR = 7, minC = 0, maxC = 7;
    let r = 7, c = 0;
    let dirX = 1, dirY = 0;

    for (let i = 1; i <= BOARD_SIZE; i++) {
        GameState.boardCells[i] = {
            id: i,
            x: startX + c * cellSize + cellSize / 2,
            y: startY + r * cellSize + cellSize / 2,
            radius: cellSize * 0.44  // Extra fluffy fat cells
        };
        
        let nextC = c + dirX;
        let nextR = r + dirY;
        
        if (nextC > maxC || nextC < minC || nextR > maxR || nextR < minR) {
            if (dirX === 1 && dirY === 0) { dirX = 0; dirY = -1; maxR--; }      
            else if (dirX === 0 && dirY === -1) { dirX = -1; dirY = 0; maxC--; } 
            else if (dirX === -1 && dirY === 0) { dirX = 0; dirY = 1; minR++; } 
            else if (dirX === 0 && dirY === 1) { dirX = 1; dirY = 0; minC++; }  
            
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
        showMessage('Durmiendo... 💤', `${player.name} pasa el turno.`);
        return setTimeout(() => { hideMessage(); passTurn(); }, 1500);
    }
    
    if (player.isBlocked) {
        showMessage('Pozo Atrapador 🕳️', `Alguien te tiene que salvar.`);
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
            }, 600);
        }
    }, 70);
}

function updateHUD() {
    const player = GameState.players[GameState.currentPlayerIndex];
    document.getElementById('current-player-skin').textContent = player.skin;
    document.getElementById('current-player-avatar').style.borderColor = player.color;
    document.getElementById('current-player-name').textContent = player.name;
    
    UI.rollBtn.style.backgroundColor = player.color;
    // Bubbly soft outline
    UI.rollBtn.style.borderColor = '#FFF'; 
    UI.rollBtn.style.boxShadow = '0 6px 15px rgba(0,0,0,0.1), 0 0 0 4px ' + player.color; 
    UI.rollBtn.classList.remove('disabled');
    
    if(player.skipTurns > 0 || player.isBlocked) {
       UI.rollBtn.querySelector('.btn-text').textContent = 'PASAR';
    } else {
       UI.rollBtn.querySelector('.btn-text').textContent = '¡A JUGAR!';
    }
}

function passTurn() {
    const win = GameState.players.find(p => p.pos === 63);
    if(win) {
        showMessage('¡TÚ GANAS!', `¡Hurra por ${win.name} 🏆!`, true);
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
                activePath = [rule.target]; 
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
        }, 1600); 
    } else {
        passTurn();
    }
}

function showMessage(title, desc, persistent = false) {
    UI.messageTitle.textContent = title;
    UI.messageDesc.textContent = desc;
    UI.messageOverlay.classList.remove('hidden');
}
function hideMessage() {
    UI.messageOverlay.classList.add('hidden');
}

// ==========================================
// RENDER LOOP (CUTE & BUBBLY GRAPHICS)
// ==========================================
let lastTime = 0;

function renderLoop(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;

    // Draw bright background for canvas
    ctx.fillStyle = '#E1F5FE'; // Light baby blue
    ctx.beginPath();
    ctx.roundRect(0, 0, VIRTUAL_SIZE, VIRTUAL_SIZE, 30);
    ctx.fill();

    // Dibuja la línea gorda y redonda
    if (GameState.boardCells.length > 2) {
        ctx.beginPath();
        ctx.strokeStyle = '#B3E5FC'; // Super bright sky blue path
        ctx.lineWidth = 55;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.moveTo(GameState.boardCells[1].x, GameState.boardCells[1].y);
        for (let i = 2; i <= BOARD_SIZE; i++) {
            ctx.lineTo(GameState.boardCells[i].x, GameState.boardCells[i].y);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 10;
        ctx.lineJoin = 'round';
        ctx.setLineDash([20, 30]);
        ctx.moveTo(GameState.boardCells[1].x, GameState.boardCells[1].y);
        for (let i = 2; i <= BOARD_SIZE; i++) {
            ctx.lineTo(GameState.boardCells[i].x, GameState.boardCells[i].y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Dibujar Casillas Muy Bubbly
    for (let i = 1; i <= BOARD_SIZE; i++) {
        const cell = GameState.boardCells[i];
        if (!cell) continue;

        ctx.beginPath();
        ctx.arc(cell.x, cell.y, cell.radius, 0, Math.PI * 2);
        
        let color = '#FFF9C4'; 
        let bColor = '#FFE082'; 
        
        if (i === 1) { color = '#C8E6C9'; bColor = '#A5D6A7'; } // Mint Green Entry
        else if (i === BOARD_SIZE) { color = '#FFF59D'; bColor = '#FFD54F'; } // Yellow Goal
        else if (SPECIAL_SQUARES[i]) {
             if (SPECIAL_SQUARES[i].type === 'OCA') { color = '#FFCC80'; bColor = '#FFA726'; } // Orange Goose
             else if (SPECIAL_SQUARES[i].type === 'PUENTE') { color = '#B3E5FC'; bColor = '#4FC3F7'; } // Blue Bridge
             else if (SPECIAL_SQUARES[i].type === 'CALAVERA') { color = '#F5F5F5'; bColor = '#E0E0E0'; } 
             else { color = '#E1BEE7'; bColor = '#CE93D8'; } // Pinks
        }

        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = bColor;
        ctx.lineWidth = 8;
        ctx.stroke();

        // Cute highlight inner rim
        ctx.beginPath();
        ctx.arc(cell.x, cell.y, cell.radius - 8, 0, Math.PI, true);
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#5D4037';
        const fontSize = cell.radius * 0.9;
        ctx.font = `bold ${fontSize}px Fredoka, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let dispText = i;
        if(i === 63) dispText = '👑';
        else if (SPECIAL_SQUARES[i]) {
            if (SPECIAL_SQUARES[i].type === 'OCA') dispText = '🦆';
            else if (SPECIAL_SQUARES[i].type === 'PUENTE') dispText = '🌈';
            else if (SPECIAL_SQUARES[i].type === 'CALAVERA') dispText = '👻';
            else if (SPECIAL_SQUARES[i].type === 'POSADA') dispText = '💤';
            else if (SPECIAL_SQUARES[i].type === 'POZO') dispText = '🕳️';
            else if (SPECIAL_SQUARES[i].type === 'LABERINTO') dispText = '😵';
            else if (SPECIAL_SQUARES[i].type === 'CARCEL') dispText = '⛓️';
        }
        ctx.fillText(dispText, cell.x, cell.y + (dispText == i ? 5 : 0));
    }

    if (animatingPlayer && activePath.length > 0) {
        const targetInd = activePath[pathIndex];
        const targetCell = GameState.boardCells[targetInd];
        
        if(targetCell) {
            const speed = 700 * dt; // bouncy fast speed
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

    const grouped = {};
    GameState.players.forEach(p => {
        const posKey = p === animatingPlayer ? 'anim' : p.pos;
        if (!grouped[posKey]) grouped[posKey] = [];
        grouped[posKey].push(p);
    });

    GameState.players.forEach(p => {
        let {x, y} = p.visualPos;
        let pSize = 34; // HUGE cute pieces

        const myGroup = p === animatingPlayer ? [] : grouped[p.pos];
        if (myGroup && myGroup.length > 1) {
            const index = myGroup.indexOf(p);
            const total = myGroup.length;
            const angle = (index / total) * Math.PI * 2;
            const distance = pSize * 0.8;
            x += Math.cos(angle) * distance;
            y += Math.sin(angle) * distance;
            pSize *= 0.75;
        }

        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 6;
        
        ctx.beginPath();
        ctx.arc(x, y, pSize, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF'; // White bubbles
        ctx.fill();
        
        ctx.shadowColor = 'transparent';
        ctx.lineWidth = 6;
        ctx.strokeStyle = p.color;
        ctx.stroke();

        ctx.fillStyle = '#000';
        ctx.font = `${pSize * 1.5}px sans-serif`;
        ctx.fillText(p.skin, x, y + pSize * 0.15);
    });

    requestAnimationFrame(renderLoop);
}

// Iniciar app
initSetup();
