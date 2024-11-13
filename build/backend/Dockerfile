FROM golang:1.23

WORKDIR /backend

COPY ./backend/src/go.mod ./backend/src/go.sum ./

RUN go mod tidy

COPY ./backend/src /backend

RUN go build -o proto-pulse-plat

EXPOSE 8080

RUN go install github.com/cosmtrek/air@v1.40.4 \
&& go install github.com/segmentio/golines@v0.12.2

CMD ["air"]
