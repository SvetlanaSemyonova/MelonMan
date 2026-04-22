type Props = {
  size?: number;
};

/** Пиксель-арт иконка Melon Sandbox (предоставленный ассет). */
export function MelonStaffMark({ size = 44 }: Props) {
  const src = `${import.meta.env.BASE_URL}melonman-icon.png`;
  return (
    <img
      src={src}
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
