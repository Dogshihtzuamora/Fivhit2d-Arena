let jogadorAtual = 1;
let p1Selecionado = null;
let p2Selecionado = null;

localStorage.clear();

fetch('/static/personagens.json')
    .then(response => response.json())
    .then(personagens => {
        const grid = document.getElementById('grid');
        
        personagens.forEach(char => {
            const box = document.createElement('div');
            box.className = 'char-box';
            
            const img = document.createElement('img');
            img.src = char.image;
            img.alt = char.name;
            img.className = 'char-img'; 
            box.appendChild(img);

            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'char-name';
            nameDiv.textContent = char.name;
            box.appendChild(nameDiv);

            box.dataset.charId = char.id;
            box.onclick = (event) => selecionarPersonagem(event, char);
            grid.appendChild(box);
        });
    });

function selecionarPersonagem(event, char) {
    const box = event.currentTarget;

    if (jogadorAtual === 1) {
        if (p1Selecionado) {
            p1Selecionado.classList.remove('selecionado-p1');
        }
        box.classList.add('selecionado-p1');
        p1Selecionado = box;

        localStorage.setItem('char1', JSON.stringify({ id: char.id, name: char.name, status: "1" }));

        jogadorAtual = 2;
        document.getElementById('status').textContent = 'Jogador 2, selecione seu personagem';
    } else {
        if (p2Selecionado) {
            p2Selecionado.classList.remove('selecionado-p2');
        }
        box.classList.add('selecionado-p2');
        p2Selecionado = box;

        localStorage.setItem('char2', JSON.stringify({ id: char.id, name: char.name, status: "2" }));

        document.getElementById('jogar').style.display = 'block';
    }
}

function criarPersonagens(){
    window.location.href = '/templates/add_personagem.html';
}

document.getElementById('jogar').onclick = () => {
    if (p1Selecionado && p2Selecionado) {
        window.location.href = '/templates/jogando.html';
    }
};