import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1a2e',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ color: '#e94560', fontSize: 72, lineHeight: 1 }}>▶</div>
        <div style={{ color: '#53d8fb', fontSize: 24, letterSpacing: 6, marginTop: 4 }}>RETRO</div>
      </div>
    ),
    { ...size },
  )
}
