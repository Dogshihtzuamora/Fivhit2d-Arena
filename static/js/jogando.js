const CONFIG = {
    GRAVITY: 0.8,
    JUMP_STRENGTH: 15,
    GROUND_LEVEL: 80,
    PLAYER_WIDTH: 100,
    PLAYER_HEIGHT: 150,
    MOVE_SPEED: 5,
    ANIMATION_SPEED: 200
};

const players = {
    player1: {
        position: 100,
        speed: 0,
        y: 80,
        verticalSpeed: 0,
        isJumping: false,
        isAnimating: false,
        isDead: false,
        data: { vida: 0 },
        sprites: {}
    },
    player2: {
        position: window.innerWidth - 200,
        speed: 0,
        y: 80,
        verticalSpeed: 0,
        isJumping: false,
        isAnimating: false,
        isDead: false,
        data: { vida: 0 },
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
        let xmlContent = await response.text();
                
        xmlContent = xmlContent.split('\n').filter(line => !line.trim().startsWith(';')).join('\n');
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, "application/xml");

        const playerIndex = playerId.slice(-1);
        
       
        const gravidadeElement = xmlDoc.querySelector("gravidade");
        const gravidadePersonalizada = gravidadeElement 
            ? parseFloat(gravidadeElement.textContent) 
            : CONFIG.GRAVITY;
        
        const velocidadeElement = xmlDoc.querySelector("velocidade");
        const velocidadePersonalizada = velocidadeElement
            ? parseFloat(velocidadeElement.textContent)
            : CONFIG.MOVE_SPEED;
       
        players[playerId].gravidade = gravidadePersonalizada;
               
        players[playerId].moveSpeed = velocidadePersonalizada;

        players[playerId].data.vida = parseInt(xmlDoc.querySelector("vida")?.textContent || '100');

        const sprites = xmlDoc.querySelectorAll("sprite");
        players[playerId].sprites = {};
        sprites.forEach(sprite => {
            const url = sprite.getAttribute("url");
            const som = sprite.getAttribute("som");
            const acao = sprite.getAttribute("acao");
            const tempo = sprite.getAttribute("tempo") 
                ? parseInt(sprite.getAttribute("tempo")) 
                : CONFIG.ANIMATION_SPEED;
            const dano = sprite.getAttribute("dano") ? parseInt(sprite.getAttribute("dano")) : 0;
            
            if (!players[playerId].sprites[acao]) {
                players[playerId].sprites[acao] = [];
            }
            players[playerId].sprites[acao].push({
                url: url,
                dano: dano,
                tempo: tempo,
                som: som
            });
        });

        iniciarAnimacaoParado(playerId);
        atualizarVida(playerIndex);
    } catch (error) {
        console.error(`Erro ao interpretar código do ${playerId}:`, error);
    }
}

function executarAnimacao(playerId, acao, callback) {
    const spriteElement = document.getElementById(`sprite${playerId.slice(-1)}`);
    const frames = players[playerId].sprites[acao];

    if (frames && frames.length > 0) {
        let frameIndex = 0;
        players[playerId].isAnimating = true;
        
          if (frames[0].som) {
                    new Audio(frames[0].som).play();
                }

        const animar = () => {
            if (!players[playerId].isAnimating) return;

            spriteElement.src = frames[frameIndex].url;
            frameIndex++;

            if (frameIndex < frames.length) {                
                const tempoFrame = frames[frameIndex - 1].tempo || CONFIG.ANIMATION_SPEED;
                setTimeout(animar, tempoFrame);
            } else {
                players[playerId].isAnimating = false;
                if (callback) {
                    callback();
                } else {
                    iniciarAnimacaoParado(playerId);
                }
            }
        };

        animar();
    } else if (callback) {
        callback();
    } else {
        iniciarAnimacaoParado(playerId);
    }
}

function iniciarAnimacaoParado(playerId) {    
    if (players[playerId].isDead) return;

    const spriteElement = document.getElementById(`sprite${playerId.slice(-1)}`);
    const frames = players[playerId].sprites["parado"];

    if (frames && frames.length > 0 && !players[playerId].isAnimating) {
        let frameIndex = 0;

        const animarParado = () => {
            if (players[playerId].isAnimating || players[playerId].isDead) return;

            spriteElement.src = frames[frameIndex].url;
            frameIndex = (frameIndex + 1) % frames.length;
            
            const tempoFrame = frames[frameIndex].tempo || CONFIG.ANIMATION_SPEED;
            setTimeout(animarParado, tempoFrame);
        };

        animarParado();
    }
}

function criarEstiloDano() {    
    if (document.getElementById('estilo-dano')) return;

    const estilo = document.createElement('style');
    estilo.id = 'estilo-dano';
    estilo.textContent = `
        .dano-texto {
            color: red;
            font-weight: bold;
            font-size: 20px;
            position: absolute;
            pointer-events: none;
            animation: flutuar 1s ease-out;
        }

        @keyframes flutuar {
            0% {
                opacity: 1;
                transform: translateY(0);
            }
            100% {
                opacity: 0;
                transform: translateY(-50px);
            }
        }
    `;

    document.head.appendChild(estilo);
}

