import React, { useEffect, useRef } from "react";

export default function GlobalMailGlobe() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let visible = true;
    let pageVisible = !document.hidden;
    let reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const updatePlayback = () => {
      if (reducedMotion || !visible || !pageVisible) {
        video.pause();
        return;
      }

      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          // Autoplay may be restricted by the browser or device.
        });
      }
    };

    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              visible = Boolean(entries[0]?.isIntersecting);
              updatePlayback();
            },
            { threshold: 0.15 }
          )
        : null;

    observer?.observe(video);

    const onVisibilityChange = () => {
      pageVisible = !document.hidden;
      updatePlayback();
    };

    const onMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      updatePlayback();
    };

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    document.addEventListener("visibilitychange", onVisibilityChange);
    motionQuery.addEventListener?.("change", onMotionChange);
    video.addEventListener("canplay", updatePlayback);
    updatePlayback();

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionQuery.removeEventListener?.("change", onMotionChange);
      video.removeEventListener("canplay", updatePlayback);
      video.pause();
    };
  }, []);

  return (
    <div
      className="hero-art global-mail-art"
      aria-label="Animated Find Mali global mail video"
    >
      <div className="gm-video-wrap">
        <video
          ref={videoRef}
          className="gm-globe-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          controls={false}
          aria-label="Animated Earth video"
        >
          <source
            src="/videos/Animated_3D_Earth_video_creation_948c8d9b.mp4"
            type="video/mp4"
          />
        </video>
      </div>
    </div>
  );
}
