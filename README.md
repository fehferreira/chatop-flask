# Aplicativo focado em cadastro de clientes de conta digital/cartão

## DOD
- Ter uma página na web para consulta, cadastro, edição e deleção de clientes
- Página no formato de ChatBot (conversa/atendimento)
- Consulta baseado em CPF
- Retorno de informações e opções de gerenciamento de conta

## Pontos de atenção tech
- Usar a biblioteca Flask para rodar na web - Será a nota da APS - Até dia 06/05
- Usar sqlite para armazenamento de dados

## Modelagem de tabela
|Campo|Tipo|Obrigatório|
|-|-|-|
|id|INTEGER|SIM - PK|
|nome|TEXT|SIM|
|cpf|TEXT|SIM|
|numero_cartao|TEXT|SIM|
|limite_total|REAL|SIM|
|limite_disponível|REAL|SIM|
|fatura_atual|REAL|SIM|
|vencimento_cartao|TEXT|SIM|
|vencimento_fatura|TEXT|SIM|
|status_cartao|TEXT|SIM|