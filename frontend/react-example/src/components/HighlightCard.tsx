import { cn } from "@/lib/utils";

type HighlightCardVariant = "orange" | "blue";

const variantStyles: Record<
  HighlightCardVariant,
  { bg: string; text: string; shadow: string }
> = {
  orange: {
    bg: "bg-orange-500",
    text: "text-white",
    shadow:
      "shadow-[0px_2px_2px_rgba(0,0,0,0.25),inset_0px_2px_2px_rgba(255,255,255,0.25),inset_0px_-2px_2px_rgba(0,0,0,0.15)]",
  },
  blue: {
    bg: "bg-blue-500",
    text: "text-white",
    shadow:
      "shadow-[0px_2px_2px_rgba(0,0,0,0.25),inset_0px_2px_2px_rgba(255,255,255,0.25),inset_0px_-2px_2px_rgba(0,0,0,0.15)]",
  },
};

export function HighlightCard({
  title,
  value,
  isError,
  variant = "orange",
}: {
  title: string;
  value: React.ReactNode;
  isError?: boolean;
  variant?: HighlightCardVariant;
}) {
  const styles = variantStyles[variant];

  let content: React.ReactNode;
  if (typeof value === "string") {
    content = (
      <p
        className={cn("text-xl font-normal", styles.text, {
          "text-red-300": isError,
        })}
      >
        {value}
      </p>
    );
  } else {
    content = value;
  }
  return (
    <div
      className={cn(
        "flex flex-col gap-5 rounded-2xl p-5",
        styles.bg,
        styles.shadow
      )}
    >
      <p className={cn("text-sm font-bold", styles.text)}>{title}</p>
      {content}
    </div>
  );
}
