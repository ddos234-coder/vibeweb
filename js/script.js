// 상단이동 버튼 기능
const scrollTopBtn = document.getElementById('scroll-to-top');

// 스크롤 이벤트 리스너
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
});

// 버튼 클릭 시 상단으로 스크롤
scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// 로고 클릭 시 시작화면(메인비주얼)으로 부드럽게 스크롤 (메인 페이지에서만)
const logoLink = document.querySelector('.logo-link');
logoLink.addEventListener('click', (e) => {
    const homeSection = document.getElementById('home');
    // 메인 페이지에서만 스크롤, 다른 페이지에서는 일반 링크 동작
    if (homeSection) {
        e.preventDefault();
        homeSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
});

// 햄버거 메뉴 기능
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('nav a');

// 햄버거 버튼 클릭 시 메뉴 토글
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// 메뉴 링크 클릭 시 메뉴 닫기
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// 메뉴 외부 클릭 시 닫기
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});
