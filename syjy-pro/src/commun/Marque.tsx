// SYJY · le nom, dans son cadre rouge, comme sur le sac.

export default function Marque({ className = '' }: { className?: string }) {
  return (
    <span className={`marque ${className}`}>
      <span className="marque-nom">SYJY</span>
      <span className="marque-signe">by Jaurès Sotohou</span>
    </span>
  )
}
