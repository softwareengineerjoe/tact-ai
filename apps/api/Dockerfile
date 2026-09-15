## TACT AI backend — FastAPI on Azure Container Apps (MASTER 18.2, 18.6).
FROM python:3.14-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Build deps for asyncpg / native wheels; removed after install to keep image slim.
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install project (dependencies resolved from pyproject).
COPY pyproject.toml ./
COPY app ./app
COPY migrations ./migrations
COPY alembic.ini ./
COPY entrypoint.sh ./
RUN pip install . \
    && apt-get purge -y build-essential && apt-get autoremove -y \
    && chmod +x entrypoint.sh

EXPOSE 8000

CMD ["./entrypoint.sh"]
