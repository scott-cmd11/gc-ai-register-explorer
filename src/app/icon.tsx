import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#f7f8f5',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 3,
          padding: '5px 4px 7px',
          borderBottom: '3px solid #a64c35',
        }}
      >
        {[17, 22, 13].map((height, index) => (
          <div key={index} style={{ width: 6, height, background: '#a64c35' }} />
        ))}
      </div>
    ),
    { ...size }
  )
}
