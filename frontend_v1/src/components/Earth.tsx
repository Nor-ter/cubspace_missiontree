// 화면 오른쪽 아래 모서리에 걸친 지구 (장식용). 스크롤·확대와 상관없이 항상 같은 자리에 있다.
// viewBox 0~100 안에서 원의 왼쪽 위 일부만 보이도록 중심을 모서리 바깥에 둔다.
function Earth() {
  return (
    <svg className="earth" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        {/* 빛을 받는 가장자리(왼쪽 위)가 밝고 안쪽으로 갈수록 어두워진다 */}
        <radialGradient id="earth-fill" cx="0.22" cy="0.22" r="0.7">
          <stop offset="0%" stopColor="#3d6390" />
          <stop offset="45%" stopColor="#1c3049" />
          <stop offset="100%" stopColor="#10151c" />
        </radialGradient>
      </defs>
      <circle cx={112} cy={118} r={96} fill="url(#earth-fill)" />
      <circle cx={112} cy={118} r={96.6} className="earth-atmosphere" />
    </svg>
  )
}

export default Earth
