const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const postsFromLocal = JSON.parse(localStorage.getItem("articles")) || [];
const categoriesFromLocal = JSON.parse(localStorage.getItem("entries")) || [];

const allPublicPosts = postsFromLocal
  .filter((post) => post.status === "public")
  .reverse();

let currentCategory = "All";
let filteredPosts = [...allPublicPosts];
let currentPage = 1;
const itemsPerPage = 5;
let currentViewingPostId = null;
const recentItems = allPublicPosts.slice(0, 3);

const authButtons = document.querySelector(".auth-buttons");
const avatarSection = document.querySelector(".avatar");
const avatarBtn = document.querySelector("#avatar-btn");
const dropdown = document.querySelector(".dropdow");
const logoutBtn = document.querySelector(".logOut");
const dropdownName = document.querySelector(".text-avatar-dropdow p");
const dropdownEmail = document.querySelector(".text-avatar-dropdow span");
const headerAvatarImg = document.querySelector(".avatar img");
const signIn = document.querySelector("#signIn");
const signUp = document.querySelector("#signUp");
const myPosst = document.querySelector(".myPosst");
const viewPrf = document.querySelector(".viewPrf");
const avatarDropdow = document.querySelector(".avatar-dropdow img");

const recentContainer = document.querySelector(".section-container");
const articleRow = document.getElementById("articleRow");
const pageText = document.querySelector(".pagination p");
const btnPrev = document.getElementById("previous");
const btnNext = document.getElementById("next");
const filterContainer = document.querySelector(".filter-topics");
const modal = document.getElementById("articleModal");
const closeModal = document.querySelector(".close-modal");
const modalBody = document.querySelector("#articleModal .modal-body");

const initAuth = () => {
  if (currentUser) {
    if (authButtons) {
      authButtons.style.display = "none";
    }
    if (avatarSection) {
      avatarSection.style.display = "block";
    }
    if (dropdownName) {
      dropdownName.textContent = `${currentUser.fistName} ${currentUser.lastName}`;
    }
    if (dropdownEmail) {
      dropdownEmail.textContent = currentUser.email;
    }
    if (headerAvatarImg) {
      headerAvatarImg.src =
        currentUser.avatar ||
        "https://cdn.kona-blue.com/upload/kona-blue_com/post/images/2024/09/18/457/avatar-mac-dinh-12.jpg";
    }
    if (avatarDropdow) {
      avatarDropdow.src =
        currentUser.avatar ||
        "https://cdn.kona-blue.com/upload/kona-blue_com/post/images/2024/09/18/457/avatar-mac-dinh-12.jpg";
    }
  } else {
    if (authButtons) authButtons.style.display = "block";
    if (avatarSection) avatarSection.style.display = "none";
  }

  avatarBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (dropdown) {
      dropdown.style.display =
        dropdown.style.display === "block" ? "none" : "block";
    }
  });

  document.addEventListener("click", () => {
    if (dropdown) dropdown.style.display = "none";
  });
};

const renderRecentPosts = () => {
  // 1. Kiểm tra xem vùng chứa có tồn tại không
  if (!recentContainer) {
    return;
  }

  // 2. Kiểm tra nếu không có bài viết mới nào (mảng trống)
  if (recentItems.length === 0) {
    // Hiển thị thông báo hoặc xóa trắng vùng chứa
    recentContainer.innerHTML = `
      <div style="width: 100%; text-align: center; padding: 30px; background: #fdfdfd; border: 1px solid #eee;">
        <p style="color: #999;">Hiện chưa có bài viết mới nào để hiển thị.</p>
      </div>
    `;
    return;
  }

  // 3. Nếu có bài viết, tiến hành bóc tách dữ liệu
  const bigPost = recentItems[0];
  const smallPosts = recentItems.slice(1);

  // Tạo HTML cho bài viết lớn bên trái
  const bigPostHTML = `
      <div class="section-blog">
          <div class="section-blog-card">
              <div class="imager-section-blog">
                  <img src="${bigPost.imager}" alt="Big Post" />
              </div>
              <div class="card-body">
                  <p class="text-date"><i class="fa-regular fa-calendar"></i> ${bigPost.date}</p>
                  <div class="heading">
                      <button class="view-detail" data-id="${bigPost.id}"><h3>${bigPost.title}</h3></button>
                  </div>
                  <p class="text-content">${bigPost.content.substring(0, 150)}...</p>
                  <div class="categories">
                      <span class="badge">${bigPost.category}</span>
                  </div>
              </div>
          </div>
      </div>`;

  // Tạo HTML cho các bài viết nhỏ bên phải
  const smallPostsHTML = smallPosts
    .map((post) => {
      return `
      <div class="section-colum-card">
          <div class="imager-section-colum">
              <img src="${post.imager}" alt="Small Post" />
          </div>
          <div class="card-body">
              <p class="text-date"><i class="fa-regular fa-calendar"></i> ${post.date}</p>
              <div class="heading">
                  <button class="view-detail" data-id="${post.id}"><h3>${post.title}</h3></button>
              </div>
              <p class="text-content">${post.content.substring(0, 120)}...</p>
              <div class="categories">
                  <span class="badge">${post.category}</span>
              </div>
          </div>
      </div>`;
    })
    .join("");
  recentContainer.innerHTML = `
    ${bigPostHTML} 
    <div class="section-colum">${smallPostsHTML}</div>
  `;
};
const renderFilters = () => {
  if (!filterContainer) return;

  let html = `<button class="${currentCategory === "All" ? "active" : ""}" data-cat="All">All</button>`;

  categoriesFromLocal.forEach((item) => {
    html += `<button class="${currentCategory === item.name ? "active" : ""}" data-cat="${item.name}">${item.name}</button>`;
  });

  filterContainer.innerHTML = html;

  filterContainer.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentCategory = btn.getAttribute("data-cat");
      filteredPosts =
        currentCategory === "All"
          ? [...allPublicPosts]
          : allPublicPosts.filter((p) => p.category === currentCategory);

      currentPage = 1;
      renderFilters();
      renderArticlesList();
    });
  });
};

