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

Crie uma NOVA ficha individualizada, evoluindo o treino antigo sem copiar.

DADOS DO ALUNO:
${JSON.stringify(dados, null, 2)}

REGRA DE DIVISÃO:
${regraDivisao}

REGRAS:
- Respeitar sexo, objetivo, nível, frequência, restrições, patologia e modo patologia exclusiva.
- Se modoPatologiaExclusiva for true, a patologia manda mais que o objetivo estético.
- Se houver patologia, controlar amplitude, carga, impacto, estabilidade, dor e sinais de alerta.
- Aplicar sobrecarga progressiva, especificidade, recuperação e volume adequado.
- Para mulher, quando seguro, priorizar inferiores/glúteos no começo da divisão.
- Para homem, quando seguro, priorizar superiores no começo da divisão.
- Não gerar treinos fora da divisão escolhida.
- Não inventar diagnóstico.

FORMATO OBRIGATÓRIO:
Responda apenas com a ficha, assim:
TREINO A
1️⃣ Exercício - 3x10
2️⃣ Exercício - 3x12
FINAL (opcional)
• Exercício - 30s

No máximo 10 linhas por treino.
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
      return { statusCode: response.status, headers: {"Content-Type":"application/json"}, body: JSON.stringify({ error: data.error?.message || "Erro na API da OpenAI." }) };
    }

    const treino = data.output_text || (data.output || []).flatMap(i => i.content || []).map(c => c.text || "").join("\n").trim();
    return { statusCode: 200, headers: {"Content-Type":"application/json"}, body: JSON.stringify({ treino }) };
  } catch (error) {
    return { statusCode: 500, headers: {"Content-Type":"application/json"}, body: JSON.stringify({ error: error.message || "Erro interno." }) };
  }
}