import { UIButton, UIInput, UIRadio, UISelect, UITabs } from "@/shared/ui";


export const Info = () => {
  return (
    <>
      <div className="pt-10 pb-10 fs-14">
        <p className="text-point-1 pb-10">(* 콘텐츠 관리 로직 관련 확인 필요(API))</p>
        $홍길동$님, 반갑습니다.<br />
        첫 출근 관련 안내해드리니 아래의 내용을 확인해주세요.
      </div>
      <div className="pt-10 pb-10 fs-14">
        출근일시 2024.09.02(월)<br />
        출근일자 09:00
      </div>
      <div className="pt-10 pb-10 fs-14">
        출근장소<br />
        서울시 강남구 역삼대로 14, A빌딩 10층
      </div>
      <div>
        <img src="/home.svg" alt="" style={{width: "100%", padding: "4rem"}}/>
      </div>
    </>
  )
}