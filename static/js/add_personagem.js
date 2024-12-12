document.getElementById('saveButton').addEventListener('click', () => {
    const name = document.getElementById('name').value.trim();
    const vida = document.getElementById('vida').value;
    const dano = document.getElementById('dano').value;
    const spriteParado = document.getElementById('spriteParado').files[0];
    const spritePulando = document.getElementById('spritePulando').files[0];
    const spriteAndando = document.getElementById('spriteAndando').files[0];

    if (!name || !vida || !dano || !spriteParado || !spritePulando || !spriteAndando) {
        alert('Por favor, preencha todos os campos e faça upload de todos os sprites.');
        return;
    }

    // Cria um objeto zip para armazenar os arquivos
    const zip = new JSZip();
    const folder = zip.folder(name);

    // Adiciona o arquivo XML
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<personagem>
<vida>${vida}</vida>
<dano>${dano}</dano>
<sprite url="${name}/parado.png" acao="parado"></sprite>
<sprite url="${name}/pulando.png" acao="pulando"></sprite>
<sprite url="${name}/andando.png" acao="andando"></sprite>
</personagem>`;
    folder.file('codigo.xml', xmlContent);

    // Adiciona os sprites
    const addFileToZip = (file, filename) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                folder.file(filename, event.target.result.split(',')[1], { base64: true });
                resolve();
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    Promise.all([
        addFileToZip(spriteParado, 'parado.png'),
        addFileToZip(spritePulando, 'pulando.png'),
        addFileToZip(spriteAndando, 'andando.png')
    ]).then(() => {
        // Gera o zip e oferece para download
        zip.generateAsync({ type: 'blob' }).then((content) => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(content);
            a.download = `${name}.zip`;
            a.click();
        });
    }).catch((error) => {
        console.error('Erro ao processar os arquivos:', error);
        alert('Ocorreu um erro ao salvar o personagem.');
    });
});