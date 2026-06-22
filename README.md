# OpenQuiz

**O seu "Game Show" de bolso!** O **OpenQuiz** é um sistema leve e open-source para rodar quizzes multiplayer estilo "Passa ou Repassa" ou "Show do Milhão", onde um apresentador lê as perguntas e os jogadores competem localmente.

> Crie perguntas usando um simples bloco de notas!

---

## Funcionalidades

* ** Formato Ultra Simples (.txt):** Escreva perguntas como se estivesse num bloco de notas. Sem códigos complicados.
* ** Modo Apresentador:** O jogo exibe a pergunta, você lê para a plateia, e só libera as respostas ao apertar **"VALENDO!"**.
* ** Tensão Real:** Efeitos sonoros sincronizados (Tic-Tac) para criar suspense nos 15 segundos de resposta.
* ** Multiplayer Local:** Suporte para até 6 jogadores/times na mesma tela.
* ** PWA & Offline:** Instale no celular/tablet e jogue mesmo sem internet.
* ** Design Moderno:** Interface limpa usando Bootstrap 5 e ícones intuitivos.

---

## Como Jogar

1. **Conecte na TV (Opcional):** Ideal para projetar a tela para grupos.
2. **Carregue o Arquivo:** Selecione seu arquivo `.txt` com as perguntas.
3. **Adicione os Jogadores:** Configure os nomes e cores dos participantes.
4. **Seja o Apresentador:**
* A pergunta aparece na tela.
* Você lê em voz alta.
* Clique em **"VALENDO!"**.
* O cronômetro dispara e os jogadores tentam acertar!



---

## Criando suas Perguntas (Novo Formato)

Esqueça JSON ou Excel. Agora você usa arquivos de texto simples (`.txt`).

### A Regra de Ouro

**A primeira opção da lista deve ser SEMPRE a resposta CORRETA.**
*(Não se preocupe, o jogo embaralha as opções automaticamente na hora de exibir).*

### Exemplo de Arquivo (`quiz.txt`):

```markdown
# Teste

1. Qual a cor do sol?
Fonte: https://www.google.com/search?q=qual+é+a+cor+do+sol%3F
* Branco
* Amarelo
* Vermelho
* Laranja

2. Quanto é 2+2?
Obs: https://www.google.com/search?q=2+%2B+2%3F
- 4
- 22
- 5
- 3

Quem descobriu o Brasil?
> https://www.google.com/search?q=quem+descobriu+o+brasil%3F
+ Pedro Álvares Cabral
+ Colombo
+ Dom Pedro I
+ Lula

```

### Detalhes da Sintaxe:

* **# Título:** A primeira linha com `#` define o nome do Quiz.
* **- Opções:** Use hífen `-`, asterisco `*` ou mais `+` para listar as alternativas.
* **> Referência (Opcional):** Use `>` logo abaixo da pergunta para adicionar uma fonte, versículo bíblico ou link explicativo que aparecerá após a resposta.

---

## Gerando Perguntas com IA

Quer criar um quiz em segundos? Copie este prompt e cole no **ChatGPT** ou **Gemini**:

```text
Crie um arquivo de quiz sobre o tema [SEU TEMA AQUI].
Formato obrigatório:
1. Use "# " para o título.
2. A primeira opção de cada pergunta deve ser a CORRETA (comece com hifén "- ").
3. Adicione 3 opções incorretas abaixo da correta.
4. (Opcional) Adicione uma linha de referência com "> " abaixo da pergunta.
5. Deixe uma linha em branco entre as perguntas.
6. Não numere as perguntas.

```

---

## Tecnologias

* **HTML5 & CSS3** (Bootstrap 5)
* **JavaScript Moderno** (ES6+)
* **FileReader API** (Para ler os arquivos TXT locais)
* **Web Audio API** (Para controle de sons e loops)

---

## Licença

Este projeto está sob licença MIT. Você é livre para usar na sua escola, igreja ou grupo de amigos.
