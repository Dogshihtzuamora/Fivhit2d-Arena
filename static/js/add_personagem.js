document.getElementById('addAction').addEventListener('click', () => {
    const actionsContainer = document.getElementById('actionsContainer');
    const actionGroup = document.createElement('div');
    actionGroup.classList.add('actionGroup');

    actionGroup.innerHTML = `
        <label>Nome da Ação:</label>
        <input type="text" class="actionName" placeholder="Ex: Correndo" required>

        <label>Sprites (.png):</label>
        <input type="file" class="actionSprites" accept="image/png" multiple required>
    `;

    actionsContainer.appendChild(actionGroup);
});

document.getElementById('saveButton').addEventListener('click', async () => {
    const name = document.getElementById('name').value.trim();
    const vida = document.getElementById('vida').value;
    const dano = document.getElementById('dano').value;
    const perfilFile = document.getElementById('perfil').files[0];

    if (!name || !vida || !dano || !perfilFile) {
        alert('Preencha todos os campos obrigatórios!');
        return;
    }

    const actions = [];
    document.querySelectorAll('.actionGroup').forEach(group => {
        const actionName = group.querySelector('.actionName').value.trim();
        const actionSprites = group.querySelector('.actionSprites').files;

        if (!actionName || actionSprites.length === 0) {
            alert('Cada ação deve ter um nome e pelo menos um sprite!');
            return;
        }

        actions.push({
            name: actionName,
            sprites: Array.from(actionSprites)
        });
    });

    if (actions.length === 0) {
        alert('Adicione pelo menos uma ação com sprites.');
        return;
    }

    const zip = new JSZip();
    const folder = zip.folder(name);

    folder.file('perfil.png', perfilFile);
    const xmlContent = [
        '<personagem>',
        `    <vida>${vida}</vida>`,
        `    <dano>${dano}</dano>`
    ];

    for (const action of actions) {
        const actionFolder = folder.folder(action.name);

        action.sprites.forEach((sprite, index) => {
            const spriteName = `frame_${index + 1}.png`;
            actionFolder.file(spriteName, sprite);
            xmlContent.push(`    <sprite url="${action.name}/${spriteName}" acao="${action.name}"></sprite>`);
        });
    }

    xmlContent.push('</personagem>');
    folder.file('codigo.xml', xmlContent.join('\n'));

    const blob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${name}.zip`;
    link.click();
});