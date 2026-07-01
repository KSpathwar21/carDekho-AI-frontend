function TypingIndicator() {
  return (
    <div className="flex w-fit items-center gap-1.5 rounded-2xl bg-[#eff6ff] px-4 py-3">
      <span className="h-2 w-2 animate-bounce rounded-full bg-[#2563eb] [animation-delay:-0.3s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-[#2563eb] [animation-delay:-0.15s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-[#2563eb]" />
    </div>
  )
}

export default TypingIndicator
