import { ImageResponse } from 'next/og'

// Open Graph / Twitter share image, generated at build time.
export const alt = 'MacroPlan - Your meal prep, planned'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#0B0F10',
          color: '#F6F8F7',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
          <div
            style={{
              width: 72,
              height: 72,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#FF6B5C',
              color: '#FFFFFF',
              fontSize: 44,
              fontWeight: 700,
              borderRadius: 18,
            }}
          >
            M
          </div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>MacroPlan</div>
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: 900,
          }}
        >
          <span>Your meal prep,&nbsp;</span>
          <span style={{ color: '#FF6B5C' }}>planned.</span>
        </div>
        <div style={{ fontSize: 34, color: '#8B9298', marginTop: 28, maxWidth: 880 }}>
          AI-generated batch cooking plans that hit your exact macros — in seconds.
        </div>
      </div>
    ),
    { ...size }
  )
}