const renderArticlesList = () => {
  // 1. Kiểm tra nếu không tìm thấy vùng chứa bài viết thì dừng lại
  if (!articleRow) {
    return;
  }

  // 2. Trường hợp KHÔNG có bài viết nào sau khi lọc
  if (filteredPosts.length === 0) {
    // Hiển thị thông báo thân thiện
    articleRow.innerHTML = `
      <div style="width: 100%; text-align: center; padding: 40px; color: #888;">
        <i class="fa-solid fa-folder-open" style="font-size: 40px; margin-bottom: 15px;"></i>
        <p>Hiện tại chưa có bài viết nào trong chủ đề này.</p>
      </div>
    `;

    // Ẩn thanh phân trang đi cho gọn
    if (pageText) {
      pageText.parentElement.style.display = "none";
    }
    return; // Dừng hàm ở đây, không chạy đoạn mã bên dưới nữa
  }

  // 3. Trường hợp CÓ bài viết: Hiện lại thanh phân trang
  if (pageText) {
    pageText.parentElement.style.display = "flex";
  }

  // Tính toán vị trí bài viết để hiển thị (Phân trang)
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage) || 1;
  const start = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredPosts.slice(start, start + itemsPerPage);

  // Render danh sách bài viết
  articleRow.innerHTML = currentItems
    .map((post) => {
      return `
        <div class="card">
            <div class="imager"><img src="${post.imager}" /></div>
            <div class="card-body">
                <p class="text-date"><i class="fa-regular fa-calendar"></i> ${post.date}</p>
                <div class="heading">
                    <button class="view-detail" data-id="${post.id}"><h3>${post.title}</h3></button>
                </div>
                <p class="text-content">${post.content.substring(0, 100)}...</p>
                <div class="categories"><span class="badge">${post.category}</span></div>
            </div>
        </div>`;
    })
    .join("");

  // Cập nhật số trang và trạng thái nút bấm
  if (pageText) {
    pageText.innerHTML = `Page <strong>${currentPage}</strong> / ${totalPages}`;
  }

  if (btnPrev) {
    btnPrev.disabled = currentPage === 1;
  }

  if (btnNext) {
    btnNext.disabled = currentPage >= totalPages;
  }
};

const showPostDetail = (id) => {
  const post = postsFromLocal.find((p) => String(p.id) === String(id));
  if (!post || !modalBody) return;

  currentViewingPostId = id;

  const postDetailHTML = `
          <h2 id="modalTitle">${post.title}</h2>
          <div class="modal-meta">
              <span class="badge" id="modalCategory">${post.category}</span>
              <span id="modalDate"><i class="fa-regular fa-calendar"></i> ${post.date}</span>
          </div>
          <div class="modal-image"><img id="modalImg" src="${post.imager}" /></div>
          <p id="modalText">${post.content.replace(/\n/g, "<br>")}</p>
          <hr />
          <div class="comment-section">
              <div class="comment-header-row">
                  <h3>Comments</h3>
                  <span class="view-all-comments">View all ${post.comments ? post.comments.length : 0} comments <i class="fa-solid fa-chevron-down"></i></span>
              </div>
              <div id="commentList" class="comment-list"></div>
              ${
                currentUser
                  ? `
                  <div class="comment-input-block">
                      <img src="${currentUser.avatar || "https://cdn.kona-blue.com/upload/kona-blue_com/post/images/2024/09/18/457/avatar-mac-dinh-12.jpg"}" alt="User Avatar" class="user-avatar-small" />
                      <textarea id="commentContent" placeholder="Post a comment..."></textarea>
                      <button id="btnSubmitComment">POST</button>
                  </div>
              `
                  : `<p class="login-to-comment">Please login to post a comment.</p>`
              }
          </div>
      `;

  modalBody.innerHTML = postDetailHTML;
  renderComments(post.comments || []);
  if (modal) modal.style.display = "block";
  document.body.style.overflow = "hidden";
};

