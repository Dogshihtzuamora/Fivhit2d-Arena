const CONFIG = {
    GRAVITY: 0.8,
    JUMP_STRENGTH: 15,
    GROUND_LEVEL: 80,
    PLAYER_WIDTH: 100,
    PLAYER_HEIGHT: 150,
    MOVE_SPEED: 5
};

const players = {
    player1: {
        position: 100,
        speed: 0,
        y: 80,
        verticalSpeed: 0,
        isJumping: false,
        data: { vida: 0, dano: 0 },
        sprites: {}
    },
    player2: {
        position: window.innerWidth - 200,
        speed: 0,
        y: 80,
        verticalSpeed: 0,
        isJumping: false,
        data: { vida: 0, dano: 0 },
        sprites: {}
    }
};

async function carregarPersonagens() {
    try {
        const response = await fetch('/static/personagens.json');
        const todosPersonagens = await response.json();

        const playerIds = ['char1', 'char2'].map(key => 
            JSON.parse(localStorage.getItem(key))?.id
        );

        playerIds.forEach((playerId, index) => {
            const player = playerId ? todosPersonagens.find(p => p.id === playerId) : null;
            if (player) {
                const playerNum = index + 1;
                const foto = document.getElementById(`foto${playerNum}`);
                foto.src = player.image;
                foto.alt = player.name;
                document.getElementById(`name${playerNum}`).textContent = player.name;
                
                interpretarCode(`player${playerNum}`, player.code);
            }
        });
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

        const playerIndex = playerId.slice(-1);
        players[playerId].data.vida = parseInt(xmlDoc.querySelector("vida")?.textContent || '100');
        players[playerId].data.dano = parseInt(xmlDoc.querySelector("dano")?.textContent || '0');

        const sprites = xmlDoc.querySelectorAll("sprite");
        players[playerId].sprites = {};
        sprites.forEach(sprite => {
            const url = sprite.getAttribute("url");
            const acao = sprite.getAttribute("acao");
            players[playerId].sprites[acao] = url;
        });

        const spriteParado = players[playerId].sprites["parado"];
        if (spriteParado) {
            document.getElementById(`sprite${playerIndex}`).src = spriteParado;
        }

        atualizarVida(playerIndex);
    } catch (error) {
        console.error(`Erro ao interpretar código do ${playerId}:`, error);
    }
}


function mudarSprite(playerId, acao) {
    const sprite = document.getElementById(`sprite${playerId.slice(-1)}`);
    const spriteUrl = players[playerId].sprites[acao];
    
    if (spriteUrl) {
        sprite.src = spriteUrl;
        if (acao !== "parado") {
            setTimeout(() => {
                sprite.style.transition = 'opacity 100ms';
                sprite.style.opacity = '0';
                
                setTimeout(() => {
                    sprite.src = players[playerId].sprites["parado"];
                    sprite.style.opacity = '1';
                    
                    setTimeout(() => {
                        sprite.style.transition = '';
                    }, 100);
                }, 100);
            }, 500);
        }
    }
}


function aplicarDano(atacante, defensor) {
    const dano = players[`player${atacante}`].data.dano;
    players[`player${defensor}`].data.vida = Math.max(0, players[`player${defensor}`].data.vida - dano);
    atualizarVida(defensor);
}

function atacar(tipoAtaque) {   
    const acao = tipoAtaque === 'punch' ? 'soco' : 'chute';
    mudarSprite('player1', acao);
       
    if (verificarColisaoPlayers()) {
        const dano = tipoAtaque === 'punch' ? 
            players.player1.data.dano : 
            players.player1.data.dano * 1.5;
        aplicarDano('1', '2');
    }
}

function atualizarVida(playerId) {
    const vida = players[`player${playerId}`].data.vida;
    const healthFill = document.getElementById(`health${playerId}-fill`);
    healthFill.style.width = `${vida}%`;

    const nomeJogador = document.getElementById(`name${playerId}`).textContent;
    
    if (vida <= 0) {
        mostrarAlertaVencedor(`${nomeJogador} perdeu!`);
    }
}

