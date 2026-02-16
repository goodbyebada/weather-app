import { describe, it, expect, vi } from "vitest";
import { searchDistricts, koreanIncludes } from "./searchDistricts";

// ─── koreanIncludes ─────────────────────────────────────────

import fs from "fs";
import path from "path";

// 실제 데이터 로드
const districtsPath = path.resolve(
  __dirname,
  "../../../../public/data/korea_districts.json",
);
const districtsData = JSON.parse(fs.readFileSync(districtsPath, "utf-8"));

// fetch 모킹
const fetchMock = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(districtsData),
  }),
);

vi.stubGlobal("fetch", fetchMock);

describe("koreanIncludes", () => {
  it("정확 일치 시 시작 인덱스를 반환한다", () => {
    expect(koreanIncludes("서울특별시", "서울")).toBe(0);
    expect(koreanIncludes("광주광역시", "광역")).toBe(2);
  });

  it("매칭 실패 시 -1을 반환한다", () => {
    expect(koreanIncludes("서울특별시", "부산")).toBe(-1);
  });

  it("초성 검색을 지원한다", () => {
    expect(koreanIncludes("서울특별시", "ㅅㅇ")).toBe(0);
    expect(koreanIncludes("종로구", "ㅈㄹ")).toBe(0);
  });

  it("혼합 검색(완성형 + 초성)을 지원한다", () => {
    expect(koreanIncludes("광주광역시", "광ㅈ")).toBe(0);
  });

  it("마지막 글자 부분 음절 매칭을 지원한다", () => {
    // "나"(ㄴ+ㅏ)가 "남"(ㄴ+ㅏ+ㅁ)에 매칭
    expect(koreanIncludes("강남구", "강나")).toBe(0);
    // "우"(ㅇ+ㅜ)가 "울"(ㅇ+ㅜ+ㄹ)에 매칭
    expect(koreanIncludes("서울특별시", "서우")).toBe(0);
  });

  it("부분 음절은 마지막 글자에서만 적용된다", () => {
    // "서우특"에서 "우"는 마지막이 아니므로 정확 일치 필요
    expect(koreanIncludes("서울특별시", "서우특")).toBe(-1);
  });

  it("대소문자를 구분하지 않는다", () => {
    expect(koreanIncludes("ABC", "abc")).toBe(0);
  });
});

// ─── searchDistricts ────────────────────────────────────────

