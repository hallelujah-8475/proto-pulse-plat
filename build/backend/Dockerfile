FROM golang:1.23
WORKDIR /backend
COPY ./backend/src /backend
RUN go mod tidy
RUN go build -o proto-pulse-plat
EXPOSE 8080
RUN go install github.com/cosmtrek/air@v1.40.4
CMD ["air"]