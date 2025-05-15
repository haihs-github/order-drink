// script xử lí phần chi tiết sản phẩm -->

// Lấy element
const detailOverlay = document.getElementById("productDetail");
const detailImg = document.getElementById("detailImg");
const detailName = document.getElementById("detailName");
const detailPriceElem = document.getElementById("detailPrice");
const detailDesc = document.getElementById("detailDesc");
const closeBtn = document.getElementById("closeBtn");
const quantityInput = document.querySelector(".quantity-input");
const totalPriceElem = document.querySelector(".detail-total-price");
const increaseBtn = document.querySelector(".increase-btn");
const decreaseBtn = document.querySelector(".decrease-btn");

const drinkTypeElem = document.getElementById("drink-type");
const sugarLevelElem = document.getElementById("sugar-level");



document.addEventListener('DOMContentLoaded', function () {
	const loginButtonsDiv = document.getElementById('login-buttons');
	const userInfoDiv = document.getElementById('user-info');
	const usernameDisplaySpan = document.getElementById('username-display');
	const logoutButton = document.getElementById('logout-button');
	// hàm giải mã token
	function decodeJwt(token) {
		try {
			const base64Url = token.split('.')[1];
			const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
			const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
				return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
			}).join(''));
			return JSON.parse(jsonPayload);
		} catch (error) {
			console.error("Lỗi giải mã token:", error);
			return null;
		}
	}
	// check login
	// Hàm kiểm tra xem token có tồn tại trong Local Storage hay không
	function checkLoginStatus() {
		const authToken = localStorage.getItem('authToken');
		if (authToken) {
			const data = decodeJwt(authToken)
			console.log("data", data)
			const loggedInUsername = data.username || 'Người dùng';
			// Ẩn nút đăng nhập/đăng ký
			loginButtonsDiv.style.display = 'none';
			// Hiển thị thông tin người dùng và nút đăng xuất
			usernameDisplaySpan.textContent = loggedInUsername;
			userInfoDiv.style.display = 'flex'; // Sử dụng flex để các phần tử nằm trên cùng một dòng
			userInfoDiv.style.alignItems = 'center'; // Căn giữa theo chiều dọc
		} else {
			// Nếu không có token, hiển thị nút đăng nhập/đăng ký
			loginButtonsDiv.style.display = 'flex';
			// Ẩn thông tin người dùng và nút đăng xuất
			userInfoDiv.style.display = 'none';
		}
	}

	// Gọi hàm kiểm tra trạng thái đăng nhập khi trang được tải
	checkLoginStatus();

	// Xử lý sự kiện click cho nút đăng xuất
	logoutButton.addEventListener('click', function () {
		// Xóa token và thông tin người dùng khỏi Local Storage
		localStorage.removeItem('authToken');
		localStorage.removeItem('loggedInUsername'); // Nếu bạn lưu username

		// Gọi lại hàm kiểm tra trạng thái đăng nhập để cập nhật giao diện
		checkLoginStatus();

		// Chuyển hướng người dùng về trang đăng nhập (tùy chọn)
		window.location.href = 'dangnhap.html';
	});
});

// danh mục sản phẩm

async function fetchAndDisplayCategories() {
	try {
		const response = await fetch('http://localhost:5000/api/category');
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const categories = await response.json();

		const danhMucList = document.querySelector('.t3-danhmuc-list');

		if (danhMucList) {
			// Xóa các item danh mục hiện có (nếu có)
			danhMucList.innerHTML = '';

			categories.forEach(category => {
				const listItem = document.createElement('li');
				listItem.classList.add('t3-danhmuc-item');

				const link = document.createElement('a');
				link.href = `#t3-${convertToSlug(category._id)}`; // Tạo slug từ tên category để làm ID hoặc href
				link.textContent = category.name;

				listItem.appendChild(link);
				danhMucList.appendChild(listItem);
			});


		} else {
			console.error('Không tìm thấy phần tử .t3-danhmuc-list trong DOM.');
		}

	} catch (error) {
		console.error('Đã xảy ra lỗi khi gọi API hoặc hiển thị danh mục:', error);
	}
}

// Hàm chuyển đổi tên thành slug (ví dụ: "Trà Sữa" -> "tra-sua")
function convertToSlug(text) {
	return text.toLowerCase();
}

// Gọi hàm fetchAndDisplayCategories khi trang web được tải
document.addEventListener('DOMContentLoaded', fetchAndDisplayCategories);


// sản phẩm