describe("searchDistricts", () => {
  describe("기본 검색", () => {
    it("시/도를 검색한다", async () => {
      const results = await searchDistricts("서울");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].district.city).toBe("서울특별시");
      expect(results[0].matchType).toBe("city");
    });

    it("시/군/구를 검색한다", async () => {
      const results = await searchDistricts("종로구");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].district.district).toBe("종로구");
      expect(results[0].matchType).toBe("district");
    });

    it("읍/면/동을 검색한다", async () => {
      const results = await searchDistricts("청운동");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].district.dong).toBe("청운동");
      expect(results[0].matchType).toBe("dong");
    });

    it("리를 검색한다", async () => {
      const results = await searchDistricts("계곡리");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.district.li === "계곡리")).toBe(true);
      expect(results[0].matchType).toBe("li");
    });
  });

  describe("초성 검색", () => {
    it("전체 초성으로 검색한다", async () => {
      const results = await searchDistricts("ㅅㅇ");
      expect(results.length).toBeGreaterThan(0);
      // 서울특별시가 결과에 포함되어 있는지 확인 (정렬 순서는 다를 수 있음)
      expect(results.some((r) => r.district.city === "서울특별시")).toBe(true);
    });

    it("혼합 초성으로 검색한다", async () => {
      const results = await searchDistricts("광ㅈ");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].district.city).toBe("광주광역시");
    });
  });

  describe("부분 음절 매칭", () => {
    it("받침 없는 마지막 글자로 매칭한다", async () => {
      const results = await searchDistricts("강나");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].district.district).toBe("강남구");
    });
  });

  describe("복합 쿼리 (공백 구분)", () => {
    it("공백으로 구분된 다중 토큰을 검색한다", async () => {
      const results = await searchDistricts("경기도 군포시");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].district.city).toBe("경기도");
      expect(results[0].district.district).toBe("군포시");
    });

    it("시/도와 구를 조합하여 검색한다", async () => {
      const results = await searchDistricts("서울 종로");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].district.district).toBe("종로구");
    });

    it("복합 쿼리에서 초성을 사용할 수 있다", async () => {
      const results = await searchDistricts("서울 ㅈㄹ");
      expect(results.length).toBeGreaterThan(0);
      // 서울특별시가 포함된 결과가 있는지 확인 (초성 매칭이 작동하는지 검증)
      expect(results.some((r) => r.district.city === "서울특별시")).toBe(true);
    });
  });

  describe("연속 입력 (공백 없이)", () => {
    it("필드 경계를 넘는 연속 입력을 매칭한다", async () => {
      const results = await searchDistricts("경상북도의성군");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].district.city).toBe("경상북도");
      expect(results[0].district.district).toBe("의성군");
    });

    it("시+군 연속 입력을 매칭한다", async () => {
      const results = await searchDistricts("경기도군포시");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].district.district).toBe("군포시");
    });
  });

  describe("복합 + 연속 조합", () => {
    it("연속 입력 토큰과 일반 토큰을 함께 사용할 수 있다", async () => {
      const results = await searchDistricts("경상남도거제시 거제면");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].district.city).toBe("경상남도");
      expect(results[0].district.district).toBe("거제시");
      expect(results[0].district.dong).toBe("거제면");
    });

    it("연속 입력 + 동 검색을 조합한다", async () => {
      const results = await searchDistricts("경기도군포시 당동");
      expect(results.length).toBe(1);
      expect(results[0].district.dong).toBe("당동");
    });
  });

  describe("정렬", () => {
    it("정확 매칭이 부분 음절 매칭보다 우선이다", async () => {
      const results = await searchDistricts("부");
      expect(results.length).toBeGreaterThan(0);
      // "부산광역시"(정확 매칭)가 "경상북도"(부분 음절: 부→북)보다 선순위
      expect(results[0].district.city).toBe("부산광역시");
    });

    it("matchType 우선순위대로 정렬한다 (city > district > dong)", async () => {
      const results = await searchDistricts("강");
      const types = results.map((r) => r.matchType);
      const cityIdx = types.indexOf("city");
      const districtIdx = types.indexOf("district");
      if (cityIdx !== -1 && districtIdx !== -1) {
        expect(cityIdx).toBeLessThan(districtIdx);
      }
    });
  });

  describe("빈 입력 및 경계 조건", () => {
    it("빈 문자열은 빈 결과를 반환한다", async () => {
      expect(await searchDistricts("")).toEqual([]);
    });

    it("공백만 입력하면 빈 결과를 반환한다", async () => {
      expect(await searchDistricts("   ")).toEqual([]);
    });

    it("maxResults 옵션이 동작한다", async () => {
      const results = await searchDistricts("서울", { maxResults: 5 });
      expect(results.length).toBeLessThanOrEqual(5);
    });

    it("매칭 불가능한 쿼리는 빈 결과를 반환한다", async () => {
      expect(await searchDistricts("zzz없는지역")).toEqual([]);
    });

    it("존재하지 않는 장소는 빈 결과를 반환한다 (토스트 트리거 조건)", async () => {
      expect(await searchDistricts("뉴욕")).toEqual([]);
      expect(await searchDistricts("도쿄")).toEqual([]);
      expect(await searchDistricts("abcdef")).toEqual([]);
    });

    it("존재하는 장소는 결과를 반환한다 (토스트 미트리거 조건)", async () => {
      expect((await searchDistricts("ㅇㅇ")).length).toBeGreaterThan(0);
      expect((await searchDistricts("서울")).length).toBeGreaterThan(0);
      expect((await searchDistricts("강남")).length).toBeGreaterThan(0);
    });
  });

  describe("특수문자 구분 쿼리", () => {
    it("하이픈으로 구분된 전체 주소를 검색한다", async () => {
      const results = await searchDistricts("경기도-양평군-청운면-가현리");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].district.full).toBe("경기도-양평군-청운면-가현리");
    });

    it("하이픈과 공백을 혼합하여 사용할 수 있다", async () => {
      const results = await searchDistricts("경기도-양평군 청운면");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].district.city).toBe("경기도");
      expect(results[0].district.district).toBe("양평군");
    });

    it("점(.)으로 구분된 주소를 검색한다", async () => {
      const results = await searchDistricts("서울특별시.종로구.청운동");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].district.city).toBe("서울특별시");
      expect(results[0].district.district).toBe("종로구");
    });

    it("슬래시(/)로 구분된 주소를 검색한다", async () => {
      const results = await searchDistricts("경기도/군포시/당동");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].district.city).toBe("경기도");
      expect(results[0].district.district).toBe("군포시");
    });

    it("쉼표(,)로 구분된 주소를 검색한다", async () => {
      const results = await searchDistricts("서울특별시,강남구");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].district.city).toBe("서울특별시");
      expect(results[0].district.district).toBe("강남구");
    });

    it("여러 특수문자를 혼합하여 사용할 수 있다", async () => {
      const results = await searchDistricts("경기도-양평군/청운면.가현리");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].district.city).toBe("경기도");
      expect(results[0].district.district).toBe("양평군");
      expect(results[0].district.dong).toBe("청운면");
      expect(results[0].district.li).toBe("가현리");
    });

    it("괄호나 기타 특수문자도 구분자로 인식한다", async () => {
      const results = await searchDistricts("서울특별시(종로구)");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].district.city).toBe("서울특별시");
      expect(results[0].district.district).toBe("종로구");
    });
  });
});
