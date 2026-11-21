import React, { useEffect, useRef, useState } from "react";

export default function GlobalMailGlobe() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let visible = true;
    let pageVisible = !document.hidden;
    let reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const updatePlayback = () => {
      if (reducedMotion || !visible || !pageVisible || videoFailed) {
        video.pause();
        return;
      }

      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          // Autoplay can be blocked by browser/device settings.
          // Keep the native controls hidden and show a poster/fallback instead.
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

    document.addEventListener("visibilitychange", onVisibilityChange);
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
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
  }, [videoFailed]);

  return (
    <div
      className="hero-art global-mail-art"
      aria-label="Animated Earth showing the Find Mali global mail network"
    >
      <div className="gm-back-glow" aria-hidden="true" />
      <div className="gm-orbit-glow gm-orbit-glow-one" aria-hidden="true" />
      <div className="gm-orbit-glow gm-orbit-glow-two" aria-hidden="true" />

      <div className="gm-video-wrap">
        {!videoFailed ? (
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
            aria-label="Slowly rotating animated blue Earth"
            onError={() => setVideoFailed(true)}
          >
            <source
              src="/videos/Animated_3D_Earth_video_creation_948c8d9b.mp4"
              type="video/mp4"
            />
          </video>
        ) : (
          <div className="gm-video-fallback" role="status">
            <span className="gm-fallback-globe" aria-hidden="true">◎</span>
            <span>GLOBAL MAIL NETWORK</span>
          </div>
        )}
      </div>

      <div className="float-chip globe-chip globe-chip-a">
        <span className="globe-shield" aria-hidden="true">✓</span>
        PRIVATE BY DESIGN
      </div>
      <div className="float-chip globe-chip globe-chip-b">
        <span className="activity-wave" aria-hidden="true">⌁</span>
        GLOBAL MAIL NETWORK
      </div>

      <div className="globe-caption">
        <span className="globe-caption-dot" aria-hidden="true" />
        CONNECTING THE WORLD, ONE INBOX AT A TIME
      </div>
      <div className="spark s1" aria-hidden="true">✦</div>
      <div className="spark s2" aria-hidden="true">✧</div>
    </div>
  );
}
