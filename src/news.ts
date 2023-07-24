export async function newsWatch() {
  while (true) {
    const news = await fetch("https://news.treeofalpha.com/api/news?limit=10");

    const data = await news.json();

    console.log("article feed");
    data
      .filter((entry: any) => entry.source != "Twitter")
      .map((entry: any) => {
        console.log(entry.title);
      });

    console.log("twitter feed");
    data
      .filter((entry: any) => entry.source == "Twitter")
      .map((entry: any) => {
        console.log(entry.title);
      });

    console.log("end of function");
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}
