// 게시판 관리 스크립트

let currentPosts = [];
let currentPage = 1;
const postsPerPage = 10;

// 페이지 로드 시 게시글 목록 불러오기
document.addEventListener('DOMContentLoaded', async () => {
    // auth.js가 로드될 때까지 대기
    await waitForAuth();

    // 게시글 목록 불러오기
    await loadPosts();

    // 이벤트 리스너 설정
    setupEventListeners();
});

// auth.js 로드 대기
function waitForAuth() {
    return new Promise((resolve) => {
        if (window.supabaseAuth && window.supabaseAuth.getClient()) {
            resolve();
        } else {
            const checkAuth = setInterval(() => {
                if (window.supabaseAuth && window.supabaseAuth.getClient()) {
                    clearInterval(checkAuth);
                    resolve();
                }
            }, 100);
        }
    });
}

// 게시글 목록 불러오기
async function loadPosts() {
    const supabase = window.supabaseAuth.getClient();

    if (!supabase) {
        console.error('Supabase 클라이언트를 찾을 수 없습니다.');
        return;
    }

    try {
        // 게시글 조회 (최신순)
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        currentPosts = data || [];
        renderPosts();

    } catch (error) {
        console.error('게시글 불러오기 오류:', error);
        alert('게시글을 불러오는 중 오류가 발생했습니다.');
    }
}

// 게시글 목록 렌더링
function renderPosts() {
    const tbody = document.querySelector('.posts-table tbody');

    if (!tbody) {
        return;
    }

    // 현재 페이지의 게시글만 가져오기
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const pagePosts = currentPosts.slice(startIndex, endIndex);

    if (pagePosts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #999;">
                    등록된 게시글이 없습니다.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = pagePosts.map((post, index) => {
        const postNumber = currentPosts.length - startIndex - index;
        const postDate = new Date(post.created_at).toLocaleDateString('ko-KR');

        return `
            <tr class="post-row" data-id="${post.id}">
                <td>${postNumber}</td>
                <td class="title-cell">
                    <a href="#" class="post-title" data-id="${post.id}">${escapeHtml(post.title)}</a>
                </td>
                <td>${escapeHtml(post.author_name)}</td>
                <td>${postDate}</td>
                <td>${post.views}</td>
            </tr>
        `;
    }).join('');

    // 게시글 클릭 이벤트 리스너 추가
    const postTitles = tbody.querySelectorAll('.post-title');
    postTitles.forEach(title => {
        title.addEventListener('click', (e) => {
            e.preventDefault();
            const postId = e.target.getAttribute('data-id');
            viewPost(postId);
        });
    });

    // 페이지네이션 렌더링
    renderPagination();
}

// 페이지네이션 렌더링
function renderPagination() {
    const pagination = document.querySelector('.pagination');

    if (!pagination) {
        return;
    }

    const totalPages = Math.ceil(currentPosts.length / postsPerPage);

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let paginationHTML = `
        <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">&lt;</button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>
        `;
    }

    paginationHTML += `
        <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">&gt;</button>
    `;

    pagination.innerHTML = paginationHTML;
}

