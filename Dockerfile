# Python 3.9 슬림 이미지 사용 (용량 절약)
FROM python:3.9-slim

# 작업 디렉토리 설정
WORKDIR /app

# 필요한 시스템 패키지 설치 (필요한 경우)
# RUN apt-get update && apt-get install -y gcc

# 의존성 파일 복사 및 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 소스 코드 복사
COPY . .

# history 폴더 생성 (권한 문제 방지)
RUN mkdir -p history

# 포트 노출
EXPOSE 5000

# 서버 실행
CMD ["python", "server.py"]
