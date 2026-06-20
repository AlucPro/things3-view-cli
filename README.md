# Things 3 CLI

`td` 是仅在 macOS 本地运行的 Things 3 命令行工具。它只读 SQLite 数据库；新增、完成和取消通过 Things 官方 URL Scheme 执行，不直接修改数据库。

## 安装

```bash
npm install -g things3-view-cli
cp .env.example .env
```

配置 `THINGS_DB_PATH` 后使用 `td projects`、`td list`。写入前在 Things → Settings → General → Enable Things URLs 中获取 token，并设置 `THINGS_AUTH_TOKEN`。`td complete <uuid> --yes` 与 `td cancel <uuid> --yes` 需要明确确认。

卸载：`npm uninstall -g things3-view-cli`。
