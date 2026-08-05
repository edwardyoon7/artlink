// "ARTIEUM VIRTUAL" 가상 배치 미리보기.
//
// 실사 사진 대신, Artlink 디자인 컨셉(붓·물감을 연상시키는 웜톤 강조색 + 화이트큐브 에디토리얼
// 톤)에 맞춘 플랫 일러스트 공간 3종에 작품을 실제 크기 비율로 배치해 보여준다. 세 공간 모두
// 동일한 축척(SVG 1단위 = 1cm)을 쓰기 때문에, widthCm/heightCm 값이 그대로 작품 사각형의
// 폭/높이 단위가 되어 방마다 일관된 실제 비율로 렌더링된다. 세 공간에 공통으로 등장하는 화분은
// 우연이 아니라 "성장 서사"를 색으로 강조한다는 디자인 원칙과 결을 맞춘 의도적인 장치.

type RoomKind = "entrance" | "living" | "office";

const ROOM_KINDS: RoomKind[] = ["entrance", "living", "office"];

const VIEW_WIDTH = 400;
const VIEW_HEIGHT = 260;
const FLOOR_TOP = 222; // 바닥 색 영역 시작 y (그 위는 벽)

const ROOMS: Record<
  RoomKind,
  {
    label: string;
    wall: string;
    floor: string;
    centerX: number;
    furnitureTopY: number;
    gap: number;
  }
> = {
  entrance: {
    label: "현관",
    wall: "#efe0d3",
    floor: "#d9cbb8",
    centerX: 147,
    furnitureTopY: 182,
    gap: 18, // 콘솔 테이블(높이 75cm) 위
  },
  living: {
    label: "거실",
    wall: "#f1ece1",
    floor: "#d3ad7c",
    centerX: 205,
    furnitureTopY: 178,
    gap: 20, // 소파 등받이(높이 80cm) 위
  },
  office: {
    label: "사무실",
    wall: "#e4e7e2",
    floor: "#d8d9d4",
    centerX: 200,
    furnitureTopY: 182,
    gap: 18, // 책상(높이 75cm) 위
  },
};

