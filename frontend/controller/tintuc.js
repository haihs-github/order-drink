const items = document.querySelectorAll('.diachi-item');
const mapIframe = document.querySelector('.khungmap iframe');

items.forEach(item => {
	item.addEventListener('click', () => {
		const newSrc = item.getAttribute('data-src');
		mapIframe.setAttribute('src', newSrc);
	});
});


//  <!-- hàm khi oneclick vào xem thêm thì tin tức hiện ra -->
function toggleContent(id, button) {
	var content = document.getElementById(id);
	if (content.style.display === "none" || content.style.display === "") {
		content.style.display = "block";
		button.innerText = "Thu gọn";
	} else {
		content.style.display = "none";
		button.innerText = "Xem thêm";
	}
}

// check login

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


// gọi api lấy danh sách tin tức
const cauchuyen = document.getElementById("cauchuyen");
const khuyenmai = document.getElementById('khuyenmai');
const sukien = document.getElementById('sukien');


async function getNews() {
	console.log('Fetching news...');
	try {
		const response = await fetch('http://localhost:5000/api/news');
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const data = await response.json();
		console.log('Fetched news:', data);
		const cauchuyenData = data.filter(item => item.type === 'câu chuyện');
		const khuyenmaiData = data.filter(item => item.type === 'khuyến mãi');
		const sukienData = data.filter(item => item.type === 'sự kiện');

		// xóa nội dung cũ
		cauchuyen.innerHTML = '';
		khuyenmai.innerHTML = '';
		sukien.innerHTML = '';

		// cập nhật api
		if (cauchuyenData.length === 0) {
			cauchuyen.innerHTML = `<h2 class="cauchuyen-header content-header">Câu chuyện thương hiệu</h2>
			<p class="content-header-small">Chưa có tin tức nào</p>`;
		} else {
			cauchuyen.innerHTML = `<h2 class="cauchuyen-header content-header">CÂU CHUYỆN THƯƠNG HIỆU</h2>`
			cauchuyenData.forEach(item => {
				cauchuyen.innerHTML += `
			<div class="news-item">
				<h2>${item.title}</h2>
                        <img src="${item.thumbnail}" alt=""
                            class="item-img">
                        <p class="content-header-small">${item.header}</p>
                        <div class="full-content" id="${item._id}">
                            <p>${item.content}</p>
                        </div>
                        <button class="btn" onclick="toggleContent('${item._id}', this)">Xem thêm</button>
			</div>
			`;
			})
		}

		if (khuyenmaiData.length === 0) {
			khuyenmai.innerHTML = `<h2 class="cauchuyen-header content-header">Khuyến mãi</h2>
			<p class="content-header-small">Chưa có tin tức nào</p>`;
		} else {
			khuyenmai.innerHTML = `<h2 class="cauchuyen-header content-header">TIN TỨC KHUYẾN MÃI</h2>`
			khuyenmaiData.forEach(item => {
				khuyenmai.innerHTML += `
			<div class="news-item">
				<h2>${item.title}</h2>
                        <img src="${item.thumbnail}" alt=""
                            class="item-img">
                        <p class="content-header-small">${item.header}</p>
                        <div class="full-content" id="${item._id}">
                            <p>${item.content}</p>
                        </div>
                        <button class="btn" onclick="toggleContent('${item._id}', this)">Xem thêm</button>
			</div>
			`;
			})
		}

		if (sukienData.length === 0) {
			sukien.innerHTML = `<h2 class="cauchuyen-header content-header">Sự kiện</h2>
			<p class="content-header-small">Chưa có tin tức nào</p>`;
		} else {
			sukien.innerHTML = `<h2 class="cauchuyen-header content-header">SỰ KIỆN</h2>`
			sukienData.forEach(item => {
				sukien.innerHTML += `
			<div class="news-item">
				<h2>${item.title}</h2>
                        <img src="${item.thumbnail}" alt=""
                            class="item-img">
                        <p class="content-header-small">${item.header}</p>
                        <div class="full-content" id="${item._id}">
                            <p>${item.content}</p>
                        </div>
                        <button class="btn" onclick="toggleContent('${item._id}', this)">Xem thêm</button>
			</div>
			`;
			})
		}

	} catch (error) {
		console.error('Error fetching news:', error);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	getNews();
});
