// DOM 元素
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const bookmarksContainer = document.getElementById('bookmarks');
const addBookmarkBtn = document.getElementById('addBookmarkBtn');
const modal = document.getElementById('bookmarkModal');
const modalTitle = document.getElementById('modalTitle');
const bookmarkTitle = document.getElementById('bookmarkTitle');
const bookmarkUrl = document.getElementById('bookmarkUrl');
const saveBookmarkBtn = document.getElementById('saveBookmarkBtn');
const closeModalBtn = document.getElementById('closeModal');
const engineButtons = document.querySelectorAll('.search-engine');
const bookmarkSearchInput = document.getElementById('bookmarkSearch');
const resetBookmarksBtn = document.getElementById('resetBookmarksBtn');
const clearBookmarksBtn = document.getElementById('clearBookmarksBtn');
const bookmarkCategory = document.getElementById('bookmarkCategory');
const addCategoryBtn = document.getElementById('addCategoryBtn');

// 状态变量
let currentEngine = localStorage.getItem('searchEngine') || 'google';
let bookmarks = [];
let categories = [];
let currentCategory = '';
let searchQuery = '';
let currentTheme = localStorage.getItem('theme') || 'light';

// 初始化
function init() {
    setActiveEngine(currentEngine);
    loadCategories();
    loadBookmarks();
    renderBookmarks();
    setupEventListeners();
    initTheme(); 
}

// 设置事件监听器
function setupEventListeners() {
    searchInput.addEventListener('keypress', handleSearchKeyPress);
    searchButton.addEventListener('click', performSearch);
    addBookmarkBtn.addEventListener('click', () => showModal());
    closeModalBtn.addEventListener('click', hideModal);
    saveBookmarkBtn.addEventListener('click', saveBookmark);
    engineButtons.forEach(button => {
        button.addEventListener('click', () => setSearchEngine(button.dataset.engine));
    });
    bookmarkSearchInput.addEventListener('input', handleBookmarkSearch);
    resetBookmarksBtn.addEventListener('click', resetBookmarks);
    clearBookmarksBtn.addEventListener('click', clearBookmarks);
    addCategoryBtn.addEventListener('click', addNewCategory);
    document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);
    document.getElementById('settingsBtn').addEventListener('click', () => {
        document.getElementById('settingsModal').style.display = 'block';
    });

    // 设置模态框关闭按钮
    document.querySelector('#settingsModal .close-btn').addEventListener('click', () => {
        document.getElementById('settingsModal').style.display = 'none';
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });
}

// 处理搜索按键
function handleSearchKeyPress(e) {
    if (e.key === 'Enter') {
        performSearch();
    }
}

// 添加主题相关函数
function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
}

// 执行搜索
function performSearch() {
    const query = searchInput.value.trim();
    if (query) {
        const searchUrls = {
            google: 'https://www.google.com/search?q=',
            bing: 'https://www.bing.com/search?q=',
            duckduckgo: 'https://duckduckgo.com/?q='
        };
        window.location.href = searchUrls[currentEngine] + encodeURIComponent(query);
    }
}

// 设置搜索引擎
function setSearchEngine(engine) {
    currentEngine = engine;
    localStorage.setItem('searchEngine', engine);
    setActiveEngine(engine);
}

// 设置活动搜索引擎
function setActiveEngine(engine) {
    engineButtons.forEach(button => {
        button.classList.toggle('active', button.dataset.engine === engine);
    });
}

// 处理书签搜索
function handleBookmarkSearch(e) {
    searchQuery = e.target.value.toLowerCase();
    renderBookmarks();
}

// 过滤书签
function filterBookmarks() {
    return bookmarks.filter(bookmark => {
        const matchesSearch = searchQuery === '' || 
            bookmark.title.toLowerCase().includes(searchQuery) || 
            bookmark.url.toLowerCase().includes(searchQuery);
        
        const matchesCategory = currentCategory === '' || 
            bookmark.category === currentCategory;
        
        return matchesSearch && matchesCategory;
    });
}

// 创建书签元素
function createBookmarkElement(bookmark, index) {
    const div = document.createElement('div');
    div.className = 'bookmark-item';
    
    div.innerHTML = `
        <div class="bookmark-icon">
            <img src="https://www.google.com/s2/favicons?domain=${bookmark.url}" alt="favicon" 
                onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔖</text></svg>'">
        </div>
        <div class="bookmark-info">
            <div class="bookmark-title">${bookmark.title}</div>
            <div class="bookmark-url">${bookmark.url}</div>
        </div>
        <div class="bookmark-actions">
            <button onclick="editBookmark(${index})" title="编辑">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </button>
            <button onclick="deleteBookmark(${index})" title="删除">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
    `;

    div.addEventListener('click', (e) => {
        if (!e.target.closest('.bookmark-actions')) {
            window.location.href = bookmark.url;
        }
    });

    return div;
}

// 渲染书签
function renderBookmarks() {
    const filteredBookmarks = filterBookmarks();
    bookmarksContainer.innerHTML = '';
    
    filteredBookmarks.forEach((bookmark, index) => {
        const bookmarkEl = createBookmarkElement(bookmark, index);
        bookmarksContainer.appendChild(bookmarkEl);
    });
}