function Scenery({ kind, defsId }: { kind: RoomKind; defsId: string }) {
  if (kind === "entrance") {
    return (
      <>
        {/* 문 */}
        <rect x={270} y={40} width={94} height={220} fill="#7c5c42" stroke="#5b4128" strokeWidth={1} />
        <rect
          x={280}
          y={52}
          width={74}
          height={196}
          fill="none"
          stroke="#efe0d3"
          strokeWidth={1.5}
          opacity={0.45}
        />
        <circle cx={352} cy={155} r={3} fill="#c9a55c" />
        {/* 콘솔 테이블 */}
        <ellipse cx={147} cy={233} rx={62} ry={6} fill="#1f2937" opacity={0.08} />
        <rect x={90} y={182} width={115} height={7} rx={1} fill="#a9835c" />
        <rect x={95} y={189} width={4} height={41} fill="#8a6640" />
        <rect x={196} y={189} width={4} height={41} fill="#8a6640" />
        {/* 화분 */}
        <rect x={233} y={222} width={20} height={16} rx={2} fill="#c1602e" />
        <circle cx={243} cy={212} r={13} fill="#8fa07e" opacity={0.9} />
        <circle cx={234} cy={206} r={10} fill="#8fa07e" opacity={0.75} />
        <circle cx={252} cy={205} r={9} fill="#8fa07e" opacity={0.8} />
        {/* 현관 매트 */}
        <rect x={58} y={246} width={150} height={9} rx={4} fill="#c1602e" opacity={0.35} />
      </>
    );
  }

  if (kind === "living") {
    return (
      <>
        <defs>
          <linearGradient id={`${defsId}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cfe3ee" />
            <stop offset="100%" stopColor="#e9ddc9" />
          </linearGradient>
          <radialGradient id={`${defsId}-glow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f8dfa3" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#f8dfa3" stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* 창 */}
        <rect
          x={18}
          y={18}
          width={72}
          height={92}
          rx={2}
          fill={`url(#${defsId}-sky)`}
          stroke="#1f2937"
          strokeWidth={1}
          opacity={0.85}
        />
        <line x1={54} y1={18} x2={54} y2={110} stroke="#1f2937" strokeWidth={1} opacity={0.25} />
        <line x1={18} y1={64} x2={90} y2={64} stroke="#1f2937" strokeWidth={1} opacity={0.25} />
        {/* 러그 */}
        <ellipse cx={205} cy={248} rx={105} ry={15} fill="#e3d5c3" stroke="#c1602e" strokeWidth={1.5} opacity={0.7} />
        {/* 소파 그림자 */}
        <ellipse cx={205} cy={252} rx={128} ry={8} fill="#1f2937" opacity={0.1} />
        {/* 소파 */}
        <rect x={90} y={178} width={22} height={82} rx={8} fill="#ad6b50" />
        <rect x={298} y={178} width={22} height={82} rx={8} fill="#ad6b50" />
        <rect x={90} y={178} width={230} height={30} rx={8} fill="#b97455" />
        <rect x={90} y={200} width={230} height={60} rx={6} fill="#c48468" />
        <rect x={128} y={190} width={58} height={34} rx={6} fill="#a5644a" opacity={0.55} />
        <rect x={214} y={190} width={58} height={34} rx={6} fill="#a5644a" opacity={0.55} />
        {/* 사이드 테이블 + 플로어 램프 */}
        <circle cx={358} cy={150} r={34} fill={`url(#${defsId}-glow)`} />
        <line x1={358} y1={150} x2={358} y2={232} stroke="#8a6640" strokeWidth={2} />
        <path d="M 342 150 L 374 150 L 366 128 L 350 128 Z" fill="#f5d9a8" stroke="#c1602e" strokeWidth={1} opacity={0.9} />
        <rect x={330} y={226} width={45} height={6} rx={1} fill="#a9835c" />
        <rect x={333} y={232} width={3} height={24} fill="#8a6640" />
        <rect x={369} y={232} width={3} height={24} fill="#8a6640" />
      </>
    );
  }

  // office
  return (
    <>
      {/* 창(블라인드) */}
      <rect x={308} y={18} width={72} height={82} rx={2} fill="#dceaf2" stroke="#1f2937" strokeWidth={1} opacity={0.5} />
      <line x1={308} y1={34} x2={380} y2={34} stroke="#1f2937" strokeWidth={1} opacity={0.2} />
      <line x1={308} y1={50} x2={380} y2={50} stroke="#1f2937" strokeWidth={1} opacity={0.2} />
      <line x1={308} y1={66} x2={380} y2={66} stroke="#1f2937" strokeWidth={1} opacity={0.2} />
      <line x1={308} y1={82} x2={380} y2={82} stroke="#1f2937" strokeWidth={1} opacity={0.2} />
      {/* 의자 */}
      <rect x={176} y={112} width={46} height={68} rx={16} fill="#37424f" opacity={0.9} />
      {/* 책상 그림자 */}
      <ellipse cx={200} cy={252} rx={92} ry={7} fill="#1f2937" opacity={0.1} />
      {/* 책상 */}
      <rect x={120} y={182} width={160} height={7} rx={1} fill="#a9835c" />
      <rect x={125} y={189} width={4} height={71} fill="#8a6640" />
      <rect x={271} y={189} width={4} height={71} fill="#8a6640" />
      {/* 모니터 */}
      <rect x={168} y={140} width={64} height={40} rx={2} fill="#dceaf2" stroke="#37424f" strokeWidth={1.5} />
      <rect x={196} y={180} width={8} height={6} fill="#37424f" />
      <rect x={186} y={186} width={28} height={4} rx={2} fill="#37424f" />
      {/* 스탠드 조명 */}
      <line x1={140} y1={182} x2={140} y2={158} stroke="#37424f" strokeWidth={2} />
      <path d="M 128 158 L 152 158 L 146 146 L 134 146 Z" fill="#c1602e" opacity={0.85} />
      {/* 화분 */}
      <rect x={288} y={224} width={18} height={14} rx={2} fill="#c1602e" />
      <circle cx={297} cy={212} r={12} fill="#8fa07e" opacity={0.9} />
      <circle cx={289} cy={207} r={9} fill="#8fa07e" opacity={0.75} />
      <circle cx={305} cy={206} r={8} fill="#8fa07e" opacity={0.8} />
    </>
  );
}

