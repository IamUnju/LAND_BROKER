/** Generic modal wrapper */
export default function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between border-b px-4 py-3 sm:px-6 sm:py-4">
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-64px)]">{children}</div>
      </div>
    </div>
  );
}
