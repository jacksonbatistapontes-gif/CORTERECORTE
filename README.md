# Corte&Recorte

Plataforma web para gerar cortes curtos a partir de vídeos do YouTube.

## Rodar em VPS com Docker (recomendado)

1. Instale Docker e Docker Compose na sua VPS.
2. Suba o projeto:

```bash
docker compose up -d --build
```

3. Acesse no navegador:

```
http://SEU_IP_DA_VPS:3000
```

O frontend já está configurado para consumir o backend via `/api`, com proxy do Nginx.

## Processamento real de vídeos
- O backend baixa o vídeo do YouTube via **yt-dlp** e recorta com **ffmpeg**.
- Os arquivos gerados ficam em `/app/storage` (montado como volume no Docker).

## Serviços expostos
- Frontend: porta **3000**
- Backend: porta **8001**
- MongoDB: interno via Docker
