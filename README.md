# 代码提交规范

## 代码提交

```bash
git add .
git cz  // 需要全局安装npm i -g commitizen
git push
```

## git cz

- feat: 新增功能
- fix: Bug 修复缺陷
- build: 项目打包
- revert: 回退代码
- docs: 文档相关内容改动, 如添加注释
- style: 不会影响系统功能的代码格式相关改动, 如删除/添加空格
- ci: 构建工具或项目依赖的改动, 如 webpack/vite 配置
- chore: 其他零星修改修改

## 无特殊情况，勿动

- .husky
- .prettierrc
- eslint.config.js
- commitlint.config.cjs
- postcss.config.mjs

# node
v24.5.0
