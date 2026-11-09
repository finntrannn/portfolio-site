const blogManifest = [
	{
		slug: "hello-world",
		title: "hello world 👋",
		date: "2026.11",
		file: "posts/hello-world.md",
	},
];

function renderBlogList() {
	const container = document.getElementById("blog-posts-container");
	if (!blogManifest || blogManifest.length === 0) {
		container.innerHTML = `
                    <p class="text-[0.9rem] italic" style="color: var(--text-muted);">
                        no posts yet. check back soon.
                    </p>
                `;
		return;
	}

	container.innerHTML = blogManifest
		.map(
			(post) => `
                <article class="flex items-baseline justify-between gap-4">
                    <button type="button" onclick="loadPost('${post.slug}')" class="prose-link text-left font-normal cursor-pointer">
                        ${post.title}
                    </button>
                    <span class="font-mono text-[0.75rem] shrink-0" style="color: var(--text-muted);">${post.date}</span>
                </article>
            `,
		)
		.join("");
}

async function loadPost(slug) {
	const post = blogManifest.find((p) => p.slug === slug);
	if (!post) return;

	document.getElementById("post-title").textContent = post.title;
	document.getElementById("post-date").textContent = post.date;
	document.getElementById("post-body").innerHTML =
		'<p class="italic" style="color: var(--text-muted);">loading markdown...</p>';

	document.getElementById("blog-list").classList.add("hidden");
	document.getElementById("blog-reader").classList.remove("hidden");

	try {
		const response = await fetch(post.file);
		if (!response.ok) throw new Error("failed to load markdown file");
		const markdownText = await response.text();

		const rawHtml =
			typeof marked !== "undefined"
				? marked.parse(markdownText)
				: markdownText;
		document.getElementById("post-body").innerHTML =
			`<div class="markdown-body">${rawHtml}</div>`;
	} catch (err) {
		document.getElementById("post-body").innerHTML = `
                    <p class="text-rose-500 text-[0.85rem]">could not load post content. make sure <code>${post.file}</code> exists in your repository.</p>
                `;
	}
}

function closePost() {
	document.getElementById("blog-reader").classList.add("hidden");
	document.getElementById("blog-list").classList.remove("hidden");
}

function updateSaigonClock() {
	const now = new Date();
	const options = {
		timeZone: "Asia/Ho_Chi_Minh",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	};
	const timeString = new Intl.DateTimeFormat("en-GB", options).format(now);
	document.getElementById("saigon-clock").textContent =
		`saigon, vn · ${timeString}`;
}
setInterval(updateSaigonClock, 1000);
updateSaigonClock();

function switchTab(tabId) {
	const wrapper = document.getElementById("app-wrapper");
	const panels = document.querySelectorAll(".tab-panel");
	const navLinks = document.querySelectorAll(".nav-link[data-tab]");

	navLinks.forEach((btn) => {
		if (btn.getAttribute("data-tab") === tabId) {
			btn.classList.add("active");
		} else {
			btn.classList.remove("active");
		}
	});

	panels.forEach((panel) => {
		if (panel.id === `tab-${tabId}`) {
			panel.classList.add("active");
		} else {
			panel.classList.remove("active");
		}
	});

	if (tabId === "blog") {
		closePost();
	}

	if (tabId === "home") {
		wrapper.classList.remove("has-content");
	} else {
		wrapper.classList.add("has-content");
	}

	try {
		if (window.location.protocol !== "blob:" && history.replaceState) {
			const newUrl =
				tabId === "home" ? window.location.pathname : `#${tabId}`;
			history.replaceState(null, null, newUrl);
		}
	} catch (err) {}
}

function toggleTheme() {
	const htmlEl = document.documentElement;
	const isDark = htmlEl.classList.toggle("dark");
	document.getElementById("theme-label").textContent = isDark
		? "light"
		: "dark";
}

async function copyEmail() {
	const email = "hi@finn.id.vn";
	const label = document.getElementById("email-label");
	try {
		if (navigator.clipboard && navigator.clipboard.writeText) {
			await navigator.clipboard.writeText(email);
		} else {
			const tempInput = document.createElement("textarea");
			tempInput.value = email;
			document.body.appendChild(tempInput);
			tempInput.select();
			document.execCommand("copy");
			document.body.removeChild(tempInput);
		}
		label.textContent = "copied hi@finn.id.vn ✓";
	} catch (err) {
		label.textContent = "copied hi@finn.id.vn ✓";
	}
	setTimeout(() => {
		label.textContent = "email (hi@finn.id.vn)";
	}, 2000);
}

window.addEventListener("DOMContentLoaded", () => {
	renderBlogList();
	const hash = window.location.hash.replace("#", "").toLowerCase();
	const validTabs = ["home", "about", "uses", "blog"];
	if (validTabs.includes(hash)) {
		switchTab(hash);
	}
});
