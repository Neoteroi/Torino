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
ADD . /home
RUN python -m venv venv && . venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt

# create a SQLite database anyway with the right structure (thanks to Alembic)
RUN . venv/bin/activate && DB_MIGCONNSTRING="sqlite:///./torino.db" alembic upgrade head
EXPOSE 8080

CMD . venv/bin/activate && uvicorn server:app --port 8080 --log-level info
