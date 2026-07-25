async function testSync() {
  console.log("Starting INIT...");
  const initRes = await fetch("http://localhost:3000/api/sync/init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targets: ["mtu"] })
  });
  const initData = await initRes.json();
  console.log("Init:", initData);

  if (!initData.ok) {
    console.error("Failed init:", initData.error);
    return;
  }

  const logId = initData.logId;

  console.log("Starting CHUNK...");
  const chunkRes = await fetch("http://localhost:3000/api/sync/chunk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sheet: "mtu", offset: 0, limit: 1000 })
  });
  const chunkData = await chunkRes.json();
  console.log("Chunk:", chunkData);

  console.log("Starting FINISH...");
  const finishRes = await fetch("http://localhost:3000/api/sync/finish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ logId, targets: ["mtu"] })
  });
  const finishData = await finishRes.json();
  console.log("Finish:", finishData);
}

testSync().catch(console.error);
