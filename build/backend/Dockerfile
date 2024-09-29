FROM golang:1.23

# 作業ディレクトリを設定
WORKDIR /backend

# go.mod, go.sum を先にコピーして依存関係をインストール
COPY ./backend/src/go.mod ./backend/src/go.sum ./
RUN go mod tidy

# 残りのソースコードをコピー
COPY ./backend/src /backend

# アプリケーションをビルド
RUN go build -o proto-pulse-plat

# ポートをエクスポート
EXPOSE 8080

# コンテナ起動時に実行するコマンド
# CMD [ "/backend/proto-pulse-plat" ]

RUN go install github.com/cosmtrek/air@v1.40.4
CMD ["air"]
