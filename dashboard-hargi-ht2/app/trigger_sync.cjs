async function sync() {
  console.log("Init...");
  const initRes = await fetch("http://localhost:3000/api/sync/init", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targets: ["abo"] })
  });
  const init = await initRes.json();
  console.log("Init OK:", init);
  const logId = init.logId;

  console.log("Chunk...");
  const chunkRes = await fetch("http://localhost:3000/api/sync/chunk", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sheet: "abo", offset: 0, limit: 1000 })
  });
  const chunk = await chunkRes.json();
  console.log("Chunk OK:", chunk);

  console.log("Finish...");
  const finishRes = await fetch("http://localhost:3000/api/sync/finish", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ logId, targets: ["abo"] })
  });
  const finish = await finishRes.json();
  console.log("Finish OK:", finish);
}
sync().catch(console.error);
