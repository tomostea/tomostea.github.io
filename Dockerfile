// [VSCodeとDockerでMacにGolangの開発環境を作成する | DevelopersIO](https://dev.classmethod.jp/articles/vscode-remote-containers-golang/)
// "workspaceFolder": "/go/src/{好きなディレクトリ名}", // コンテナ内で使用するディレクトリ
// "workspaceMount": "src={VSCodeで開いているディレクトリのフルパス},dst=/go/src/{好きなディレクトリ名},type=bind"

FROM node:16
# [NODE_ENV=productionにしてyarn install(npm install)するとdevDependenciesがインストールされない · HikaTechBlog](https://miyahara.hikaru.dev/posts/20200414/)
# ENV NODE_ENV production
WORKDIR /app
COPY ["package*.json", "./"]
RUN npm i
COPY . .
CMD npm start