async function fetchAndDisplayAllProducts() {
	try {
		const categoriesResponse = await fetch('http://localhost:5000/api/category');
		if (!categoriesResponse.ok) {
			throw new Error(`HTTP error! status: ${categoriesResponse.status}`);
		}
		const categories = await categoriesResponse.json();

		const bodyElement = document.querySelector('.t3-sanpham'); // Lấy phần thân trang

		if (bodyElement) {
			// Xóa nội dung cũ của phần thân trang
			bodyElement.innerHTML = '';

			for (const category of categories) {
				const categoryId = category._id;
				const categoryName = category.name;

				// Tạo các phần tử HTML cho từng danh mục
				const categorySection = document.createElement('div');
				categorySection.id = `t3-${categoryId}`; // Sử dụng categoryId làm ID
				categorySection.innerHTML = `
          <div class="t3-trasua-title">
            <h4>${categoryName}</h4>
          </div>
          <div class="t3-trasua-list">
            </div>
        `;

				bodyElement.appendChild(categorySection);

				// Gọi API để lấy sản phẩm cho từng danh mục
				await fetchAndDisplayProductsByCategory(categoryId);
			}
		} else {
			console.error('Không tìm thấy phần tử #t3-body trong DOM.');
		}
	} catch (error) {
		console.error('Lỗi khi lấy và hiển thị sản phẩm theo danh mục:', error);
	}
}

