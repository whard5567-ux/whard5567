import { toJpeg } from "html-to-image";

export async function exportDashboardAsJpg(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  let bgPhoto = getComputedStyle(document.documentElement).getPropertyValue('--bg-photo').trim();
  let bgUrl = '';
  
  if (bgPhoto.startsWith('url(')) {
    bgUrl = bgPhoto.slice(4, -1).replace(/["']/g, '');
  }

  let backgroundImage = 'var(--bg-veil)';
  
  if (bgUrl) {
    try {
      // Convert image to base64 so html-to-image can render it without CORS or loading delay issues
      const res = await fetch(bgUrl);
      if (!res.ok) throw new Error("Network response was not ok");
      const blob = await res.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      backgroundImage = `var(--bg-veil), url("${base64}")`;
    } catch (err) {
      console.warn("Failed to convert background image to base64, falling back to absolute URL", err);
      backgroundImage = `var(--bg-veil), url("${window.location.origin}${bgUrl.startsWith('/') ? '' : '/'}${bgUrl}")`;
    }
  }

  const dataUrl = await toJpeg(element, { 
    quality: 0.92,
    pixelRatio: 2, // High quality
    style: {
      backgroundColor: 'var(--bg)',
      backgroundImage: backgroundImage,
      backgroundSize: 'cover, cover',
      backgroundPosition: 'center, center',
      backgroundRepeat: 'no-repeat, no-repeat',
      padding: '24px',
      borderRadius: '12px'
    }
  });

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
