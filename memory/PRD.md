# PRD — Corte&Recorte

## Problema original
crie site para cortes de videos curtos a partir de videos do youtube, com funções semelhantes ao site opnusclips. Preferência: faça conforme o opnus clipes. Atualização: nome da aplicação deve ser Corte&Recorte e pronta para VPS.

## Decisões de arquitetura
- Frontend: React + Tailwind + shadcn/ui + sonner para toasts
- Backend: FastAPI + MongoDB (motor)
- Processamento real com download via yt-dlp + recorte com ffmpeg
- Pronto para VPS via Docker Compose + Nginx (proxy /api)

## O que foi implementado
- Landing page moderna com hero, CTA, bento grid e prévia de clipes
- Studio com sidebar fixa, formulário de URL, configurações e progresso em tempo real
- Página de resultados com cards de clipes, score viral e ações de download/preview
- Editor manual para ajustar título, legenda e intervalo do corte
- Pipeline real: download YouTube, geração de clipes, thumbnails, URLs de mídia e pacote ZIP
- Editor com timeline visual (waveform + sprite de frames)
- API: criar jobs, listar, obter, avançar progresso e listar clipes
- Brand atualizado para Corte&Recorte
- Arquivos de VPS: docker-compose.yml, Dockerfiles e nginx.conf + README

## Backlog priorizado
### P0
- Aprimorar lógica de detecção de melhores momentos (IA)
- Processamento em fila e paralelização (para escala)

### P1
- Autenticação e histórico por usuário
- Edição manual de timeline e cortes

### P2
- Templates de legendas e estilos visuais
- Analytics de performance dos clipes

## Próximas tarefas
- Conectar a um pipeline real de extração e renderização de clipes
- Melhorar pré-visualização com player embutido
