import * as THREE from "three";
import { SplatMesh } from "@sparkjsdev/spark";

// Encapsulates the three.js + SparkJS WebGL scene that renders the Lotus Splat.
// The rest of the Hero talks to it only through this small surface: it awaits
// `ready`, feeds a per-frame azimuth (ticket 04's Sway), and disposes on teardown.
// Keeping all WebGL here means the Sway and capability logic stay pure/testable.

export interface SplatScene {
  /** Resolves once the splat is loaded and the first frame has rendered. */
  ready: Promise<void>;
  /** Rotate the lotus about its vertical axis (radians). Driven by Sway. */
  setAzimuth(radians: number): void;
  /** Tear down GL resources and listeners. */
  dispose(): void;
}

// The splat's "up" needs a 180° flip about X to sit upright in three.js —
// SparkJS splats come in Y-down relative to three.js' Y-up. Tuned against the
// real asset (see ticket 03/04 notes).
const UP_FLIP_X = Math.PI;

// Resting orientation: the splat starts turned 270° (90° right + 180°). Sway's
// azimuth is applied on top of this base.
const BASE_AZIMUTH = (3 * Math.PI) / 2;

// Fixed vertical tilt: tip the pool 20° toward the front (about the X axis).
const BASE_ELEVATION = (20 * Math.PI) / 180;

export function mountSplatScene(
  canvas: HTMLCanvasElement,
  splatUrl: string,
): SplatScene {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);

  // `pivot` is what Sway rotates; the splat is recentered inside it so rotation
  // is about the lotus' own centre rather than an arbitrary origin.
  const pivot = new THREE.Group();
  pivot.rotation.x = BASE_ELEVATION;
  scene.add(pivot);

  const splat = new SplatMesh({ url: splatUrl });
  splat.rotation.x = UP_FLIP_X;
  pivot.add(splat);

  let disposed = false;

  function resize(): void {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // Frame the camera so the lotus fills a comfortable portion of the viewport.
  function frameCamera(): void {
    const box = splat.getBoundingBox(true);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Recenter the splat within the pivot.
    splat.position.sub(center);

    const maxExtent = Math.max(size.x, size.y);
    const fov = (camera.fov * Math.PI) / 180;
    // Distance to fit `maxExtent` in view, with a little breathing room.
    const distance = (maxExtent / 2 / Math.tan(fov / 2)) * 1.35;
    camera.position.set(0, 0, distance);
    camera.lookAt(0, 0, 0);
  }

  window.addEventListener("resize", resize);
  resize();

  const ready = splat.initialized.then(() => {
    if (disposed) return;
    frameCamera();
    renderer.render(scene, camera);
  });

  renderer.setAnimationLoop(() => {
    if (disposed) return;
    renderer.render(scene, camera);
  });

  return {
    ready,
    setAzimuth(radians: number): void {
      pivot.rotation.y = BASE_AZIMUTH + radians;
    },
    dispose(): void {
      disposed = true;
      renderer.setAnimationLoop(null);
      window.removeEventListener("resize", resize);
      splat.dispose();
      renderer.dispose();
    },
  };
}
