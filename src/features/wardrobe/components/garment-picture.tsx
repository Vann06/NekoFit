"use client";

import { useEffect, useState, type CSSProperties } from "react";

import type { WardrobeItem } from "../types/wardrobe-item";
import styles from "../wardrobe.module.css";

type GarmentPictureProps = {
  item: WardrobeItem;
  className?: string;
};

type UploadedPictureProps = {
  name: string;
  primarySource: string;
  fallbackSource?: string;
  className: string;
};

type LoadStage = "cutout" | "original" | "retry" | "failed";

function UploadedPicture({
  name,
  primarySource,
  fallbackSource,
  className,
}: UploadedPictureProps) {
  const [stage, setStage] = useState<LoadStage>("cutout");
  const [imageKey, setImageKey] = useState(0);
  const isLoaded = stage === "retry" ? false : undefined;
  const [loaded, setLoaded] = useState(false);

  const source = stage === "original" && fallbackSource
    ? fallbackSource
    : primarySource;

  useEffect(() => {
    if (loaded || stage !== "cutout" || !fallbackSource) return;

    const fallbackTimer = window.setTimeout(() => {
      setLoaded(false);
      setStage("original");
    }, 10_000);

    return () => window.clearTimeout(fallbackTimer);
  }, [fallbackSource, loaded, stage]);

  function recoverFromError() {
    setLoaded(false);

    if (stage === "cutout" && fallbackSource) {
      setStage("original");
      return;
    }

    if (stage !== "retry") {
      window.setTimeout(() => {
        setImageKey((current) => current + 1);
        setStage("retry");
      }, 900);
      return;
    }

    setStage("failed");
  }

  return (
    <span
      className={`${styles.garmentPicture} ${styles.uploadPicture} ${className}`}
      role="img"
      aria-label={name}
      aria-busy={!loaded && stage !== "failed"}
    >
      {stage !== "failed" && (
        <img
          key={`${source}:${imageKey}`}
          className={`${styles.garmentImage} ${loaded ? styles.garmentImageVisible : ""}`}
          src={source}
          alt=""
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={recoverFromError}
        />
      )}

      {!loaded && stage !== "failed" && (
        <span className={styles.pictureLoader} aria-hidden="true">
          <span className={styles.loaderRing} />
        </span>
      )}

      {stage === "failed" && (
        <span className={styles.pictureUnavailable} aria-hidden="true">
          <span>♧</span>
          No se pudo cargar
        </span>
      )}
    </span>
  );
}

export function GarmentPicture({ item, className = "" }: GarmentPictureProps) {
  if (item.image.kind === "sprite") {
    const pictureStyle = {
      "--sprite-position": item.image.position,
      "--sprite-size": item.image.size ?? "300%",
    } as CSSProperties;

    return (
      <span
        className={`${styles.garmentPicture} ${styles.spritePicture} ${className}`}
        style={pictureStyle}
        role="img"
        aria-label={item.name}
      />
    );
  }

  const primarySource = item.image.kind === "cloudinary"
    ? item.image.displayUrl
    : item.image.dataUrl;
  const fallbackSource = item.image.kind === "cloudinary"
    ? item.image.originalUrl
    : undefined;

  return (
    <UploadedPicture
      key={`${item.id}:${primarySource}`}
      name={item.name}
      primarySource={primarySource}
      fallbackSource={fallbackSource}
      className={className}
    />
  );
}
