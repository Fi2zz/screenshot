import puppeteer from "puppeteer";
const stash = {
	brower: null,
	page: null,
};
function wait(duration) {
	return new Promise((resolve) => setTimeout(() => resolve(), duration));
}
export async function screenshot(urls = [], { writeFile, headers = {} }) {
	if (urls.length === 0) return;
	let start = new Date();
	console.log(`开始 ${start.toLocaleString()}`);
	const browser =
		stash.brower ||
		(await puppeteer.launch({
			headless: "shell",
			defaultViewport: { width: 1920, height: 1080 },
		}));

	if (!stash.brower) stash.brower = browser;
	let index = 0;
	const page = stash.page || (await browser.newPage());
	if (!stash.page) stash.page = page;

	while (index < urls.length) {
		let url = urls[index];
		console.log("开始：#", index, " ", url);
		try {
			const now = new Date();
			if (headers) await page.setExtraHTTPHeaders(headers);
			await page.goto(url, { waitUntil: "networkidle2" });
			const content = await page.screenshot({
				type: "jpeg",
				quality: 100,
				fullPage: true,
			});
			writeFile(index, url, content);
			const msg = `✅ 完成： ${now.toLocaleString()}`;
			console.log(msg);
		} catch (error) {
			console.log(error);
			const now = new Date();
			const msg = `❌ 失败 ${now.toLocaleString()}`;
			console.log(msg);
			browser.close();
			process.exit(1);
		}
		await wait(1500);
		index++;
	}

	browser.close();
}
