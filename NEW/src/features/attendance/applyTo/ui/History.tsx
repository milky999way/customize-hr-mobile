import { axiosInstance } from "@/app/api/axiosInstance";
import { useAuthStore, useDateStore } from "@/app/store/authStore";
import { useApprovalForm, useApprovalLine, useApprovalDocument } from "@/entities/approvalLine";
import { useAttendanceHistory } from "@/entities/attendance";
import { useUser } from "@/entities/user";
import { getDaysBetweenDates } from "@/shared/lib/daysBetweenDates";
import { formatByType } from "@/shared/lib/formatByType";
import { UIAlert, UIButton, UICheckbox, UIDatePicker, UIInput, UITimePicker, UIToast, UIToggleButton } from "@/shared/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const History = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    docNo: "",
    formId: "",
    reqEmplNo: "",
    reqEmplName: "",
    pgmId: "",
    mblPgmId: "",
    docTitlNm: "",
    statusCode: "",
    

    aprvPathOrder: "",
    aprvdetailDtoList: [
      {
        docNo: "",
        aprvSeqNo: 0,
        aprvType: "",
        aprvEmplNo: "",
        transInd: "",
        tarnsEmplNo: "",
        statusCode: 0
      }
    ],
    wcworktmchngreqList: [
      {
        nextDayInd : "",
        chngStartTime: "",
        chngEndTime : "", 
        chngRsn: ""
      }
    ]
  });

  const [errors, setErrors] = useState({    
    chngStartTime: false,
    chngEndTime : false,
    chngRsn: false,
});


  const { data: userData, isLoading: isUserLoading, error: userError } = useUser();
	if (isUserLoading) return <p>Loading...</p>;
	if (userError) return <p>Error: {userError.message}</p>;

  const { data: approvalFormData, isLoading: isApprovalFormLoading, error: approvalFormError } = useApprovalForm();
  if (isApprovalFormLoading) return <p>Loading...</p>;
  if (approvalFormError) return <p>Something went wrong!</p>;
  const selectedForm = approvalFormData?.filter((i) => i.formId === "CH")[0]
  
  const auth = useAuthStore((state) => state.auth);
  const { data: approvalLineData, isLoading: isApprovalLineLoading, error: approvalLineError } = useApprovalLine({
    formId: selectedForm?.formId,
    emplNo: userData.loginUserId,
  });
  if (isApprovalLineLoading) return <p>Loading...</p>;
  if (approvalLineError) return <p>Something went wrong!</p>;

  const { data: approvalDocumentData, isLoading: isApprovalDocumentLoading, error: approvalDocumentError } = useApprovalDocument(userData.loginUserId);
  if (isApprovalDocumentLoading) return <p>Loading...</p>;
  if (approvalDocumentError) return <p>Something went wrong!</p>;

  // 조회일(today)
  const {currentDate, setCurrentDate} = useDateStore();
  const toDay = currentDate.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const thisMonth = currentDate.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit' });
  const [month, setMonth] = useState<string>(thisMonth);


  // 출퇴근 기록
  const { data: historyData, isLoading: isHistoryLoading, error: historyError, refetch: refetchAttendanceHistory } = useAttendanceHistory({ emplNo: userData.userId, baseMonth: month });
  if (isHistoryLoading) return <p>Loading...</p>;
  if (historyError) return <p>Something went wrong!</p>;

  const handleMonth = (date: Date) => {
    setMonth(date.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit' }));
  }


  //검증
  const validateForm = () => {      
    
    if(form.wcworktmchngreqList[0].nextDayInd !== "Y" && (Number(form.wcworktmchngreqList[0].chngStartTime) > Number(form.wcworktmchngreqList[0].chngEndTime) ) ){
      alert("총 시간이 올바르지 않습니다.");
      return false;
    }
    const newErrors = {
        chngStartTime: !form.wcworktmchngreqList[0].chngStartTime,
        chngEndTime: !form.wcworktmchngreqList[0].chngEndTime,
        chngRsn: !form.wcworktmchngreqList[0].chngRsn,
    };
      // 상태 업데이트
    //  console.log(newErrors)
      setErrors(newErrors);

      // 오류가 없으면 true 반환
      if(Object.values(newErrors).every((error) => !error)){
        return 0;
      }else{
        return 1;
      }
  };
  
  useEffect(() => {
    // 결재 라인-기안서 세팅
    setForm((prev) => ({
      ...prev,
      docNo: approvalDocumentData,
      formId: selectedForm?.formId,
      reqEmplNo: userData.loginUserId,
      reqEmplName: userData.loginUserNm,
      pgmId: selectedForm?.pgmId,
      mblPgmId: "",
      docTitlNm: `${selectedForm?.formName}-${userData.loginUserNm}`,
      statusCode: "",

      aprvPathOrder: approvalLineData.map(item => item.emplNameHan).join("^"),
      aprvdetailDtoList: approvalLineData.map((item, index) => ({
        docNo: approvalDocumentData,
        aprvSeqNo: index + 1,
        aprvType: item.aprvType,
        aprvEmplNo: item.emplNo,
        transInd: "",
        tarnsEmplNo: "",
        statusCode: item.aprvDepth,
      }))
    }));
  }, [userData, approvalLineData, approvalDocumentData])





  // 선택값 변경
  const handleSelectChange = (field: string, value: any) => {
    setErrors((prevErrors) => ({ ...prevErrors, [field.split(".")[1]]: false })); // Clear error on change
    setForm((prevForm: any) => {
      const keys = field.split(".");
      let updatedForm = { ...prevForm };
      let current: any = updatedForm;
      keys.forEach((key: any, index) => {
        // 배열 처리를 위한 검사
        if (Array.isArray(current) && !isNaN(Number(key))) {
          key = Number(key); // 인덱스를 숫자로 변환
        }
        if (index === keys.length - 1) {
          current[key] = value; // 값 설정
        } else {
          current[key] = current[key] ? { ...current[key] } : {};
          current = current[key];
        }
      });
      return updatedForm;
    });
  };

  const handleApplySetting = (historyIndex: number) => {
    
    setForm((prev) => ({
      ...prev,
      statusCode: "3",
      wcworktmchngreqList: [
        {
          emplNo: userData.loginUserId,
          reqEmplNo: userData.loginUserId,
          reqEmplName: userData.loginUserNm,
          docNo: approvalDocumentData,
          docTitlNm: `${selectedForm?.formName}-${userData.loginUserNm}`,
          formId: selectedForm?.formId,
          pgmId: selectedForm?.pgmId,
          workDate: historyData[historyIndex].workDate,
          startTime: historyData[historyIndex].startTime,
          endTime: historyData[historyIndex].endTime,
          workHour: historyData[historyIndex].workHour,
          workHourTotal: "",
          rowKey: "0",
          rowStatus: "C",
          nextDayInd : form.wcworktmchngreqList[0].nextDayInd,
          chngStartTime: form.wcworktmchngreqList[0].chngStartTime,
          chngEndTime : form.wcworktmchngreqList[0].chngEndTime,
          chngRsn: form.wcworktmchngreqList[0].chngRsn,
        }
      ]
    }))
  }


  // 출퇴근변경 신청(+결과값 Toast 알림)
  const [openToast, setOpenToast] = useState({
    message: "",
    type: "",
    open: false
  });
  const handleApply = async () => {
    const formData = new URLSearchParams();
    const appendFormData = (data: any, parentKey = '') => {
      if (typeof data === 'object' && !Array.isArray(data)) {
        Object.entries(data).forEach(([key, value]) => {
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
    appendFormData(form);
    try {
      const response = await axiosInstance.post('/uhr/docappr/apprtmchng100', formData);
      if (response.status === 200 && response.data) {
        setOpenToast({message: "결재요청이 완료되었습니다.", open: true, type: "success"});
        setTimeout(async () => {
          setOpenToast((prev) => ({ ...prev, open: false }));
          await refetchAttendanceHistory();
          navigate('/attendance/apply-list');
        }, 1000);
      } else {
        setOpenToast({message: "결재요청에 이상이 있습니다.", open: true, type: "danger"});
        setTimeout(() => {
          setOpenToast((prev) => ({ ...prev, open: false }));
        }, 1000);
      }
    } catch (error: any) {
      setOpenToast({message: error.response.data.message, open: true, type: "danger"});
      setTimeout(() => {
        setOpenToast((prev) => ({ ...prev, open: false }));
      }, 1000);
    }
  }


  const getDayOfWeek = (date: any) => {
    const week = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = week[new Date(date).getDay()];

    return dayOfWeek;

}
  

  return (
    <>
      {/* <div className="pt-30 pb-10 text-right">
        <UIToggleButton group={["한달", "일주일"]} />
      </div> */}
      <div className="pt-10 pb-10">
        <UIDatePicker
          label="조회월"
          type="year-month"
          onMonthSelect={handleMonth}
        />
      </div>
      <div className="pt-10 pb-10">
        <div className="count__control border-none">
          <div className="count">총 <em>{historyData.length}</em> 건</div>
        </div>
        <ul className="list">
          {historyData.map((item: any, index) =>
            <li key={index}>
              <Popover>
                {getDaysBetweenDates(toDay, item.workDate) < -7 ? 
                <UIAlert description="7일 이전의 출/퇴근기록 변경은 불가합니다.">
                  <div className="list__content">
                    <div className="top">
                      <div className="date">{item.workDate}({getDayOfWeek(item.workDate)})</div>
                      <div className="icon is-arrow__right"></div>
                    </div>
                    <div className="info">
                      {/* <div>
                        <strong>근무시간</strong>
                        <span>{item.workHour}</span>
                      </div> */}
                      <div>
                        <strong>입문시간</strong>
                        <span>{item.startTime && formatByType("time", item.startTime)}</span>
                      </div>
                      <div>
                        <strong>출문시간</strong>
                        <span>{item.endTime && formatByType("time", item.endTime)}</span>
                      </div>
                    </div>
                  </div>
                </UIAlert>
                :
                <PopoverTrigger asChild className="list__content">
                  <div className="list__content">
                    <div className="top">
                    <div className="date">{item.workDate}({getDayOfWeek(item.workDate)})</div>
                      <div className="icon is-arrow__right"></div>
                    </div>
                    <div className="info">
                      {/* <div>
                        <strong>근무시간</strong>
                        <span>{item.workHour}</span>
                      </div> */}
                      <div>
                        <strong>입문시간</strong>
                        <span>{item.startTime && formatByType("time", item.startTime)}</span>
                      </div>
                      <div>
                        <strong>출문시간</strong>
                        <span>{item.endTime && formatByType("time", item.endTime)}</span>
                      </div>
                    </div>
                  </div>
                </PopoverTrigger>
                }
                <PopoverContent className="d-flex flex-direction-column custom__popper mt-160">
                  <h4 className="p-30">입/출문 기록 변경 {item.workDate}({getDayOfWeek(item.workDate)})</h4>
                  <div className="custom__popper__in pl-30 pr-30">
                    <UITimePicker
                      label="입/출문 시간"
                      type="range"
                      start={item.startTime && formatByType("time", item.startTime)}
                      end={item.endTime && formatByType("time", item.endTime)}
                      onStartTimeChange={(start) => 
                        {
                         // handleSelectChange("wcworktmchngreqList[0].chngStartTime", start ? start.replace(":", "") : item.startTime)}
                         form.wcworktmchngreqList[0].chngStartTime =  start ? start.replace(":", "") : item.startTime
                         setErrors((prevErrors) => ({ ...prevErrors, "chngStartTime": false })); // Clear error on change
                       }
                     }
                      onEndTimeChange={(end) => {
                          form.wcworktmchngreqList[0].chngEndTime =  end ? end.replace(":", "") : item.endTime
                          setErrors((prevErrors) => ({ ...prevErrors, "chngEndTime": false })); // Clear error on change
                        }
                      }
                      error={errors.chngStartTime || errors.chngEndTime}
                      hint={errors.chngEndTime || errors.chngEndTime ? "변경하실 입/출문 시간을 입력해주세요." : ""}
                    />
                  </div>
                  <div className="pt-10 pb-10 pl-30 pr-30">
                    <UICheckbox
                      label="익일여부"
                      onChecked={
                        (isChecked) => {
                          if(isChecked){
                            form.wcworktmchngreqList[0].nextDayInd = "Y";
                          }else{
                            form.wcworktmchngreqList[0].nextDayInd = "";
                          }                          
                        }
                      }
                    />
                  </div>
                  <div className="pt-10 pb-10 pl-30 pr-30">
                    <UIInput
                      label="사유"
                      onChange={(e) => {
                          // handleSelectChange("wcworktmchngreqList[0].chngRsn", e.target.value)}
                          form.wcworktmchngreqList[0].chngRsn =  e.target.value
                          setErrors((prevErrors) => ({ ...prevErrors, "chngRsn": false })); // Clear error on change
                        }
                      }
                      error={errors.chngRsn}
                      hint={errors.chngRsn? "사유를 입력해주세요." : ""}
                    />
                  </div>

                  <div className="applyAction">
                    <UIAlert
                      description="신청하시겠습니까?"
                      actionProps={{
                        onClick: () => {
                          const returnValidate = validateForm();
                          if (returnValidate === 1) {
                            setOpenToast({ message: "필수 값을 입력해주세요.", type: "danger", open: true });
                            setTimeout(() => {
                              setOpenToast((prev) => ({ ...prev, open: false }));
                            }, 1000);
                            return;
                          }else if (returnValidate === 0){
                            handleApply();
                          }
                        },
                      }}
                    >
                      <UIButton type="primary" onClick={() => handleApplySetting(index)}>결재요청</UIButton>
                    </UIAlert>
                  </div>
                </PopoverContent>
              </Popover>
            </li>
          )}
        </ul>
      </div>
      {openToast.open && (
        <UIToast message={openToast.message} type={openToast.type} open={openToast.open} onOpenChange={setOpenToast} />
      )}
    </>
  )
}