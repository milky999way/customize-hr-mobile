import { usePersonnelInquire } from "@/entities/personnel";
import { formatByType } from "@/shared/lib/formatByType";
import { UIDatePicker } from "@/shared/ui"
import { useState } from "react";


export const Inquire = () => {
  const [startMonth, setStartMonth] = useState<string>();
  const [endMonth, setEndMonth] = useState<string>();
  const { data: personnelInquireData, isLoading: isPersonnelInquireLoading, error: personnelInquireError } = usePersonnelInquire({
    fromMonth: startMonth,
    toMonth: endMonth,
  });
	if (isPersonnelInquireLoading) return <p>Loading...</p>;
	if (personnelInquireError) return <p>Something went wrong!</p>;

  const handleStartMonth = (date: Date) => {
    setStartMonth(date.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit' }));
  }
  const handleEndMonth = (date: Date) => {
    setEndMonth(date.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit' }));
  }

  return (
    <>
      <div className="pt-10 pb-10 d-flex justify-content-between gap-10">
        <div className="d-flex" style={{"width": "50%"}}>
          <UIDatePicker label="조회 시작월" type="year-month" onMonthSelect={handleStartMonth} />
        </div>
        <div className="d-flex" style={{"width": "50%"}}>
          <UIDatePicker label="조회 종료월" type="year-month" onMonthSelect={handleEndMonth} />
        </div>
      </div>
      <div className="pt-10 pb-10">
        <div className="count__control">
          <div className="count">총 <em>{personnelInquireData.length}</em> 건</div>
        </div>
        <ul className="list">
          {(!startMonth || !endMonth) && personnelInquireData.length === 0 ? 
            <li className="fs-15 text-center">조회기간을 선택해주세요.</li>
          : personnelInquireData.length === 0 ?
            <li className="fs-15 text-center">데이터가 없습니다.</li>
          : personnelInquireData.map((item: any, i) =>
            <li key={i}>
              <div className="list__content">
                <div className="top">
                  <div className="date">조회기간: {item.mealTerm}</div>
                </div>
                <div className="info">
                  <div className="justify-content-between mr-20">
                    <strong>식수기준</strong>
                    <span>{item.baseMealCnt}</span>
                  </div>
                  <div className="justify-content-between mr-20">
                    <strong>당월식수</strong>
                    <span>{item.mealCnt}</span>
                  </div>
                  <div className="justify-content-between mr-20">
                    <strong>제외식수(연장)</strong>
                    <span>{item.overMealCnt}</span>
                  </div>
                  <div className="justify-content-between mr-20">
                    <strong>예상공제금액(단위:원)</strong>
                    <span>{formatByType("number", item.overMealAmt)}</span>
                  </div>
                </div>
              </div>
            </li>
          )}
        </ul>
      </div>
    </>
  )
}