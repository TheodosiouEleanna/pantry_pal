export function SparkIcon(props: React.SVGProps<SVGSVGElement>) {
return (
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
<path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 12v4m8-8h-4M8 12H4m9.5-6.5L11 9l-2.5-3.5M6.5 14.5 11 15l-1 4.5m7-10L13 9l1-4.5m1.5 13L13 15l2.5 3.5"/>
</svg>
);
}


export function LeafIcon(props: React.SVGProps<SVGSVGElement>) {
return (
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
<path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M5 19c5-5 10-7 14-7-1 4-3 9-8 9S6 19 5 19Zm0 0c0-6 3-11 9-11 0 0 0 5-4 9"/>
</svg>
);
}


export function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
return (
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
<path strokeWidth="2" strokeLinecap="round" d="M12 5v14M5 12h14" />
</svg>
);
}

export function ChefIcon({
  className = "h-6 w-6 text-emerald-600",
  ...props
}) {
  return (
     <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={["h-6 w-6 stroke-emerald-600", className].join(" ")}
      {...props}
    >
      <path d="M5 10.5H19" />
      <path d="M6.25 10.5C4.45 10.5 3 9.05 3 7.25C3 5.62 4.25 4.25 5.9 4.03C6.29 2.86 7.45 2 8.8 2C10.02 2 11.08 2.65 11.59 3.63C12.09 2.65 13.15 2 14.38 2C15.73 2 16.89 2.86 17.28 4.03C18.93 4.25 20.18 5.62 20.18 7.25C20.18 9.05 18.73 10.5 16.93 10.5" />
      <path d="M7 10.5H17V16.25C17 17.22 16.22 18 15.25 18H8.75C7.78 18 7 17.22 7 16.25V10.5Z" />
    </svg>
  );
}

export function XIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
        <path strokeWidth="2" strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
    }