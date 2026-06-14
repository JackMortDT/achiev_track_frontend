interface PixelCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'red' | 'cyan'
}

export function PixelCard({ children, className = '', variant = 'default' }: PixelCardProps) {
  const borders = {
    default: 'border-pixel-border shadow-pixel',
    red: 'border-pixel-red shadow-pixel-red',
    cyan: 'border-pixel-cyan shadow-pixel-cyan',
  }

  return (
    <div className={`bg-pixel-surface border-2 p-4 ${borders[variant]} ${className}`}>
      {children}
    </div>
  )
}
