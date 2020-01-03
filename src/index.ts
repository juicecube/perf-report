export type PerfResult = {
  fcp: number;
  lcp: number;
  tti: number;
};

let fcp: number;
let lcp: number;
let tti: number;
let finished = false;

function setFinished(): void {
  if (!finished) {
    finished = true;
    (window as any).__PERF_REPORT__ = getResult();
  }
}

function init(): void {
  if (!('PerformanceObserver' in window)) {
    return;
  }

  // Create the Performance Observer instance.
  const fcpObserver = new PerformanceObserver(list => {
    for (const entry of list.getEntriesByName('first-contentful-paint')) {
      // Log the value of FCP to the console.
      fcp = Math.ceil(entry.startTime);
      fcpObserver.disconnect();
    }
  });

  // Start observing paint entry types.
  fcpObserver.observe({
    type: 'paint',
    buffered: true,
  });

  // Create the PerformanceObserver instance.
  const lcpObserver = new PerformanceObserver(entryList => {
    const entries = entryList.getEntries();
    const lastEntry: any = entries[entries.length - 1];

    // Update `lcp` to the latest value, using `renderTime` if it's available,
    // otherwise using `loadTime`. (Note: `renderTime` may not be available if
    // the element is an image and it's loaded cross-origin without the
    // `Timing-Allow-Origin` header.)
    lcp = Math.ceil(lastEntry.renderTime || lastEntry.loadTime);
  });

  // Observe entries of type `largest-contentful-paint`, including buffered
  // entries, i.e. entries that occurred before calling `observe()`.
  lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

  window.addEventListener('load', function() {
    if (tti) {
      setFinished();
    }
  });
  setTimeout(setFinished, 1000 * 60 * 2);
}

try {
  init();
} catch (e) {
  //
}

export function setInteractive(): void {
  if (!tti) {
    tti = Math.ceil(performance.now());
    setTimeout(setFinished, 'PerformanceObserver' in window ? 1000 * 30 : 0);
  }
}

export function isFinished(): boolean {
  return finished;
}

export function getResult(): PerfResult {
  return {
    fcp,
    lcp,
    tti,
  };
}
