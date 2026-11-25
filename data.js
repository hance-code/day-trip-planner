// 預設一日遊資料庫：包含景點、路線座標、四種交通工具路程與費用、必吃美食、門票估算
const TRANSPORT_META = {
  transit: { label: "大眾運輸", icon: "🚇", shareable: false, note: "捷運 / 台鐵 / 公車 / 渡輪票價（依每人計算）" },
  car: { label: "開車/計程車", icon: "🚗", shareable: true, note: "計程車資或油資＋停車費（支援依人數均攤）" },
  scooter: { label: "騎機車", icon: "🛵", shareable: false, note: "油資或租車分攤（機動性高、好停車）" },
  walk: { label: "步行/單車", icon: "🚶", shareable: false, note: "徒步或 YouBike 微笑單車（綠色低碳）" }
};

const CATEGORY_META = {
  attraction: { label: "景點", icon: "🏞️", badgeClass: "cat-attraction" },
  food: { label: "美食", icon: "🍜", badgeClass: "cat-food" },
  cafe: { label: "下午茶", icon: "☕", badgeClass: "cat-cafe" },
  shopping: { label: "逛街", icon: "🛍️", badgeClass: "cat-shopping" }
};

const PRESET_TRIPS = [
  {
    id: "jiufen-shifen",
    title: "九份山城 × 十分瀑布 × 猴硐貓村鐵道一日遊",
    region: "新北瑞芳・平溪線",
    description: "結合平溪鐵道風光、瀑布壯景、貓村療癒散步與九份黃金山城夜景的經典北台灣路線。",
    defaultStartTime: "08:30",
    defaultMode: "transit",
    miscBudget: 350,
    stops: [
      {
        id: "jf-1",
        name: "台北車站（出發集合點）",
        category: "attraction",
        duration: 20,
        ticketCost: 0,
        foodCost: 90,
        foodItems: ["台鐵便當", "飯糰早點"],
        note: "於台北車站東三門或台鐵月台集合，可先買早餐或車上享用。",
        lat: 25.0478,
        lng: 121.517,
        legFromPrev: null
      },
      {
        id: "jf-2",
        name: "猴硐貓村",
        category: "attraction",
        duration: 75,
        ticketCost: 0,
        foodCost: 110,
        foodItems: ["古早味礦工麵", "貓咪造型鳳梨酥", "黑糖珍珠鮮奶"],
        note: "出車站天橋即可見到可愛貓咪聚集，拍照請勿開閃光燈與隨意餵食。",
        lat: 25.0869,
        lng: 121.8273,
        legFromPrev: {
          distanceKm: 36.5,
          routeDesc: "台鐵區間車（台北→猴硐）/ 開車走國道1號接台62線",
          modes: {
            transit: { minutes: 52, cost: 56, detail: "台鐵區間車直達" },
            car: { minutes: 45, cost: 680, detail: "國1→台62線（含油資與停車）" },
            scooter: { minutes: 65, cost: 110, detail: "台5線接北37鄉道" },
            walk: { minutes: 420, cost: 0, detail: "距離過遠，不建議全程步行" }
          }
        }
      },
      {
        id: "jf-3",
        name: "十分瀑布 & 十分老街",
        category: "attraction",
        duration: 110,
        ticketCost: 200,
        foodCost: 180,
        foodItems: ["榕樹下米粉湯", "溜哥燒烤雞翅包飯", "花生捲冰淇淋"],
        note: "免費參觀台版尼加拉瓜瀑布「十分瀑布」，回老街可在鐵道旁施放天燈（約 NT$200/人分攤）。",
        lat: 25.0489,
        lng: 121.7876,
        legFromPrev: {
          distanceKm: 11.2,
          routeDesc: "台鐵平溪線（猴硐→十分）或 106 縣道",
          modes: {
            transit: { minutes: 24, cost: 19, detail: "平溪線小火車" },
            car: { minutes: 20, cost: 320, detail: "北37接106縣道（含停車費100）" },
            scooter: { minutes: 22, cost: 40, detail: "106縣道山路順暢" },
            walk: { minutes: 145, cost: 0, detail: "沿山路步行約2.5小時" }
          }
        }
      },
      {
        id: "jf-4",
        name: "九份老街（基山街美食巡禮）",
        category: "food",
        duration: 120,
        ticketCost: 0,
        foodCost: 280,
        foodItems: ["阿柑姨芋圓", "賴阿婆芋圓", "阿蘭草仔粿", "紅糟肉圓"],
        note: "沿著基山街邊逛邊吃，推薦在阿柑姨芋圓靠窗座位欣賞基隆嶼海景。",
        lat: 25.1095,
        lng: 121.8452,
        legFromPrev: {
          distanceKm: 16.8,
          routeDesc: "平溪線至瑞芳轉公車 788 / 1062，或走 102 縣道",
          modes: {
            transit: { minutes: 48, cost: 45, detail: "台鐵回瑞芳轉基隆客運788" },
            car: { minutes: 32, cost: 480, detail: "106接102縣道（九份停車200）" },
            scooter: { minutes: 30, cost: 50, detail: "102縣道上山好停機車" },
            walk: { minutes: 210, cost: 0, detail: "跨山區步行約3.5小時" }
          }
        }
      },
      {
        id: "jf-5",
        name: "阿妹茶樓 & 豎崎路夜景茶點",
        category: "cafe",
        duration: 90,
        ticketCost: 0,
        foodCost: 350,
        foodItems: ["高山烏龍茶組", "綠豆糕", "黑糖麻糬", "梅子蜜餞"],
        note: "傍晚紅燈籠亮起後是九份最美時刻，推薦品茗看山海夕照與夜景。",
        lat: 25.1087,
        lng: 121.8439,
        legFromPrev: {
          distanceKm: 0.4,
          routeDesc: "沿九份老街豎崎路階梯漫步",
          modes: {
            transit: { minutes: 6, cost: 0, detail: "老街內步行階梯" },
            car: { minutes: 6, cost: 0, detail: "老街徒步區需步行" },
            scooter: { minutes: 6, cost: 0, detail: "老街徒步區需步行" },
            walk: { minutes: 6, cost: 0, detail: "階梯散步400公尺" }
          }
        }
      },
      {
        id: "jf-6",
        name: "瑞芳站 / 返回台北市區",
        category: "shopping",
        duration: 30,
        ticketCost: 0,
        foodCost: 120,
        foodItems: ["瑞芳龍鳳腿", "林記胡椒餅"],
        note: "搭 965 台灣好行直達西門/北門，或回瑞芳站搭台鐵返回台北。",
        lat: 25.1088,
        lng: 121.8062,
        legFromPrev: {
          distanceKm: 4.8,
          routeDesc: "公車 788 / 965 下山至瑞芳車站",
          modes: {
            transit: { minutes: 18, cost: 15, detail: "公車下山至瑞芳站" },
            car: { minutes: 15, cost: 250, detail: "102縣道下山" },
            scooter: { minutes: 14, cost: 25, detail: "102縣道下山" },
            walk: { minutes: 65, cost: 0, detail: "下坡步行約1小時" }
          }
        }
      }
    ]
  },
  {
    id: "tamsui-beitou",
    title: "淡水海景古蹟 × 北投溫泉文化微旅行",
    region: "新北淡水・台北北投",
    description: "沿著台北捷運淡水信義線玩到底，上午看河海古蹟吃阿給，下午泡湯漫步日式建築群。",
    defaultStartTime: "09:30",
    defaultMode: "transit",
    miscBudget: 300,
    stops: [
      {
        id: "tb-1",
        name: "淡水老街 & 金色水岸",
        category: "food",
        duration: 85,
        ticketCost: 0,
        foodCost: 180,
        foodItems: ["文化阿給", "魚丸湯", "巨無霸霜淇淋", "阿婆鐵蛋"],
        note: "捷運淡水站出站即達，可沿河岸散步吃經典淡水小吃。",
        lat: 25.1688,
        lng: 121.4426,
        legFromPrev: null
      },
      {
        id: "tb-2",
        name: "淡水紅毛城 & 真理大學",
        category: "attraction",
        duration: 80,
        ticketCost: 80,
        foodCost: 0,
        foodItems: ["紅毛城紀念明信片", "牛津學堂建築美拍"],
        note: "門票 NT$80（含小白宮、滬尾礮臺聯票），紅磚建築與淡水河景極適合拍照。",
        lat: 25.1754,
        lng: 121.4329,
        legFromPrev: {
          distanceKm: 1.5,
          routeDesc: "紅26公車 或 租借 YouBike 沿河岸騎行",
          modes: {
            transit: { minutes: 10, cost: 15, detail: "公車 紅26 / 857" },
            car: { minutes: 7, cost: 140, detail: "中正路短程（含停車）" },
            scooter: { minutes: 6, cost: 15, detail: "沿中正路騎行" },
            walk: { minutes: 18, cost: 10, detail: "河岸散步或YouBike 7分" }
          }
        }
      },
      {
        id: "tb-3",
        name: "漁人碼頭 & 情人橋",
        category: "attraction",
        duration: 75,
        ticketCost: 0,
        foodCost: 160,
        foodItems: ["海景咖啡廳輕食", "炭烤花枝丸"],
        note: "可從淡水渡船頭搭藍色公路渡輪前往，吹海風欣賞寬闊海口。",
        lat: 25.1829,
        lng: 121.4106,
        legFromPrev: {
          distanceKm: 2.8,
          routeDesc: "紅26公車 / 淡海輕軌 / 渡輪",
          modes: {
            transit: { minutes: 16, cost: 60, detail: "淡水渡船頭搭渡輪" },
            car: { minutes: 10, cost: 160, detail: "中正路二段直行" },
            scooter: { minutes: 9, cost: 20, detail: "直行接沙崙路" },
            walk: { minutes: 35, cost: 15, detail: "YouBike 自行車道 15分" }
          }
        }
      },
      {
        id: "tb-4",
        name: "北投市場美食（矮仔財滷肉飯）",
        category: "food",
        duration: 60,
        ticketCost: 0,
        foodCost: 190,
        foodItems: ["矮仔財黑金滷肉飯", "高記茶莊無憂茶", "營養三明治"],
        note: "下午轉往北投覓食，高記茶莊的烏龍綠茶（無憂茶）CP值超高必點！",
        lat: 25.1319,
        lng: 121.5008,
        legFromPrev: {
          distanceKm: 10.4,
          routeDesc: "紅26回淡水站轉捷運淡水信義線至北投站",
          modes: {
            transit: { minutes: 38, cost: 40, detail: "公車+捷運紅線" },
            car: { minutes: 24, cost: 340, detail: "台2乙接大度路" },
            scooter: { minutes: 22, cost: 35, detail: "大度路直達北投" },
            walk: { minutes: 125, cost: 30, detail: "YouBike 河濱約45分鐘" }
          }
        }
      },
      {
        id: "tb-5",
        name: "北投溫泉博物館 & 地熱谷",
        category: "attraction",
        duration: 100,
        ticketCost: 0,
        foodCost: 80,
        foodItems: ["溫泉蛋", "日式抹茶冰淇淋"],
        note: "免費參觀綠建築北投圖書館與百年溫泉博物館，再步行至煙霧繚繞的地熱谷。",
        lat: 25.1376,
        lng: 121.5122,
        legFromPrev: {
          distanceKm: 1.4,
          routeDesc: "新北投支線捷運 或 中山路漫步",
          modes: {
            transit: { minutes: 12, cost: 20, detail: "捷運新北投支線" },
            car: { minutes: 8, cost: 130, detail: "光明路上山" },
            scooter: { minutes: 7, cost: 15, detail: "中山路騎行" },
            walk: { minutes: 18, cost: 0, detail: "沿北投公園樹蔭散步" }
          }
        }
      },
      {
        id: "tb-6",
        name: "北投溫泉湯屋 / 露天風呂放鬆",
        category: "cafe",
        duration: 90,
        ticketCost: 450,
        foodCost: 120,
        foodItems: ["溫泉拉麵", "冰鎮烏梅汁"],
        note: "行程尾聲選擇平價大眾池（NT$60-150）或精緻雙人湯屋（每人約 NT$450-700）消除疲勞。",
        lat: 25.1369,
        lng: 121.5082,
        legFromPrev: {
          distanceKm: 0.5,
          routeDesc: "沿溫泉路步行下坡",
          modes: {
            transit: { minutes: 7, cost: 0, detail: "步行即可" },
            car: { minutes: 4, cost: 80, detail: "短程移動" },
            scooter: { minutes: 3, cost: 10, detail: "短程移動" },
            walk: { minutes: 7, cost: 0, detail: "散步7分鐘" }
          }
        }
      }
    ]
  },
  {
    id: "taichung-hipster",
    title: "台中草悟道 × 審計新村 × 逢甲夜市文青美食遊",
    region: "台中西區・西屯區",
    description: "城市綠意與老宅文創交織的輕鬆一日遊，一路從早午餐、博物館逛到審計新村與夜市。",
    defaultStartTime: "10:00",
    defaultMode: "scooter",
    miscBudget: 400,
    stops: [
      {
        id: "tc-1",
        name: "第二市場（山河魯肉飯・老賴紅茶）",
        category: "food",
        duration: 60,
        ticketCost: 0,
        foodCost: 160,
        foodItems: ["山河魯肉飯", "老賴豆漿紅茶", "王記菜頭粿糯米腸"],
        note: "台中經典百年市場早午餐，建議 10:00 前抵達避開尖峰人潮。",
        lat: 24.1419,
        lng: 120.6797,
        legFromPrev: null
      },
      {
        id: "tc-2",
        name: "國立自然科學博物館 / 植物園",
        category: "attraction",
        duration: 120,
        ticketCost: 120,
        foodCost: 50,
        foodItems: ["植物園熱帶雨林溫室", "恐龍廳"],
        note: "展示廳全票 NT$100 + 植物園 NT$20，夏天吹冷氣超舒適。",
        lat: 24.1573,
        lng: 120.6661,
        legFromPrev: {
          distanceKm: 2.5,
          routeDesc: "台灣大道公車 300~310 號專用道",
          modes: {
            transit: { minutes: 14, cost: 20, detail: "台中公車雙十優惠免費/低價" },
            car: { minutes: 10, cost: 150, detail: "沿台灣大道二段" },
            scooter: { minutes: 9, cost: 20, detail: "台灣大道慢車道" },
            walk: { minutes: 32, cost: 10, detail: "YouBike 約12分鐘" }
          }
        }
      },
      {
        id: "tc-3",
        name: "勤美誠品綠園道 & PARK2 草悟廣場",
        category: "shopping",
        duration: 90,
        ticketCost: 0,
        foodCost: 220,
        foodItems: ["大人系公園冰品", "異國輕食", "質感選物店"],
        note: "沙漠仙人掌造景與大片草地，非常適合午後悠閒拍照與逛街。",
        lat: 24.1508,
        lng: 120.6641,
        legFromPrev: {
          distanceKm: 1.0,
          routeDesc: "沿館前路、公益路綠園道步行",
          modes: {
            transit: { minutes: 12, cost: 0, detail: "綠園道林蔭步行" },
            car: { minutes: 6, cost: 120, detail: "公益路停車較不易" },
            scooter: { minutes: 4, cost: 15, detail: "沿英才路騎行" },
            walk: { minutes: 12, cost: 0, detail: "沿草悟道散步超舒服" }
          }
        }
      },
      {
        id: "tc-4",
        name: "審計新村（文創市集・泡芙下午茶）",
        category: "cafe",
        duration: 90,
        ticketCost: 0,
        foodCost: 200,
        foodItems: ["旅禾泡芙之家", "魚刺人雞蛋糕", "手沖咖啡"],
        note: "老宿舍改建的文青聚落，假日下午有熱鬧暮暮市集。",
        lat: 24.1449,
        lng: 120.6627,
        legFromPrev: {
          distanceKm: 0.7,
          routeDesc: "沿中興街步行穿越綠園道",
          modes: {
            transit: { minutes: 9, cost: 0, detail: "步行即達" },
            car: { minutes: 5, cost: 100, detail: "向上路轉民生路" },
            scooter: { minutes: 3, cost: 10, detail: "沿美村路騎行" },
            walk: { minutes: 9, cost: 0, detail: "散步9分鐘" }
          }
        }
      },
      {
        id: "tc-5",
        name: "台中國家歌劇院（空中花園）",
        category: "attraction",
        duration: 60,
        ticketCost: 0,
        foodCost: 0,
        foodItems: ["頂樓空中花園夕陽", "曲牆建築光影"],
        note: "伊東豐雄設計的免費建築藝術空間，傍晚五點點燈前後最美。",
        lat: 24.1628,
        lng: 120.6404,
        legFromPrev: {
          distanceKm: 3.4,
          routeDesc: "公車或沿市政北二路前往七期",
          modes: {
            transit: { minutes: 22, cost: 20, detail: "公車 75 / 358" },
            car: { minutes: 12, cost: 180, detail: "向上路接文心路" },
            scooter: { minutes: 11, cost: 20, detail: "公益路轉惠來路" },
            walk: { minutes: 44, cost: 15, detail: "YouBike 18分鐘" }
          }
        }
      },
      {
        id: "tc-6",
        name: "逢甲夜市美食大滿貫",
        category: "food",
        duration: 110,
        ticketCost: 0,
        foodCost: 350,
        foodItems: ["明倫蛋餅", "官芝琳大腸包小腸", "日船章魚小丸子", "溫家地瓜球"],
        note: "晚餐直接攻佔逢甲夜市，吃飽喝足結束完美一日。",
        lat: 24.1806,
        lng: 120.6451,
        legFromPrev: {
          distanceKm: 2.4,
          routeDesc: "沿河南路北行前往逢甲商圈",
          modes: {
            transit: { minutes: 18, cost: 20, detail: "公車 160 / 33" },
            car: { minutes: 12, cost: 200, detail: "福星路停車場" },
            scooter: { minutes: 9, cost: 15, detail: "河南路直行（夜市周邊較塞）" },
            walk: { minutes: 30, cost: 10, detail: "YouBike 12分鐘" }
          }
        }
      }
    ]
  },
  {
    id: "tainan-foodie",
    title: "台南府城古蹟 × 國華街小吃 × 漁光島夕陽遊",
    region: "台南中西區・安平區",
    description: "不繞路的古都慢旅！上午品嚐道地牛肉湯與老街小吃，下午走訪安平古堡與海邊日落。",
    defaultStartTime: "08:30",
    defaultMode: "scooter",
    miscBudget: 350,
    stops: [
      {
        id: "tn-1",
        name: "國華街 & 永樂市場早午餐",
        category: "food",
        duration: 80,
        ticketCost: 0,
        foodCost: 260,
        foodItems: ["富盛號碗粿", "金得春捲", "阿松割包", "修安豆花"],
        note: "一早來國華街一次蒐羅台南傳統小吃精華，建議多人分食才能吃更多樣！",
        lat: 22.9977,
        lng: 120.1982,
        legFromPrev: null
      },
      {
        id: "tn-2",
        name: "赤崁樓 & 祀典武廟",
        category: "attraction",
        duration: 70,
        ticketCost: 70,
        foodCost: 45,
        foodItems: ["義豐冬瓜茶", "武廟肉圓"],
        note: "全票 NT$70（台南市民免費），紅牆古蹟配上冬瓜茶是最對味的府城日常。",
        lat: 22.9975,
        lng: 120.2025,
        legFromPrev: {
          distanceKm: 0.6,
          routeDesc: "沿民族路二段步行",
          modes: {
            transit: { minutes: 8, cost: 0, detail: "步行即達" },
            car: { minutes: 4, cost: 100, detail: "市區單行道多不建議開車" },
            scooter: { minutes: 3, cost: 10, detail: "民族路騎行" },
            walk: { minutes: 8, cost: 0, detail: "散步8分鐘" }
          }
        }
      },
      {
        id: "tn-3",
        name: "台南美術館二館 & 孔廟商圈",
        category: "attraction",
        duration: 90,
        ticketCost: 200,
        foodCost: 130,
        foodItems: ["莉莉水果店剉冰", "克林台包"],
        note: "純白五角形幾何建築非常涼爽好拍，出來可到對面吃莉莉水果冰消暑。",
        lat: 22.9904,
        lng: 120.2016,
        legFromPrev: {
          distanceKm: 0.9,
          routeDesc: "沿永福路南行",
          modes: {
            transit: { minutes: 10, cost: 18, detail: "公車或步行" },
            car: { minutes: 6, cost: 130, detail: "南美館地下停車場" },
            scooter: { minutes: 4, cost: 10, detail: "永福路直行" },
            walk: { minutes: 12, cost: 0, detail: "老街散步12分鐘" }
          }
        }
      },
      {
        id: "tn-4",
        name: "安平老街 & 安平古堡",
        category: "attraction",
        duration: 100,
        ticketCost: 70,
        foodCost: 210,
        foodItems: ["文章牛肉湯", "同記安平豆花", "周氏蝦捲", "永泰興蜜餞"],
        note: "下午前往安平區，逛延平老街、登安平古堡眺望海景。",
        lat: 23.0014,
        lng: 120.1606,
        legFromPrev: {
          distanceKm: 5.2,
          routeDesc: "公車 2 / 99 路 或 沿安平路騎行",
          modes: {
            transit: { minutes: 24, cost: 18, detail: "大台南公車 2路" },
            car: { minutes: 16, cost: 220, detail: "民生路接安平路" },
            scooter: { minutes: 14, cost: 20, detail: "沿運河旁安平路" },
            walk: { minutes: 65, cost: 15, detail: "YouBike 運河自行車道 22分" }
          }
        }
      },
      {
        id: "tn-5",
        name: "漁光島月牙灣看夕陽",
        category: "cafe",
        duration: 75,
        ticketCost: 0,
        foodCost: 120,
        foodItems: ["海灘咖啡車飲品", "手工烤布蕾"],
        note: "穿過森林步道來到月牙灣沙灘，欣賞金色落日餘暉灑落海面。",
        lat: 22.9788,
        lng: 120.1552,
        legFromPrev: {
          distanceKm: 3.1,
          routeDesc: "經安億橋過漁光大橋",
          modes: {
            transit: { minutes: 20, cost: 18, detail: "公車 19 / 台灣好行" },
            car: { minutes: 9, cost: 150, detail: "經漁光大橋（假日有時管制）" },
            scooter: { minutes: 8, cost: 15, detail: "漁光大橋暢通好停" },
            walk: { minutes: 38, cost: 10, detail: "YouBike 15分鐘" }
          }
        }
      },
      {
        id: "tn-6",
        name: "花園夜市 / 大東東夜市（依星期選擇）",
        category: "food",
        duration: 90,
        ticketCost: 0,
        foodCost: 300,
        foodItems: ["二師兄古早味滷味", "麻糬叔叔", "木瓜牛奶", "旗魚黑輪"],
        note: "台南口訣「大大武花大武花」：週四六日逛花園夜市，週一二五逛大東夜市。",
        lat: 23.0108,
        lng: 120.1997,
        legFromPrev: {
          distanceKm: 6.4,
          routeDesc: "經安平路轉中華西路接海安路",
          modes: {
            transit: { minutes: 32, cost: 18, detail: "公車轉乘" },
            car: { minutes: 18, cost: 240, detail: "海安路三段" },
            scooter: { minutes: 15, cost: 25, detail: "中華西路轉和緯路" },
            walk: { minutes: 80, cost: 20, detail: "YouBike 約28分" }
          }
        }
      }
    ]
  },
  {
    id: "kaohsiung-harbor",
    title: "高雄駁二藝術特區 × 旗津渡輪海鮮 × 西子灣夕照",
    region: "高雄鹽埕・旗津・鼓山",
    description: "搭輕軌與渡輪串聯港都最美海岸線！融合藝術倉庫、鹽埕老店美食與浪漫夕陽。",
    defaultStartTime: "09:30",
    defaultMode: "transit",
    miscBudget: 300,
    stops: [
      {
        id: "kh-1",
        name: "鹽埕區早午餐 & 奶茶一條街",
        category: "food",
        duration: 70,
        ticketCost: 0,
        foodCost: 170,
        foodItems: ["樺達奶茶 / 雙妃奶茶", "鴨肉珍", "阿囉哈滷味"],
        note: "搭捷運橘線至鹽埕埔站，先喝杯高雄發源的濃郁奶茶配鴨肉飯！",
        lat: 22.6245,
        lng: 120.2835,
        legFromPrev: null
      },
      {
        id: "kh-2",
        name: "駁二藝術特區 & 大港橋",
        category: "attraction",
        duration: 100,
        ticketCost: 0,
        foodCost: 120,
        foodItems: ["微熱山丘鳳梨酥", "誠品駁二店", "大港橋旋轉秀"],
        note: "每日下午 15:00 大港橋會進行水平旋轉秀，周邊倉庫市集與裝置藝術極好拍。",
        lat: 22.6199,
        lng: 120.2816,
        legFromPrev: {
          distanceKm: 0.7,
          routeDesc: "輕軌 C12 駁二大義站 或 步行",
          modes: {
            transit: { minutes: 8, cost: 20, detail: "高雄輕軌一站" },
            car: { minutes: 5, cost: 120, detail: "大勇路停車場" },
            scooter: { minutes: 4, cost: 10, detail: "大勇路騎行" },
            walk: { minutes: 9, cost: 0, detail: "散步9分鐘" }
          }
        }
      },
      {
        id: "kh-3",
        name: "旗津老街 & 星空隧道 & 彩虹教堂",
        category: "food",
        duration: 130,
        ticketCost: 0,
        foodCost: 340,
        foodItems: ["萬三 / 鴨角活海產", "烤小卷", "番茄切盤沾薑汁醬油", "旗魚黑輪"],
        note: "從鼓山輪渡站搭渡輪約 5 分鐘即抵旗津，下船後可租電動自行車環島。",
        lat: 22.6119,
        lng: 120.2683,
        legFromPrev: {
          distanceKm: 1.9,
          routeDesc: "輕軌至哈瑪星轉步行至鼓山輪渡站搭渡輪",
          modes: {
            transit: { minutes: 22, cost: 50, detail: "輕軌+旗津渡輪(刷一卡通30元)" },
            car: { minutes: 28, cost: 320, detail: "需繞行過港隧道" },
            scooter: { minutes: 18, cost: 45, detail: "機車可直接騎上渡輪" },
            walk: { minutes: 35, cost: 30, detail: "步行+搭渡輪" }
          }
        }
      },
      {
        id: "kh-4",
        name: "西子灣 & 打狗英國領事館",
        category: "cafe",
        duration: 90,
        ticketCost: 99,
        foodCost: 160,
        foodItems: ["領事館古典玫瑰園下午茶", "海之冰水果大碗公冰"],
        note: "搭渡輪回到鼓山，登上領事館山丘看大船入港與西子灣落日。",
        lat: 22.6188,
        lng: 120.2669,
        legFromPrev: {
          distanceKm: 1.3,
          routeDesc: "旗津渡輪回鼓山輪渡站後沿哨船街步行",
          modes: {
            transit: { minutes: 18, cost: 30, detail: "渡輪回鼓山+步行" },
            car: { minutes: 26, cost: 280, detail: "經旗津過港隧道繞回市區" },
            scooter: { minutes: 14, cost: 40, detail: "騎機車搭渡輪返回" },
            walk: { minutes: 22, cost: 30, detail: "渡輪+海岸散步" }
          }
        }
      },
      {
        id: "kh-5",
        name: "六合夜市 / 美麗島光之穹頂",
        category: "shopping",
        duration: 85,
        ticketCost: 0,
        foodCost: 260,
        foodItems: ["鄭老牌木瓜牛奶", "海產粥", "烤肉之家", "土魠魚羹"],
        note: "搭捷運橘線到美麗島站欣賞光之穹頂，出站即達夜市吃宵夜返程。",
        lat: 22.6314,
        lng: 120.3019,
        legFromPrev: {
          distanceKm: 4.1,
          routeDesc: "橘1公車至捷運西子灣站轉橘線至美麗島站",
          modes: {
            transit: { minutes: 20, cost: 32, detail: "公車+捷運橘線" },
            car: { minutes: 14, cost: 200, detail: "五福路接中山路" },
            scooter: { minutes: 12, cost: 20, detail: "臨海二路接五福路" },
            walk: { minutes: 52, cost: 15, detail: "YouBike 約18分" }
          }
        }
      }
    ]
  }
];