// 编辑书签
function editBookmark(index) {
    const bookmark = bookmarks[index];
    bookmarkTitle.value = bookmark.title;
    bookmarkUrl.value = bookmark.url;
    bookmarkCategory.value = bookmark.category || 'uncategorized';
    showModal(true, index);
}

// 删除书签
function deleteBookmark(index) {
    if (confirm('确定要删除这个书签吗？')) {
        bookmarks.splice(index, 1);
        saveBookmarks();
        renderBookmarks();
    }
}

// 保存书签
function saveBookmark() {
    const title = bookmarkTitle.value.trim();
    const url = bookmarkUrl.value.trim();
    const category = bookmarkCategory.value;
    
    if (!title || !url) {
        alert('请填写标题和URL');
        return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        bookmarkUrl.value = 'https://' + url;
    }

    const bookmark = {
        title,
        url: bookmarkUrl.value,
        category: category || 'uncategorized'
    };

    const editIndex = parseInt(modal.dataset.editIndex);
    if (editIndex > -1) {
        bookmarks[editIndex] = bookmark;
    } else {
        bookmarks.push(bookmark);
    }

    saveBookmarks();
    renderBookmarks();
    hideModal();
    resetForm();
}

// 显示模态框
function showModal(isEdit = false, index = -1) {
    modal.style.display = 'block';
    modal.dataset.editIndex = index;
    modalTitle.textContent = isEdit ? '编辑书签' : '添加书签';
    
    // 确保分类选项是最新的
    updateCategoryOptions();
}

// 隐藏模态框
function hideModal() {
    modal.style.display = 'none';
    resetForm();
}

// 重置表单
function resetForm() {
    bookmarkTitle.value = '';
    bookmarkUrl.value = '';
    bookmarkCategory.value = 'uncategorized';
    modal.dataset.editIndex = -1;
}

// 加载书签
function loadBookmarks() {
    const savedBookmarks = localStorage.getItem('bookmarks');
    bookmarks = savedBookmarks ? JSON.parse(savedBookmarks) : getDefaultBookmarks();
}

// 保存书签
function saveBookmarks() {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

// 重置为默认书签
function resetBookmarks() {
    if (confirm('确定要重置为默认书签吗？')) {
        bookmarks = getDefaultBookmarks();
        saveBookmarks();
        renderBookmarks();
    }
}

// 清空所有书签
function clearBookmarks() {
    if (confirm('确定要清空所有书签吗？')) {
        bookmarks = [];
        saveBookmarks();
        renderBookmarks();
    }
}

// 获取默认书签
function getDefaultBookmarks() {
    return [
        { title: 'GitHub', url: 'https://github.com', category: 'dev' },
        { title: 'Google', url: 'https://google.com', category: 'search' },
        { title: 'Stack Overflow', url: 'https://stackoverflow.com', category: 'dev' },
        { title: 'Bilibili', url: 'https://bilibili.com', category: 'media' },
        { title: '极影', url: 'https://www.expreview.com/', category: 'news' }
    ];
}

// 更新分类选项
function updateCategoryOptions() {
    // 保存当前选中的值
    const currentValue = bookmarkCategory.value;
    
    // 清空现有选项
    bookmarkCategory.innerHTML = '';
    
    // 添加所有分类选项
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        bookmarkCategory.appendChild(option);
    });
    
    // 恢复选中的值
    if (categories.includes(currentValue)) {
        bookmarkCategory.value = currentValue;
    } else {
        bookmarkCategory.value = 'uncategorized';
    }
}

// 添加新分类
function addNewCategory() {
    const category = prompt('请输入新分类名称：');
    if (category && category.trim()) {
        const trimmedCategory = category.trim().toLowerCase();
        if (!categories.includes(trimmedCategory)) {
            categories.push(trimmedCategory);
            saveCategories();
            updateCategoryOptions();
            renderCategoryButtons();
        }
    }
}

// 渲染分类按钮
function renderCategoryButtons() {
    const container = document.getElementById('categoryButtons');
    container.innerHTML = '';
    
    // 添加"全部"按钮
    const allButton = document.createElement('button');
    allButton.textContent = '全部';
    allButton.className = currentCategory === '' ? 'active' : '';
    allButton.onclick = () => filterByCategory('');
    container.appendChild(allButton);
    
    // 添加各个分类的按钮
    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category;
        button.className = currentCategory === category ? 'active' : '';
        button.onclick = () => filterByCategory(category);
        container.appendChild(button);
    });
}

// 根据分类筛选
function filterByCategory(category) {
    currentCategory = category;
    renderBookmarks();
    
    // 更新按钮状态
    const buttons = document.querySelectorAll('#categoryButtons button');
    buttons.forEach(button => {
        button.className = button.textContent === (category || '全部') ? 'active' : '';
    });
}

// 加载分类
function loadCategories() {
    const savedCategories = localStorage.getItem('categories');
    categories = savedCategories ? JSON.parse(savedCategories) : ['uncategorized', 'dev', 'search', 'media', 'news'];
    renderCategoryButtons();
    updateCategoryOptions();
}

// 保存分类
function saveCategories() {
    localStorage.setItem('categories', JSON.stringify(categories));
}

// 初始化应用
init();