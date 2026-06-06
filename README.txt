SoulFit+ IA V45 - Versao Vercel

Atualizacoes desta versao:
- A ficha voltou a ter 10 espacos por treino para edicao manual.
- A IA continua limitada pelo nivel do aluno: ela preenche apenas o limite permitido.
- Os espacos 9 e 10 ficam livres para ajustes manuais, cardio, observacao ou exercicio avulso.
- Historico local agora tem botao Excluir.
- Limpar ficha agora limpa tambem os dados do aluno, observacoes, patologias e treino antigo.
- Mensagens de erro da API foram protegidas para nao expor chave sensivel na tela.

Arquivos principais:
- index.html
- api/gerar-treino.js
- vercel.json

No Vercel, manter a variavel de ambiente:
OPENAI_API_KEY

Opcional:
OPENAI_MODEL
