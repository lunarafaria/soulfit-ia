SoulFit+ IA V46 - Versão Vercel

Ajustes desta versão:
- A ficha fica com 10 linhas fixas por treino no painel e na impressão.
- A IA continua limitada pelo nível/perfil/tempo do aluno: ela não preenche 10 por conta própria.
- Linhas 9 e 10 ficam disponíveis para uso manual, cardio, observação ou exercício avulso.
- Históricos antigos com 8 linhas são normalizados automaticamente para 10 ao abrir.
- Histórico local mantém botão Excluir.
- Limpar ficha limpa também dados do aluno, observações, patologias e treino antigo.
- Mantém rota Vercel: /api/gerar-treino.

Arquivos principais:
- index.html
- api/gerar-treino.js
- vercel.json

No Vercel, manter a variável de ambiente:
OPENAI_API_KEY

Opcional:
OPENAI_MODEL
