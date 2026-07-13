async function testGvizOffset() {
  const PARETO = { id: "1hf_lpXI6x3hBDfEHX8r8q15w6F3wtlzIABGibdpCMhg", gid: "1882488493" };
  const url = `https://docs.google.com/spreadsheets/d/${PARETO.id}/gviz/tq?tqx=out:csv&gid=${PARETO.gid}&tq=select%20*%20limit%202%20offset%2010`;
  const res = await fetch(url);
  const text = await res.text();
  console.log(text);
}
testGvizOffset();
