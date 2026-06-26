// Floating WhatsApp chat button with a soft pulsing glow.
export function WhatsAppFab() {
  return (
    <a
      href="https://wa.me/12460000000"
      aria-label="Chat on WhatsApp"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[max(26px,env(safe-area-inset-bottom))] right-[max(26px,env(safe-area-inset-right))] z-[900] flex h-[60px] w-[60px] items-center justify-center rounded-full bg-green no-underline transition-colors hover:bg-green-dark"
      style={{ animation: "mcPulse 2.6s ease-in-out infinite" }}
    >
      <span className="font-sans text-[13px] font-bold text-sand">Chat</span>
    </a>
  );
}
