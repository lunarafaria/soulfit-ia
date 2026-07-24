import { calcularLimites, responderChat } from "./gerar-treino.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST." });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY não configurada na Vercel.",
      });
    }

    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : req.body || {};
    const mensagem = String(body.mensagem || "").trim();

    if (!mensagem) {
      return res.status(400).json({ error: "Digite uma orientação para a Liora." });
    }

    const dados = {
      ...(body.contexto || {}),
      acao: "chat",
      mensagemProfessor: mensagem,
      historicoChat: Array.isArray(body.historicoChat)
        ? body.historicoChat.slice(-10)
        : [],
    };
    const resultado = await responderChat(dados, calcularLimites(dados));

    return res.status(200).json({
      resposta: resultado.mensagem,
      treino: resultado.treino || "",
    });
  } catch (error) {
    const status = Number(error.status) || 500;
    const mensagem =
      status === 401
        ? "Chave da OpenAI inválida ou sem acesso."
        : status === 429
          ? "Limite ou saldo da OpenAI atingido."
          : error.message || "Erro interno no assistente.";
    return res.status(status).json({ error: mensagem });
  }
}
