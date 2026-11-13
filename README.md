# Gerador de Propostas Solturi

Site para montar propostas comerciais da Solturi Energia Solar (recarga veicular e analisador de potência) no padrão visual da marca.

**Abrir:** https://viniciusmorsch-eng.github.io/gerador-propostas-solturi/

## Como usar
- Preencha os dados no formulário à esquerda; a prévia das páginas A4 atualiza na hora.
- **Baixar PDF** gera o arquivo direto no navegador. **Baixar HTML** gera um arquivo para abrir e imprimir (Ctrl+P › Salvar como PDF).
- **Salvar proposta** grava a proposta na planilha Google "Propostas Solturi" (uma linha por proposta). Qualquer navegador ou computador que abrir o site vê a mesma lista, que atualiza a cada 30 segundos.
- Se dois usuários tentarem salvar o mesmo número ao mesmo tempo, a segunda proposta é salva automaticamente com o próximo número livre.
- A numeração começa em 203 e segue a partir da maior proposta salva.

## Arquivos
- `index.html`: o site inteiro. O link da planilha fica na constante `API_URL`.
- `apps-script/Code.gs`: código do Apps Script publicado como App da Web (Executar como: Eu, Quem pode acessar: Qualquer pessoa). Se mudar o código, publique em Implantar › Gerenciar implantações › Editar › Nova versão, para manter o mesmo link.