function pular(player) {
    if (!players[player].isJumping) {
        players[player].isJumping = true;
        players[player].verticalSpeed = CONFIG.JUMP_STRENGTH;
    }
}

function verificarColisaoPlayers() {
    const player1 = document.getElementById('player1');
    const player2 = document.getElementById('player2');
    const p1Rect = player1.getBoundingClientRect();
    const p2Rect = player2.getBoundingClientRect();

    return p1Rect.left < p2Rect.right && 
           p1Rect.right > p2Rect.left && 
           p1Rect.top < p2Rect.bottom && 
           p1Rect.bottom > p2Rect.top;
}

function atualizarFisica() {
    ['player1', 'player2'].forEach(playerKey => {
        const player = players[playerKey];
        const playerElement = document.getElementById(playerKey);
        
        if (player.isJumping) {
            player.verticalSpeed -= CONFIG.GRAVITY;
            player.y += player.verticalSpeed;

            if (player.y <= CONFIG.GROUND_LEVEL) {
                player.y = CONFIG.GROUND_LEVEL;
                player.isJumping = false;
                player.verticalSpeed = 0;
            }
        }

        player.position += player.speed;
        player.position = Math.max(0, Math.min(window.innerWidth - CONFIG.PLAYER_WIDTH, player.position));

        playerElement.style.left = `${player.position}px`;
        playerElement.style.bottom = `${player.y}px`;

        player.speed *= 0.9;
    });

    if (verificarColisaoPlayers()) {
        const p1 = players.player1;
        const p2 = players.player2;

        if (p1.position < p2.position) {
            p1.position = p2.position - CONFIG.PLAYER_WIDTH;
            p2.position = p1.position + CONFIG.PLAYER_WIDTH;
        } else {
            p2.position = p1.position - CONFIG.PLAYER_WIDTH;
            p1.position = p2.position + CONFIG.PLAYER_WIDTH;
        }
    }

    requestAnimationFrame(atualizarFisica);
}

document.getElementById('punch').addEventListener('click', () => atacar('punch'));
document.getElementById('kick').addEventListener('click', () => atacar('kick'));

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
        players.player1.speed = -CONFIG.MOVE_SPEED;
        player.style.transform = 'scaleX(-1)';
    } else if (data.direction?.angle === 'right') {
        players.player1.speed = CONFIG.MOVE_SPEED;
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
            players.player1.speed = -CONFIG.MOVE_SPEED;
            player1.style.transform = 'scaleX(-1)';
            break;
        case 'ArrowRight':
            players.player1.speed = CONFIG.MOVE_SPEED;
            player1.style.transform = 'scaleX(1)';
            break;
    }
});

carregarPersonagens();
atualizarFisica();

function mostrarAlertaVencedor(vencedor) {
    const alerta = document.createElement('div');
    alerta.id = 'alerta-vencedor';
    alerta.textContent = vencedor;

    document.body.appendChild(alerta);

    const estiloAlerta = document.createElement('style');
    estiloAlerta.textContent = `
        @keyframes fadeInOut {
            0%, 100% { opacity: 0; transform: translate(-50%, -60%); }
            10%, 90% { opacity: 1; transform: translate(-50%, -50%); }
        }
        #alerta-vencedor {
            position: fixed;
            top: 50%;
            left: 50%;
            background-color: rgba(0, 0, 0, 0.8);
            color: #fff;
            padding: 20px 40px;
            border: 5px solid #ff4444;
            border-radius: 10px;
            font-size: 2rem;
            text-align: center;
            z-index: 9999;
            animation: fadeInOut 3s ease-out;
        }
    `;
    document.head.appendChild(estiloAlerta);

    setTimeout(() => alerta.remove(), 3000);
}