const renderComments = (comments) => {
  const commentList = document.getElementById("commentList");
  if (!commentList) return;

  if (comments.length === 0) {
    commentList.innerHTML = `<p class="no-comments">No comments yet. Be the first to comment!</p>`;
    return;
  }

  commentList.innerHTML = comments
    .map(
      (c) => `
          <div class="comment-item">
              <img src="${c.userAvatar}" alt="Avatar" class="user-avatar-small" />
              <div class="comment-bubble">
                  <p class="comment-text"><strong>${c.userName}</strong>: ${c.text}</p>
                  <div class="comment-bubble-footer">
                      <span class="reply-count">6 Replies <i class="fa-solid fa-chevron-down"></i></span>
                      <span class="reply-action-icon"><i class="fa-solid fa-share"></i></span>
                  </div>
              </div>
              ${
                currentUser &&
                (currentUser.isAdmin ||
                  currentUser.fistName + " " + currentUser.lastName ===
                    c.userName)
                  ? `
                  <button class="btn-delete-comment" onclick="deleteComment('${currentViewingPostId}', ${c.timestamp})">
                      <i class="fa-solid fa-times"></i>
                  </button>
              `
                  : ""
              }
          </div>
      `,
    )
    .join("");
};

document.addEventListener("click", (e) => {
  const detailBtn = e.target.closest(".view-detail");
  if (detailBtn) {
    showPostDetail(detailBtn.getAttribute("data-id"));
    return;
  }

  if (e.target.id === "btnSubmitComment") {
    const commentInput = document.getElementById("commentContent");
    if (!commentInput || !currentUser) return;

    const text = commentInput.value.trim();
    if (!text) return;

    const postIndex = postsFromLocal.findIndex(
      (p) => String(p.id) === String(currentViewingPostId),
    );
    if (postIndex === -1) return;

    const newComment = {
      userName: `${currentUser.fistName} ${currentUser.lastName}`,
      userAvatar: currentUser.avatar,
      text: text,
      timestamp: new Date().getTime(),
      date: new Date().toLocaleString(),
    };

    if (!postsFromLocal[postIndex].comments)
      postsFromLocal[postIndex].comments = [];
    postsFromLocal[postIndex].comments.push(newComment);

    localStorage.setItem("articles", JSON.stringify(postsFromLocal));
    commentInput.value = "";
    renderComments(postsFromLocal[postIndex].comments);
    return;
  }
});

window.deleteComment = (postId, commentTimestamp) => {
  const postIndex = postsFromLocal.findIndex(
    (p) => String(p.id) === String(postId),
  );
  if (postIndex === -1) return;

  Swal.fire({
    title: "Delete comment?",
    text: "You will not be able to restore this comment!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#d33",
  }).then((result) => {
    if (result.isConfirmed) {
      postsFromLocal[postIndex].comments = postsFromLocal[
        postIndex
      ].comments.filter((c) => c.timestamp !== commentTimestamp);
      localStorage.setItem("articles", JSON.stringify(postsFromLocal));
      renderComments(postsFromLocal[postIndex].comments);
    }
  });
};

closeModal?.addEventListener("click", () => {
  if (modal) modal.style.display = "none";
  document.body.style.overflow = "auto";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
});

btnPrev?.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderArticlesList();
  }
});

btnNext?.addEventListener("click", () => {
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderArticlesList();
  }
});

signIn?.addEventListener("click", () => {
  window.location.href = "./page/login.html";
});

signUp?.addEventListener("click", () => {
  window.location.href = "./page/register.html";
});
myPosst?.addEventListener("click", () => {
  window.location.href = "./page/article_add.html";
});
viewPrf?.addEventListener("click", () => {
  window.location.href = "./page/profile.html";
});
logoutBtn?.addEventListener("click", () => {
  Swal.fire({
    title: "Are you sure?",
    text: "Do you want to log out?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Log Out Success",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        localStorage.removeItem("currentUser");
        window.location.reload();
      });
    }
  });
});

initAuth();
renderRecentPosts();
renderFilters();
renderArticlesList();
