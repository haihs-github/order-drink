(function () {
	const token = localStorage.getItem("authToken");
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

	const user = decodeJwt(token)

	if (!token || user.role !== 'admin') {
		// Không có token thì redirect về trang đăng nhập
		alert("bạn ko có quyền truy cập trang này!!")
		window.location.href = "trangchu.html"; // sửa đường dẫn cho đúng
		return
	}
})();