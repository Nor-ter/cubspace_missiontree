// Phase를 끝내는 검토 회의. 우리 팀의 실제 회의가 정해지기 전까지 NASA 표준을 쓴다.
// 출처: NASA Systems Engineering Handbook (NASA/SP-2016-6105 Rev 2), 수명주기 검토 회의
export const REVIEW_SOURCE = 'NASA Systems Engineering Handbook, NASA/SP-2016-6105 Rev 2'

export interface Review {
  code: string
  name: string
}

export const PHASE_REVIEWS: Record<string, Review[]> = {
  'Pre-A': [{ code: 'MCR', name: 'Mission Concept Review' }],
  A: [
    { code: 'SRR', name: 'System Requirements Review' },
    { code: 'MDR', name: 'Mission Definition Review' },
  ],
  B: [{ code: 'PDR', name: 'Preliminary Design Review' }],
  C: [
    { code: 'CDR', name: 'Critical Design Review' },
    { code: 'SIR', name: 'System Integration Review' },
  ],
  D: [
    { code: 'ORR', name: 'Operational Readiness Review' },
    { code: 'FRR', name: 'Flight Readiness Review' },
  ],
  E: [{ code: 'DR', name: 'Decommissioning Review' }],
  F: [{ code: 'DRR', name: 'Disposal Readiness Review' }],
}