function aplicarDano(atacante, defensor, tipoAtaque) {    
    criarEstiloDano();

    const frames = players[`player${atacante}`].sprites[tipoAtaque];
    const dano = frames[0].dano; 
    
    players[`player${defensor}`].data.vida = Math.max(0, players[`player${defensor}`].data.vida - dano);
    atualizarVida(defensor);
    
    const elementoDano = document.createElement('div');
    elementoDano.classList.add('dano-texto');
    elementoDano.textContent = `-${dano}`;
    
    const defensorElemento = document.getElementById(`player${defensor}`);
    const rect = defensorElemento.getBoundingClientRect();
    
    elementoDano.style.left = `${rect.left + rect.width / 2}px`;
    elementoDano.style.top = `${rect.top}px`;
    
    document.body.appendChild(elementoDano);
    
    setTimeout(() => {
        document.body.removeChild(elementoDano);
    }, 1000);
}

function atacar(tipoAtaque) {   
    const acao = tipoAtaque === 'punch' ? 'soco' : 'chute';
    const playerId = 'player1';
   
    if (players[playerId].isDead) return;

    if (!players[playerId].sprites[acao] || players[playerId].sprites[acao].length === 0) {
        iniciarAnimacaoParado(playerId);
        return;
    }

    players[playerId].isAnimating = true;
    executarAnimacao(playerId, acao, () => {
        if (verificarColisaoPlayers()) {
            aplicarDano('1', '2', acao);
        }
        iniciarAnimacaoParado(playerId);
    });
}

function atualizarVida(playerId) {
    const player = players[`player${playerId}`];
    const vida = player.data.vida;
    const healthFill = document.getElementById(`health${playerId}-fill`);
    healthFill.style.width = `${vida}%`;

    const nomeJogador = document.getElementById(`name${playerId}`).textContent;
    
    if (vida <= 0 && !player.isDead) {
        player.isDead = true;
               
        if (player.sprites['morto'] && player.sprites['morto'].length > 0) {          
            executarAnimacaoDeMorte(`player${playerId}`);
        } else {           
            mostrarAlertaVencedor(`${nomeJogador} perdeu!`);
        }
    }
}

function executarAnimacaoDeMorte(playerId) {
    const spriteElement = document.getElementById(`sprite${playerId.slice(-1)}`);
    const morteFrames = players[playerId].sprites['morto'];

    if (morteFrames && morteFrames.length > 0) {
        let frameIndex = 0;
       
        if (morteFrames[0].som) {
            new Audio(morteFrames[0].som).play();
        }

        const animarMorte = () => {
            spriteElement.src = morteFrames[frameIndex].url;
            frameIndex++;

            if (frameIndex < morteFrames.length) {
                setTimeout(animarMorte, CONFIG.ANIMATION_SPEED);
            } else {              
                const nomeJogador = document.getElementById(`name${playerId.slice(-1)}`).textContent;
                mostrarAlertaVencedor(`${nomeJogador} perdeu!`);
            }
        };

        animarMorte();
    } else {        
        const nomeJogador = document.getElementById(`name${playerId.slice(-1)}`).textContent;
        mostrarAlertaVencedor(`${nomeJogador} perdeu!`);
    }
}

function pular(player) {    
    if (players[player].isDead) return;

    if (!players[player].isJumping) {
        players[player].isJumping = true;
        players[player].verticalSpeed = CONFIG.JUMP_STRENGTH;
       
        if (players[player].sprites["pulo"] && players[player].sprites["pulo"].length > 0) {
            executarAnimacao(player, "pulo", () => {               
                iniciarAnimacaoParado(player);
            });
        }
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
       
        if (player.isDead) return;

        const playerElement = document.getElementById(playerKey);
        
        if (player.isJumping) {            
            const gravidade = player.gravidade !== undefined 
                ? player.gravidade 
                : CONFIG.GRAVITY;

            player.verticalSpeed -= gravidade;
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

document.getElementById('jump').addEventListener('click', () => {
    pular('player1');
});

const joystick = nipplejs.create({
    zone: document.getElementById('joystick'),
    mode: 'static',
    position: { left: '50%', top: '50%' },
    color: 'white',
    size: 100
});

joystick.on('move', (evt, data) => {   
    if (players.player1.isDead) return;

    const player = document.getElementById('player1');
   
    const moveSpeed = players.player1.moveSpeed || CONFIG.MOVE_SPEED;

    if (data.direction?.angle === 'left') {
        players.player1.speed = -moveSpeed;
        player.style.transform = 'scaleX(-1)';
    } else if (data.direction?.angle === 'right') {
        players.player1.speed = moveSpeed;
        player.style.transform = 'scaleX(1)';
    }
});

document.addEventListener('keydown', (e) => {
    const player1 = document.getElementById('player1');
       
    if (players.player1.isDead) return;

    const moveSpeed = players.player1.moveSpeed || CONFIG.MOVE_SPEED;

    switch(e.code) {
        case 'Space':
            pular('player1');
            break;
        case 'ArrowLeft':
            players.player1.speed = -moveSpeed;
            player1.style.transform = 'scaleX(-1)';
            break;
        case 'ArrowRight':
            players.player1.speed = moveSpeed;
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
