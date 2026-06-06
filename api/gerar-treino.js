
function cleanEx(v){
  let s=String(v||'').trim();
  for(let i=0;i<4;i++){
    s=s
      .replace(/^\d{1,2}\uFE0F?\u20E3\s*/u,'')
      .replace(/^[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F\u20E3]+/gu,'')
      .replace(/^[☐☑☒□■▪▫▢▣◻◼✓✔•●○◆◇►▸→➡]+/gu,'')
      .replace(/^\s*(?:\d{1,2}\s*[\.)\-:]\s*|\d{1,2}\s+)/u,'')
      .replace(/^[\s\-–—*]+/u,'')
      .trim();
  }
  return s;
}

function parseTreinoTexto(txt){
  const res={A:[],B:[],C:[],D:[]};
  let atual=null;
  String(txt||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean).forEach(raw=>{
    const h=raw.match(/treino\s*([abcd])/i);
    if(h){atual=h[1].toUpperCase();return;}
    if(!atual||!res[atual])return;
    let s=cleanEx(raw);
    if(!s)return;
    let ex=s, sr='';
    let m=s.match(/(.+?)\s*[-–]\s*((?:\d+\s*x\s*[\d\-]+.*|[2345]x[\d\-]+.*|FINAL.*|.*voltas?.*|.*seg.*|.*s$))$/i)||s.match(/(.+?)\s+((?:\d+\s*x\s*[\d\-]+.*|[2345]x[\d\-]+.*))$/i);
    if(m){ex=m[1].trim();sr=m[2].trim();}
    res[atual].push({ex:cleanEx(ex),sr:sr.trim()});
  });
  return res;
}

function seriePadrao(nivel){
  if(nivel==='Iniciante') return '2x10-12';
  if(nivel==='Intermediário') return '3x8-12';
  return '3x8-10';
}

function normalizarSerie(sr,nivel,indice){
  let s=String(sr||'').trim() || seriePadrao(nivel);
  if(nivel==='Iniciante'){
    s=s.replace(/^\s*[345]\s*x/i,'2x').replace(/^\s*\d+\s*x\s*6-8/i,'2x10-12');
  }else if(nivel==='Intermediário'){
    s=s.replace(/^\s*4\s*x/i,'3x');
  }else if(indice>0){
    s=s.replace(/^\s*4\s*x/i,'3x');
  }
  return s;
}

function treinosAtivosPorDivisao(divisao){
  if(divisao==='A/B') return ['A','B'];
  if(divisao==='A/B/C/D') return ['A','B','C','D'];
  if(divisao==='MI/MS') return ['A','B'];
  return ['A','B','C'];
}