// 페이지 변경
function changePage(page) {
    const totalPages = Math.ceil(currentPosts.length / postsPerPage);

    if (page < 1 || page > totalPages) {
        return;
    }

    currentPage = page;
    renderPosts();

    // 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 게시글 상세보기
async function viewPost(postId) {
    const supabase = window.supabaseAuth.getClient();

    try {
        // 게시글 조회
        const { data: post, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();

        if (error) {
            throw error;
        }

        // 조회수 증가
        await supabase
            .from('posts')
            .update({ views: post.views + 1 })
            .eq('id', postId);

        // 모달에 게시글 표시
        showPostDetail(post);

        // 게시글 목록 새로고침 (조회수 반영)
        await loadPosts();

    } catch (error) {
        console.error('게시글 조회 오류:', error);
        alert('게시글을 불러오는 중 오류가 발생했습니다.');
    }
}

// 게시글 상세보기 모달 표시
function showPostDetail(post) {
    const modal = document.getElementById('detail-modal');
    const title = modal.querySelector('.post-detail-title');
    const author = modal.querySelector('.post-author');
    const date = modal.querySelector('.post-date');
    const views = modal.querySelector('.post-views');
    const content = modal.querySelector('.post-detail-content');

    title.textContent = post.title;
    author.textContent = `작성자: ${post.author_name}`;
    date.textContent = `작성일: ${new Date(post.created_at).toLocaleString('ko-KR')}`;
    views.textContent = `조회수: ${post.views + 1}`;
    content.innerHTML = `<p>${escapeHtml(post.content).replace(/\n/g, '<br>')}</p>`;

    // 수정/삭제 버튼 표시 여부 결정
    checkPostOwnership(post.author_id);

    // 모달 표시
    modal.classList.add('active');

    // 모달에 post id 저장
    modal.setAttribute('data-post-id', post.id);
}

// 게시글 소유권 확인 (수정/삭제 버튼 표시)
async function checkPostOwnership(authorId) {
    const currentUser = await window.supabaseAuth.getCurrentUser();
    const editBtn = document.querySelector('.edit-btn');
    const deleteBtn = document.querySelector('.delete-btn');

    if (currentUser && currentUser.id === authorId) {
        editBtn.style.display = 'inline-block';
        deleteBtn.style.display = 'inline-block';
    } else {
        editBtn.style.display = 'none';
        deleteBtn.style.display = 'none';
    }
}

// 게시글 작성 모달 열기
async function openWriteModal() {
    const currentUser = await window.supabaseAuth.getCurrentUser();

    if (!currentUser) {
        alert('로그인이 필요합니다.');
        window.location.href = 'login.html';
        return;
    }

    const modal = document.getElementById('write-modal');
    const form = modal.querySelector('.write-form');

    // 폼 초기화
    form.reset();
    form.removeAttribute('data-post-id');

    // 모달 제목 변경
    modal.querySelector('.modal-header h3').textContent = '글쓰기';

    // 모달 표시
    modal.classList.add('active');
}

// 게시글 작성
async function submitPost(e) {
    e.preventDefault();

    const form = e.target;
    const title = form.querySelector('#post-title').value.trim();
    const content = form.querySelector('#post-content').value.trim();
    const postId = form.getAttribute('data-post-id');

    if (!title || !content) {
        alert('제목과 내용을 모두 입력해주세요.');
        return;
    }

    const currentUser = await window.supabaseAuth.getCurrentUser();

    if (!currentUser) {
        alert('로그인이 필요합니다.');
        window.location.href = 'login.html';
        return;
    }

    const supabase = window.supabaseAuth.getClient();

    try {
        if (postId) {
            // 수정
            const { error } = await supabase
                .from('posts')
                .update({
                    title: title,
                    content: content
                })
                .eq('id', postId);

            if (error) {
                throw error;
            }

            alert('게시글이 수정되었습니다.');
        } else {
            // 새 글 작성
            const { error } = await supabase
                .from('posts')
                .insert({
                    title: title,
                    content: content,
                    author_id: currentUser.id,
                    author_name: currentUser.email
                });

            if (error) {
                throw error;
            }

            alert('게시글이 등록되었습니다.');
        }

        // 모달 닫기
        closeModal('write-modal');

        // 게시글 목록 새로고침
        await loadPosts();

    } catch (error) {
        console.error('게시글 작성/수정 오류:', error);
        alert('게시글 처리 중 오류가 발생했습니다.');
    }
}

// 게시글 수정 모달 열기
async function editPost() {
    const modal = document.getElementById('detail-modal');
    const postId = modal.getAttribute('data-post-id');

    const supabase = window.supabaseAuth.getClient();

    try {
        const { data: post, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();

        if (error) {
            throw error;
        }

        // 상세보기 모달 닫기
        closeModal('detail-modal');

        // 글쓰기 모달 열기
        const writeModal = document.getElementById('write-modal');
        const form = writeModal.querySelector('.write-form');

        // 폼에 데이터 채우기
        form.querySelector('#post-title').value = post.title;
        form.querySelector('#post-content').value = post.content;
        form.setAttribute('data-post-id', postId);

        // 모달 제목 변경
        writeModal.querySelector('.modal-header h3').textContent = '글 수정';

        // 모달 표시
        writeModal.classList.add('active');

    } catch (error) {
        console.error('게시글 불러오기 오류:', error);
        alert('게시글을 불러오는 중 오류가 발생했습니다.');
    }
}

// 게시글 삭제
async function deletePost() {
    if (!confirm('정말 삭제하시겠습니까?')) {
        return;
    }

    const modal = document.getElementById('detail-modal');
    const postId = modal.getAttribute('data-post-id');

    const supabase = window.supabaseAuth.getClient();

    try {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId);

        if (error) {
            throw error;
        }

        alert('게시글이 삭제되었습니다.');

        // 모달 닫기
        closeModal('detail-modal');

        // 게시글 목록 새로고침
        await loadPosts();

    } catch (error) {
        console.error('게시글 삭제 오류:', error);
        alert('게시글 삭제 중 오류가 발생했습니다.');
    }
}

// 모달 닫기
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 글쓰기 버튼
    const writeBtn = document.querySelector('.write-btn');
    if (writeBtn) {
        writeBtn.addEventListener('click', openWriteModal);
    }

    // 글쓰기 폼 제출
    const writeForm = document.querySelector('.write-form');
    if (writeForm) {
        writeForm.addEventListener('submit', submitPost);
    }

    // 취소 버튼
    const cancelBtns = document.querySelectorAll('.cancel-btn');
    cancelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal('write-modal');
        });
    });

    // 목록 버튼
    const listBtn = document.querySelector('.list-btn');
    if (listBtn) {
        listBtn.addEventListener('click', () => {
            closeModal('detail-modal');
        });
    }

    // 수정 버튼
    const editBtn = document.querySelector('.edit-btn');
    if (editBtn) {
        editBtn.addEventListener('click', editPost);
    }

    // 삭제 버튼
    const deleteBtnElement = document.querySelector('.delete-btn');
    if (deleteBtnElement) {
        deleteBtnElement.addEventListener('click', deletePost);
    }

    // 모달 닫기 버튼
    const closeBtns = document.querySelectorAll('.modal-close');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });

    // 모달 배경 클릭 시 닫기
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// HTML 이스케이프 (XSS 방지)
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// 전역 함수로 내보내기
window.boardFunctions = {
    loadPosts,
    changePage,
    openWriteModal,
    closeModal
};