function RoomMock({
  kind,
  imageUrl,
  widthCm,
  heightCm,
  title,
}: {
  kind: RoomKind;
  imageUrl: string;
  widthCm: number;
  heightCm: number;
  title: string;
}) {
  const room = ROOMS[kind];
  const artX = room.centerX - widthCm / 2;
  const artY = room.furnitureTopY - room.gap - heightCm;
  const clipId = `virtual-clip-${kind}`;
  const defsId = `virtual-defs-${kind}`;

  return (
    <div>
      <div className="overflow-hidden rounded-sm border border-ink/10">
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="block w-full"
          role="img"
          aria-label={`${title} 작품을 ${room.label}에 배치한 가상 미리보기`}
        >
          <rect x={0} y={0} width={VIEW_WIDTH} height={VIEW_HEIGHT} fill={room.wall} />
          <rect x={0} y={FLOOR_TOP} width={VIEW_WIDTH} height={VIEW_HEIGHT - FLOOR_TOP} fill={room.floor} />
          <line
            x1={0}
            y1={FLOOR_TOP}
            x2={VIEW_WIDTH}
            y2={FLOOR_TOP}
            stroke="#1f2937"
            strokeWidth={1}
            opacity={0.15}
          />
          <Scenery kind={kind} defsId={defsId} />

          <clipPath id={clipId}>
            <rect x={artX} y={artY} width={widthCm} height={heightCm} />
          </clipPath>
          {/* 작품 그림자 + 프레임(매트) */}
          <rect x={artX - 4} y={artY - 4} width={widthCm + 8} height={heightCm + 8} fill="#1f2937" opacity={0.12} />
          <rect
            x={artX - 3}
            y={artY - 3}
            width={widthCm + 6}
            height={heightCm + 6}
            fill="#f5f1ea"
            stroke="#1f2937"
            strokeWidth={1}
            opacity={0.95}
          />
          <image
            href={imageUrl}
            x={artX}
            y={artY}
            width={widthCm}
            height={heightCm}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
          />
          <rect
            x={artX}
            y={artY}
            width={widthCm}
            height={heightCm}
            fill="none"
            stroke="#1f2937"
            strokeWidth={0.75}
            opacity={0.6}
          />
        </svg>
      </div>
      <p className="mt-2 text-center text-xs tracking-wide text-ink/60">{room.label}</p>
    </div>
  );
}

export function ArtieumVirtualPreview({
  imageUrl,
  widthCm,
  heightCm,
  title,
}: {
  imageUrl: string;
  widthCm: number;
  heightCm: number;
  title: string;
}) {
  return (
    <div className="mt-16 border-t border-ink/10 pt-10">
      <p className="font-[var(--font-serif-en)] text-xs tracking-[0.3em] text-terracotta">
        ARTIEUM VIRTUAL
      </p>
      <p className="mt-2 text-sm text-ink/60">
        실제 크기({widthCm} × {heightCm}cm) 비율 그대로, 세 가지 공간에 걸어본 모습입니다.
      </p>
      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        {ROOM_KINDS.map((kind) => (
          <RoomMock
            key={kind}
            kind={kind}
            imageUrl={imageUrl}
            widthCm={widthCm}
            heightCm={heightCm}
            title={title}
          />
        ))}
      </div>
    </div>
  );
}
