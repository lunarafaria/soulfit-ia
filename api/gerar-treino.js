
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

export function calcularLimites(dados){
  const nivel=dados.nivel||'Iniciante';
  const tempo=dados.tempoSessao||'40-60 min';
  const perfil=dados.perfilVolume||'Conservador científico';
  let minimo=nivel==='Iniciante'?6:nivel==='Intermediário'?7:6;
  let maximo=nivel==='Iniciante'?7:nivel==='Intermediário'?8:10;
  let limite=maximo;

  if(nivel==='Avançado'){
    limite=tempo==='30-40 min'?6:tempo==='60-75 min'?10:8;
    if(perfil==='Hipertrofia avançada controlada')limite=10;
  }else if(tempo==='30-40 min'){
    limite=minimo;
  }

  if(dados.usarQuantidadeIA===true){
    const faixa=String(dados.quantidadeExerciciosIA||'');
    if(faixa==='6 a 7'){minimo=6;limite=7}
    if(faixa==='7 a 8'){minimo=7;limite=8}
    if(faixa==='8 a 10'){minimo=8;limite=10}
  }

  return {minimo,limite:Math.min(10,Math.max(minimo,limite))};
}

function regraDaDivisao(divisao){
  if(divisao==='A/B')return 'Gere somente os treinos A e B.';
  if(divisao==='A/B/C/D')return 'Gere os treinos A, B, C e D.';
  if(divisao==='MI/MS')return 'Gere A para membros inferiores e B para membros superiores.';
  return 'Gere somente os treinos A, B e C.';
}

function textoDaResposta(data){
  return String(data.output_text||(data.output||[]).flatMap(i=>i.content||[]).map(c=>c.text||'').join('\n')).trim();
}

function dadosAnonimizados(dados){
  const copia={...dados};
  delete copia.aluno;
  delete copia.nascimento;
  delete copia.horario;
  delete copia.dataFicha;
  delete copia.dataAvaliacao;
  delete copia.historicoChat;
  delete copia.mensagemProfessor;
  return copia;
}

async function consultarOpenAI(prompt,maxOutputTokens=3000){
  const response=await fetch('https://api.openai.com/v1/responses',{
    method:'POST',
    headers:{
      'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type':'application/json'
    },
    body:JSON.stringify({
      model:process.env.OPENAI_MODEL||'gpt-5.6-sol',
      input:prompt,
      reasoning:{effort:process.env.OPENAI_REASONING_EFFORT||'low'},
      text:{verbosity:'medium'},
      max_output_tokens:maxOutputTokens
    })
  });
  const data=await response.json();
  if(!response.ok){
    const detalhe=data&&data.error&&data.error.message;
    const erro=new Error(detalhe||'Falha ao consultar a OpenAI.');
    erro.status=response.status;
    throw erro;
  }
  return textoDaResposta(data);
}

function separarFicha(texto,marcador){
  const indice=texto.toUpperCase().indexOf(marcador.toUpperCase());
  if(indice<0)return {mensagem:texto,ficha:''};
  return {
    mensagem:texto.slice(0,indice).replace(/^RESPOSTA\s*:\s*/i,'').trim(),
    ficha:texto.slice(indice+marcador.length).trim()
  };
}

export async function responderChat(dados,limites){
  const prompt=`
Você é o assistente técnico SoulFit+ para um profissional de Educação Física.
Responda em português do Brasil, com objetividade e raciocínio aplicável à prescrição.
Não diagnostique, não invente referências e sinalize quando sintomas ou sinais exigirem avaliação de saúde.

DADOS ANONIMIZADOS:
${JSON.stringify(dadosAnonimizados(dados),null,2)}

HISTÓRICO RECENTE DA CONVERSA:
${JSON.stringify((dados.historicoChat||[]).slice(-10),null,2)}

PEDIDO DO PROFISSIONAL:
${String(dados.mensagemProfessor||'')}

REGRAS:
- Considere cadastro, avaliação, equipamentos, condição clínica, dor, treino anterior e treino atual.
- Se o pedido for apenas explicação, responda começando por "RESPOSTA:" e não gere ficha.
- Se o pedido alterar exercícios, volume, ordem, divisão ou séries, explique brevemente e depois escreva "FICHA ATUALIZADA:".
- Após "FICHA ATUALIZADA:", devolva a ficha completa, não apenas o exercício alterado.
- Use no máximo ${limites.limite} exercícios em cada treino.
- Cada linha da ficha deve ter "Exercício - séries x repetições".
- A ficha precisa usar apenas as divisões solicitadas pelo prontuário.
`;
  const bruto=await consultarOpenAI(prompt,3200);
  let partes=separarFicha(bruto,'FICHA ATUALIZADA:');
  if(!partes.ficha&&/\bTREINO\s+A\b/i.test(bruto)){
    const inicio=bruto.search(/\bTREINO\s+A\b/i);
    partes={mensagem:bruto.slice(0,inicio).replace(/^RESPOSTA\s*:\s*/i,'').trim(),ficha:bruto.slice(inicio)};
  }
  const treino=partes.ficha?limitarTreinoTexto(partes.ficha,{limite:limites.limite,nivel:dados.nivel||'Iniciante',divisao:dados.divisao||'A/B/C'}):'';
  return {mensagem:partes.mensagem||'Ajuste preparado para revisão profissional.',treino};
}

