let player1Position = 100;
let player2Position = window.innerWidth - 200;
let player1Speed = 0;
let player2Speed = 0;
let isPlayer1Jumping = false;
let isPlayer2Jumping = false;
let player1Y = 80;
let player2Y = 80;
let player1VerticalSpeed = 0;
let player2VerticalSpeed = 0;

const GRAVITY = 0.8;
const JUMP_STRENGTH = 15;
const GROUND_LEVEL = 80;
const PLAYER_WIDTH = 100;
const PLAYER_HEIGHT = 150;
const MOVE_SPEED = 5;

let player1Data = { vida: 100, dano: 0 };
let player2Data = { vida: 100, dano: 0 };

async function carregarPersonagens() {
    try {
        const response = await fetch('/static/personagens.json');
        const todosPersonagens = await response.json();

        const p1Id = JSON.parse(localStorage.getItem('char1'))?.id;
        const p2Id = JSON.parse(localStorage.getItem('char2'))?.id;

        const player1 = p1Id ? todosPersonagens.find(p => p.id === p1Id) : null;
        const player2 = p2Id ? todosPersonagens.find(p => p.id === p2Id) : null;

        if (player1) {
            await interpretarCode('player1', player1.code);
            document.getElementById('name1').textContent = player1.name;
        }

        if (player2) {
            await interpretarCode('player2', player2.code);
            document.getElementById('name2').textContent = player2.name;
        }
    } catch (error) {
        console.error('Erro ao carregar personagens:', error);
    }
}

async function interpretarCode(playerId, codeUrl) {
    try {
        const response = await fetch(codeUrl);
        const xmlContent = await response.text();
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, "application/xml");

        const vida = parseInt(xmlDoc.querySelector("vida")?.textContent || '100');
        const dano = parseInt(xmlDoc.querySelector("dano")?.textContent || '0');
        const sprite = xmlDoc.querySelector("sprite");
        const spriteUrl = sprite?.getAttribute("url");

        if (playerId === 'player1') {
            player1Data = { vida, dano };
        } else {
            player2Data = { vida, dano };
        }

        if (spriteUrl) {
            document.getElementById(`sprite${playerId.slice(-1)}`).src = spriteUrl;
        }

        atualizarVida(playerId.slice(-1));
    } catch (error) {
        console.error(`Erro ao interpretar código do ${playerId}:`, error);
    }
}

function atualizarVida(playerId) {
    const vida = playerId === '1' ? player1Data.vida : player2Data.vida;
    const healthFill = document.getElementById(`health${playerId}-fill`);
    healthFill.style.width = `${vida}%`;
}

function aplicarDano(atacante, defensor) {
    const dano = atacante === '1' ? player1Data.dano : player2Data.dano;
    if (defensor === '1') {
        player1Data.vida = Math.max(0, player1Data.vida - dano);
        atualizarVida('1');
    } else {
        player2Data.vida = Math.max(0, player2Data.vida - dano);
        atualizarVida('2');
    }
}

function verificarColisaoPlayers() {
    const player1 = document.getElementById('player1');
    const player2 = document.getElementById('player2');
    const p1Rect = player1.getBoundingClientRect();
    const p2Rect = player2.getBoundingClientRect();

    const colisaoHorizontal = 
        p1Rect.left < p2Rect.right && 
        p1Rect.right > p2Rect.left;
    
    const colisaoVertical = 
        p1Rect.top < p2Rect.bottom && 
        p1Rect.bottom > p2Rect.top;

    return colisaoHorizontal && colisaoVertical;
}

function atacar(tipoAtaque) {
    if (verificarColisaoPlayers()) {
        const dano = tipoAtaque === 'punch' ? player1Data.dano : player1Data.dano * 1.5;
        aplicarDano('1', '2');
    }
}

document.getElementById('punch').addEventListener('click', () => atacar('punch'));
document.getElementById('kick').addEventListener('click', () => atacar('kick'));

function pular(player) {
    if (player === 'player1' && !isPlayer1Jumping) {
        isPlayer1Jumping = true;
        player1VerticalSpeed = JUMP_STRENGTH;
    } else if (player === 'player2' && !isPlayer2Jumping) {
        isPlayer2Jumping = true;
        player2VerticalSpeed = JUMP_STRENGTH;
    }
}

function atualizarFisica() {
    const player1 = document.getElementById('player1');
    const player2 = document.getElementById('player2');

    if (isPlayer1Jumping) {
        player1VerticalSpeed -= GRAVITY;
        player1Y += player1VerticalSpeed;

        if (player1Y <= GROUND_LEVEL) {
            player1Y = GROUND_LEVEL;
            isPlayer1Jumping = false;
            player1VerticalSpeed = 0;
        }
    }

    if (isPlayer2Jumping) {
        player2VerticalSpeed -= GRAVITY;
        player2Y += player2VerticalSpeed;

        if (player2Y <= GROUND_LEVEL) {
            player2Y = GROUND_LEVEL;
            isPlayer2Jumping = false;
            player2VerticalSpeed = 0;
        }
    }

    player1Position += player1Speed;
    player2Position += player2Speed;

    player1Position = Math.max(0, Math.min(window.innerWidth - PLAYER_WIDTH, player1Position));
    player2Position = Math.max(0, Math.min(window.innerWidth - PLAYER_WIDTH, player2Position));

    if (verificarColisaoPlayers()) {
        if (player1Position < player2Position) {
            player1Position = player2Position - PLAYER_WIDTH;
            player2Position = player1Position + PLAYER_WIDTH;
        } else {
            player2Position = player1Position - PLAYER_WIDTH;
            player1Position = player2Position + PLAYER_WIDTH;
        }
    }

    player1.style.left = `${player1Position}px`;
    player1.style.bottom = `${player1Y}px`;
    player2.style.left = `${player2Position}px`;
    player2.style.bottom = `${player2Y}px`;

    player1Speed *= 0.9;
    player2Speed *= 0.9;

    requestAnimationFrame(atualizarFisica);
}

const joystick = nipplejs.create({
    zone: document.getElementById('joystick'),
    mode: 'static',
    position: { left: '50%', top: '50%' },
    color: 'white',
    size: 100
});

joystick.on('move', (evt, data) => {
    const player = document.getElementById('player1');

    if (data.direction?.angle === 'left') {
        player1Speed = -MOVE_SPEED;
        player.style.transform = 'scaleX(-1)';
    } else if (data.direction?.angle === 'right') {
        player1Speed = MOVE_SPEED;
        player.style.transform = 'scaleX(1)';
    } else if (data.direction?.angle === 'up') {
        pular('player1');
    }
});

document.addEventListener('keydown', (e) => {
    const player1 = document.getElementById('player1');
    
    switch(e.code) {
        case 'Space':
            pular('player1');
            break;
        case 'ArrowLeft':
            player1Speed = -MOVE_SPEED;
            player1.style.transform = 'scaleX(-1)';
            break;
        case 'ArrowRight':
            player1Speed = MOVE_SPEED;
            player1.style.transform = 'scaleX(1)';
            break;
    }
});

carregarPersonagens();
atualizarFisica();