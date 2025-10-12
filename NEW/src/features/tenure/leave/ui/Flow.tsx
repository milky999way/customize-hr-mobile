import { axiosInstance } from "@/app/api/axiosInstance";
import { useDateStore } from "@/app/store/authStore";
import { usePersonnelInfo } from "@/entities/personnel";
import { useTenureLeaveFlow } from "@/entities/tenure";
import { useUser } from "@/entities/user";
import { UIAlert, UIBadge, UIButton, UIDatePicker, UISelect } from "@/shared/ui";
import { useState } from "react";
import { Link } from "react-router-dom";


export const Flow = () => {
  const [dateRange, setDateRange] = useState({ fromDate: '', toDate: ''});
  const [completeYn, setCompleteYn] = useState('');
  const {currentDate, setCurrentDate} = useDateStore();
  const toDay = currentDate.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const [day, setDay] = useState<string>(toDay);
  const checkDate = new Date();
  const threeMonthAgo = new Date(checkDate.setMonth(checkDate.getMonth() - 3));
  const threeMonthDay = threeMonthAgo.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' });

  const { data: userData, isLoading: isUserLoading, error: userError } = useUser();
	if (isUserLoading) return <p>Loading...</p>;
	if (userError) return <p>Error: {userError.message}</p>;


  const { data: tenureLeaveFlowData, isLoading: isTenureLeaveFlowLoading, error: tenureLeaveFlowError } = useTenureLeaveFlow({
    fromDate: dateRange.fromDate ? dateRange.fromDate : threeMonthDay,
    toDate: dateRange.toDate,
    rEmplNo: userData.loginUserId,
    rEmplNameHan: userData.loginUserNm,
    sComplYn: completeYn,
    role: '2',
  });
	if (isTenureLeaveFlowLoading) return <p>Loading...</p>;
	if (tenureLeaveFlowError) return <p>Error: {tenureLeaveFlowError.message}</p>;



  // 쿼리되는 값에 따라서, 레포트, 동적필드, 사직원, 설문조사 - 설정확인(팝업/프로그램 - 화면, 본인확인/담당자확인 - 동적필드, 레포트)

  





  const [openToast, setOpenToast] = useState({ message: "", type: "", open: false });
  const handleViewer = async (securityDoc: any, action: string) => {



    
    const formData = new URLSearchParams();
    const appendFormData = (data: any, parentKey = '') => {
      if (typeof data === 'object' && !Array.isArray(data)) {
        const excludedKeys = ['toDate', 'memplNo', 'retireGbn', 'remplNo', 'host2Type', 'loginIdntClCode',  'mpgmId', 'emprt140FileDtoList', 'colNm', 'retireDate', 'loginPwResetDt', 'memplNameHan',  'effFromDate', 'remplNameHan', 'requiredFile', 'loginTitleName', 'loginInitPwdYn',  'fromDate', 'loginCoEngNm', 'role', 'loginCoId', 'retireReasonCode', 'reportId',  'loginCellularTel', 'attachInd', 'col', 'host1Ind', 'loginDeptName', 'displayOrder',  'host2Ind', 'host1Nm', 'sign', 'loginGradeName', 'docNo', 'host2Nm', 'hostType',  'loginUserId', 'host3Type', 'wfNm', 'emprt140DtoList', 'hostNm', 'loginRetireDate',  'effToDate', 'curEditTime', 'host1Type', 'detailNm', 'scomplYn', 'chk', 'loginTitleCode',  'mpgmUrlAd', 'loginUserNm', 'host3Nm', 'retireReasonName', 'hostInd', 'host3Ind',  'loginCoNm', 'loginDeptId', 'loginEntranceDate', 'wfCode', 'loginPstnName']
        const formList = Object.entries(data).filter(([key]) => !excludedKeys.includes(key))
        formList.forEach(([key, value]) => {
          appendFormData(value, parentKey ? `${parentKey}.${key}` : key);
        });
      } else if (Array.isArray(data)) {
        data.forEach((item, index) => {
          appendFormData(item, `${parentKey}[${index}]`);
        });
      } else {
        formData.append(parentKey, data);
      }
    };
    appendFormData(securityDoc);


    const staticFormData = {
      formName: "securityPledgeRetire",
      sysRptId: "securityPledgeRetire",
      projectName: "dbh^contract",
      UB_UNVISIBLE_MENULIST: "btnSaveDataLB,lbPageContinue",
      UB_DOCUMENT_DATA: "",

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
      ...securityDoc, // 받은 데이터를 그대로 병합
    };
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






    if (action === "view") {
      try {
        const { data } = await axiosInstance.post('/emp/dbhemprt/emprt140/sendReport', formData)
        // 설정값 유지
        const staticFormData = {
          formName: "securityPledgeRetire",
          sysRptId: "securityPledgeRetire",
          projectName: "dbh^contract",
          UB_UNVISIBLE_MENULIST: "btnSaveDataLB,lbPageContinue",
          UB_DOCUMENT_DATA: "",

          // 개발배포
          rptProfile: "dev",
          imgUrl: "http://10.141.5.197:8110/",
          rowKey: "10"

          // 운영배포
          // rptProfile: "prod",
          // imgUrl: "https://hrmreport.dbhitek.com/",
        };

        const excludedKeys = ['toDate', 'memplNo', 'retireGbn', 'remplNo', 'host2Type', 'loginIdntClCode',  'mpgmId', 'emprt140FileDtoList', 'colNm', 'retireDate', 'loginPwResetDt', 'memplNameHan',  'effFromDate', 'remplNameHan', 'requiredFile', 'loginTitleName', 'loginInitPwdYn',  'fromDate', 'loginCoEngNm', 'role', 'loginCoId', 'retireReasonCode', 'reportId',  'loginCellularTel', 'attachInd', 'col', 'host1Ind', 'loginDeptName', 'displayOrder',  'host2Ind', 'host1Nm', 'sign', 'loginGradeName', 'docNo', 'host2Nm', 'hostType',  'loginUserId', 'host3Type', 'wfNm', 'emprt140DtoList', 'hostNm', 'loginRetireDate',  'effToDate', 'curEditTime', 'host1Type', 'detailNm', 'scomplYn', 'chk', 'loginTitleCode',  'mpgmUrlAd', 'loginUserNm', 'host3Nm', 'retireReasonName', 'hostInd', 'host3Ind',  'loginCoNm', 'loginDeptId', 'loginEntranceDate', 'wfCode', 'loginPstnName']
        const formList = Object.entries(data).filter(([key]) => !excludedKeys.includes(key))
        // 데이터 병합
        const printFormData = {
          ...staticFormData,
          ...securityDoc, // 받은 데이터를 그대로 병합
        };

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
      } catch (error: any) {
        console.log(error)
      }
    }



    if (action === "submit") {
      try {
        const response = await axiosInstance.post("/emp/dbhemprt/emprt140/saveReport", formData);
        if (response.status === 200 && response.data) {
          setOpenToast({ message: "제출이 완료되었습니다.", type: "success", open: true });
          setTimeout(async () => {
            setOpenToast((prev) => ({ ...prev, open: false }));
          }, 1000);
        } else {
          setOpenToast({ message: "제출에 실패하였습니다.", type: "danger", open: true });
        }
      } catch (error: any) {
        setOpenToast({ message: error.response?.data?.message || "오류가 발생하였습니다.", type: "danger", open: true });
      }
    }

  };


  return (
    <>
      <div className="pt-10 pb-10">
        <UIDatePicker
          type="range"
          label="퇴직희망일자"
          onDateRangeChange={(range) => setDateRange(range)}
        />
      </div>
      <div className="pt-10 pb-10">
        <UISelect
          label="완료여부"
          items={[
            {label: "전체", error: false, query: ""},
            {label: "완료", error: false, query: "Y"},
            {label: "미완료", error: false, query: "N"},
          ]}
          onQuerySelect={(value) => setCompleteYn(value)}
        />
      </div>
      <div className="pt-10 pb-100">
        <div className="count__control">
          <div className="count">총 <em>{tenureLeaveFlowData.length}</em> 건</div>
        </div>
        <ul className="list">
          {tenureLeaveFlowData.length === 0 ?
            <li className="fs-15 text-center">데이터가 없습니다.</li>
          : tenureLeaveFlowData.map((item: any, i) =>
            <li key={i}>
              <div className="list__content">
                {item.statusCode === "N" && item.rtflowId !== "D01" ?
                  <Link to={item.rtflowId === "A01" ? `/tenure/leave-survey/${item.lastWorkDate}` // 퇴직설문
                      : item.rtflowId === "A08" ? `/tenure/leave-resignation/${item.lastWorkDate}` // 퇴직사직원
                      : item.rtflowId === "A09" ? `/tenure/leave-handover/${item.lastWorkDate}` // 인수인계서
                      : `/tenure/leave-flow/${item.rtflowId}-${item.reqDate}-${item.emplNo}-${item.lastWorkDate}`
                    }
                    className="top pb-20"
                  >
                    <div className="date">기한: {item.returnDate}</div>
                    <div className="icon is-arrow__right"></div>
                  </Link>
                : item.statusCode === "N" && item.rtflowId === "D01" ?
                  // 보안서약서
                  <div className="top pb-20">
                    <div className="date">기한: {item.returnDate}</div>
                    <div className="d-flex justify-content-between">
                      {item.statusName === "미완료" ?
                        <UIAlert
                          description="제출하시겠습니까?"
                          actionProps={{
                            onClick: () => {
                              handleViewer(item, "submit")
                            },
                          }}
                        >
                          <UIButton type="secondary" size="small" className="mr-10">제출</UIButton>
                        </UIAlert>
                      : null}
                      <UIButton type="border" size="small" onClick={() => handleViewer(item, "view")}>보기</UIButton>
                    </div>
                  </div>
                :
                  <div className="top pb-20">
                    <div className="date">기한: {item.returnDate}</div>
                  </div>
                }
                <div className="info">
                  <div>
                    <strong>상태</strong>
                    <span>
                      {item.statusName === "미완료" ?
                        <UIBadge type="border" shape="square" color="red">{item.statusName}</UIBadge>
                      :
                        <UIBadge type="border" shape="square" color="green">{item.statusName}</UIBadge>
                      }
                    </span>
                  </div>
                  <div>
                    <strong>사번</strong>
                    <span>{item.mngEmpNo}</span>
                  </div>
                  <div>
                    <strong>성명</strong>
                    <span>{item.mngEmpNm}</span>
                  </div>
                  <div>
                    <strong>최종근무일</strong>
                    <span>{item.retireReqDate}</span>
                  </div>
                  <div>
                    <strong>퇴직FLOW명</strong>
                    <span>{item.rtflowNm}</span>
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