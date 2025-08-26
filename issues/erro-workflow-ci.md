### Problema do Workflow CI

O workflow CI está falhando porque o comando `pnpm` não está sendo encontrado no PATH. Isso foi observado no job [#48920272848](https://github.com/ArthurProjectCorrea/corp_system/actions/runs/17241658210/job/48920272848).

### Sugestão de Solução

Para resolver este problema, sugiro adicionar um passo após a configuração do `pnpm` para garantir que ele esteja no PATH. O comando a ser adicionado é:

```bash
echo "$(pnpm bin)" >> $GITHUB_PATH
```

### Próximos Passos

1. Adicionar o comando sugerido ao workflow.
2. Testar o workflow para garantir que o erro não ocorra novamente.