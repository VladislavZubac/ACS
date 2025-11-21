type ErrorToast = {
  id: string;
  text: string;
};

type Props = {
  messages: ErrorToast[];
  onDismiss: (id: string) => void;
};

export function ErrorToastContainer({ messages, onDismiss }: Props) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-3 px-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className="pointer-events-auto w-full max-w-md rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive shadow-lg backdrop-blur"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="font-medium">{message.text}</p>
            <button
              type="button"
              className="text-xs uppercase tracking-wide text-destructive/80 transition hover:text-destructive"
              onClick={() => onDismiss(message.id)}
            >
              Закрыть
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}


