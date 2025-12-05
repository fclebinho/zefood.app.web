# ZeFood.app Frontend

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Versionamento e Deploy

Este projeto utiliza [standard-version](https://github.com/conventional-changelog/standard-version) para versionamento semântico automático e geração de CHANGELOG. A pipeline de CI/CD é acionada automaticamente quando você cria uma tag de versão.

### Conventional Commits

Faça commits seguindo a convenção [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Nova funcionalidade (incrementa MINOR: 0.1.0 -> 0.2.0)
git commit -m "feat: adicionar modo escuro"

# Correção de bug (incrementa PATCH: 0.1.0 -> 0.1.1)
git commit -m "fix: corrigir erro no login"

# Com escopo
git commit -m "feat(auth): adicionar login com Google"

# Breaking change (incrementa MAJOR: 0.1.0 -> 1.0.0)
git commit -m "feat!: mudar estrutura da API"
```

#### Tipos de Commit

- `feat`: Nova funcionalidade (incrementa MINOR)
- `fix`: Correção de bug (incrementa PATCH)
- `perf`: Melhoria de performance (incrementa PATCH)
- `refactor`: Refatoração de código (aparece no CHANGELOG)
- `docs`: Apenas documentação (não aparece no CHANGELOG)
- `style`: Formatação (não aparece no CHANGELOG)
- `test`: Testes (não aparece no CHANGELOG)
- `chore`: Tarefas de build (não aparece no CHANGELOG)

### Como Fazer um Release

```bash
# Release automático (analisa commits e incrementa apropriadamente)
npm run release

# Forçar tipo específico de versão
npm run release:patch  # 0.1.0 -> 0.1.1
npm run release:minor  # 0.1.0 -> 0.2.0
npm run release:major  # 0.1.0 -> 1.0.0
```

O `standard-version` irá:
1. Analisar os commits desde a última tag
2. Determinar o tipo de versão baseado nos commits
3. Atualizar a versão no `package.json`
4. Gerar/atualizar o `CHANGELOG.md` automaticamente
5. Criar um commit de release
6. Criar uma tag git (ex: `v0.1.1`)

### Pipeline de CI/CD

A pipeline é acionada automaticamente quando você cria uma tag com o padrão `v*.*.*`.

**O que a pipeline faz:**
1. Faz build da imagem Docker
2. Publica no Docker Hub com duas tags:
   - `<versão>` (ex: `0.1.0`)
   - `latest`

**Executar pipeline manualmente:**
Você pode executar a pipeline manualmente através da aba "Actions" no GitHub.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
