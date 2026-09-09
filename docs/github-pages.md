# GitHub publication

状态更新：2026-09-09 UTC / LOG-013。公开仓库为 [FlewolfXY/memory-nook](https://github.com/FlewolfXY/memory-nook)，演示为 [GitHub Pages](https://flewolfxy.github.io/memory-nook/)。

基准公开提交 9dfe4070c133035a6981397dcfd5130460f20de7 的 [workflow 34383296669](https://github.com/FlewolfXY/memory-nook/actions/runs/34383296669) 已 completed/success。早期 configure-pages 的 404 已解除，不再请求用户重复配置。发布状态核对不等于实际浏览器交互验收。

## 更新约定

在活跃协作中，将经检查的改动、CHANGELOG 和 PROGRESS 一起提交并同步到 main。现有 workflow 会执行数据与静态检查、发布 dist/。文档轮也可能触发这条既有工作流，但不改变 dist/ 中的应用内容；不为文档另建或部署 Sites 版本。

这是每个完成片段的提交同步，不是逐键镜像，也不是离开对话后仍有代理自动工作。受管源码仓库与公开快照是两套提交历史，记录基准时保留 SHA 映射。禁止强推覆盖用户历史；推送前读取当前公开分支。

## 公开快照范围

scripts/public-snapshot.py 生成可本地启动的公开源码压缩包，包含：

- dist/ 应用、随包依赖和许可证、演示素材。
- tests/、静态检查、只读审计探针、本地启动器和 Pages workflow。
- README、AGENTS、产品基准、当前片段、决策、总进度、变更日志和迭代计划。
- 经审阅的设计说明、审计报告、诊断证据和照片署名。

不包含受管托管配置、私有 Git 历史、凭证、用户参考原图、私人浏览器导出或无关文件。脚本使用明确目录/文件清单；新增公开目录前检查内容与许可。用户要求每轮留日志，所以公开源码与工作记录一并可见。

## 照片与设备

默认示例有清楚的示例标记；照片出处见 photo-credits.json。个人照片、笔记与布局在当前浏览器 IndexedDB，源代码发布不上传这些内容。

公开地址让手机免 ChatGPT 登录查看演示；不同设备、浏览器和站点的个人内容不自动同步。应用导出/恢复用于主动迁移，当前大小与条数边界缺陷见 [AUD-001](audits/2026-09-09.md)。源码备份不等于私人记忆备份。

/assets/memories/ 引用经 assetURL 按应用模块解析，兼容域名根目录与 Pages 仓库子路径；导出将示例图片内嵌以便携带。

## 未来部署记录

应用轮保留公开提交、工作流结果与应用版本；失败如实记录，不提前说网址已经更新。只在当前授权目的地与范围内发布，保留原受管项目身份。文档轮标明应用基准不变。
