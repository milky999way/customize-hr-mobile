import { useMain } from "@/entities/main";
import { UIButton } from "@/shared/ui";

export const Main = () => {
  const { data: mainData, isLoading: isMainLoading, error: mainError } = useMain();

  // 로딩 중일 때
  if (isMainLoading) return <p>Loading...</p>;

  // 에러 발생 시
  if (mainError) return <p>Error: {mainError.message}</p>;

  // 데이터 로드 전 기본값 처리
  const lveDays = mainData?.lveDays || 0;
  const useDays = mainData?.useDays || 0;
  const remindDays = mainData?.remindDays || 0;
  const etcDays = mainData?.etcDays || 0;

  return (
    <>
      <div className="text-center pt-124 pb-40">
        <img src="/logo_hitek.svg" />
      </div>
      <div className="text-center pt-10 pb-10 fs-18">
        <strong>{mainData?.loginUserNm || "사용자"}</strong>님, 안녕하세요.
      </div>
      <div className="pt-30 pb-120 fs-16">
        <h3 className="main__card__title">연차현황</h3>
        <div className="main__card gap-10">
          <div>
            부여
            <p>{Math.floor(lveDays)} 일</p>
            <p>{(lveDays % 1) * 8} 시간</p>
          </div>
          <div>
            사용
            <p>{Math.floor(useDays)} 일</p>
            <p>{(useDays % 1) * 8} 시간</p>
          </div>
          <div>
            잔여
            <p>{Math.floor(remindDays)} 일</p>
            <p>{(remindDays % 1) * 8} 시간</p>
          </div>
          <div>
            기타
            <p>{Math.floor(etcDays)} 일</p>
            <p>{(etcDays % 1) * 8} 시간</p>
          </div>
        </div>
      </div>
      <div className="pt-10 pb-10">
        <a href="https://drms.dbhitek.com/" target="_blank">
          <UIButton type="primary">다붓</UIButton>
        </a>
      </div>
      <div className="pt-10 pb-10">
        <a href="https://ims.dbhitek.com/" target="_blank">
          <UIButton type="primary">통합관리시스템</UIButton>
        </a>
      </div>
    </>
  );
};