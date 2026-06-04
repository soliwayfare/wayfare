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

const createBgIndicator = () => {
  // Reuse the persisted container if present; append the indicator children.
  let container = document.querySelector<HTMLDivElement>(
    '.progress-indicator-container',
  );
  if (!container) {
    container = document.createElement('div');
    container.className = 'progress-indicator-container';
    document.body.appendChild(container);
  }
  const indicator1 = document.createElement('div');
  indicator1.className = 'progress-indicator anim-1';
  container.appendChild(indicator1);
  const indicator2 = document.createElement('div');
  indicator2.className = 'progress-indicator anim-2';
  container.appendChild(indicator2);
  const indicator = document.createElement('div');
  indicator.className = 'progress-indicator';
  container.appendChild(indicator);
  let removed = false;
  return {
    container,
    indicator,
    removeIndeterminate() {
      if (removed) return;
      removed = true;
      container.removeChild(indicator1);
      container.removeChild(indicator2);
    },
  };
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
  const { container, indicator, removeIndeterminate } = createBgIndicator();
  const bg = injectBackground();

  if (~location.hash.indexOf('pure')) {
    // Pure mode: no rotation, but still expose a destroy() so the caller can
    // clean up the injected nodes on navigation.
    return {
      pause() {},
      resume() {},
      saveCurrentImage() {},
      destroy() {
        bg.remove();
        container.remove();
      },
    };
  }

  let progress = 0;
  let progressUpdateInterval: number;
  let paused = false;
  let timeout: number;

  const updateBgIndicator = () => {
    indicator.style.width = ((progress * 100) << 0) + '%';
  };

  const startProgressInterval = () => {
    if (progressUpdateInterval) clearInterval(progressUpdateInterval);

    progressUpdateInterval = setInterval(() => {
      if (progress < 1) {
        progress += 0.01;
      }
      updateBgIndicator();
    }, loopIntervalMS / 100);
  };

  const scheduleNext = (delayMS: number) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(loop, delayMS);
  };

  const loop = async () => {
    timeout = 0;

    await changeBackground(bg);
    removeIndeterminate();
    preFetchImage();
    progress = 0;
    startProgressInterval();

    if (timeout || paused) return;

    scheduleNext(loopIntervalMS);
  };

  const stopTimers = () => {
    if (timeout) clearTimeout(timeout);
    timeout = 0;
    if (progressUpdateInterval) clearInterval(progressUpdateInterval);
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
      stopTimers();
    },
    resume() {
      paused = false;
      const remainingMS = (1 - progress) * loopIntervalMS;
      startProgressInterval();
      scheduleNext(remainingMS);
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
      container.remove();
    },
  };
};
