import { prisma } from "@/lib/prisma";

// 홈 화면 작품 슬라이드쇼에 보여줄 자리 수 (기존 HOME_PREVIEW_COUNT와 동일한 값을 여기서 관리).
export const HOME_FEATURED_SLOTS = 9;

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

// 한국시간(KST) 자정 기준으로 날짜가 바뀌는 정수 인덱스. 같은 날엔 항상 같은 값이라
// 방문자·새로고침과 무관하게 하루 동안은 동일한 구성이 노출된다.
function todayIndexKst(now: Date): number {
  return Math.floor((now.getTime() + KST_OFFSET_MS) / MS_PER_DAY);
}

/**
 * 작품이 많아질수록 "최신 등록순"만 노출하면 오래전에 등록한 작가는 새 작품이
 * HOME_FEATURED_SLOTS개만 더 등록돼도 홈 화면에서 영영 사라지는 문제가 있다.
 *
 * 대신 판매중/판매완료 작품을 가진 작가 전원을 등록일(가장 처음 등록한 작품 기준) 순으로
 * 줄 세운 뒤, "하루에 한 묶음"씩 순서대로 노출한다. 묶음은 연속 구간이 아니라 일정 간격으로
 * 건너뛰며 골라서(인터리브) 담기 때문에, 하루치 묶음 안에도 오래된 작가와 최근 작가가 고르게
 * 섞인다 — 그래서 첫날부터 "과거부터 현재까지" 골고루 소개되고, 며칠에 걸쳐 전체 작가가
 * 한 번씩 돌아가며 노출된다(전체 작가 수가 HOME_FEATURED_SLOTS 이하면 매일 전원 노출).
 *
 * 한 작가의 작품이 여러 점이면, 그 작가 차례일 때마다 대표작도 날짜별로 돌아가며 바뀐다. 다만
 * "작가 1명당 하루 1작품"만 엄격히 지키면, 작가 수가 적을 때(HOME_FEATURED_SLOTS보다 적을 때)
 * 오히려 예전(최신 등록순 9개)보다 슬라이드 수가 줄어드는 역효과가 생긴다 — 예를 들어 작가가
 * 2명뿐이면 늘 2장만 보이게 됨. 그래서 1인 1점 우선 배정 후에도 자리가 남으면(HOME_FEATURED_SLOTS
 * 미만), 작품을 더 가진 작가부터 라운드로빈으로 추가 배정해 가능한 한 슬롯을 다 채운다.
 */
export async function getDailyFeaturedArtworks(now: Date = new Date()) {
  const artistsWithArtworks = await prisma.user.findMany({
    where: { artworks: { some: { status: { in: ["LISTED", "SOLD"] } } } },
    select: {
      id: true,
      artworks: {
        where: { status: { in: ["LISTED", "SOLD"] } },
        orderBy: { createdAt: "asc" },
        include: { artist: true },
      },
    },
  });

  if (artistsWithArtworks.length === 0) return [];

  // 과거 → 현재 순(각 작가의 가장 오래된 작품 등록일 기준)으로 정렬
  const artists = artistsWithArtworks.sort(
    (a, b) => a.artworks[0].createdAt.getTime() - b.artworks[0].createdAt.getTime(),
  );

  const totalArtists = artists.length;
  const groupCount = Math.max(1, Math.ceil(totalArtists / HOME_FEATURED_SLOTS));
  const dayIndex = todayIndexKst(now);
  const todayGroup = dayIndex % groupCount;

  // 인터리브 배정: i번째 작가는 (i % groupCount)번 묶음 소속 → 같은 묶음 안에 과거~최근이 고르게 섞임
  const todaysArtists = artists.filter((_, i) => i % groupCount === todayGroup);

  // 작가별로 오늘의 시작 오프셋부터 순서대로 작품을 나열(대표작이 매일 바뀌도록).
  const rotatedWorksByArtist = todaysArtists.map((artist) => {
    const works = artist.artworks;
    const offset = dayIndex % works.length;
    return [...works.slice(offset), ...works.slice(0, offset)];
  });

  // 라운드 0: 작가마다 1점씩. 슬롯이 남으면 라운드 1, 2, ...로 넘어가며 각 작가의 다음 작품을 추가
  // 배정 — 그래서 작가 수가 적을 때도 HOME_FEATURED_SLOTS까지 최대한 채운다.
  const featured: (typeof rotatedWorksByArtist)[number][number][] = [];
  for (let round = 0; featured.length < HOME_FEATURED_SLOTS; round++) {
    let addedThisRound = false;
    for (const works of rotatedWorksByArtist) {
      if (featured.length >= HOME_FEATURED_SLOTS) break;
      if (round < works.length) {
        featured.push(works[round]);
        addedThisRound = true;
      }
    }
    if (!addedThisRound) break; // 오늘 소개될 작가들의 작품을 전부 다 썼으면 종료
  }

  return featured;
}
