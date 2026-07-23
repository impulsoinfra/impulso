// Shared brand panel for the login / register split cards.
export function AuthBrandPanel({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="hidden md:flex w-[210px] shrink-0 bg-tinta p-6 flex-col relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-[120px] h-[120px] rounded-full" style={{ background: 'rgba(255,157,61,0.15)' }} />
      <div className="absolute -bottom-8 -left-8 w-[90px] h-[90px] rounded-full" style={{ background: 'rgba(240,53,92,0.18)' }} />

      <p className="disp text-crema text-[19px] leading-tight mb-2.5 relative z-10">{title}</p>
      <p className="text-[rgba(251,247,242,0.6)] text-[11.5px] leading-relaxed mb-5 relative z-10">{subtitle}</p>

      <p className="text-[rgba(251,247,242,0.4)] text-[9.5px] mt-auto relative z-10">
        El impulso que necesitás.
      </p>
    </div>
  )
}