function limitarTreinoTexto(txt,{limite,nivel,divisao}){
  const parsed=parseTreinoTexto(txt);
  const ativos=treinosAtivosPorDivisao(divisao);
  const linhas=[];
  ativos.forEach(l=>{
    const itens=(parsed[l]||[]).filter(r=>r.ex).slice(0,limite);
    linhas.push('TREINO '+l);
    itens.forEach((r,i)=>linhas.push(`${i+1}️⃣ ${cleanEx(r.ex)} - ${normalizarSerie(r.sr,nivel,i)}`));
    linhas.push('');
  });
  return linhas.join('\n').trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST." });
  }

  try {
    const dados = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY não configurada na Vercel." });
    }

    const divisao = dados.divisao || "A/B/C";
    let regraDivisao = "Gere SOMENTE TREINO A, TREINO B e TREINO C. Não gere D.";
    if (divisao === "A/B") regraDivisao = "Gere SOMENTE TREINO A e TREINO B. Não gere C nem D.";
    if (divisao === "A/B/C/D") regraDivisao = "Gere TREINO A, TREINO B, TREINO C e TREINO D.";
    if (divisao === "MI/MS") regraDivisao = "Gere SOMENTE TREINO A - MI e TREINO B - MS. Não gere C nem D.";

    const nivel = dados.nivel || "Iniciante";
    const perfilVolume = dados.perfilVolume || "Conservador científico";
    const tempoSessao = dados.tempoSessao || "40-60 min";

    let limite = nivel === "Iniciante" ? 5 : nivel === "Intermediário" ? 6 : 7;
    if (perfilVolume === "Hipertrofia avançada controlada" && nivel === "Avançado") limite = 8;
    if (tempoSessao === "30-40 min") limite = Math.max(4, limite - 1);
    if (tempoSessao === "60-75 min" && nivel !== "Iniciante") limite = Math.min(8, limite + 1);

    const prompt = `
Você é a IA assistente da Luna, profissional de Educação Física e CEO da SoulFit+.
Monte uma ficha com base em ciência do treinamento, segurança e padrão SoulFit+.

DADOS DO ALUNO:
${JSON.stringify(dados, null, 2)}

DIVISÃO:
${regraDivisao}

REGRA DE VOLUME CIENTÍFICO + PADRÃO SOULFIT+:
- NÃO prescrever 10 exercícios por sessão.
- Máximo absoluto nesta ficha: ${limite} exercícios por treino. Conte antes de responder.
- Iniciante: 4 a 5 exercícios, geralmente 2 séries, técnica, segurança e adaptação.
- Intermediário: 5 a 6 exercícios, geralmente 3 séries.
- Avançado: 6 a 7 exercícios, 3 séries; 4 séries apenas no exercício prioritário.
- Hipertrofia avançada controlada: até 8 exercícios só se avançado e sem restrição relevante.
- Patologia/dor/retorno: reduzir volume, evitar redundância e priorizar segurança.
- Finalizadores contam como exercício/bloco e só entram se couberem.
- Emagrecimento não significa excesso de exercícios.
- A OMS recomenda fortalecimento dos grandes grupos musculares em 2 ou mais dias por semana, mas não exige 10 exercícios por sessão.
- Referência prática: iniciante 6-10 séries semanais por grande grupo; intermediário 8-12; avançado 10-16, sempre individualizando.

PADRÃO LUNA/SOULFIT+:
- Ficha objetiva, aplicável em academia real.
- Normalmente 5 a 7 exercícios por treino.
- Multiarticulares no início; isoladores depois.
- Mulheres: quando seguro, prioridade para inferiores/glúteos e um dia de superiores organizado.
- Homens: quando seguro, prioridade inicial para superiores, sem negligenciar inferiores.
- Patologia manda mais que estética.
- Não repetir padrões desnecessários na mesma sessão.

REGRAS:
1. Não gerar treino genérico.
2. Não ultrapassar ${limite} exercícios por treino. Se passar de ${limite}, refaça antes de responder.
3. Não preencher linhas vazias e não completar a ficha até 10 linhas.
4. Não gerar 10 exercícios por treino.
5. Primeira prescrição: progressão conservadora.
6. Evolução com treino antigo: evoluir sem copiar tudo.
7. Adaptação por lesão/patologia: substituir o que for inadequado.
8. Se modoPatologiaExclusiva=true, a patologia manda mais que objetivo estético.
9. Considerar idade, sexo, objetivo, nível, experiência, frequência, restrições, patologia, tempo e perfil de volume.
10. Treino funcional: blocos simples, seguros, mobilidade, estabilidade, core e condicionamento sem excesso.
11. Não inventar diagnóstico.

FORMATO OBRIGATÓRIO:
Responda apenas com a ficha.

TREINO A
1️⃣ Exercício - 3x10
2️⃣ Exercício - 3x12

TREINO B
1️⃣ Exercício - 3x10

Antes de finalizar, faça uma autocorreção silenciosa: nenhum treino pode ter mais que ${limite} exercícios.
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.1",
        input: prompt,
        max_output_tokens: 2200
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: "Erro na API da OpenAI. Verifique a chave, créditos e modelo configurado." });
    }

    const treinoBruto = data.output_text || (data.output || []).flatMap(i => i.content || []).map(c => c.text || "").join("\n").trim();
    const treino = limitarTreinoTexto(treinoBruto, { limite, nivel, divisao });
    return res.status(200).json({ treino });

  } catch (error) {
    return res.status(500).json({ error: "Erro interno ao gerar treino." });
  }
}
