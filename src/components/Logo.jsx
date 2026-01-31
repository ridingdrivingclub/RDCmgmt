export default function Logo({ size = 'default', className = '' }) {
  const sizes = {
    small: {
      main: 'text-sm',
      amp: 'text-lg',
      club: 'text-[8px]'
    },
    default: {
      main: 'text-lg',
      amp: 'text-2xl',
      club: 'text-[11px]'
    },
    large: {
      main: 'text-2xl',
      amp: 'text-3xl',
      club: 'text-sm'
    }
  }

  const s = sizes[size] || sizes.default

  return (
    <div className={`text-center font-display font-normal tracking-wide leading-tight ${className}`}>
      <div className={`${s.main} text-rdc-primary`}>RIDING</div>
      <div className={`${s.amp} text-rdc-primary -my-0.5`}>&amp;</div>
      <div className={`${s.main} text-rdc-primary`}>DRIVING</div>
      <div className={`${s.club} tracking-[0.3em] text-rdc-primary mt-1`}>CLUB</div>
    </div>
  )
}
