async function sync() {
  console.log("Chunk...");
  const chunkRes = await fetch("http://localhost:3000/api/sync/chunk", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sheet: "ahi_mtu", offset: 0, limit: 5000 })
  });
  const chunk = await chunkRes.json();
  console.log("Chunk OK:", chunk);
}
sync().catch(console.error);
