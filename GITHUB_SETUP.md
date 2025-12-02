# GitHub 설정 가이드

이 프로젝트를 GitHub에 올리는 방법입니다.

## 방법 1: GitHub Desktop 사용 (추천 - 가장 쉬움)

1. **GitHub Desktop 다운로드 및 설치**
   - https://desktop.github.com/ 에서 다운로드
   - 설치 후 GitHub 계정으로 로그인

2. **저장소 생성**
   - File → Add Local Repository
   - 이 폴더 선택: `C:\Users\gomse\.gemini\antigravity\scratch\orf_finder`
   - "Create Repository" 클릭

3. **GitHub에 업로드**
   - "Publish repository" 버튼 클릭
   - 저장소 이름: `orf-finder`
   - Private/Public 선택
   - "Publish repository" 클릭

4. **완료!**
   - 이제 다른 컴퓨터에서:
   - GitHub Desktop → File → Clone Repository
   - 방금 만든 저장소 선택

## 방법 2: Git 명령줄 사용

### Git 설치
1. https://git-scm.com/download/win 에서 다운로드
2. 기본 설정으로 설치
3. PowerShell 재시작

### 저장소 설정
```powershell
# 프로젝트 폴더로 이동
cd C:\Users\gomse\.gemini\antigravity\scratch\orf_finder

# Git 사용자 설정 (최초 1회)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Git 저장소 초기화
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: ORF Finder with BLAST integration"

# GitHub에 푸시 (먼저 GitHub에서 빈 저장소 생성 필요)
git remote add origin https://github.com/yourusername/orf-finder.git
git branch -M main
git push -u origin main
```

## 방법 3: GitHub 웹사이트에서 직접 업로드

1. **GitHub.com에서 새 저장소 생성**
   - https://github.com/new
   - 저장소 이름: `orf-finder`
   - "Create repository" 클릭

2. **파일 업로드**
   - "uploading an existing file" 클릭
   - 다음 파일들을 드래그 앤 드롭:
     - index.html
     - script.js
     - style.css
     - server.py
     - requirements.txt
     - README.md
     - .gitignore

3. **커밋 메시지 작성**
   - "Initial commit" 입력
   - "Commit changes" 클릭

## 다른 컴퓨터에서 사용하기

### GitHub Desktop 사용
1. GitHub Desktop 설치
2. File → Clone Repository
3. 저장소 선택 → Clone
4. 터미널 열기:
   ```powershell
   cd <cloned-folder>
   pip install -r requirements.txt
   python server.py
   ```

### Git 명령줄 사용
```powershell
git clone https://github.com/yourusername/orf-finder.git
cd orf-finder
pip install -r requirements.txt
python server.py
```

## 주의사항

⚠️ **server.py의 이메일 꼭 변경하기!**
```python
Entrez.email = "your_email@example.com"  # 실제 이메일로!
```

💡 **history 폴더는 자동 생성됩니다**
- Git에 포함할지 선택 가능
- `.gitignore`에서 주석 해제하면 제외됨

## 문제 해결

**"git is not recognized" 오류**
→ Git을 설치하거나 GitHub Desktop 사용

**파일이 너무 많아요**
→ `.gitignore`가 자동으로 불필요한 파일 제외

**Private vs Public?**
- Private: 본인만 볼 수 있음
- Public: 누구나 볼 수 있음 (보통 연구용은 Public)
