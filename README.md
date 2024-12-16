# 🕹️ Fivhit2D Arena

**Fivhit2D Arena** é uma *engine* de luta 2D **open source** e totalmente personalizável, semelhante ao estilo do [M.U.G.E.N](https://mugenfreeforall.com). Com esta *engine*, você pode criar personagens, arenas e lutar em um ambiente dinâmico e flexível.

[Teste agora clicando aqui](https://fivhit2d-arena.vercel.app/templates/jogo.html)

---

## 📁 Estrutura do Projeto

```plaintext
Fivhit2d-Arena

├─ CREDITS.md
├─ assets
│  ├─ logo.png
│  └─ personagens
│     ├─ inie
│     │  ├─ chute
│     │  │  └─ frame_1.png
│     │  ├─ codigo.xml
│     │  ├─ inie.png
│     │  ├─ parado
│     │  │  └─ frame_1.png
│     │  ├─ pulo
│     │  │  └─ frame_1.png
│     │  └─ soco
│     │     └─ frame_1.png
│     └─ inie_reverse
│        ├─ chute
│        │  └─ frame_1.png
│        ├─ codigo.xml
│        ├─ inie_reverse.png
│        ├─ parado
│        │  └─ frame_1.png
│        ├─ pulo
│        │  └─ frame_1.png
│        └─ soco
│           └─ frame_1.png
├─ static
│  ├─ js
│  │  ├─ add_personagem.js
│  │  ├─ jogando.js
│  │  └─ jogo.js
│  └─ personagens.json
└─ templates
   ├─ add_personagem.html
   ├─ jogando.html
   └─ jogo.html

```

---

## 📂 Explicação dos Diretórios e Arquivos

### **`CREDITS.md`**

Arquivo que lista todos os colaboradores que contribuíram para o projeto. Inclua os nomes e, opcionalmente, os papéis desempenhados por cada um.

### **`assets/`**

Contém todos os recursos visuais utilizados no jogo:

- **`logo.png`**: Logotipo principal do projeto.
- **`personagens/`**: Diretório com personagens e suas respectivas animações e configurações:
  - **`chute/`**, **`parado/`**, **`pulo/`**, **`soco/`**: Frames de animação.
  - **`codigo.xml`**: Define os movimentos e atributos do personagem.

### **`static/`**

Arquivos estáticos, como scripts e dados de configuração:

- **`js/`**: Scripts JavaScript que controlam o funcionamento do jogo.
- **`personagens.json`**: Contém a lista de personagens disponíveis no jogo.

### **`templates/`**

Arquivos HTML para a interface do usuário:

- **`add_personagem.html`**: Interface para adicionar novos personagens.
- **`jogando.html`**: Tela principal do jogo.
- **`jogo.html`**: Estrutura da arena de luta.

---

## 🚀 Funcionalidades

- **Criação de Personagens Personalizados:**  
  Adicione personagens com animações e atributos personalizados.

- **Sistema de Skins Dinâmicas:**  
  Troque entre versões alternativas dos personagens.

- **Scripts JavaScript:**  
  Controle dinâmico da jogabilidade e da arena de luta.

---

## 🛠️ Tecnologias Usadas

- **Frontend:** HTML, CSS, JavaScript  
- **Formato de Dados:** JSON, XML

---

## 💡 Como Usar

1. **Clone o Repositório:**
   ```bash
   # Via SSH
   git clone git@github.com:Dogshihtzuamora/fivhit2d-arena.git

   # Via HTTPS
   git clone https://github.com/Dogshihtzuamora/fivhit2d-arena

   cd fivhit2d-arena
   ```

2. **Adicione Personagens:**
   - Coloque os arquivos em `assets/personagens/nome_do_personagem`.
   - Configure o `codigo.xml` para definir movimentos.

3. **Execute o Projeto:**
   Abra `templates/jogo.html` no navegador.

---

## 📜 Créditos

Veja o arquivo [CREDITS.md](CREDITS.md) para a lista completa de contribuidores.