async function fetchAndDisplayProductsByCategory(categoryId) {
	try {
		const response = await fetch(`http://localhost:5000/api/products/category/${categoryId}`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const products = await response.json();

		const productListContainer = document.querySelector(`#t3-${categoryId} .t3-trasua-list`);

		if (productListContainer) {
			productListContainer.innerHTML = '';

			if (products.message) {
				productListContainer.innerHTML = `<p>${products.message}</p>`;
			} else {
				products.forEach(product => {
					const productItem = document.createElement('div');
					productItem.classList.add('t3-trasua-item');

					const img = document.createElement('img');
					img.classList.add('t3-ts-img');
					img.src = product.thumbnail;
					img.alt = product.title;

					const name = document.createElement('p');
					name.classList.add('t3-ts-name');
					name.textContent = product.title;

					const price = document.createElement('p');
					price.classList.add('t3-ts-gia');
					price.textContent = product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

					const cartIcon = document.createElement('div');
					cartIcon.classList.add('t3-ts-iconn');
					const icon = document.createElement('i');
					icon.classList.add('fa-solid', 'fa-cart-plus');
					icon.style.color = '#799dd9';
					cartIcon.appendChild(icon);

					productItem.appendChild(img);
					productItem.appendChild(name);
					productItem.appendChild(price);
					productItem.appendChild(cartIcon);

					productListContainer.appendChild(productItem);
				});
				// hien popup
				const items = productListContainer.querySelectorAll(".t3-trasua-item");
				items.forEach((item) => {
					item.addEventListener("click", () => {
						const img = item.querySelector(".t3-ts-img").src;
						const name = item.querySelector(".t3-ts-name").innerText;
						const price = item.querySelector(".t3-ts-gia").innerText;

						detailImg.src = img;
						detailName.innerText = name;
						detailPriceElem.innerText = price;
						detailDesc.innerText = "Mô tả sản phẩm đang cập nhật...";

						quantityInput.value = 1;
						updateTotal();

						detailOverlay.style.display = "flex";
						detailOverlay.style.top = "0px";
						detailOverlay.style.right = "0px";
					});
				});
			}
		} else {
			console.error(`Không tìm thấy phần tử chứa sản phẩm cho danh mục có ID: ${categoryId}`);
		}
	} catch (error) {
		console.error('Lỗi khi lấy và hiển thị sản phẩm:', error);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	fetchAndDisplayAllProducts();
});



// Xử lý sự kiện click cho từng sản phẩm
// Mở popup khi click vào item

// Đóng popup
closeBtn.addEventListener("click", () => {
	detailOverlay.style.display = "none";
});
detailOverlay.addEventListener("click", (e) => {
	if (e.target === detailOverlay) {
		detailOverlay.style.display = "none";
	}
});

// Tính tổng tiền
function updateTotal() {
	const quantity = parseInt(quantityInput.value) || 1;
	const rawPrice = detailPriceElem.innerText
		.replace(/\./g, "")
		.replace("đ", "")
		.trim();
	const priceNum = parseInt(rawPrice) || 0;
	const total = priceNum * quantity;
	totalPriceElem.innerText =
		"Tổng tiền: " + total.toLocaleString("vi-VN") + "đ";
}

// Sự kiện tăng giảm
increaseBtn.addEventListener("click", () => {
	let v = parseInt(quantityInput.value) || 1;
	quantityInput.value = v + 1;
	updateTotal();
});

decreaseBtn.addEventListener("click", () => {
	let v = parseInt(quantityInput.value) || 1;
	if (v > 1) quantityInput.value = v - 1;
	updateTotal();
});
// nhập trực tiếp sô lượng
quantityInput.addEventListener("input", () => {
	if (quantityInput.value < 1) quantityInput.value = 1;
	updateTotal();
});

// xử lí phần giỏ hàng -->

const cartItemsContainer = document.querySelector(
	".cart-items-container"
);
const emptyCartText = document.querySelector(".empty-cart");
const totalPriceElem1 = document.querySelector(".total-price");
const addToCartBtn = document.querySelector(".add-to-cart-btn");

function saveCartToLocalStorage() {
	const cartItems = [];
	document.querySelectorAll(".cart-item").forEach((item) => {
		const name = item.querySelector(".cart-name").innerText;
		const note = item.querySelector(".cart-note").innerText;
		const quantity = parseInt(
			item.querySelector(".cart-quantity").innerText
		);
		const total = item.querySelector(".cart-total").innerText;
		const price =
			parseInt(total.replace(/\./g, "").replace("đ", "").trim()) /
			quantity;

		cartItems.push({ name, note, quantity, total, price });
	});
	localStorage.setItem("cart", JSON.stringify(cartItems));
}

function updateCartTotal() {
	let total = 0;
	const cartItems = document.querySelectorAll(".cart-item");
	cartItems.forEach((item) => {
		const priceText = item.querySelector(".cart-total").innerText;
		const price = parseInt(
			priceText.replace(/\./g, "").replace("đ", "").trim()
		);
		total += price;
	});
	totalPriceElem1.innerText = total.toLocaleString("vi-VN") + "đ";
}

function checkEmptyCart() {
	if (cartItemsContainer.children.length === 0) {
		emptyCartText.style.display = "block";
		totalPriceElem1.innerText = "0đ";
	}
}

function clearCart() {
	cartItemsContainer.innerHTML = "";
	emptyCartText.style.display = "block";
	totalPriceElem1.innerText = "0đ";
	localStorage.removeItem("cart");
}

function addCartItem(name, note, quantity, price) {
	const total = price * quantity;

	const cartItem = document.createElement("div");
	cartItem.classList.add("cart-item");
	cartItem.innerHTML = `
                <div class="cart-info">
                    <div class="cart-name">${name}</div>
                    <div class="cart-note">${note}</div>
                </div>
                <div class="cart-controls">
                    <button class="decrease-cart-btn">-</button>
                    <span class="cart-quantity">${quantity}</span>
                    <button class="increase-cart-btn">+</button>
                    <span class="cart-total">${total.toLocaleString(
		"vi-VN"
	)}đ</span>
                </div>
            `;

	const decreaseBtn = cartItem.querySelector(".decrease-cart-btn");
	const increaseBtn = cartItem.querySelector(".increase-cart-btn");
	const quantityElem = cartItem.querySelector(".cart-quantity");
	const totalElem = cartItem.querySelector(".cart-total");

	decreaseBtn.addEventListener("click", () => {
		let q = parseInt(quantityElem.innerText);
		if (q > 1) {
			quantityElem.innerText = --q;
			totalElem.innerText = (q * price).toLocaleString("vi-VN") + "đ";
		} else {
			cartItem.remove();
			checkEmptyCart();
		}
		updateCartTotal();
		saveCartToLocalStorage();
	});

	increaseBtn.addEventListener("click", () => {
		let q = parseInt(quantityElem.innerText);
		quantityElem.innerText = ++q;
		totalElem.innerText = (q * price).toLocaleString("vi-VN") + "đ";
		updateCartTotal();
		saveCartToLocalStorage();
	});

	cartItemsContainer.appendChild(cartItem);
	emptyCartText.style.display = "none";
	updateCartTotal();
	saveCartToLocalStorage();
}

function loadCartFromLocalStorage() {
	const data = localStorage.getItem("cart");
	if (!data) return;

	const cartItems = JSON.parse(data);
	cartItems.forEach((item) => {
		const { name, note, quantity, price } = item;
		addCartItem(name, note, quantity, price);
	});
}

if (addToCartBtn) {
	addToCartBtn.addEventListener("click", () => {
		const name = detailName.innerText;
		const rawPrice = detailPriceElem.innerText
			.replace(/\./g, "")
			.replace("đ", "")
			.trim();
		const price = parseInt(rawPrice) || 0;
		const quantity = parseInt(quantityInput.value);

		const drinkType = document.querySelector("#drink-type").value;
		const sugarLevel = document.querySelector("#sugar-level").value;

		const note = `(${drinkType}, ${sugarLevel}% đường)`;

		addCartItem(name, note, quantity, price);

		detailOverlay.style.display = "none";
	});
}

document.addEventListener("DOMContentLoaded", loadCartFromLocalStorage);
// xử lí phần lưu dữ liệu giỏ hàng lên localstorage
function proceedToCheckout() {
	// Dữ liệu giỏ hàng đã được lưu trong localStorage
	window.location.href = "chitietthanhtoan.html"; // Thay bằng đường dẫn thực tế của trang chi tiết thanh toán
}