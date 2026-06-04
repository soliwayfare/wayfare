// Rotating full-screen background, ported from the old `solitude` homepage.
// Fetches a random image from picsum.photos every ~10s and cross-fades it, with
// a thin progress bar. Returns controls including `destroy()` so the Astro
// ClientRouter can tear everything down when navigating away from the homepage
// (otherwise the timers and the visibilitychange listener would leak).

const imageToCanvas = (image: HTMLImageElement) => {
  const canvas =
    typeof window.OffscreenCanvas === 'function'
      ? new OffscreenCanvas(image.width, image.height)
      : document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx!.drawImage(image, 0, 0, image.width, image.height);
  return canvas;
};

const isOffscreenCanvas = (o: any): o is OffscreenCanvas =>
  typeof window.OffscreenCanvas === 'function' &&
  o instanceof window.OffscreenCanvas;

const canvasToBlob = async (canvas: HTMLCanvasElement | OffscreenCanvas) => {
  const blob = isOffscreenCanvas(canvas)
    ? await canvas.convertToBlob()
    : await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve);
      });
  return blob;
};

const preFetchQueue: string[] = [];

const fetchRandomImage = async () => {
  const url =
    window.innerHeight < window.innerWidth
      ? `https://picsum.photos/1080/600/?random&t=${Date.now()}`
      : `https://picsum.photos/600/1080/?random&t=${Date.now()}`;

  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.src = url;

  await new Promise<void>((resolve, reject) => {
    image.addEventListener('load', () => {
      resolve();
    });
    image.addEventListener('error', (e) => {
      reject(e.error);
    });
  });
  const canvas = imageToCanvas(image);
  const blob = await canvasToBlob(canvas);
  return URL.createObjectURL(blob!);
};

const preFetchImage = () =>
  fetchRandomImage().then((url) => preFetchQueue.push(url));

const getNextImage = () =>
  preFetchQueue.length ? preFetchQueue.shift() : fetchRandomImage();

const injectBackground = () => {
  // Reuse the persisted .bg declared by <SiteBackground /> if present, so the
  // current image survives navigation; otherwise create one (defensive).
  const existing = document.querySelector<HTMLDivElement>('.bg');
  if (existing) return existing;
  const bg = document.createElement('div');
  bg.className = 'bg';
  document.body.appendChild(bg);
  return bg;
};

const FADE_DURATION = 1000;

let currentImageUrl: string | null = null;

const changeBackground = async (bg: HTMLDivElement) => {
  const url = await getNextImage();
  currentImageUrl = url;
  const item = document.createElement('div');
  item.style.backgroundImage = 'url(' + url + ')';
  item.className = 'cur';
  bg.appendChild(item);

  // Wait for fade-in to complete before removing old backgrounds
  setTimeout(() => {
    while (bg.children.length > 1) {
      bg.removeChild(bg.children[0]);
    }
  }, FADE_DURATION);
};

const loopIntervalMS = 10e3;

export interface BgControls {
  pause: () => void;
  resume: () => void;
  saveCurrentImage: () => void;
  destroy: () => void;
}

export const dynamicBackground = (): BgControls | undefined => {
  const bg = injectBackground();

  // Drive the FAB's circular progress ring (rendered by <SiteBackground />).
  const ring = document.querySelector<SVGCircleElement>('.bg-fab-progress');
  const ringC = ring ? 2 * Math.PI * ring.r.baseVal.value : 0;
  if (ring) ring.style.strokeDasharray = String(ringC);
  const setProgress = (p: number) => {
    if (ring) ring.style.strokeDashoffset = String(ringC * (1 - Math.min(1, Math.max(0, p))));
  };

  if (~location.hash.indexOf('pure')) {
    // Pure mode: no rotation, but still expose a destroy() so the caller can
    // clean up the injected nodes on navigation.
    return {
      pause() {},
      resume() {},
      saveCurrentImage() {},
      destroy() {
        bg.remove();
      },
    };
  }

  let paused = false;
  let timeout = 0; // image-change timer
  let raf = 0; // ring animation frame
  let cycleStart = 0; // performance.now() when the current cycle began
  let pausedElapsed = 0; // ms elapsed into the cycle when paused

  // The ring fills from real elapsed time, so it reaches 100% exactly when the
  // image-change timeout fires — they share one clock and never drift apart.
  const tickRing = () => {
    raf = 0;
    const elapsed = performance.now() - cycleStart;
    setProgress(elapsed / loopIntervalMS);
    if (!paused && elapsed < loopIntervalMS) raf = requestAnimationFrame(tickRing);
  };
  const startRing = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tickRing);
  };

  const scheduleNext = (delayMS: number) => {
    if (timeout) clearTimeout(timeout);
    timeout = window.setTimeout(loop, delayMS);
  };

  async function loop() {
    timeout = 0;
    await changeBackground(bg);
    preFetchImage();
    cycleStart = performance.now();
    setProgress(0);
    startRing();
    if (paused) return;
    scheduleNext(loopIntervalMS);
  }

  const stopTimers = () => {
    if (timeout) clearTimeout(timeout);
    timeout = 0;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  const handleHidden = () => {
    if (paused) return;
    document.hidden ? stopTimers() : loop();
  };
  document.addEventListener('visibilitychange', handleHidden);

  loop();

  return {
    pause() {
      paused = true;
      pausedElapsed = performance.now() - cycleStart;
      stopTimers();
    },
    resume() {
      paused = false;
      cycleStart = performance.now() - pausedElapsed;
      startRing();
      scheduleNext(Math.max(0, loopIntervalMS - pausedElapsed));
    },
    saveCurrentImage() {
      if (!currentImageUrl) return;
      const a = document.createElement('a');
      a.href = currentImageUrl;
      a.download = 'background.jpg';
      a.click();
    },
    destroy() {
      stopTimers();
      document.removeEventListener('visibilitychange', handleHidden);
      bg.remove();
    },
  };
};
