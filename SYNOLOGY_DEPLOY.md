# 시놀로지 NAS 배포 가이드 (Docker)

## 1. 준비 사항
1. 시놀로지 NAS에 **Container Manager** (구 Docker) 패키지가 설치되어 있어야 합니다.
2. 프로젝트 파일들이 준비되어 있어야 합니다 (`Dockerfile`, `docker-compose.yml`, 소스 코드 등).

## 2. 파일 업로드
1. 시놀로지 **File Station**을 엽니다.
2. `docker` 공유 폴더 아래에 새 폴더를 만듭니다 (예: `orf-finder`).
3. 이 프로젝트의 모든 파일을 해당 폴더로 업로드합니다.
   - `Dockerfile`
   - `docker-compose.yml`
   - `server.py`
   - `requirements.txt`
   - `index.html`
   - `script.js`
   - `style.css`
   - `history/` (폴더가 없다면 빈 폴더라도 생성)

## 3. 실행 방법 (Container Manager 사용)

### 방법 A: 프로젝트(Project) 생성 (추천)
1. **Container Manager** 실행
2. 왼쪽 메뉴에서 **프로젝트(Project)** 선택
3. **생성(Create)** 클릭
   - **프로젝트 이름**: `orf-finder`
   - **경로**: 업로드한 폴더 선택 (`/docker/orf-finder`)
   - **소스**: `docker-compose.yml`을 사용하여 프로젝트 생성 선택
4. **다음** → **다음** → **완료** 클릭
5. 이미지가 빌드되고 컨테이너가 실행될 때까지 기다립니다.

### 방법 B: SSH 사용 (고급 사용자)
1. SSH로 NAS에 접속
2. 폴더로 이동: `cd /volume1/docker/orf-finder`
3. 실행: `docker-compose up -d --build`

## 4. 접속 확인
브라우저를 열고 다음 주소로 접속합니다:
`http://<NAS_IP_ADDRESS>:5000`

예: `http://192.168.0.10:5000`

## 5. 주의 사항
- **포트 충돌**: 만약 5000번 포트가 이미 사용 중이라면 `docker-compose.yml`에서 앞쪽 숫자를 변경하세요.
  ```yaml
  ports:
    - "8080:5000"  # 8080번 포트로 접속
  ```
- **이메일 설정**: `server.py`의 `Entrez.email`이 올바르게 설정되어 있는지 확인하세요.
