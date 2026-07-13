async function testGvizCount() {
  const CE_ABO = { id: "1-eC0GdeMwYDhnGzCSM8viO0HvD6X0NdlMaWOxe2P9ZM", gid: "299154811" };
  const url = `https://docs.google.com/spreadsheets/d/${CE_ABO.id}/gviz/tq?tqx=out:csv&gid=${CE_ABO.gid}&tq=select%20count(A)`;
  const res = await fetch(url);
  const text = await res.text();
  console.log(text);
}
testGvizCount();
