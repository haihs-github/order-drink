document.addEventListener("DOMContentLoaded", async function () {
	//load feedbacks
	const feedbacks = await fetch("http://localhost:5000/api/feedbacks")
		.then((response) => {
			if (!response.ok) {
				console.error("Network response was not ok", error);
				throw new Error("Network response was not ok");
			}
			return response.json();
		}).then((data) => {
			return data;
		}).catch((error) => {
			console.error("There was a problem with the fetch operation:", error);
		})
	console.log("feedbacks", feedbacks);

	function renderFeedbacks(feedbacks) {
		const feedbackList = document.getElementById("product-list");
		feedbackList.innerHTML = ""; // Clear existing content

		feedbacks.forEach(async (feedback) => {
			const feedbackItem = document.createElement("tr");
			feedbackItem.className = "feedback-item";
			feedbackItem.innerHTML = `
				<td>${feedback.user_id.username}</td>
				<td>${feedback.name}</td>
				<td>${feedback.email}</td>
				<td>${feedback.phone_number}</td>
				<td style="min-width: 300px;">${feedback.content}</td>
			`;
			feedbackList.appendChild(feedbackItem);
		});
	}

	renderFeedbacks(feedbacks);

})