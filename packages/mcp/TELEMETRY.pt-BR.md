# Medição opcional de uso do MCP — política 1

**Situação atual: a instrumentação local, os controles de consentimento e o envio limitado estão implementados em [#274](https://github.com/rocketclimb/rocketicons/issues/274). Esta versão não possui endpoint de coleta, portanto não envia eventos de uso nem mantém uma fila de eventos, mesmo com adesão. A coleta depende de [#275](https://github.com/rocketclimb/rocketicons/issues/275).** O contrato técnico e o exemplo estão em [contracts/telemetry/v1](contracts/telemetry/v1/README.md). [English](TELEMETRY.md).

## Finalidade e escolha

Quando a coleta for lançada, o recurso medirá chamadas concluídas de ferramentas MCP, falhas, fallback da busca e novas adições de ícones confirmadas para melhorar o sistema gratuito e de código aberto Rocketicons. A participação é opcional e desativada por padrão. A descoberta de ícones e as operações do projeto devem funcionar com a telemetria desativada, bloqueada ou indisponível.

Isso não mede todos os usuários do Rocketicons nem o uso de ícones nos aplicativos. Não cria uma identidade persistente de usuário, instalação ou sessão. Contagens de instalações únicas e associação com visitantes do site ficam adiadas.

## Dados de uma versão futura com o recurso ativado

Um evento contém versões do schema/política, versões numéricas dos pacotes/catálogo, a interface MCP local, o nome permitido da ferramenta, resultado de sucesso/erro/cancelamento, duração arredondada para 10 ms e limitada a dez minutos, indicador de dry run, código de erro enumerado ou null, quantidade/origem dos resultados da busca e quantidade de novos ícones confirmados. [Veja o exemplo de payload](contracts/telemetry/v1/example.json).

Não são enviados consulta, prompt, caminho de projeto, nome de arquivo, URL de repositório, código/SVG, dependências, argumentos/resultados da ferramenta, mensagem/stack trace de erro, conta/e-mail, nome do cliente/modelo ou identificador de ícone/coleção. Campos desconhecidos são rejeitados.

Planos e dry runs adicionam zero ícones; adições repetidas e reparos adicionam zero novos ícones. Mutações com falha ou sem confirmação adicionam zero. Requisições de protocolo/ciclo de vida/recursos e falhas de validação de argumentos do SDK são excluídas. As contagens representam chamadas participantes, não pessoas; envios offline ou bloqueados podem ser perdidos.

## Controles de adesão e retirada

Para uma versão futura com um coletor verificado, defina estas variáveis somente no ambiente do processo MCP do cliente, depois de ler este aviso. Elas não ativam a coleta nesta versão:

```json
{
  "ROCKETICONS_TELEMETRY": "on",
  "ROCKETICONS_TELEMETRY_POLICY": "1"
}
```

Os dois valores exatos são necessários. Valores ausentes/inválidos desativam a coleta. `ROCKETICONS_TELEMETRY=off` a desativa. `DO_NOT_TRACK` ativo prevalece sobre a adesão. Processos de CI e testes suprimem a telemetria de produção mesmo com adesão. Nenhuma ferramenta do agente ou arquivo de projeto pode conceder consentimento.

Para retirar a adesão/redefinir, configure `off` ou remova as duas variáveis Rocketicons e desconecte/reinicie o MCP no cliente. O envio apaga a memória ainda não enviada ao desativar/encerrar; não existe fila em disco nem identificador para redefinir. Isso não exclui dados já enviados. Uma política alterada exige nova confirmação. Operadores de clientes compartilhados devem fornecer este aviso e ter autorização para ativar a coleta.

## Destinatários e requisitos de retenção

O coletor do Rocketicons seria executado na Cloudflare. Se ativado e verificado futuramente, o Google Analytics receberia as mesmas medições permitidas para relatórios MCP. A política 1 cobre esses destinatários; o encaminhamento ao Google permanece desativado até a verificação dos relatórios e configurações de privacidade.

A borda HTTP recebe o IP da conexão. A telemetria da aplicação não pode armazenar ou encaminhar IPs, user agents, cabeçalhos identificadores ou corpos brutos. Logs essenciais de segurança da plataforma são separados; suas configurações e retenção reais devem ser publicadas antes do lançamento da coleta.

Eventos não enviados ficam na memória por no máximo dez segundos, até 16 eventos, com uma tentativa de envio e sem repetição/reenvio offline. Eventos brutos não são armazenados pelo Rocketicons; eventuais agregados diários próprios expiram em até 13 meses.

Relatórios futuros de GA exclusivos para MCP exigem retenção de usuário/evento de dois meses, redefinição por atividade desativada e publicidade/signals/exportações brutas desativadas. Relatórios agregados padrão do Google podem permanecer por mais tempo; a configuração de dois meses não os cobre. Veja a [explicação de retenção do Google](https://support.google.com/analytics/answer/7667196?hl=pt-BR).

Nenhuma identidade associa seus eventos a um visitante do site ou cookie do navegador. O Google exige um identificador de protocolo; a implementação deve comprovar relatórios de contagens sem associação persistente ou manter o encaminhamento desativado. Contribuições já agregadas não podem ser localizadas com segurança para exclusão individual. Fale com os [mantenedores do repositório](https://github.com/rocketclimb/rocketicons/issues) sobre questões da política.

O GA4 do site e as requisições opcionais de busca ao Algolia são recursos separados. Desativar a telemetria MCP não torna uma busca online uma busca offline.

## Condição para lançamento

[#274](https://github.com/rocketclimb/rocketicons/issues/274) fornece os controles/envio locais; [#275](https://github.com/rocketclimb/rocketicons/issues/275) implementa o coletor e [#276](https://github.com/rocketclimb/rocketicons/issues/276) verifica os relatórios. Esses requisitos precisam ser cumpridos e o aviso atualizado com os detalhes reais de implantação antes de uma versão com coleta ativada.
