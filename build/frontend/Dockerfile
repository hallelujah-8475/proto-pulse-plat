# Node.jsのベースイメージ
FROM node:22.1.0

# 作業ディレクトリの設定
WORKDIR /frontend

# package.jsonとpackage-lock.jsonをコピー
COPY ./frontend/package*.json ./

# 依存関係のインストール
RUN npm install

# アプリケーションコードをコピー
COPY ./frontend .

# ビルドは本番環境のみ実行
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}
RUN if [ "$NODE_ENV" = "production" ]; then npm run build; fi

# アプリケーションで使用するポートを公開
EXPOSE 3000

# 環境変数に応じて実行コマンドを切り替え
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then npm run start; else npm run dev; fi"]
