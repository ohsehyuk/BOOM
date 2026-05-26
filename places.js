// 📍 서울시 주요 장소 실시간 데이터 매핑 사전 (121개 중 핵심 핫스팟 엄선)
const SEOUL_PLACES = [
    // [관광특구]
    { category: "관광특구", code: "POI007", name: "홍대 관광특구", keywords: ["홍대", "홍대입구", "서교동"] },
    { category: "관광특구", code: "POI001", name: "강남 MICE 관광특구", keywords: ["강남 코엑스", "코엑스", "COEX"] },
    { category: "관광특구", code: "POI003", name: "명동 관광특구", keywords: ["명동", "을지로입구"] },
    { category: "관광특구", code: "POI004", name: "이태원 관광특구", keywords: ["이태원", "경리단길"] },
    { category: "관광특구", code: "POI005", name: "잠실 관광특구", keywords: ["잠실", "방이동", "석촌호수"] },

    // [발달상권]
    { category: "발달상권", code: "POI068", name: "성수카페거리", keywords: ["성수", "성수동", "뚝섬역"] },
    { category: "발달상권", code: "POI062", name: "서촌", keywords: ["서촌", "통인동", "효자동"] },
    { category: "발달상권", code: "POI061", name: "북촌한옥마을", keywords: ["북촌", "삼청동", "안국역"] },
    { category: "발달상권", code: "POI073", name: "연남동", keywords: ["연남", "연남동"] },
    { category: "발달상권", code: "POI057", name: "가로수길", keywords: ["가로수길", "신사역", "압구정"] },

    // [고궁·문화유산]
    { category: "고궁·문화유산", code: "POI008", name: "경복궁", keywords: ["경복궁", "광화문역"] },
    { category: "고궁·문화유산", code: "POI012", name: "창덕궁·종묘", keywords: ["창덕궁", "종묘", "익선동"] },

    // [공원]
    { category: "공원", code: "POI105", name: "여의도한강공원", keywords: ["여의도 한강공원", "여의도한강", "한강고수부지"] },
    { category: "공원", code: "POI101", name: "서울숲공원", keywords: ["서울숲", "뚝섬공원"] },
    { category: "공원", code: "POI093", name: "뚝섬한강공원", keywords: ["뚝섬한강", "자양동"] },
    { category: "공원", code: "POI094", name: "망원한강공원", keywords: ["망원한강", "망원동 한강"] },
    { category: "공원", code: "POI095", name: "반포한강공원", keywords: ["반포 한강공원", "반포한강", "세빛섬"] },
    { category: "공원", code: "POI092", name: "노들섬", keywords: ["노들섬", "한강대교"] },

    // [인구밀집지역]
    { category: "인구밀집지역", code: "POI013", name: "강남역", keywords: ["강남역", "신논현역"] },
    { category: "인구밀집지역", code: "POI034", name: "신촌·이대역", keywords: ["신촌", "이대역", "연세대"] },
    { category: "인구밀집지역", code: "POI017", name: "건대입구역", keywords: ["건대", "건대입구", "화양동"] }
];
