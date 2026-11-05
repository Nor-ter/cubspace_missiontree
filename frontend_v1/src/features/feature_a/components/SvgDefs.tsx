// 여러 컴포넌트가 같이 쓰는 SVG 무늬(금박, 태양전지 셀)
function SvgDefs() {
  return (
    <defs>
      {/* Phase 도착 강조의 빛줄기 */}
      <linearGradient id="arrive-sweep">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
        <stop offset="55%" stopColor="#ffffff" stopOpacity="0.28" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="foil" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#dcbd78" />
        <stop offset="35%" stopColor="#b18a45" />
        <stop offset="60%" stopColor="#d2ad63" />
        <stop offset="100%" stopColor="#7d5e2c" />
      </linearGradient>
      <pattern id="crinkle" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
        <path d="M0 7 L14 7" stroke="#ffffff" strokeOpacity=".12" />
      </pattern>
      <pattern id="cells" width="10" height="10" patternUnits="userSpaceOnUse">
        <rect width="10" height="10" fill="#1d2d4d" />
        <path d="M10 0 V10 M0 10 H10" stroke="#5f7397" strokeOpacity=".5" strokeWidth=".8" />
      </pattern>
    </defs>
  )
}

export default SvgDefs
