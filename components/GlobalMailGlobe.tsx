import React from "react";

export default function GlobalMailGlobe() {
  return (
    <div
      className="hero-art global-mail-art"
      aria-label="Animated holographic globe for the global mail network"
    >
      <div className="globe-halo" />
      <div className="globe-orbit globe-orbit-one" />
      <div className="globe-orbit globe-orbit-two" />

      <div className="globe-stage">
        <div className="globe-sphere">
          <div className="globe-ocean" />

          <div className="globe-texture">
            <svg
              className="globe-land"
              viewBox="0 0 520 520"
              aria-hidden="true"
            >
              <path d="M66 151l18-35 38-22 33 8 14 22 31 7 17 20-8 18-25 4-10 22-26 6-10 24-22 5-17-17-24-3-12-22-20-5zM169 253l29 2 24 17 16 29-5 31-17 24-7 36-19 34-15-18-8-38-19-28-10-42 9-29zM248 116l21-24 38-8 20 15 27-2 28 17 8 22-19 16-22-7-18 15-23-4-15 18-28-6-13-22-22-4zM286 211l27-18 38 3 18 20 29 7 17 26-8 29-22 10-5 32-22 29-25-11-13-30-25-15-15-31-20-10zM371 347l23-11 29 9 15 24-13 23-30 4-24-18zM432 144l21-10 17 16-8 23-23 4-14-15zM110 78l18-10 16 9-5 18-19 4-15-9z" />
            </svg>

            <span className="globe-grid globe-lat globe-lat-one" />
            <span className="globe-grid globe-lat globe-lat-two" />
            <span className="globe-grid globe-lon globe-lon-one" />
            <span className="globe-grid globe-lon globe-lon-two" />

            <i className="network-pulse pulse-a" />
            <i className="network-pulse pulse-b" />
            <i className="network-pulse pulse-c" />
            <i className="network-pulse pulse-d" />
            <i className="network-pulse pulse-e" />
            <i className="network-pulse pulse-f" />
          </div>

          <div className="globe-glass" />
        </div>

        <div className="globe-mail-core" aria-hidden="true">
          <span className="mail-core-ring" />

          <svg viewBox="0 0 64 64">
            <rect x="8" y="15" width="48" height="34" rx="7" />
            <path d="M10 20l22 17 22-17" />
          </svg>
        </div>
      </div>

      <div className="float-chip globe-chip globe-chip-a">
        <span className="globe-shield">✓</span>
        PRIVATE BY DESIGN
      </div>

      <div className="float-chip globe-chip globe-chip-b">
        <span className="activity-wave">⌁</span>
        GLOBAL MAIL NETWORK
      </div>

      <div className="globe-caption">
        <span className="globe-caption-dot" />
        CONNECTING THE WORLD, ONE INBOX AT A TIME
      </div>

      <div className="spark s1" aria-hidden="true">✦</div>
      <div className="spark s2" aria-hidden="true">✧</div>
    </div>
  );
}
