# release-archive

按版本管理的打包产物目录。每个版本一个子目录：

```
release-archive/
  0.2.0/
    dsh-workbench-four-images-model-0.2.0.tgz
    SHA256SUMS.txt
```

- `.tgz` 由 `npm pack` 生成，与 npm 发布、GitHub Release 附件保持同一份产物；
- `SHA256SUMS.txt` 为对应 tgz 的 SHA-256 校验值；
- 已发布的版本目录只增不改；需要修订时使用新版本号。