async function gerarFicha(dados,limites){
  const divisao=dados.divisao||'A/B/C';
  const faixa=dados.usarQuantidadeIA===true?`${dados.quantidadeExerciciosIA} exercícios`:`${limites.minimo} a ${limites.limite} exercícios`;
  const prompt=`
Você é o assistente de prescrição SoulFit+ para um profissional de Educação Física.
Monte uma ficha individualizada, aplicável aos equipamentos disponíveis e baseada em princípios de treinamento resistido.
Não diagnostique. Se os dados indicarem condição que exija liberação ou avaliação, seja conservador e registre isso na justificativa.

PRONTUÁRIO ANONIMIZADO:
${JSON.stringify(dadosAnonimizados(dados),null,2)}

REGRAS DA FICHA:
- ${regraDaDivisao(divisao)}
- Use ${faixa} por treino e nunca ultrapasse ${limites.limite}.
- Cardio conta como um bloco dentro do limite e só entra quando incluirCardio=true.
- Quando incluirIntervalado=true, inclua um único bloco ${dados.intervaladoTipo||"intervalado"} no treino ${dados.intervaladoDestino||"indicado"}, usando ${dados.intervaladoProtocolo||"protocolo adequado"} e ${dados.intervaladoExercicio||"modalidade compatível"}. Esse bloco também conta no limite.
- Organize padrões multiarticulares antes dos acessórios quando forem adequados.
- Ajuste séries, repetições, impacto, amplitude e complexidade ao nível, dor, histórico, patologias e tempo.
- Em evolução, preserve exercícios que ainda fazem sentido e altere somente o que tiver justificativa.
- Não invente diagnóstico, teste, carga usada ou resposta clínica.

FORMATO OBRIGATÓRIO:
FICHA
TREINO A
1. Exercício - 3x10
2. Exercício - 3x12

TREINO B
1. Exercício - 3x10

JUSTIFICATIVA TÉCNICA:
- Escreva de 3 a 6 pontos curtos sobre divisão, volume, escolhas, progressão e cuidados.
`;
  const bruto=await consultarOpenAI(prompt,3600);
  const partes=separarFicha(bruto,'JUSTIFICATIVA TÉCNICA:');
  const ficha=partes.mensagem.replace(/^FICHA\s*/i,'').trim();
  const treino=limitarTreinoTexto(ficha,{limite:limites.limite,nivel:dados.nivel||'Iniciante',divisao});
  if(!treino||!/\bTREINO\s+A\b/i.test(treino))throw new Error('A IA não retornou uma ficha válida.');
  return {treino,justificativa:partes.ficha||'Ficha individualizada para revisão profissional.'};
}

export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Use POST.'});

  try{
    const dados=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
    if(!process.env.OPENAI_API_KEY)return res.status(500).json({error:'OPENAI_API_KEY não configurada na Vercel.'});
    const limites=calcularLimites(dados);
    const resultado=dados.acao==='chat'?await responderChat(dados,limites):await gerarFicha(dados,limites);
    return res.status(200).json(resultado);
  }catch(error){
    const status=Number(error.status)||500;
    const mensagem=status===401?'Chave da OpenAI inválida ou sem acesso.':status===429?'Limite ou saldo da OpenAI atingido.':error.message||'Erro interno ao gerar treino.';
    return res.status(status).json({error:mensagem});
  }
}
