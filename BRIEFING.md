# Briefing Técnico e Funcional: Sistema de Invalidação de Cache (Cloudflare Purge)

## 1. Objetivo do Sistema
O objetivo deste sistema é atuar como um middleware especializado para gerenciar a limpeza de cache na rede da Cloudflare. Ele deve prover uma interface segura e padronizada para que sistemas de origem (CMS, Backoffice, ERPs) possam solicitar a invalidação de conteúdos específicos sem a necessidade de interagir diretamente com a API complexa da Cloudflare ou gerenciar credenciais sensíveis.

## 2. Problema que Resolve
*   **Segurança:** Evita a exposição de chaves globais da Cloudflare em múltiplos sistemas de origem.
*   **Complexidade:** Centraliza a lógica de expurgo (por URL, por Tag ou Zone) em um único ponto, facilitando a manutenção.
*   **Auditabilidade:** Permite o registro (log) de quem solicitou a limpeza e o resultado da operação.
*   **Abstração:** Simplifica o processo de invalidação para sistemas que não possuem suporte nativo ou integração simplificada com a Cloudflare.

## 3. Fluxo de Funcionamento
1.  **Solicitação:** O Sistema de Origem envia uma requisição HTTP POST para o nosso middleware.
2.  **Autenticação:** O sistema valida o token de acesso (API Key/Bearer Token) enviado no Header.
3.  **Parsing/Validação:** O sistema processa o corpo da requisição para identificar o tipo de expurgo (URL, Tag ou Zona) e valida a estrutura dos dados.
4.  **Integração Cloudflare:** O sistema solicita o expurgo à API da Cloudflare utilizando as credenciais seguras armazenadas em variáveis de ambiente.
5.  **Resposta:** O sistema retorna o status da operação ao Sistema de Origem (Sucesso/Erro).

## 4. Requisitos Funcionais (RF)
*   **RF01 (Autenticação):** O sistema deve validar chaves de API para permitir o acesso aos endpoints.
*   **RF02 (Purge por URL):** Deve ser possível enviar uma ou mais URLs específicas para limpeza.
*   **RF03 (Purge por Tag):** Deve ser possível limpar o cache baseado em `Cache-Tags` (comum em arquiteturas headless).
*   **RF04 (Purge Todo - Zona):** Deve permitir a limpeza completa (Purge Everything) de uma zona específica.
*   **RF05 (Logs):** O sistema deve registrar cada tentativa de limpeza, informando data, origem, tipo de expurgo e resposta da Cloudflare.

## 5. Requisitos Não Funcionais (RNF)
*   **RNF01 (Tecnologia):** Desenvolvido utilizando **Next.js 14** (App Router) e **React 18**.
*   **RNF02 (Performance):** A resposta do middleware deve ser rápida (< 500ms), preferencialmente utilizando Route Handlers para processamento no servidor.
*   **RNF03 (Escalabilidade):** O sistema deve ser compatível com deploys em ambientes serverless (Vercel/Edge Runtime) para suportar picos de demanda.
*   **RNF04 (Disponibilidade):** Resiliência a falhas na API da Cloudflare com tratamento adequado de erros.

## 6. Integrações Envolvidas
*   **Sistema de Origem:** Cliente (via REST API).
*   **Cloudflare API (v4):** Destinatário das solicitações de invalidação.
    *   Endpoint: `https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache`.

## 7. Segurança
*   **Proteção de Segredos:** O `CLOUDFLARE_API_TOKEN` e o `CLOUDFLARE_ZONE_ID` nunca devem ser expostos ao frontend ou ao sistema de origem; devem residir estritamente no backend (Environment Variables).
*   **Auth Token:** Cada sistema de origem deverá possuir um token único gerado pelo admin do sistema de limpeza.

## 8. Critérios de Sucesso
*   Invalidação de cache refletida na Cloudflare em menos de 2 segundos após a chamada do sistema de origem.
*   Retorno correto de códigos de erro HTTP (ex: 401 para não autorizado, 400 para payloads inválidos).
*   Dashboard ou log acessível para conferência de requisições.

## 9. Possíveis Riscos e Recomendações
*   **Risco (Rate Limit):** A API da Cloudflare possui limites de requisições. 
    *   *Recomendação:* Implementar uma fila simples ou tratamento de erro com retry se o volume for muito alto.
*   **Risco (Purge Exagerado):** O "Purge Everything" pode derrubar a performance do site original devido à carga repentina no servidor de origem (Cache Miss storm).
    *   *Recomendação:* Limitar o uso do Purge Total apenas a usuários com privilégios administrativos.
*   **Risco (Next.js Caching):** Como o sistema usa Next.js 14, deve-se garantir que as rotas de API (Route Handlers) não sejam cacheadas indevidamente.
    *   *Recomendação:* Utilizar `export const dynamic = 'force-dynamic'` nas rotas de API.
