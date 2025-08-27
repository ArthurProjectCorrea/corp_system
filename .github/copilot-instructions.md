# Copilot Instructions for AI Agents

## Visão Geral

Este monorepo utiliza Turborepo para gerenciar múltiplos apps e pacotes TypeScript, com foco em Next.js e Tailwind CSS. O objetivo é facilitar o desenvolvimento de apps web modernos, compartilhando configurações e componentes entre projetos.

## Estrutura Principal

- `apps/web` e `apps/docs`: Aplicações Next.js independentes, cada uma com seu próprio `app/`, assets e configurações.
- `packages/ui`: Biblioteca de componentes React compartilhada, estilizada com Tailwind CSS (usa prefixo `ui-` para evitar conflitos).
- `packages/eslint-config`, `packages/typescript-config`, `packages/tailwind-config`: Configurações compartilhadas para lint, TypeScript e Tailwind.

## Fluxos de Desenvolvimento

- **Build/Dev:** Use `pnpm dev` para desenvolvimento e `pnpm build` para build de produção (ambos usam Turbo).
- **Lint/Format:** `pnpm lint` e `pnpm format` aplicam regras globais.
- **Commits Semânticos:** Use `pnpm commit` para abrir um assistente interativo (Commitizen + cz-conventional-changelog). Mensagens são validadas por Commitlint via Husky.
- **Versionamento:** Use `pnpm changeset` para criar changelogs e gerenciar versões. O Changeset está inicializado na raiz.

## Convenções e Padrões

- Componentes do pacote `ui` devem usar classes Tailwind prefixadas com `ui-`.
- Apps consomem componentes diretamente via `transpilePackages` no Next.js.
- Configurações compartilhadas ficam em `packages/*-config` e são importadas via `extends` ou `require`.
- Cada app pode customizar seu próprio `tailwind.config.ts` se necessário, mas deve incluir paths dos pacotes compartilhados.

## Integrações e Dependências

- **Next.js**: Apps em `apps/` usam Next.js 13+ (pasta `app/`).
- **Tailwind CSS**: Configurado globalmente, mas cada app/pacote pode customizar.
- **Husky**: Hooks de git para garantir qualidade e padronização de commits.
- **Commitlint**: Valida mensagens de commit semântico.
- **Changeset**: Gerencia changelogs e versionamento multi-pacote.

## Exemplos de Comandos

- Rodar app web: `pnpm --filter web dev`
- Rodar lint global: `pnpm lint`
- Criar commit semântico: `pnpm commit`
- Adicionar changeset: `pnpm changeset`

## Arquivos-Chave

- `turbo.json`: Orquestra builds e tasks.
- `pnpm-workspace.yaml`: Define workspaces.
- `apps/*/next.config.ts`: Configuração Next.js por app.
- `packages/ui/src/`: Componentes compartilhados.
- `.husky/`, `commitlint.config.js`, `.changeset/`: Infraestrutura de automação e versionamento.

> Siga os padrões de importação, versionamento e commit descritos acima para garantir integração suave entre apps e pacotes.
