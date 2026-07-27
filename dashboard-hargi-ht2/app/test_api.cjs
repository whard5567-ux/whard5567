async function testAPI() {
  console.log("Triggering init...");
  let res = await fetch("http://localhost:3000/api/sync/init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targets: ["ce", "pareto", "abo", "bushing"] })
  });
  let data = await res.json();
  console.log("init res:", data);

  const targets = ["ce", "pareto", "abo", "bushing"];
  for (const sheet of targets) {
    let hasMore = true;
    let offset = 0;
    while (hasMore) {
      console.log(`Triggering chunk ${sheet} offset ${offset}...`);
      let chunkRes = await fetch("http://localhost:3000/api/sync/chunk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheet, offset, limit: 1000 })
      });
      let chunkData = await chunkRes.json();
      console.log(`chunk ${sheet} res:`, chunkData);
      hasMore = chunkData.hasMore;
      offset = chunkData.nextOffset;
    }
  }
}
testAPI();
