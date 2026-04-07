// --- 1. KHỞI TẠO DỮ LIỆU ---
let allArticles = JSON.parse(localStorage.getItem("articles")) || [];
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const categories =
  JSON.parse(localStorage.getItem("categories")) ||
  JSON.parse(localStorage.getItem("entries")) ||
  [];

if (!currentUser) {
  window.location.href = "login.html";
}

// --- 2. TRUY VẤN ELEMENTS (Khớp chính xác với HTML của bạn) ---
const tbody = document.getElementById("tbody");
const modal = document.getElementById("modalArticle");
const articleForm = document.getElementById("articleForm");
const prevBtn = document.getElementById("previous");
const nextBtn = document.getElementById("next");
const btnOpen = document.querySelector(".btn-add");
const logout = document.querySelector(".logout");

// Biến trạng thái
let currentPage = 1;
const itemsPerPage = 5;
let editId = null;

// --- 3. HÀM RENDER DỮ LIỆU ---
const renderArticles = () => {
  // Lọc bài viết (Hiển thị tất cả nếu là admin, hoặc lọc theo userId nếu cần)
  // Dựa vào ảnh Local Storage của bạn, ta sẽ hiển thị tất cả bài viết hiện có
  const filtered = allArticles;

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const start = (currentPage - 1) * itemsPerPage;
  const currentData = filtered.slice(start, start + itemsPerPage);

  if (tbody) {
    tbody.innerHTML =
      currentData.length > 0
        ? currentData
            .map(
              (art) => `
          <tr>
            <td><img src="${art.imager || ""}" class="row-thumb" alt="thumb" style="width:50px; height:50px; object-fit:cover; border-radius:4px;"/></td>
            <td class="bold">${art.title}</td>
            <td>${art.category || art.entries || "N/A"}</td>
            <td class="text-muted">${(art.content || "").substring(0, 20)}...</td>
            <td><span class="status-tag ${art.status || "public"}">${art.status || "public"}</span></td>
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
          </tr>`,
            )
            .join("")
        : '<tr><td colspan="7" style="text-align:center; padding: 20px;">No articles found.</td></tr>';
  }

  // Cập nhật phân trang
  const pageInfo = document.querySelector(".pagination p");
  if (pageInfo)
    pageInfo.innerHTML = `Page <strong>${currentPage}</strong> / ${totalPages}`;
  if (prevBtn) prevBtn.disabled = currentPage === 1;
  if (nextBtn) nextBtn.disabled = currentPage === totalPages;
};

// --- 4. XỬ LÝ MODAL & FORM ---
if (btnOpen) {
  btnOpen.onclick = () => {
    editId = null;
    articleForm.reset();
    document.getElementById("modalTitleText").innerText = "Add New Article";
    modal.style.display = "flex"; 
  };
}

const closeModal = () => {
  modal.style.display = "none"; 
  editId = null;
};

document.getElementById("btnCloseModal").onclick = closeModal;
document.getElementById("btnCancelModal").onclick = closeModal;

// --- 5. LƯU BÀI VIẾT ---
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
    Swal.fire("Error", "Please fill Title and Content", "error");
    return;
  }

  if (editId) {
    const index = allArticles.findIndex((a) => a.id == editId);
    if (index !== -1)
      allArticles[index] = { ...allArticles[index], ...articleData };
  } else {
    allArticles.unshift({ id: Date.now(), ...articleData });
  }

  localStorage.setItem("articles", JSON.stringify(allArticles));
  closeModal();
  renderArticles();
  Swal.fire("Success", "Article saved!", "success");
};

// --- 6. CHỈNH SỬA & XÓA ---
window.handleEdit = (id) => {
  const art = allArticles.find((a) => a.id == id);
  if (!art) return;

  editId = id;
  document.getElementById("modalTitleText").innerText = "Edit Article";
  document.getElementById("input_title").value = art.title;
  document.getElementById("category_select").value = art.category;
  document.getElementById("input_content").value = art.content;
  document.getElementById("input_mood").value = art.mood || "";
  document.getElementById("input_imager").value = art.imager || "";

  const statusRadios = document.querySelectorAll('input[name="status"]');
  statusRadios.forEach((r) => (r.checked = r.value === art.status));

  modal.style.display = "flex";
};

window.handleDelete = (id) => {
  Swal.fire({
    title: "Are you sure?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      allArticles = allArticles.filter((a) => a.id != id);
      localStorage.setItem("articles", JSON.stringify(allArticles));
      renderArticles();
      Swal.fire("Deleted!", "Success", "success");
    }
  });
};

window.changeStatus = (id, newStatus) => {
  const index = allArticles.findIndex((a) => a.id == id);
  if (index !== -1) {
    allArticles[index].status = newStatus;
    localStorage.setItem("articles", JSON.stringify(allArticles));
    renderArticles();
  }
};

// --- 7. KHỞI TẠO ---
if (prevBtn)
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderArticles();
    }
  };
if (nextBtn)
  nextBtn.onclick = () => {
    currentPage++;
    renderArticles();
  };

const init = () => {
  // Load danh mục vào dropdown
  const catSelect = document.getElementById("category_select");
  if (catSelect) {
    catSelect.innerHTML = categories
      .map((c) => `<option value="${c.name}">${c.name}</option>`)
      .join("");
  }

  // Load Avatar & Tên (Khớp với fistName trong Local Storage)
  const userAvatar = document.querySelector(".user-avatar");
  if (userAvatar && currentUser.avatar) userAvatar.src = currentUser.avatar;

  renderArticles();
};
logout.addEventListener("click", () => {
  Swal.fire({
    title: "Are you sure?",
    text: "Do you want to log out?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes",
  }).then((result) => {
    if (result.isConfirmed)
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Log Out Success",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        localStorage.removeItem("currentUser");
        window.location.href = "../index.html";
      });
  });
});
init();
