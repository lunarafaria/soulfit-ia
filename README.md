# SoulFit+ IA V57

Aplicativo web para apoio à prescrição de treinos por profissionais de Educação Física.

## Estrutura

- `index.html`: aplicativo completo.
- `api/gerar-treino.js`: geração da ficha com IA.
- `api/assistente-treino.js`: conversa e ajustes da ficha com IA.
- `REFERENCIAS_CLINICAS.md`: referências técnicas usadas no projeto.
- `vercel.json`: configuração da implantação.

## Publicar no GitHub e na Vercel

1. Envie o conteúdo desta pasta para a raiz do repositório. O arquivo deve se chamar exatamente `index.html`.
2. Importe o repositório na Vercel como um projeto novo ou atualize o projeto existente.
3. Em **Settings > Environment Variables**, crie `OPENAI_API_KEY` com a chave da API da OpenAI.
4. Faça um novo deploy após salvar a variável.

Variáveis opcionais:

- `OPENAI_MODEL`: substitui o modelo padrão usado pelo backend.
- `OPENAI_REASONING_EFFORT`: controla o esforço de raciocínio; o padrão é `low`.

Não coloque a chave da OpenAI no `index.html`, no GitHub ou em qualquer arquivo público.

## Funcionamento

- A opção **Definir quantidade para a IA** permite escolher `6 a 7`, `7 a 8` ou `8 a 10` exercícios por treino.
- Sem essa opção marcada, o limite continua automático conforme nível, duração e perfil.
- O professor precisa revisar e aprovar a ficha depois de alterações relevantes.
- O histórico e os alunos ficam no IndexedDB do navegador usado. Eles não são sincronizados automaticamente entre aparelhos.
- O botão **Imprimir / salvar PDF** abre o diálogo de impressão do navegador; selecione **Salvar como PDF**.
- Dados identificáveis do aluno são removidos antes do envio ao modelo.

## Atualização de uma versão existente

Substitua os arquivos antigos pelos arquivos desta pasta, preserve a variável `OPENAI_API_KEY` na Vercel e execute um novo deploy. Se o navegador mostrar uma versão anterior, faça uma atualização forçada da página.

