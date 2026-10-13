---
mode: agent
description: Cria Repository (interface + Mock + Api stub)
---

# Criar Repository — Vision Flow

**[PAPEL]** Engenheiro Sênior React + Clean Architecture.
**[CONTEXTO]** Feature `{{nome_feature}}`. Fase mock. ERP Delphi.
Envelope `{success, data, error}` definido em copilot-instructions.md.
**[TAREFA]** Criar Repository para a entidade **{{NomeEntidade}}**.

## Estrutura obrigatória
src/features/{{nome_feature}}/
├── domain/
│ ├── entities/{{NomeEntidade}}.ts
│ └── repositories/{{NomeEntidade}}Repository.ts (interface)
└── data/
└── repositories/
├── Mock{{NomeEntidade}}Repository.ts
└── Api{{NomeEntidade}}Repository.ts (stub)

## Interface (domain/repositories/{{NomeEntidade}}Repository.ts)

```ts
import type { {{NomeEntidade}} } from '../entities/{{NomeEntidade}}';

export interface {{NomeEntidade}}Repository {
  list(filter?: {{NomeEntidade}}Filter): Promise<{{NomeEntidade}}[]>;
  findById(id: number): Promise<{{NomeEntidade}}>;
  save(entity: {{NomeEntidade}}): Promise<{{NomeEntidade}}>;
  remove(id: number): Promise<void>;
}