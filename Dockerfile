FROM golang:1.23

WORKDIR /backend

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o proto-pulse-plat .

RUN go install github.com/cosmtrek/air@v1.40.4
CMD ["air"]