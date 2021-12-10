# Test Dockerfile to build the ui
FROM node:14.18.1-stretch-slim AS ui_builder
WORKDIR /ui
ADD . /ui
RUN yarn install && yarn build

FROM alpine:latest
WORKDIR /root
COPY --from=ui_builder /ui/public/* /root/
CMD echo "Hello World"
