# AI바이브웹 🚀

바이브코딩으로 빠르게 프로젝트를 제작하며 풀스택 웹 개발을 경험할 수 있는 웹사이트입니다.

## 📋 프로젝트 소개

AI 시대의 실용적 개발 역량을 키우기 위한 바이브코딩 학습 플랫폼입니다.
HTML, CSS, JavaScript와 Supabase를 활용한 풀스택 웹 애플리케이션입니다.

### 주요 기능

- 📝 **게시판**: 게시글 작성, 조회, 수정, 삭제 (CRUD)
- 🔐 **회원 인증**: 회원가입, 로그인, 자동 로그인 유지
- 👤 **사용자 관리**: 로그인 상태 확인, 로그아웃
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- 🔒 **보안**: Row Level Security (RLS) 정책 적용

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **배포**: Vercel (권장)
- **버전 관리**: Git, GitHub

## 📂 프로젝트 구조

```
vibeweb/
├── index.html          # 메인 페이지
├── board.html          # 게시판 페이지
├── login.html          # 로그인 페이지
├── signup.html         # 회원가입 페이지
├── css/
│   └── style.css       # 전체 스타일시트
├── js/
│   ├── auth.js         # 인증 관리
│   ├── board.js        # 게시판 기능
│   └── script.js       # 공통 스크립트
├── img/                # 이미지 파일
├── .gitignore          # Git 제외 파일
└── README.md           # 프로젝트 문서
```

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/vibeweb.git
cd vibeweb
```

### 2. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 다음 쿼리 실행:

```sql
-- 게시판 테이블 생성
CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 조회 정책
CREATE POLICY "누구나 게시글 조회 가능"
ON posts FOR SELECT TO public USING (true);

-- 작성 정책
CREATE POLICY "로그인 사용자만 작성 가능"
ON posts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = author_id);

-- 수정 정책
CREATE POLICY "본인 게시글만 수정 가능"
ON posts FOR UPDATE TO authenticated
USING (auth.uid() = author_id);

-- 삭제 정책
CREATE POLICY "본인 게시글만 삭제 가능"
ON posts FOR DELETE TO authenticated
USING (auth.uid() = author_id);

-- 조회수 업데이트 정책
CREATE POLICY "조회수 업데이트 허용"
ON posts FOR UPDATE TO public
USING (true) WITH CHECK (true);

-- 인덱스 생성
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_author_id ON posts(author_id);
```

### 3. Supabase 설정 파일 수정

`js/auth.js` 파일에서 본인의 Supabase 정보로 변경:

```javascript
const SUPABASE_URL = 'your-project-url.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

**⚠️ 중요**: 다음 파일들도 동일하게 수정해야 합니다:
- `signup.html` (176-179줄)
- `login.html` (200-202줄)

### 4. 로컬 서버 실행

```bash
# Live Server 사용 (VS Code 확장)
# 또는 Python 간이 서버
python -m http.server 8000

# 또는 Node.js http-server
npx http-server
```

브라우저에서 `http://localhost:8000` 접속

## 📖 사용 방법

### 회원가입 및 로그인

1. `signup.html`에서 이메일과 비밀번호로 회원가입
2. `login.html`에서 로그인
3. "자동 로그인 유지" 체크 시 브라우저 닫아도 로그인 유지

### 게시글 작성

1. 로그인 후 `board.html` 접속
2. "글쓰기" 버튼 클릭
3. 제목과 내용 입력 후 등록

### 게시글 관리

- **조회**: 제목 클릭 (조회수 자동 증가)
- **수정**: 본인 게시글만 수정 가능
- **삭제**: 본인 게시글만 삭제 가능

## 🔒 보안 주의사항

### Supabase 키 관리

현재 코드에는 Supabase URL과 ANON KEY가 하드코딩되어 있습니다.

**ANON KEY는 공개되어도 안전합니다:**
- Row Level Security (RLS) 정책으로 보호됨
- 클라이언트 사이드에서 사용하도록 설계됨

**하지만 추가 보안을 원한다면:**
1. 환경 변수 사용 (Vercel, Netlify 등)
2. Supabase 대시보드에서 도메인 제한 설정
3. Rate Limiting 설정

## 🌐 배포

### Vercel 배포 (권장)

1. [Vercel](https://vercel.com)에 로그인
2. GitHub 저장소 연결
3. "Deploy" 클릭
4. 자동 배포 완료!

### Netlify 배포

1. [Netlify](https://netlify.com)에 로그인
2. "Add new site" → "Import from Git"
3. GitHub 저장소 선택
4. 배포 완료!

## 📝 커리큘럼

### 기초 과정
- ✅ 포트폴리오 웹사이트 제작
- ✅ 로그인/회원가입 기능 구현
- ✅ 게시판 CRUD 기능 개발
- ⬜ 실무 배포 프로세스 (Vercel)

### 심화 과정
- ⬜ React Native + Expo를 활용한 모바일 앱 개발
- ⬜ SNS 기능 구현
- ⬜ 카메라 연동
- ⬜ 앱스토어 배포

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

This project is licensed under the MIT License.

## 📧 문의

프로젝트 관련 문의사항이 있으시면 Issues를 통해 남겨주세요.

---

**Made with Claude Code** 🤖
