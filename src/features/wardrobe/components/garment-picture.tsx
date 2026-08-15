import type { CSSProperties } from "react";

import type { WardrobeItem } from "../types/wardrobe-item";
import styles from "../wardrobe.module.css";

type GarmentPictureProps = {
  item: WardrobeItem;
  className?: string;
};

export function GarmentPicture({ item, className = "" }: GarmentPictureProps) {
  const pictureStyle = item.image.kind === "sprite"
    ? {
        "--sprite-position": item.image.position,
        "--sprite-size": item.image.size ?? "300%",
      } as CSSProperties
    : { backgroundImage: `url("${item.image.kind === "cloudinary" ? item.image.displayUrl : item.image.dataUrl}")` };

  return (
    <span
      className={`${styles.garmentPicture} ${item.image.kind === "sprite" ? styles.spritePicture : styles.uploadPicture} ${className}`}
      style={pictureStyle}
      role="img"
      aria-label={item.name}
    />
  );
}
