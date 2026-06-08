SoulFit+ IA V55 - Cardio opcional corrigido

Arquivos corretos para subir na raiz do GitHub:
- index.html
- vercel.json
- pasta api/gerar-treino.js
- README.txt
- REFERENCIAS_VOLUME.txt

Ajustes:
- Mantém 10 linhas fixas no painel 3. Editar ficha.
- Mantém 10 linhas fixas na seção 4. Ficha para impressão.
- Cardio opcional com checkbox.
- Tipo de cardio: Automático, Esteira, Bike, Elíptico ou Escada.
- Tempo do cardio: Automático, 10 min, 15 min, 20 min ou 30 min.
- Cardio entra preferencialmente nas linhas 9 e 10, quando houver espaço.
- IA limitada por nível:
  * Iniciante: 6 a 7 exercícios.
  * Intermediário: 7 a 8 exercícios.
  * Avançado: 6 a 10 exercícios.
- Nova opção no menu:
  * "Definir quantidade de exercícios da IA".
  * Só vale quando o checkbox estiver marcado.
  * Faixas disponíveis: 6 a 7, 7 a 8 e 8 a 10 exercícios por treino.
- Mantém rota Vercel: /api/gerar-treino.
- Mantém histórico com excluir e limpar ficha completa.

Importante:
Suba estes arquivos na raiz do GitHub. Não suba dentro da pasta soulfit_ia_netlify_v14.
