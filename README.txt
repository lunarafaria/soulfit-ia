SoulFit+ IA V44 - Versão para Vercel

Arquivos principais:
- index.html
- api/gerar-treino.js
- vercel.json
- REFERENCIAS_VOLUME.txt

O que mudou:
- A rota da IA foi alterada de /.netlify/functions/gerar-treino para /api/gerar-treino.
- A função foi convertida do padrão Netlify para o padrão Vercel.
- O limite de volume continua travado no código.
- A IA não deve preencher 10 exercícios por sessão.

Como subir no GitHub:
1. Substitua o index.html antigo por este index.html.
2. Crie uma pasta chamada api na raiz do repositório.
3. Coloque gerar-treino.js dentro da pasta api.
4. Coloque vercel.json na raiz do repositório.
5. Pode remover netlify.toml se não for mais usar Netlify.

Configuração no Vercel:
- Framework: Other
- Root Directory: ./
- Build Command: vazio
- Output Directory: vazio ou .
- Environment Variable obrigatória:
  OPENAI_API_KEY = sua chave da OpenAI

Opcional:
  OPENAI_MODEL = gpt-5.1

Depois clique em Deploy/Implantar.
