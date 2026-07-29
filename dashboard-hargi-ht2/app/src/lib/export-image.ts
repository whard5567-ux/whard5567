import { toJpeg } from "html-to-image";

export async function exportDashboardAsJpg(elementId: string, filename: string) {
  // Support multiple pages by checking elementId-1, elementId-2, etc.
  const parts: HTMLElement[] = [];
  let i = 1;
  while (document.getElementById(`${elementId}-${i}`)) {
    parts.push(document.getElementById(`${elementId}-${i}`)!);
    i++;
  }

  // Fallback to single element if no multipage found
  if (parts.length === 0) {
    const el = document.getElementById(elementId);
    if (el) parts.push(el);
  }

  if (parts.length === 0) {
    console.error(`Element(s) for ${elementId} not found.`);
    return;
  }

  let bgPhoto = getComputedStyle(document.documentElement).getPropertyValue('--bg-photo').trim();
  let bgUrl = '';
  
  if (bgPhoto.startsWith('url(')) {
    bgUrl = bgPhoto.slice(4, -1).replace(/["']/g, '');
  }

  let backgroundImage = 'var(--bg-veil)';
  
  let base64Bg = '';
  if (bgUrl) {
    try {
      const res = await fetch(bgUrl);
      if (!res.ok) throw new Error("Network response was not ok");
      const blob = await res.blob();
      base64Bg = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      backgroundImage = `var(--bg-veil), url("${base64Bg}")`;
    } catch (err) {
      console.warn("Failed to convert background image to base64", err);
      backgroundImage = `var(--bg-veil), url("${window.location.origin}${bgUrl.startsWith('/') ? '' : '/'}${bgUrl}")`;
    }
  }

  let bgImgForCanvas: HTMLImageElement | null = null;
  if (base64Bg) {
    bgImgForCanvas = new Image();
    bgImgForCanvas.src = base64Bg;
    await new Promise(r => { bgImgForCanvas!.onload = r; });
  }

  for (let idx = 0; idx < parts.length; idx++) {
    const element = parts[idx];
    
    // Ambil ukuran asli konten yang utuh (scrollWidth/Height)
    const originalW = element.scrollWidth;
    const originalH = element.scrollHeight;

    // Tangkap elemen persis seukuran kontennya (auto fit & proporsional) 
    // dan tempelkan background secara langsung agar tidak transparan/putih.
    const dataUrl = await toJpeg(element, { 
      quality: 0.95, 
      pixelRatio: 2,
      width: originalW,
      height: originalH,
      style: {
        backgroundColor: '#0f172a',
        backgroundImage: backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        margin: '0',
      }
    });

    const link = document.createElement("a");
    const outFilename = parts.length > 1 
      ? filename.replace(/(\.[\w\d_-]+)$/i, `_Page_${idx + 1}$1`) 
      : filename;
      
    link.download = outFilename;
    link.href = dataUrl;
    link.click();

    if (parts.length > 1 && idx < parts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  }
}
