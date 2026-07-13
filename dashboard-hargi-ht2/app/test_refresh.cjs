async function run() {
  const url = "https://mjgekmjnsipthcswazid.supabase.co/functions/v1/hargi-refresh";
  const key = "sb_publishable_HblqEUMMs2lb9OiEf7jhYw_-wmASMbp";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` }
    });
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
  } catch(e) {
    console.error(e);
  }
}
run();
