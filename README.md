# Desafio da Matemática (jogo 1)

Jogo de soma, subtração, multiplicação e divisão para alunos sem dificuldade de aprendizagem: 60 segundos, a dificuldade sobe a cada 4 acertos e o **ranking é semanal** (zera toda segunda-feira, horário de Brasília), separado por operação. Site estático (HTML/CSS/JS puro) + Supabase. Layout responsivo (celular, tablet, notebook/Chromebook).

## Fluxo de telas
1. **Qual é o seu ano?** (6º, 7º, 8º ou 9º). Cada ano tem o seu próprio ranking.
2. **Quem está jogando?** apelido e turma (ficam lembrados no aparelho).
3. **O que vamos treinar?** Somar, Subtrair, Multiplicar ou Dividir.
4. **Jogo** de 60 segundos e **resultado**.

Em todas as telas (menos a primeira) há os botões **← Voltar** e **🏠 Início**. O ranking pode ser aberto na 1ª tela ou ao fim de cada partida, com abas por ano e por operação. Em Multiplicar/Dividir aparece um botão **📋 (tabuada)** que mostra a tabuada do número da pergunta.

## Pontuação
- O ano define a dificuldade inicial (6º = nível 1 … 9º = nível 4); depois ela sobe a cada 4 acertos.
- 10 pontos por acerto; a cada 5 acertos seguidos, +10 de bônus.
- No ranking aparece a **melhor** pontuação de cada aluno (apelido + turma) na semana, dentro do seu ano.
- A divisão nunca deixa resto (sempre exata), para não travar quem está aprendendo.

## Banco (Supabase)
Está em `supabase/schema.sql` (tabela `mat_scores` + funções `submit_score` e `get_weekly_ranking`).
O mesmo banco é compartilhado com o jogo guiado (coluna `variant`: `normal` / `guiado`), então rode o SQL **uma vez só**.
Já foi aplicado no projeto "Materiais adaptados". URL e chave ficam em `config.js`.

Segurança: ninguém escreve direto na tabela (RLS sem policy de insert); só a função `submit_score`, que valida os dados
(apelido 2–20 letras, pontos 0–2000). Leitura do ranking é pública.

## Rodar local
```
npx serve .
```

## GitHub + Vercel
```
git init
git add .
git commit -m "Desafio da Matemática"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/jogo-matematica-normal.git
git push -u origin main
```
Na Vercel: **Add New > Project**, escolha o repositório, deixe *Framework Preset: Other* e clique em **Deploy** (não precisa de build).
