export default function Tooltip({ text, children, position = "bottom" }) {
  const positionClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2",
  };

  const arrowClasses = {
    top: "absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900",
    bottom: "absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900",
    left: "absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900",
    right: "absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900",
  };

  return (
    <div className="group relative inline-flex">
      {children}
      <div
        className={`pointer-events-none absolute ${positionClasses[position]} left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
      >
        {text}
        <div className={arrowClasses[position]}></div>
      </div>
    </div>
  );
}
