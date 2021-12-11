# Build the UI
FROM node:14.18.1-stretch-slim AS ui_builder
WORKDIR /home
ADD ./ui /home
RUN yarn install && yarn build

# Build the Server
FROM python:3.10.1-slim as server_builder
WORKDIR /home
RUN echo "APT::Get::Assume-Yes \"true\";" > /etc/apt/apt.conf.d/90assumeyes
RUN apt-get update && apt-get install make \
    apt-utils \
    lsb-release \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    sqlite3 \
    build-essential \
    libssl-dev \
    zlib1g-dev \
    libbz2-dev \
    libsqlite3-dev \
    unixodbc-dev \
    libncurses5-dev \
    libgdbm-dev \
    libnss3-dev \
    libreadline-dev \
    libffi-dev \
    libjpeg-dev \
    zlib1g-dev \
    wget
ADD ./server /home
RUN mkdir -p /home/app/static
COPY --from=ui_builder /home/build/ /home/app/static/
RUN python -m venv venv && . venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt

# create a SQLite database anyway with the right structure (thanks to Alembic)
RUN . venv/bin/activate && DB_MIGCONNSTRING="sqlite:///./torino.db" alembic upgrade head

FROM python:3.10.1-slim
WORKDIR /home
COPY --from=server_builder /home/ /home/
RUN echo "APT::Get::Assume-Yes \"true\";" > /etc/apt/apt.conf.d/90assumeyes
RUN apt-get update && apt-get install \
    ca-certificates \
    sqlite3 \
    libsqlite3-dev \
    libjpeg-dev \
    zlib1g-dev
CMD . venv/bin/activate && uvicorn server:app --port 8080 --log-level info
