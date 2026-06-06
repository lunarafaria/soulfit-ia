SoulFit+ IA V48 - Versão Vercel

Ajustes desta versão:
- A ficha fica com 10 linhas fixas por treino no painel e na impressão.
- A IA continua limitada pelo nível/perfil/tempo do aluno: ela não preenche 10 por conta própria em todos os casos.
- Padrão de volume corrigido:
  * Iniciante: 6 a 7 exercícios.
  * Intermediário: 7 a 8 exercícios.
  * Avançado: 6 a 10 exercícios.
- Linhas excedentes ficam disponíveis para uso manual, cardio, observação ou exercício avulso.
- Históricos antigos com menos linhas são normalizados automaticamente para 10 ao abrir.
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
