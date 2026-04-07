// --- 1. KHỞI TẠO DỮ LIỆU ---
let allArticles = JSON.parse(localStorage.getItem("articles")) || [];
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const entries = JSON.parse(localStorage.getItem("entries")) || [];

// Kiểm tra đăng nhập
if (!currentUser) {
  window.location.href = "login.html";
}

// --- 2. TRUY VẤN ELEMENTS ---
const articleRow = document.getElementById("articleRow"); // Cho trang Grid
const tbody = document.getElementById("tbody"); // Cho trang Table
const modal = document.getElementById("modalArticle");
const articleForm = document.getElementById("articleForm");
const searchInput = document.getElementById("searchInput");
const prevBtn = document.getElementById("previous");
const nextBtn = document.getElementById("next");

// Biến trạng thái
let currentPage = 1;
const itemsPerPage = 5;
let editId = null;

// --- 3. HÀM HIỂN THỊ (RENDER) ---
const renderArticles = () => {
  // Lọc bài viết của chính user
  const userArticles = allArticles.filter((art) => {
    return art.userId === currentUser.id;
  });

  // Lọc theo tìm kiếm
  const keyword = searchInput?.value.toLowerCase().trim() || "";
  const filtered = userArticles.filter((art) => {
    return art.title.toLowerCase().includes(keyword);
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const start = (currentPage - 1) * itemsPerPage;
  const currentData = filtered.slice(start, start + itemsPerPage);

  // TRƯỜNG HỢP 1: HIỂN THỊ DẠNG GRID (article_add.html)
  if (articleRow) {
    articleRow.innerHTML =
      currentData
        .map((art) => {
          return `
            <div class="card">
                <div class="imager"><img src="${art.imager || ""}" alt="cover"></div>
                <div class="card-body">
                    <span class="badge">${art.category}</span>
                    <h3 class="title">${art.title}</h3>
                    <p class="excerpt">${art.content.substring(0, 80)}...</p>
                    <div class="card-actions">
                        <button class="btn-edit" onclick="handleEdit(${art.id})">Edit</button>
                        <button class="btn-delete" onclick="handleDelete(${art.id})">Delete</button>
                    </div>
                </div>
            </div>`;
        })
        .join("") || `<p class="no-data">No articles found.</p>`;
  }

  // TRƯỜNG HỢP 2: HIỂN THỊ DẠNG TABLE (article_manage.html)
  if (tbody) {
    tbody.innerHTML =
      currentData
        .map((art) => {
          return `
            <tr>
                <td><img src="${art.imager || ""}" class="row-thumb" alt="thumb" /></td>
                <td class="bold">${art.title}</td>
                <td>${art.category}</td>
                <td class="text-muted">${art.content.substring(0, 20)}...</td>
                <td><span class="status-tag ${art.status}">${art.status}</span></td>
                <td>
                    <select class="status-dropdown" onchange="changeStatus(${art.id}, this.value)">
                        <option value="public" ${art.status === "public" ? "selected" : ""}>Public</option>
                        <option value="private" ${art.status === "private" ? "selected" : ""}>Private</option>
                    </select>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="handleEdit(${art.id})">Sửa</button>
                        <button class="btn-delete" onclick="handleDelete(${art.id})">Xóa</button>
                    </div>
                </td>
            </tr>`;
        })
        .join("") || '<tr><td colspan="7">No articles found.</td></tr>';
  }

  renderPaginationUI(totalPages);
};

// --- 4. HÀM SỬA BÀI (HANDLE EDIT) ---
window.handleEdit = (id) => {
  editId = id;
  const art = allArticles.find((a) => {
    return a.id == id;
  });
  if (!art) {
    return;
  }

  const modalTitle = document.getElementById("modalTitleText");
  if (modalTitle) {
    modalTitle.innerText = "Edit Your Post";
  }

  document.getElementById("input_title").value = art.title;
  document.getElementById("category_select").value = art.category;
  document.getElementById("input_content").value = art.content;
  document.getElementById("input_mood").value = art.mood || "";
  document.getElementById("input_imager").value = art.imager || "";

  const statusRadios = document.querySelectorAll('input[name="status"]');
  statusRadios.forEach((radio) => {
    radio.checked = radio.value === art.status;
  });

  modal.classList.add("active");
};

// --- 5. HÀM LƯU (SUBMIT FORM) ---
articleForm.onsubmit = (e) => {
  e.preventDefault();

  const articleData = {
    title: document.getElementById("input_title").value.trim(),
    category: document.getElementById("category_select").value,
    content: document.getElementById("input_content").value.trim(),
    mood: document.getElementById("input_mood").value.trim(),
    imager: document.getElementById("input_imager").value.trim(),
    status:
      document.querySelector('input[name="status"]:checked')?.value || "public",
    userId: currentUser.id,
    date: new Date().toLocaleDateString("en-GB"),
  };

  if (!articleData.title || !articleData.content) {
    Swal.fire("Error", "Title and Content are required!", "error");
    return;
  }

  if (editId) {
    const index = allArticles.findIndex((a) => {
      return a.id == editId;
    });
    if (index !== -1) {
      allArticles[index] = {
        ...allArticles[index],
        ...articleData,
        id: editId,
      };
    }
  } else {
    allArticles.unshift({ id: Date.now(), ...articleData });
  }

  localStorage.setItem("articles", JSON.stringify(allArticles));
  closeModalFunc();
  renderArticles();
  Swal.fire("Success", "Article saved!", "success");
};

// --- 6. PHÂN TRANG UI ---
const renderPaginationUI = (totalPages) => {
  const pageInfo =
    document.getElementById("pageInfo") ||
    document.querySelector(".pagination p");
  if (pageInfo) {
    pageInfo.innerHTML = `Page <strong>${currentPage}</strong> / ${totalPages}`;
  }
  if (prevBtn) {
    prevBtn.disabled = currentPage === 1;
  }
  if (nextBtn) {
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
  }
};

// --- 7. CÁC TIỆN ÍCH ---
const closeModalFunc = () => {
  modal.classList.remove("active");
  articleForm.reset();
  editId = null;
};

// Nút mở modal (hỗ trợ cả 2 id/class từ 2 file HTML)
const btnOpen =
  document.getElementById("btnOpenModal") || document.querySelector(".btn-add");
if (btnOpen) {
  btnOpen.onclick = () => {
    editId = null;
    articleForm.reset();
    const modalTitle = document.getElementById("modalTitleText");
    if (modalTitle) {
      modalTitle.innerText = "Add New Article";
    }
    modal.classList.add("active");
  };
}

document.getElementById("btnCloseModal").onclick = closeModalFunc;
document.getElementById("btnCancelModal").onclick = closeModalFunc;

window.handleDelete = (id) => {
  Swal.fire({
    title: "Are you sure?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    Swal.fire({
      position: "center",
      icon: "success",
      title: "delete success",
      showConfirmButton: false,
      timer: 1500,
    });
    if (result.isConfirmed) {
      allArticles = allArticles.filter((a) => {
        return a.id != id;
      });
      localStorage.setItem("articles", JSON.stringify(allArticles));
      renderArticles();
    }
  });
};

window.changeStatus = (id, newStatus) => {
  const index = allArticles.findIndex((a) => {
    return a.id === id;
  });
  if (index !== -1) {
    allArticles[index].status = newStatus;
    localStorage.setItem("articles", JSON.stringify(allArticles));
    renderArticles();
  }
};

// Khởi tạo
const init = () => {
  const catSelect = document.getElementById("category_select");
  if (catSelect) {
    catSelect.innerHTML = entries
      .map((e) => {
        return `<option value="${e.name}">${e.name}</option>`;
      })
      .join("");
  }
  // Setup Header User Info (fistName)
  const dropName = document.getElementById("dropdownUserName");
  if (dropName && currentUser) {
    dropName.textContent = `${currentUser.fistName} ${currentUser.lastName}`;
  }
  renderArticles();
};

init();
