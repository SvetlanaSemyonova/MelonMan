type Props = {
  size?: number;
};

/** Пиксель-арт иконка Melon Sandbox (предоставленный ассет). */
export function MelonManMark({ size = 44 }: Props) {
  return (
    <img
      src="/melonman-icon.png"
      width={size}
      height={size}
      alt=""
      decoding="async"
      style={{
        width: size,
        height: size,
        borderRadius: Math.max(8, Math.round(size * 0.2)),
        objectFit: "cover",
        flexShrink: 0,
        imageRendering: "pixelated",
      }}
    />
  );
}
