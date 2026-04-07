const currentUser = JSON.parse(localStorage.getItem("currentUser"));
let allArticles = JSON.parse(localStorage.getItem("articles")) || [];
const entries = JSON.parse(localStorage.getItem("entries")) || [];

// Redirect if not logged in
if (!currentUser) {
  window.location.href = "login.html";
}

// Global Variables
const articleRow = document.getElementById("articleRow");
const modal = document.getElementById("modalArticle");
const articleForm = document.getElementById("articleForm");
const searchInput = document.getElementById("searchInput");
const prevBtn = document.getElementById("previous");
const nextBtn = document.getElementById("next");
const pageInfo = document.getElementById("pageInfo");
const viewPrf = document.querySelector(".viewPrf");
const avatarWrapper = document.querySelector(".avatar-wrapper img");

let currentPage = 1;
const itemsPerPage = 5;
let editId = null;
const setupHeader = () => {
  const userSection = document.getElementById("userSection");
  const authButtons = document.querySelector(".auth-buttons");

  if (currentUser) {
    if (userSection) userSection.style.display = "flex";
    if (authButtons) authButtons.style.display = "none";
    const headerAvt = document.getElementById("headerAvatar");
    if (headerAvt) {
      headerAvt.src =
        currentUser.avatar ||
        "https://cdn.kona-blue.com/upload/kona-blue_com/post/images/2024/09/18/457/avatar-mac-dinh-12.jpg";
    }
    if (avatarWrapper) {
      avatarWrapper.src =
        currentUser.avatar ||
        "https://cdn.kona-blue.com/upload/kona-blue_com/post/images/2024/09/18/457/avatar-mac-dinh-12.jpg";
    }
    const dropName = document.getElementById("dropdownUserName");
    dropName.textContent = `${currentUser.fistName} ${currentUser.lastName}`;
  }
  const avatarBtn = document.getElementById("avatarBtn");
  const dropdown = document.getElementById("avatarDropdown");
  if (avatarBtn && dropdown) {
    avatarBtn.onclick = (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("active");
    };
    window.onclick = () => dropdown.classList.remove("active");
  }
};

// lọc theo userId để người dùng chỉ thấy bài của chính họ.

const renderArticles = () => {
  if (!articleRow) return;

  const userArticles = allArticles.filter(
    (art) => art.userId === currentUser.id,
  );
  const keyword = searchInput?.value.toLowerCase().trim() || "";
  const filtered = userArticles.filter((art) =>
    art.title.toLowerCase().includes(keyword),
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const start = (currentPage - 1) * itemsPerPage;
  const currentData = filtered.slice(start, start + itemsPerPage);

  articleRow.innerHTML =
    currentData
      .map(
        (art) => `
        <div class="card">
            <div class="imager"><img src="${art.imager || "https://cdn.kona-blue.com/upload/kona-blue_com/post/images/2024/09/18/457/avatar-mac-dinh-12.jpg"}" alt="cover"></div>
            <div class="card-body">
                <span class="badge">${art.category}</span>
                <h3 class="title">${art.title}</h3>
                <p class="excerpt">${art.content.substring(0, 80)}...</p>
                <div class="card-actions">
                    <button class="btn-edit" onclick="handleEdit(${art.id})"><i class="fa-solid fa-pen"></i> Edit</button>
                    <button class="btn-delete" onclick="handleDelete(${art.id})"><i class="fa-solid fa-trash"></i> Delete</button>
                </div>
            </div>
        </div>
    `,
      )
      .join("") || `<p class="no-data">No articles found.</p>`;
  if (pageInfo)
    pageInfo.innerHTML = `Page <strong>${currentPage}</strong> / ${totalPages}`;
  if (prevBtn) prevBtn.disabled = currentPage === 1;
  if (nextBtn)
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
};
window.handleEdit = (id) => {
  articleTitle = document.getElementById("input_title");
  articleContent = document.getElementById("input_content");
  categoryDropdown = document.getElementById("category_select");
  moodInput = document.getElementById("input_mood");
  imagerInput = document.getElementById("input_imager");
  editId = id;
  const art = allArticles.find((a) => a.id == id);
  if (!art) return;

  const modalTitle = document.getElementById("modalTitle");
  if (modalTitle) modalTitle.innerText = "Edit Your Post";

  articleTitle.value = art.title;
  categoryDropdown.value = art.category;
  articleContent.value = art.content;
  moodInput.value = art.mood;
  imagerInput.value = art.imager;
  const statusRadios = document.querySelectorAll('input[name="status"]');
  statusRadios.forEach((radio) => {
    radio.checked = radio.value === art.status;
  });

  modal.classList.add("active");
};

articleForm.onsubmit = (e) => {
  e.preventDefault();
  articleTitle = document.getElementById("input_title");
  articleContent = document.getElementById("input_content");
  categoryDropdown = document.getElementById("category_select");
  moodInput = document.getElementById("input_mood");
  imagerInput = document.getElementById("input_imager");
  const selectedStatus =
    document.querySelector('input[name="status"]:checked')?.value || "public";
  if (
    !articleTitle.value ||
    !articleContent.value ||
    !categoryDropdown.value ||
    !moodInput.value ||
    !imagerInput.value
  ) {
    Swal.fire({ icon: "error", title: "Error", text: "Cannot be left blank" });
    return;
  }

  const articleData = {
    title: articleTitle.value,
    category: categoryDropdown.value,
    content: articleContent.value,
    mood: moodInput.value,
    status: selectedStatus,
    imager: imagerInput.value,
    userId: currentUser.id,
    date: new Date().toLocaleDateString("en-GB"),
  };

  if (editId) {
    const index = allArticles.findIndex((a) => a.id == editId);
    if (index !== -1) {
      allArticles[index] = {
        ...allArticles[index],
        ...articleData,
        id: editId,
      };
    }
  } else {
    // Case: ADD NEW
    allArticles.push({ id: Date.now(), ...articleData });
  }

  localStorage.setItem("articles", JSON.stringify(allArticles));
  closeModalFunc();
  renderArticles();
  Swal.fire("Success", "Your article has been saved!", "success");
};
const closeModalFunc = () => {
  modal.classList.remove("active");
  articleForm.reset();
  editId = null;
  baseImg = "";
};

document.getElementById("btnOpenModal").onclick = () => {
  const modalTitle = document.getElementById("modalTitle");
  if (modalTitle) modalTitle.innerText = "Create New Post";
  modal.classList.add("active");
};

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
      allArticles = allArticles.filter((a) => a.id != id);
      localStorage.setItem("articles", JSON.stringify(allArticles));
      renderArticles();
    }
  });
};
if (searchInput)
  searchInput.oninput = () => {
    currentPage = 1;
    renderArticles();
  };
if (prevBtn)
  prevBtn.onclick = () => {
    currentPage--;
    renderArticles();
  };
if (nextBtn)
  nextBtn.onclick = () => {
    currentPage++;
    renderArticles();
  };

const init = () => {
  const catSelect = document.getElementById("category_select");
  if (catSelect) {
    catSelect.innerHTML = entries
      .map((e) => `<option value="${e.name}">${e.name}</option>`)
      .join("");
  }
  setupHeader();
  renderArticles();
};
viewPrf?.addEventListener("click", () => {
  window.location.href = "./profile.html";
});
init();
