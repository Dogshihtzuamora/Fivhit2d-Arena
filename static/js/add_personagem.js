// Elementos do DOM
const actionSelect = document.getElementById('actionSelect');
const actionSprites = document.getElementById('actionSprites');
const actionsContainer = document.getElementById('actionsContainer');
const addActionButton = document.getElementById('addAction');
const saveButton = document.getElementById('saveButton');

const danoInputContainer = document.getElementById('danoInput');
const tempoInputContainer = document.getElementById('tempoInput');
const danoInput = document.getElementById('dano');
const tempoInput = document.getElementById('tempo');

// Variáveis de controle
const actionsAdded = new Set(); // Rastrear ações já adicionadas
const actionsData = {}; // Rastrear os dados de cada ação

// Mostrar ou esconder campos com base na ação selecionada
actionSelect.addEventListener('change', () => {
    const selectedAction = actionSelect.value;

    // Mostrar dano para "soco" ou "chute"
    danoInputContainer.style.display = (selectedAction === 'soco' || selectedAction === 'chute') ? 'block' : 'none';

    // Mostrar tempo para "pulo"
    tempoInputContainer.style.display = (selectedAction === 'pulo') ? 'block' : 'none';

    danoInput.value = "";
    tempoInput.value = "";
});

// Adicionar uma ação
addActionButton.addEventListener('click', () => {
    console.log("Botão Adicionar Ação clicado!");

    const action = actionSelect.value;
    const sprites = Array.from(actionSprites.files);
    const dano = danoInput.value;
    const tempo = tempoInput.value;

    console.log({ action, sprites, dano, tempo }); // Log dos valores selecionados

    // Validações
    if (!action) {
        alert('Escolha uma ação antes de adicionar!');
        return;
    }

    if (sprites.length < 1) {
        alert('Faça o upload de pelo menos um sprite!');
        return;
    }

    if ((action === 'soco' || action === 'chute') && !dano) {
        alert(`Defina o dano para a ação ${action}!`);
        return;
    }

    if (action === 'pulo' && !tempo) {
        alert('Defina o tempo de execução para o pulo!');
        return;
    }

    // Criação do grupo de ações no container
    const actionGroup = document.createElement('div');
    actionGroup.classList.add('actionGroup');
    actionGroup.dataset.actionName = action;

    actionGroup.innerHTML = `
        <h3>Ação: ${action}</h3>
        <p>Sprites (${sprites.length}):</p>
        <ul>${sprites.map(sprite => `<li>${sprite.name}</li>`).join('')}</ul>
        ${dano ? `<p>Dano: ${dano}</p>` : ''}
        ${tempo ? `<p>Tempo: ${tempo}ms</p>` : ''}
        <button type="button" class="removeAction">Remover Ação ${action}</button>
    `;
    actionsContainer.appendChild(actionGroup);

    // Armazenar os dados da ação
    actionsAdded.add(action);
    actionsData[action] = { sprites, dano, tempo };

    // Remover a ação do select para evitar duplicatas
    actionSelect.querySelector(`option[value="${action}"]`).remove();

    // Limpar os campos
    actionSelect.value = "";
    actionSprites.value = "";
    danoInput.value = "";
    tempoInput.value = "";

    // Botão de remover ação
    actionGroup.querySelector('.removeAction').addEventListener('click', () => removerAcao(actionGroup));
});

// Função para remover uma ação
function removerAcao(actionGroup) {
    const actionName = actionGroup.dataset.actionName;

    // Remover o grupo do DOM
    actionGroup.remove();

    // Remover a ação do armazenamento
    actionsAdded.delete(actionName);
    delete actionsData[actionName];

    // Adicionar a ação de volta ao select
    const option = document.createElement('option');
    option.value = actionName;
    option.textContent = actionName;
    actionSelect.appendChild(option);

    console.log(`Ação ${actionName} removida.`);
}

// Salvar personagem localmente
saveButton.addEventListener('click', async () => {
    const name = document.getElementById('name').value.trim();
    const vida = document.getElementById('vida').value;
    const perfilFile = document.getElementById('perfil').files[0];

    if (!name || !vida || !perfilFile) {
        alert('Preencha todos os campos obrigatórios!');
        return;
    }

    console.log("Salvando personagem...");
     
    // Faz a requisição usando fetch
    const response = await fetch('/static/personagens.json');
    if (!response.ok) {
        throw new Error('Erro ao buscar o arquivo JSON');
    }
    const personagens = await response.json();// Converte a resposta para JSON
    // Verificar se há personagens no JSON
    if (personagens.length === 0) {
        throw new Error('Nenhum personagem encontrado no JSON');
    }

    // Acessar o último personagem na lista e incrementar o ID
    const ultimoPersonagem = personagens[personagens.length - 1];
    const personagemId = ultimoPersonagem.id.replace(/\d+$/, (num) => parseInt(num) + 1);

    const personagemDir = name;

    // Gerar XML do personagem
    const xmlContent = [
        '<personagem>',
        `    <vida>${vida}</vida>`,
    ];

    // Adicionar sprites ao XML
    Object.entries(actionsData).forEach(([actionName, { sprites, dano, tempo }]) => {
        sprites.forEach((sprite, index) => {
            const spriteUrl = `/assets/personagens/${personagemDir}/${actionName}/frame_${index + 1}.png`;
            let spriteAttributes = `url="${spriteUrl}" acao="${actionName}"`;

            if (dano && (actionName === 'soco' || actionName === 'chute')) {
                spriteAttributes += ` dano="${dano}"`;
            }

            if (tempo && actionName === 'pulo') {
                spriteAttributes += ` tempo="${tempo}"`;
            }

            xmlContent.push(`    <sprite ${spriteAttributes} />`);
        });
    });

    xmlContent.push('</personagem>');

    // Simular salvamento local
    const zip = new JSZip();
    const folder = zip.folder(personagemDir);

    // Adicionar imagem de perfil
    folder.file(`${name}.png`, perfilFile);

    // Adicionar sprites
    Object.entries(actionsData).forEach(([actionName, { sprites }]) => {
        const actionFolder = folder.folder(actionName);
        sprites.forEach((sprite, index) => {
            actionFolder.file(`frame_${index + 1}.png`, sprite);
        });
    });

    // Adicionar XML do personagem
    folder.file('codigo.xml', xmlContent.join('\n'));

    // Adicionar JSON atualizado
    try {
        // Busca o JSON atual
        const response = await fetch('/static/personagens.json');
        let personagensJson = await response.json();

        // Adiciona o novo personagem
        personagensJson.push({
            id: personagemId,
            name: name,
            image: `/${personagemDir}/${name}.png`,
            code: `/${personagemDir}/codigo.xml`
        });

        // Stringify do JSON atualizado
        const updatedJsonContent = JSON.stringify(personagensJson, null, 4);

        // Adicionar JSON ao ZIP
        zip.file('personagens.json', updatedJsonContent);

    } catch (error) {
        console.error("Erro ao carregar ou atualizar personagens.json:", error);
        alert("Erro ao atualizar personagens.json");
        return;
    }

    // Gerar o ZIP
    const blob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${name}.zip`;
    link.click();

    alert('Personagem salvo com sucesso!\n\nMova o arquivo "personagens.json" para a pasta "static" para substituir o JSON.\n\nE mova a pasta do personagem para dentro de "assets/personagens".');
});
