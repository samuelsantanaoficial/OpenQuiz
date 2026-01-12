class OpenQuiz {
    constructor() {
        this.players = [
            { name: "Jogador 1", score: 0, color: "bg-primary" },
            { name: "Jogador 2", score: 0, color: "bg-success" }
        ];
        this.questions = [];
        this.qIndex = 0;
        this.pIndex = 0;
        this.timer = null;
        this.timeLeft = 15;
        this.isLocked = false;

        this.colors = ["bg-primary", "bg-success", "bg-danger", "bg-warning text-dark", "bg-info text-dark", "bg-secondary"];

        this.init();
    }

    init() {
        this.renderPlayers();
        this.addEvents();
    }

    addEvents() {
        document.getElementById('file-upload').addEventListener('change', (e) => this.loadFile(e));
        document.getElementById('btn-add').addEventListener('click', () => this.addPlayer());
        document.getElementById('btn-remove').addEventListener('click', () => this.removePlayer());
        document.getElementById('btn-start').addEventListener('click', () => this.startGame());

        document.getElementById('btn-release-timer').addEventListener('click', () => this.releaseTimer());
        document.getElementById('btn-next').addEventListener('click', () => this.nextTurn());
        document.getElementById('btn-quit').addEventListener('click', () => this.resetToMenu());
        document.getElementById('btn-menu').addEventListener('click', () => this.resetToMenu());

        document.getElementById('players-container').addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT') {
                this.players[e.target.dataset.index].name = e.target.value;
            }
        });
    }

    // --- PARSER ---
    loadFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => this.parseTXT(evt.target.result);
        reader.readAsText(file);
    }

    parseTXT(text) {
        const lines = text.split(/\r?\n/);
        this.questions = [];
        let current = null;

        lines.forEach(l => {
            l = l.trim();
            if (!l) return;
            if (l.startsWith('#') || l.toUpperCase().startsWith('TEMA:')) return;
            if (l.match(/^>|^(OBS|FONTE):/i)) {
                if (current) current.ref = l.replace(/^>|^(OBS|FONTE):/i, '').trim(); return;
            }
            if (l.match(/^[-*+•]/)) {
                if (current) {
                    const txt = l.replace(/^[-*+•]\s*/, '').trim();
                    if (current.options.length === 0) current.answer = txt;
                    current.options.push(txt);
                }
                return;
            }
            l = l.replace(/^\d+[\.)]\s+/, '');
            if (current && current.options.length > 0) this.questions.push(current);
            current = { text: l, options: [], answer: null, ref: null };
        });
        if (current && current.options.length > 0) this.questions.push(current);

        if (this.questions.length > 0) {
            document.getElementById('file-info').innerHTML = `<span class="text-success fw-bold"><i class="bi bi-check-circle"></i> ${this.questions.length} perguntas carregadas!</span>`;
            document.getElementById('btn-start').disabled = false;
        } else {
            document.getElementById('file-info').innerHTML = `<span class="text-danger">Erro no arquivo.</span>`;
        }
    }

    // --- JOGADORES ---
    renderPlayers() {
        const div = document.getElementById('players-container');
        div.innerHTML = '';
        this.players.forEach((p, i) => {
            div.innerHTML += `
                <div class="input-group mb-2">
                    <span class="input-group-text ${p.color} text-white border-0 fw-bold">P${i + 1}</span>
                    <input type="text" class="form-control" value="${p.name}" data-index="${i}">
                </div>`;
        });
        document.getElementById('btn-add').disabled = this.players.length >= 6;
        document.getElementById('btn-remove').disabled = this.players.length <= 2;
    }

    addPlayer() {
        if (this.players.length >= 6) return;
        this.players.push({ name: `Jogador ${this.players.length + 1}`, score: 0, color: this.colors[this.players.length % 6] });
        this.renderPlayers();
    }

    removePlayer() {
        if (this.players.length <= 2) return;
        this.players.pop();
        this.renderPlayers();
    }

    // --- GAME ENGINE ---
    startGame() {
        this.players.forEach(p => p.score = 0);
        this.qIndex = 0;
        this.pIndex = 0;
        this.questions.sort(() => Math.random() - 0.5);

        document.getElementById('screen-setup').classList.add('d-none');
        document.getElementById('screen-game').classList.remove('d-none');
        document.getElementById('footer-score').classList.remove('d-none');
        this.updateMiniScore();
        this.loadQuestion();

        window.onbeforeunload = () => "O jogo está em andamento. Se sair, perderá o progresso.";
    }

    loadQuestion() {
        const q = this.questions[this.qIndex];
        const p = this.players[this.pIndex];

        this.timeLeft = 15;
        this.isLocked = false;
        this.stopAudio();

        document.getElementById('btn-next').classList.add('d-none');
        document.getElementById('feedback-area').innerHTML = '';
        document.getElementById('timer-display').innerText = 15;

        document.getElementById('question-text').innerText = q.text;

        const turn = document.getElementById('turn');
        turn.className = `btn btn-sm fw-bolder w-50 btn-outline-${p.color.replace('bg-', '')}`;
        turn.innerText = `${p.name}`;

        // Renderiza Opções
        const optArea = document.getElementById('options-area');
        optArea.innerHTML = '';
        let opts = q.options.map(t => ({ text: t }));
        opts.sort(() => Math.random() - 0.5);

        opts.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = "btn border py-3 text-start fw-semibold shadow-sm";
            btn.innerText = opt.text;
            btn.onclick = () => this.checkAnswer(opt.text, btn);
            optArea.appendChild(btn);
        });

        document.getElementById('btn-release-timer').classList.remove('d-none');
        document.getElementById('options-area').classList.add('blocked-area');
    }

    releaseTimer() {
        document.getElementById('btn-release-timer').classList.add('d-none');

        const area = document.getElementById('options-area');
        area.classList.remove('blocked-area');

        const btns = area.querySelectorAll('button');
        btns.forEach(b => {
            b.classList.remove('btn-secondary');
        });

        this.playAudio('snd-clock');
        this.runTimer();
    }

    runTimer() {
        if (this.timer) clearInterval(this.timer);
        const display = document.getElementById('timer-display');

        this.timer = setInterval(() => {
            this.timeLeft--;
            display.innerText = this.timeLeft;
            if (this.timeLeft <= 5) display.parentElement.classList.add('timer-danger');
            if (this.timeLeft <= 0) this.checkAnswer(null, null);
        }, 1000);
    }

    checkAnswer(answer, btn) {
        if (this.isLocked) return;
        this.isLocked = true;
        clearInterval(this.timer);
        this.stopAudio();

        const q = this.questions[this.qIndex];
        const isCorrect = (answer === q.answer);
        const p = this.players[this.pIndex];

        // CORREÇÃO DOS ÁUDIOS: Verifica estritamente se acertou ou errou
        if (isCorrect) {
            this.playAudio('snd-success');
            p.score++;
        } else {
            this.playAudio('snd-error');
        }

        const allBtns = document.querySelectorAll('#options-area button');
        allBtns.forEach(b => {
            b.classList.add('opacity-50');
            if (b.innerText === q.answer) {
                b.className = "btn btn-success py-3 text-start fw-bold opacity-100 shadow";
                b.innerHTML += ` <i class="bi bi-check-circle-fill float-end"></i>`;
            } else if (b === btn && !isCorrect) {
                b.className = "btn btn-danger py-3 text-start opacity-100 shadow";
                b.innerHTML += ` <i class="bi bi-x-circle-fill float-end"></i>`;
            }
        });

        const feed = document.getElementById('feedback-area');
        if (isCorrect) {
            feed.innerHTML = `<div class="alert alert-success border-0 fw-bold"><i class="bi bi-emoji-smile"></i> Acertou!</div>`;
        } else {
            feed.innerHTML = `<div class="alert alert-danger border-0 fw-bold"><i class="bi bi-emoji-frown"></i> Errou! Era: ${q.answer}</div>`;
        }

        if (q.ref) {
            const link = q.ref.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">Link para verificação</a>');
            feed.innerHTML += `<div class="alert alert-secondary py-2 small mt-2">${link}</div>`;
        }

        this.updateMiniScore();
        document.getElementById('btn-next').classList.remove('d-none');
    }

    nextTurn() {
        this.pIndex++;
        if (this.pIndex >= this.players.length) this.pIndex = 0;
        this.qIndex++;

        if (this.qIndex >= this.questions.length) {
            this.endGame();
        } else {
            this.loadQuestion();
        }
    }

    playAudio(id) {
        const audio = document.getElementById(id);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log("Audio block:", e));
        }
    }

    stopAudio() {
        ['snd-clock', 'snd-success', 'snd-error', 'snd-complete', 'snd-failed'].forEach(id => {
            const audio = document.getElementById(id);
            if (audio) { audio.pause(); audio.currentTime = 0; }
        });
    }

    updateMiniScore() {
        const div = document.getElementById('mini-scoreboard');
        div.innerHTML = '';
        const rank = [...this.players].sort((a, b) => b.score - a.score);
        rank.forEach(p => {
            div.innerHTML += `
<button type="button" class="btn btn-primary ${p.color} position-relative m-2">
    ${p.name}
    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
        ${p.score}
    </span>
</button>
        `;
        });
    }

    endGame() {
        document.getElementById('screen-game').classList.add('d-none');
        document.getElementById('footer-score').classList.add('d-none');
        document.getElementById('screen-result').classList.remove('d-none');

        this.stopAudio();

        const rank = [...this.players].sort((a, b) => b.score - a.score);

        const winner = rank[0];
        const winnerAlert = document.getElementById('winner-alert');

        // Verifica se existe mais de 1 jogador e se o primeiro tem a mesma pontuação do segundo
        const isTie = (rank.length > 1 && rank[0].score === rank[1].score);

        if (isTie) {
            // Se empatou: Mostra Azul (Info) e diz "Empate!"
            winnerAlert.className = "alert alert-info d-inline-block fw-bold px-5 mb-4 shadow-sm";
            winnerAlert.innerHTML = `<i class="bi bi-people-fill"></i> EMPATE!`;
            this.playAudio('snd-failed');
        } else {
            // Se tem vencedor: Mostra Verde (Success) e o nome dele
            winnerAlert.className = "alert alert-success d-inline-block fw-bold px-5 mb-4 shadow-sm";
            winnerAlert.innerHTML = `<i class="bi bi-trophy-fill"></i> ${winner.name} venceu!`;
            this.celebrar();
        }

        const list = document.getElementById('final-list');
        list.innerHTML = '';

        rank.forEach((p, i) => {
            const badgeClass = p.color.includes('bg-') ? p.color : `bg-${p.color}`;

            list.innerHTML += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span>
                        <span class="badge ${badgeClass} me-2">${i + 1}º</span> 
                        ${p.name}
                    </span> 
                    <strong>${p.score} pts</strong>
                </li>`;
        });


        window.onbeforeunload = null;
    }

    celebrar() {
        var duration = 3 * 1000; // Dura 3 segundos
        var end = Date.now() + duration;

        (function frame() {
            // Lança confetes da Esquerda
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#0d6efd', '#ffc107', '#198754'] // Cores do Bootstrap (Azul, Amarelo, Verde)
            });
            // Lança confetes da Direita
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#0d6efd', '#ffc107', '#198754']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
        this.playAudio('snd-complete');
    }

    resetToMenu() {
        this.stopAudio();
        if (this.timer) clearInterval(this.timer);
        document.getElementById('screen-game').classList.add('d-none');
        document.getElementById('screen-result').classList.add('d-none');
        document.getElementById('footer-score').classList.add('d-none');
        document.getElementById('screen-setup').classList.remove('d-none');

        window.onbeforeunload = null;
    }
}

new OpenQuiz();