const user = JSON.parse(localStorage.getItem("currentUser"));
const entries = JSON.parse(localStorage.getItem("entries")) || [];
const allArticles = JSON.parse(localStorage.getItem("articles")) || [];

const articleTitle = document.querySelector("#input_1");
const categoryDropdown = document.querySelector("#category_selection");
const articleMood = document.querySelector("#mood");
const articleContent = document.querySelector("#input_3");
const fileInput = document.querySelector("#fileInput");
const btnAdd = document.querySelector(".btn-add");
const imagePreview = document.querySelector("#imagePreview");
const backBtn = document.querySelector(".back-icon-btn");

let baseImg = "";

// Kiểm tra chế độ Sửa (Edit) qua Query Params
const urlParams = new URLSearchParams(window.location.search);
const editId = urlParams.get("id");

// Đổ danh sách Category
entries.forEach((entrie) => {
  const option = document.createElement("option");
  option.value = entrie.name;
  option.textContent = entrie.name;
  categoryDropdown.appendChild(option);
});

// Nếu là mode Edit: Đổ dữ liệu cũ vào input
if (editId) {
  const articleToEdit = allArticles.find((a) => a.id == editId);
  if (articleToEdit) {
    articleTitle.value = articleToEdit.title;
    categoryDropdown.value = articleToEdit.category;
    articleMood.value = articleToEdit.mood;
    articleContent.value = articleToEdit.content;
    baseImg = articleToEdit.imager;
    document.querySelector(
      `input[name="status"][value="${articleToEdit.status}"]`,
    ).checked = true;

    if (baseImg) {
      imagePreview.src = baseImg;
      imagePreview.style.display = "block";
      document.querySelector("#uploadPlaceholder").style.display = "none";
    }
    btnAdd.innerHTML = '<i class="fa-solid fa-save"></i> UPDATE ARTICLE';
  }
}

btnAdd.addEventListener("click", (event) => {
  event.preventDefault();

  if (!articleTitle.value || !articleContent.value || !categoryDropdown.value) {
    Swal.fire({ icon: "error", title: "Error", text: "Cannot be left blank" });
    return;
  }

  const statusInput = document.querySelector("input[name=status]:checked");

  if (editId) {
    // Logic Cập nhật
    const index = allArticles.findIndex((a) => a.id == editId);
    allArticles[index] = {
      ...allArticles[index],
      title: articleTitle.value,
      category: categoryDropdown.value,
      content: articleContent.value,
      mood: articleMood.value,
      status: statusInput.value,
      imager: baseImg,
    };
  } else {
    // Logic Thêm mới
    const newarticle = {
      id: Date.now(),
      title: articleTitle.value,
      category: categoryDropdown.value,
      content: articleContent.value,
      mood: articleMood.value,
      status: statusInput.value,
      imager: baseImg,
      date: getTodayDate(),
      userId: user.id,
    };
    allArticles.push(newarticle);
  }

  localStorage.setItem("articles", JSON.stringify(allArticles));
  Swal.fire({ icon: "success", title: "Thành công" }).then(() =>
    handleBackNavigation(),
  );
});

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      baseImg = event.target.result;
      imagePreview.src = baseImg;
      imagePreview.style.display = "block";
      document.querySelector("#uploadPlaceholder").style.display = "none";
    };
    reader.readAsDataURL(file);
  }
});

function getTodayDate() {
  const now = new Date();
  return `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
}

const handleBackNavigation = () => {
  if (!user) return (window.location.href = "./login.html");
  window.location.href =
    user.role === "admin" ? "./article_manage.html" : "./article_add.html";
};

backBtn.addEventListener("click", (e) => {
  e.preventDefault();
  handleBackNavigation();
});
