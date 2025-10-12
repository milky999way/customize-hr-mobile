import { useDateStore } from "@/app/store/authStore";
import { useSalaryAnnual } from "@/entities/salary";
import { useUser } from "@/entities/user";
import { formatByType } from "@/shared/lib/formatByType";
import { UIAlert, UIButton, UIDatePicker } from "@/shared/ui";
import { useState } from "react";


export const Annual = () => {

  const {currentDate, setCurrentDate} = useDateStore();
  const toDay = currentDate.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const [todayDate, setTodayDate] = useState(toDay)
  
  const { data: userData, isLoading: isUserLoading, error: userError } = useUser();
	if (isUserLoading) return <p>Loading...</p>;
	if (userError) return <p>Error: {userError.message}</p>;

  const { data: salaryAnnualData, isLoading: isSalaryAnnualLoading, error: salaryAnnualError } = useSalaryAnnual({
    baseDate: todayDate,
    emplNo: userData.loginUserId,
    emplNameHan: userData.loginUserNm,
  });
	if (isSalaryAnnualLoading) return <p>Loading...</p>;
	if (salaryAnnualError) return <p>Error: {salaryAnnualError.message}</p>;

  const handleViewer = (data: any) => {
    // 설정값 유지
    console.log(data.ctrtFile)
    const staticFormData = {
      formName: "salaryContract",
      sysRptId: "salaryContract",
      projectName: "dbh^contract",
      UB_UNVISIBLE_MENULIST: "btnSaveDataLB,lbPageContinue",

      // 개발배포
      rptProfile: "dev",
      imgUrl: "http://10.141.5.197:8110/",

      // 운영배포
      // rptProfile: "prod",
      // imgUrl: "https://hrmreport.dbhitek.com/",
    };

    // 데이터 병합
    const printFormData = {
      ...staticFormData,
      ...data, // 받은 데이터를 그대로 병합
    };


    console.log(printFormData);

    // Create a form dynamically
    const printForm = document.createElement("form");
    printForm.setAttribute("method", "POST");

    // 개발배포
    printForm.setAttribute("action", "http://10.141.5.197:8120/UView5/index.jsp");

    // 운영배포
    // printForm.setAttribute("action", "https://hrmreport.dbhitek.com/UView5/index.jsp");

    printForm.setAttribute("target", "_blank"); // Open in a new tab or window

    // Append hidden inputs for each form data field
    for (const [key, value] of Object.entries(printFormData)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value != null ? String(value) : "";
      printForm.appendChild(input);
    }

    // Append the form to the document, submit, and remove it
    document.body.appendChild(printForm);
    // console.log(printForm);
    printForm.submit();
    document.body.removeChild(printForm);
  };

  //연봉 제출기간 체크
  const calcDay = (ctrtStartDate: any, ctrtEndDate: any) => {
    let returnBollean = true;
    if(ctrtStartDate < todayDate.replace("-","").replace("-","") < ctrtEndDate){
      returnBollean = false;
    }
    return returnBollean;
  }


  return (
    <>
      <div className="pt-10 pb-10">
        <UIDatePicker type="date" label="조회일" onDateSelect={(value) => setTodayDate(formatByType("date", value))} placeholder={toDay} />
      </div>
      <div className="pt-10 pb-10">
        <div className="count__control">
          <div className="count">총 <em>{salaryAnnualData.length}</em> 건</div>
        </div>
        <ul className="list">
          {salaryAnnualData.length === 0 ?
            <li className="fs-15 text-center">데이터가 없습니다.</li>
          : salaryAnnualData.map((item: any, i) =>
            <li key={i}>
              <div className="list__content">
                <div className="top">
                  <div className="date">연봉: {formatByType("number", item.annualAmt)}</div>
                  <div className="d-flex justify-content-between">
                    <UIAlert
                      description="제출하시겠습니까?"
                      actionProps={{
                        onClick: () => {
                          // handleSave();
                        },
                      }}
                    >
                      {/* <UIButton disabled={calcDay(item.ctrtStartDate,item.ctrtEndDate)} type="secondary" size="small" className="mr-10">제출</UIButton> */}
                      <UIButton disabled={true} type="secondary" size="small" className="mr-10">제출</UIButton>
                    </UIAlert>
                    <UIButton type="border" size="small" onClick={() => handleViewer(item)}>보기</UIButton>
                  </div>
                </div>
                <div className="info">
                  <div>
                    <strong>계약시작일</strong>
                    <span>{formatByType("date", item.ctrtStartDate)}</span>
                  </div>
                  <div>
                    <strong>계약종료일</strong>
                    <span>{formatByType("date", item.ctrtEndDate)}</span>
                  </div>
                  <div>
                    <strong>계약일</strong>
                    <span>{formatByType("date", item.ctrtDate)}</span>
                  </div>
                </div>
              </div>
            </li>
          )}
        </ul>
      </div>
      {/* <div className="pt-10 pb-200">
        <iframe src="http://10.141.5.197:8120/UView5/index.jsp" style={{width: "100%", height: "75vh"}}/>
      </div>
      <div className="applyAction">
        <UIAlert
          description="제출하시겠습니까?"
          actionProps={{
            onClick: () => {
              // handleSave();
            },
          }}
        >
          <UIButton type="primary">제출</UIButton>
        </UIAlert>
      </div> */}
    </>
  )
}