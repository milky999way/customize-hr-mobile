import { useDateStore } from "@/app/store/authStore";
import { useBaseCode } from "@/entities/approvalLine";
import { useUser } from "@/entities/user";
import { useWelfare } from "@/entities/welfare/api/useWelfare";
import { formatByType } from "@/shared/lib/formatByType";
import { UIBadge, UIDatePicker } from "@/shared/ui";
import { useState } from "react";


export const Welfare = () => {
  const {currentDate, setCurrentDate} = useDateStore();
  const toMonth = currentDate.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit' });
  const [month, setMonth] = useState<string>(toMonth.replace("-", ""));

  const parameters = {
    baseCodList: [
      { "patternCode": "WL01", "effDateYn": true, "companyYn": true },
    ]
  }
  const { data: baseCodeData, isLoading: isBaseCodeLoading, error: baseCodeError } = useBaseCode(parameters);
	if (isBaseCodeLoading) return <p>Loading...</p>;
	if (baseCodeError) return <p>Something went wrong!</p>;
  const codeData = baseCodeData && baseCodeData.map((code: any) =>
    code.cdbaseList.map((cd: any) => (
      {codeKey : cd.baseCode, codeName: cd.codeNameHan}
    ))
  )
  
  const { data: userData, isLoading: isUserLoading, error: userError } = useUser();
	if (isUserLoading) return <p>Loading...</p>;
	if (userError) return <p>Error: {userError.message}</p>;

  const { data: welfareData, isLoading: isWelfareLoading, error: welfareError } = useWelfare({
    emplNo: userData.loginUserId,
    loginCoId: userData.loginCoId,
    yyyyMm: month,
  });
  if (isWelfareLoading) return <p>Loading...</p>;
  if (welfareError) return <p>Something went wrong!</p>;

  const handleMonth = (date: Date) => {
    setMonth(date.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit' }).replace("-", ""));
  }


  // 신청일별로 정렬
  const welfareSortData = welfareData.sort((a: any, b: any) => {
    return b.reqDate - a.reqDate
  })

  return (
    <>
      <div className="pt-10 pb-10">
        <UIDatePicker
          label="조회기간"
          type="year-month"
          onMonthSelect={handleMonth}
        />
      </div>
      <div className="pt-10 pb-10">
        <div className="count__control">
          <div className="count">총 <em>{welfareData.length}</em> 건</div>
        </div>
        <ul className="list">
          {welfareSortData.length === 0 ?
            <li className="fs-15 text-center">데이터가 없습니다.</li>
          : welfareSortData.map((item: any, i) =>
            <li key={i}>
              <div className="list__content">
                <div className="top">
                  <div className="date"></div>
                </div>
                <div className="info">
                  <div>
                    <strong>신청 항목</strong>
                    <span className={item.reqGbn === "학자금" ? "text-information-dark" : "text-point-1"}>{item.reqGbn}</span>
                  </div>
                  <div>
                    <strong>신청일</strong>
                    <span>{formatByType("date", item.reqDate)}</span>
                  </div>
                  <div>
                    <strong>상태</strong>
                    {codeData[0].map((code: any, i: any) => 
                      code.codeKey === item.statusCode ?
                      <UIBadge key={i} type="border" shape="square" color={
                        code.codeName === "전송" || code.codeName === "결재요청" || code.codeName ==="급여반영" || code.codeName === "지급완료" ? "green"
                        : code.codeName === "작성중" || code.codeName === "담당자확인중" || code.codeName === "급여작업중" || code.codeName === "승인" ? "blue"
                        : code.codeName === "반려" ? "red"
                        : ""}
                      >
                        {code.codeName}
                      </UIBadge>
                      : null
                    )}
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