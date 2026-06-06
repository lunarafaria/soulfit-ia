export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: {"Content-Type":"application/json"}, body: JSON.stringify({ error: "Use POST." }) };
  }

  try {
    const dados = JSON.parse(event.body || "{}");

    if (!process.env.OPENAI_API_KEY) {
      return { statusCode: 500, headers: {"Content-Type":"application/json"}, body: JSON.stringify({ error: "OPENAI_API_KEY não configurada no Netlify." }) };
    }

    const divisao = dados.divisao || "A/B/C";
    let regraDivisao = "Gere SOMENTE TREINO A, TREINO B e TREINO C. Não gere D.";
    if (divisao === "A/B") regraDivisao = "Gere SOMENTE TREINO A e TREINO B. Não gere C nem D.";
    if (divisao === "A/B/C/D") regraDivisao = "Gere TREINO A, TREINO B, TREINO C e TREINO D.";
    if (divisao === "MI/MS") regraDivisao = "Gere SOMENTE TREINO A - MI e TREINO B - MS. Não gere C nem D.";

    const prompt = `
Você é a IA assistente da Luna, profissional de Educação Física e CEO da SoulFit+.
Prescreva no padrão SoulFit+, respeitando o estilo da Luna e princípios atuais de treinamento:
individualização, especificidade, sobrecarga progressiva, controle de volume, recuperação, técnica,
segurança articular e adaptação à patologia.

DADOS DO ALUNO:
${JSON.stringify(dados, null, 2)}

REGRA DE DIVISÃO:
${regraDivisao}

REGRAS ESSENCIAIS:
1. Não gerar treino genérico.
2. Primeira prescrição: não exige treino antigo. Para iniciante, priorizar adaptação anatômica, técnica, segurança, máquinas, exercícios simples, volume moderado e baixa complexidade.
3. Evolução com treino anterior: usar o treino antigo como referência, mas não copiar. Evoluir por variações, volume, intensidade e distribuição.
4. Adaptação por lesão/patologia: a nova condição manda mais que a ficha antiga. Substituir exercícios inadequados por opções seguras.
5. Se modoPatologiaExclusiva for true, a patologia manda mais que o objetivo estético.
6. Considerar idade, sexo, objetivo, nível, experiência, frequência, restrições e patologia.
7. Para mulher, quando seguro e coerente, priorizar inferiores/glúteos no começo da divisão, padrão Luna.
8. Para homem, quando seguro e coerente, priorizar superiores no começo da divisão, padrão Luna.
9. Modalidade funcional: usar circuitos/blocos, core, mobilidade, estabilidade e condicionamento. Para iniciantes, evitar impacto alto e movimentos complexos.
10. Musculação + funcional: treino principal + final funcional.
11. Não gerar treinos fora da divisão escolhida.
12. Não inventar diagnóstico.
13. Máximo 10 linhas por treino.
14. Não use emojis, ícones, caixas, marcadores decorativos ou números emoji.
15. Em cada linha, escreva somente o nome do exercício, seguido de hífen e séries/repetições.

FORMATO OBRIGATÓRIO:
Responda apenas com a ficha, sem texto introdutório.

TREINO A
Exercício - 3x10
Exercício - 3x12
Exercício - 2x15

FINAL (opcional)
Exercício - 30s

TREINO B
Exercício - 3x10
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
        max_output_tokens: 2500
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ error: data.error?.message || "Erro na API da OpenAI." })
      };
    }

    const treino = data.output_text || (data.output || []).flatMap(i => i.content || []).map(c => c.text || "").join("\n").trim();

    return {
      statusCode: 200,
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ treino })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ error: error.message || "Erro interno." })
    };
  }
}
