(() => {
  const $ = (s) => document.querySelector(s);
  const nav = Nav('normal');
  const tab = tabuadaPanel('#tabuada-btn', '#tabuada-panel');
  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const DURATION = 60; // segundos
  const OPS = { soma: '+', subtracao: '−', multiplicacao: '×', divisao: '÷' };

  // ---------- perguntas ----------
  // Dificuldade inicial depende do ano (6º = nível 1 ... 9º = nível 4) e sobe a cada 4 acertos (máx. 5).
  // soma/subtracao/multiplicacao: [aMin, aMax, bMin, bMax]. divisao: [divisorMin, divisorMax, quocienteMin, quocienteMax] (sempre exata).
  const RANGES = {
    soma: [[2, 9, 2, 9], [10, 50, 2, 9], [10, 50, 10, 50], [50, 99, 10, 99], [100, 500, 10, 200]],
    subtracao: [[5, 15, 1, 9], [10, 50, 2, 9], [20, 99, 10, 80], [100, 300, 10, 99], [200, 999, 100, 199]],
    multiplicacao: [[2, 9, 2, 9], [2, 12, 2, 12], [10, 20, 2, 9], [10, 30, 2, 12], [10, 50, 2, 15]],
    divisao: [[2, 9, 2, 9], [2, 12, 2, 9], [2, 9, 10, 20], [2, 12, 10, 30], [2, 15, 10, 50]],
  };
  function makeQuestion(op, level) {
    if (op === 'divisao') {
      const [dMin, dMax, qMin, qMax] = RANGES.divisao[level - 1];
      const b = rnd(dMin, dMax), q = rnd(qMin, qMax);
      return { a: b * q, b, op };
    }
    const [aMin, aMax, bMin, bMax] = RANGES[op][level - 1];
    for (;;) {
      const a = rnd(aMin, aMax);
      if (op === 'soma' || op === 'multiplicacao') return { a, b: rnd(bMin, bMax), op };
      if (bMin <= a - 1) return { a, b: rnd(bMin, Math.min(bMax, a - 1)), op }; // subtracao
    }
  }
  const solve = (q) => ({ soma: q.a + q.b, subtracao: q.a - q.b, multiplicacao: q.a * q.b, divisao: q.a / q.b })[q.op];

  // ---------- jogo ----------
  let g = null, timer = null;
  nav.leave['s-jogo'] = () => clearInterval(timer); // sair da tela para o cronômetro

  function start(op) {
    g = { op, level0: nav.user.ano - 5, score: 0, correct: 0, wrong: 0, streak: 0, end: Date.now() + DURATION * 1000, q: null, sent: false };
    $('#tabuada-btn').hidden = !(op === 'multiplicacao' || op === 'divisao');
    nav.go('s-jogo');
    $('#feedback').textContent = '';
    updateHud();
    nextQuestion();
    timer = setInterval(tick, 100);
  }

  function nextQuestion() {
    const level = Math.min(5, g.level0 + Math.floor(g.correct / 4));
    g.q = makeQuestion(g.op, level);
    $('#question').textContent = `${g.q.a} ${OPS[g.op]} ${g.q.b}`;
    tab.setNumber(g.op === 'multiplicacao' || g.op === 'divisao' ? g.q.b : null);
    const a = $('#answer'); a.value = ''; a.focus();
  }

  function updateHud() {
    $('#score').textContent = g.score;
    $('#streak').textContent = g.streak;
  }

  function tick() {
    const left = Math.max(0, g.end - Date.now());
    $('#time').textContent = Math.ceil(left / 1000);
    $('#barfill').style.width = (left / (DURATION * 1000)) * 100 + '%';
    if (left <= 0) finish();
  }

  $('#form').onsubmit = (e) => {
    e.preventDefault();
    if (!g || Date.now() >= g.end) return;
    const raw = $('#answer').value.trim();
    if (raw === '') return;
    const fb = $('#feedback');
    if (Number(raw) === solve(g.q)) {
      g.correct++; g.streak++;
      g.score += 10 + (g.streak % 5 === 0 ? 10 : 0); // a cada 5 seguidos: bônus
      fb.textContent = g.streak % 5 === 0 ? '🔥 Sequência! +10 de bônus' : '✔ Certo!';
      fb.className = 'feedback good';
    } else {
      g.wrong++; g.streak = 0;
      fb.textContent = `✘ Era ${solve(g.q)}`;
      fb.className = 'feedback bad';
      const q = $('#question'); q.classList.remove('shake'); void q.offsetWidth; q.classList.add('shake');
    }
    updateHud();
    nextQuestion();
  };

  async function send() {
    if (g.sent) return;
    const st = $('#r-status'); st.className = 'msg'; st.textContent = 'Enviando pontuação…';
    $('#retry-send').hidden = true;
    try {
      await API.submit('normal', g.op, nav.user.ano, nav.user.nick, nav.user.turma, g.score, g.correct);
      g.sent = true;
      st.textContent = '✅ Pontuação enviada para o ranking!';
    } catch {
      st.className = 'msg err';
      st.textContent = 'Não consegui enviar a pontuação.';
      $('#retry-send').hidden = false;
    }
  }

  function finish() {
    $('#r-score').textContent = g.score;
    $('#r-correct').textContent = g.correct;
    $('#r-wrong').textContent = g.wrong;
    nav.go('s-fim');
    send();
  }

  document.querySelectorAll('[data-jogar]').forEach((b) => { b.onclick = () => start(b.dataset.jogar); });
  $('#retry-send').onclick = send;
  $('#again').onclick = () => start(g.op);
  $('#see-rank').onclick = () => nav.rank(g.op);
})();
