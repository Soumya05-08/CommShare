 /*
Simple client-side MVP for "ShareNBorrow" style idea.
- Uses localStorage to persist items, users, requests.
- No backend (for project demo). Replace persistence with API calls when backend exists.
*/

  // ---------- Sample categories ----------
  const CATEGORIES = [
    "Education & Learning",
    "Gadgets & Electronics",
    "Sports & Fitness",
    "Music & Hobbies",
    "Household & Festive",
    "Travel & Outdoor",
    "Miscellaneous",
  ];

  // ---------- Helpers ----------
  function $(id) {
    return document.getElementById(id);
  }
  function toast(msg, t = 2500) {
    const el = $("toast");
    el.textContent = msg;
    el.classList.remove("hidden");
    setTimeout(() => el.classList.add("hidden"), t);
  }

  // ---------- storage helpers ----------
  const STORAGE = {
    itemsKey: "sn_items_v1",
    userKey: "sn_user_v1",
    requestsKey: "sn_requests_v1",

    loadItems() {
      return JSON.parse(localStorage.getItem(this.itemsKey) || "[]");
    },
    saveItems(items) {
      localStorage.setItem(this.itemsKey, JSON.stringify(items));
    },
    getUser() {
      return JSON.parse(localStorage.getItem(this.userKey) || "null");
    },
    setUser(u) {
      localStorage.setItem(this.userKey, JSON.stringify(u));
    },
    clearUser() {
      localStorage.removeItem(this.userKey);
    },
    loadRequests() {
      return JSON.parse(localStorage.getItem(this.requestsKey) || "[]");
    },
    saveRequests(reqs) {
      localStorage.setItem(this.requestsKey, JSON.stringify(reqs));
    },
  };

  // ---------- UI init ----------
  const itemsGrid = $("itemsGrid");
  const categoryFilter = $("categoryFilter");
  const itemCategory = $("itemCategory");
  const searchInput = $("searchInput");
  const sortSelect = $("sortSelect");

  function initCategorySelects() {
    CATEGORIES.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      categoryFilter.appendChild(opt);
      const opt2 = opt.cloneNode(true);
      itemCategory.appendChild(opt2);
    });
  }
  initCategorySelects();

  // ---------- sample data (only if empty) ----------
  if (STORAGE.loadItems().length === 0) {
    const sample = [
      {
        id: "it1",
        title: "Canon EOS DSLR",
        desc: "Good condition, ideal for travel photography.",
        category: "Gadgets & Electronics",
        price: 500,
        deposit: 2000,
        owner: "Mradul",
        ownerPhone: "9999999999",
        img: "",
        created: Date.now(),
      },
      {
        id: "it2",
        title: "Acoustic Guitar",
        desc: "Standard size, includes case.",
        category: "Music & Hobbies",
        price: 150,
        deposit: 800,
        owner: "Naman",
        ownerPhone: "8888888888",
        img: "",
        created: Date.now() - 10000000,
      },
    ];
    STORAGE.saveItems(sample);
  }

  // ---------- Render items ----------
  function renderItems() {
    const q = searchInput.value.trim().toLowerCase();
    const cat = categoryFilter.value;
    let items = STORAGE.loadItems();

    // filter
    if (cat !== "all") items = items.filter((i) => i.category === cat);
    if (q)
      items = items.filter((i) =>
        (i.title + " " + i.desc + " " + i.category).toLowerCase().includes(q)
      );

    // sort
    const sort = sortSelect.value;
    if (sort === "price_low") items.sort((a, b) => a.price - b.price);
    else if (sort === "price_high") items.sort((a, b) => b.price - a.price);
    else items.sort((a, b) => b.created - a.created);

    itemsGrid.innerHTML = "";
    if (items.length === 0) {
      $("emptyState").classList.remove("hidden");
      return;
    } else $("emptyState").classList.add("hidden");

    items.forEach((it) => {
      const card = document.createElement("div");
      card.className = "bg-white rounded shadow p-3 flex flex-col";

      const imgWrap = document.createElement("div");
      imgWrap.className =
        "w-full h-40 bg-gray-100 rounded overflow-hidden flex items-center justify-center";
      if (it.img) {
        const im = document.createElement("img");
        im.src = it.img;
        im.alt = it.title;
        im.className = "object-cover w-full h-full";
        imgWrap.appendChild(im);
      } else {
        imgWrap.innerHTML = `<div class="text-gray-500">${it.title}</div>`;
      }

      const body = document.createElement("div");
      body.className = "mt-2 flex-1";
      body.innerHTML = `
      <h3 class="font-semibold text-sm">${it.title}</h3>
      <p class="text-xs text-gray-500 mt-1">${it.desc}</p>
      <div class="flex items-center justify-between mt-3">
        <div class="text-xs text-gray-600">${it.category}</div>
        <div class="text-sm font-semibold">₹${it.price}/day</div>
      </div>
      <div class="text-xs text-gray-500 mt-1">Deposit: ₹${it.deposit} • Owner: ${it.owner}</div>
    `;

      const actions = document.createElement("div");
      actions.className = "mt-3 flex gap-2";
      const btnRequest = document.createElement("button");
      btnRequest.className =
        "flex-1 bg-green-600 text-white py-2 rounded text-sm";
      btnRequest.textContent = "Request to Rent";
      btnRequest.onclick = () => openRequestModal(it.id);

      const btnDetails = document.createElement("button");
      btnDetails.className = "px-3 py-2 rounded border text-sm";
      btnDetails.textContent = "Contact Owner";
      btnDetails.onclick = () => {
        const user = STORAGE.getUser();
        if (!user) {
          toast("Login first to contact");
          return;
        }
        // show phone in toast (demo)
        toast(`Owner: ${it.owner} • Phone: ${it.ownerPhone}`, 4000);
      };

      actions.appendChild(btnRequest);
      actions.appendChild(btnDetails);

      card.appendChild(imgWrap);
      card.appendChild(body);
      card.appendChild(actions);

      itemsGrid.appendChild(card);
    });
  }
  renderItems();

  // ---------- Search & filter events ----------
  searchInput.addEventListener("input", () => renderItems());
  categoryFilter.addEventListener("change", () => renderItems());
  sortSelect.addEventListener("change", () => renderItems());
  $("clearFilters").addEventListener("click", () => {
    searchInput.value = "";
    categoryFilter.value = "all";
    sortSelect.value = "newest";
    renderItems();
  });

  // ---------- Login logic (demo) ----------
  function refreshUserArea() {
    const u = STORAGE.getUser();
    const userArea = $("userArea");
    const loginCard = $("loginCard");
    const btnLogout = $("btnLogout");
    if (u) {
      userArea.innerHTML = `<div class="text-sm">Hi, <strong>${u.name}</strong></div>`;
      loginCard.classList.add("hidden");
      btnLogout.classList.remove("hidden");
    } else {
      userArea.innerHTML = "";
      loginCard.classList.remove("hidden");
      btnLogout.classList.add("hidden");
    }
  }
  $("btnLogin").addEventListener("click", () => {
    const name = $("inpName").value.trim();
    const phone = $("inpPhone").value.trim();
    if (!name || !phone) {
      toast("Enter name & phone");
      return;
    }
    const user = { name, phone, joined: Date.now() };
    STORAGE.setUser(user);
    toast("Logged in as " + name);
    refreshUserArea();
  });
  $("btnLogout").addEventListener("click", () => {
    STORAGE.clearUser();
    refreshUserArea();
    toast("Logged out");
  });
  refreshUserArea();

  // ---------- Add Item modal logic ----------
  const modal = $("modalOverlay");
  $("btnAdd").addEventListener("click", () => {
    const user = STORAGE.getUser();
    if (!user) {
      toast("Login first to add item");
      return;
    }
    modal.classList.remove("hidden");
  });

  $("closeModal").addEventListener("click", () =>
    modal.classList.add("hidden")
  );
  $("btnCancelAdd").addEventListener("click", () =>
    modal.classList.add("hidden")
  );

  const imgInput = $("imgInput");
  const imgPreview = $("imgPreview");
  let uploadedDataUrl = "";

  imgInput.addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      uploadedDataUrl = ev.target.result;
      imgPreview.innerHTML = "";
      const im = document.createElement("img");
      im.src = uploadedDataUrl;
      im.className = "object-cover w-full h-full";
      imgPreview.appendChild(im);
    };
    reader.readAsDataURL(f);
  });

  // add item submit
  $("addItemForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = $("itemTitle").value.trim() || "Untitled";
    const desc = $("itemDesc").value.trim() || "";
    const category = $("itemCategory").value;
    const price = Number($("pricePerDay").value) || 0;
    const deposit = Number($("securityDeposit").value) || 0;
    const availability = $("availability").value.trim() || "Immediate";
    const user = STORAGE.getUser();
    if (!user) {
      toast("Login to add");
      return;
    }

    const newItem = {
      id: "it_" + Date.now(),
      title,
      desc,
      category,
      price,
      deposit,
      availability,
      owner: user.name,
      ownerPhone: user.phone,
      img: uploadedDataUrl,
      created: Date.now(),
    };

    const items = STORAGE.loadItems();
    items.unshift(newItem);
    STORAGE.saveItems(items);
    uploadedDataUrl = "";
    $("addItemForm").reset();
    imgPreview.innerHTML = "Preview";
    modal.classList.add("hidden");
    toast("Item added");
    renderItems();
  });

  // ---------- Request modal ----------
  let activeRequestItemId = null;
  function openRequestModal(itemId) {
    const user = STORAGE.getUser();
    if (!user) {
      toast("Login to request");
      return;
    }
    const items = STORAGE.loadItems();
    const it = items.find((x) => x.id === itemId);
    if (!it) {
      toast("Item not found");
      return;
    }
    activeRequestItemId = itemId;
    $(
      "requestItemTitle"
    ).textContent = `${it.title} — ₹${it.price}/day • Deposit ₹${it.deposit}`;
    $("requestOverlay").classList.remove("hidden");
  }
  $("btnCancelRequest").addEventListener("click", () => {
    activeRequestItemId = null;
    $("requestOverlay").classList.add("hidden");
  });
  $("btnConfirmRequest").addEventListener("click", () => {
    const days = Number($("rentalDays").value) || 1;
    const user = STORAGE.getUser();
    if (!user) {
      toast("Login to request");
      return;
    }
    const it = STORAGE.loadItems().find((x) => x.id === activeRequestItemId);
    if (!it) {
      toast("Item not found");
      return;
    }
    const reqs = STORAGE.loadRequests();
    // simple request object
    reqs.push({
      id: "rq_" + Date.now(),
      itemId: it.id,
      itemTitle: it.title,
      requester: user.name,
      requesterPhone: user.phone,
      owner: it.owner,
      ownerPhone: it.ownerPhone,
      days,
      status: "pending",
      created: Date.now(),
    });
    STORAGE.saveRequests(reqs);
    $("requestOverlay").classList.add("hidden");
    toast("Request sent to owner");
  });

  // ---------- small helpers for dev: view requests in console ----------
  window.DEBUG = {
    listItems: () => console.log(STORAGE.loadItems()),
    listRequests: () => console.log(STORAGE.loadRequests()),
    clearAll: () => {
      localStorage.clear();
      location.reload();
    },
  };