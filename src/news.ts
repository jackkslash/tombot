export async function newsWatch() {
  const news = await fetch("https://news.treeofalpha.com/api/news?limit=5");

  const data = await news.json();

  console.log(data);
}
