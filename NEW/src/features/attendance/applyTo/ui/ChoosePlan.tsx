import { axiosInstance } from "@/app/api/axiosInstance";
import { useAuthStore, useDateStore } from "@/app/store/authStore";
import { useApprovalForm, useApprovalLine } from "@/entities/approvalLine";
import { useApprovalDocument } from "@/entities/approvalLine";
import { useAttendanceChoosePlan } from "@/entities/attendance";
import { useUser } from "@/entities/user";
import { getDaysBetweenDates } from "@/shared/lib/daysBetweenDates";
import { UIAlert, UIButton, UIDatePicker, UIInput, UISelect, UIToast } from "@/shared/ui";
// import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import * as Popover from "@radix-ui/react-popover";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";


export const ChoosePlan = () => {
  
  const navigate = useNavigate();

  const { data: userData, isLoading: isUserLoading, error: userError } = useUser();
	if (isUserLoading) return <p>Loading...</p>;
	if (userError) return <p>Error: {userError.message}</p>;

  const { data: approvalFormData, isLoading: isApprovalFormLoading, error: approvalFormError } = useApprovalForm();
  if (isApprovalFormLoading) return <p>Loading...</p>;
  if (approvalFormError) return <p>Something went wrong!</p>;
  const selectedForm = approvalFormData?.filter((i) => i.formId === "WM")[0]
  
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
  const thisMonth = currentDate.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit' });
  const toDay = currentDate.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const [month, setMonth] = useState<string>(thisMonth);

  // // 월간 선택근로 신청
  const { data: choosePlanData, isLoading: isChoosePlanLoading, error: choosePlanError } = useAttendanceChoosePlan({emplNo: userData.loginUserId, workYymm: month.replace("-", "") });
  if (isChoosePlanLoading) return <p>Loading...</p>;
  if (choosePlanError) return <p>Something went wrong!</p>;
  const workDays = choosePlanData?.workInfo?.map((i) => i.workDays)
  const workHour = choosePlanData?.workInfo?.map((i) => i.workHour)
  const planDays = choosePlanData?.workInfo?.map((i) => i.workDays)
  
  const [selectIndex, setSelectIndex] = useState<any>();
  const [selectStartHour, setSelectStartHour] = useState<any>("08");
  const [selectStartMin, setSelectStartMin] = useState<any>("30");
  const [selectEndHour, setSelectEndHour] = useState<any>("17");
  const [selectEndMin, setSelectEndMin] = useState<any>("30");

  const calcWorkHour = (endHour: any ,startHour: any) => {
    let workHour;
    if((Number(startHour) <= 12 && Number(endHour) >= 13)){
      workHour = Number(endHour) - Number(startHour) - 1;  // 점심시간빼기      
    }else{
      workHour = Number(endHour) - Number(startHour)
    }
    if(startHour !== "00" && endHour !== "00"){
      workHour = Number(workHour) > 0 ? workHour : Number(workHour) + 24;
    }

    return workHour;
  }
  

  const sortPlanData = 
  choosePlanData.calList?.sort((sortA, sortB) => {
    return sortA.startTime.split(' ')[0].replace("-","").replace("-","") < sortB.startTime.split(' ')[0].replace("-","").replace("-","") ? -1 : sortA.startTime.split(' ')[0].replace("-","").replace("-","") > sortB.startTime.split(' ')[0].replace("-","").replace("-","") ? 1 : 0;
  });

  
  const [form, setForm] = useState({
    // files: [],
    workDays: 0,
    workHour: 0,
    planDays: 0,
    planHour: 0,
    workYymm: "",
    reqEmplNo: "",
    docNo: "",
    seqNo: "",
    statusCode: "",
    docTitlNm: "",
    formId: "",
    pgmId: "",
    mblPgmId: "",
    saveFlag: "",
    bfDocNo: "",
    reqEmplName: "",
    aprvPathOrder: "",
    // 월간 선택근로 신청
    wcplanmnthreqdtlDtoList:sortPlanData?.map((item: any, i) =>  ({
      docNo: approvalDocumentData,
      title: item.title,
      workDate: item.startTime.split(' ')[0].replace("-","").replace("-",""),
      workYymm: item.startTime.split(' ')[0].replace("-","").replace("-","").substring(0,6),
      workCode: item.workCode,
      workHour: calcWorkHour(item.endTime.split(' ')[1].substring(0,2), item.startTime.split(' ')[1].substring(0,2)),    
      startTime: item.startTime.split(' ')[1].substring(0,2) + "" + item.startTime.split(' ')[1].substring(3,5),
      endTime: item.endTime.split(' ')[1].substring(0,2) + "" + item.endTime.split(' ')[1].substring(3,5),
    })),
    // 결재선
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
    ]
  });

  const planHour = form.wcplanmnthreqdtlDtoList?.reduce((acc, item) => acc + item.workHour, 0)

    
  useEffect(() => {
    // 결재 라인-기안서 세팅
    
    setForm((prev) => ({
      ...prev,
      workDays: Number(workDays),
      workHour: Number(workHour),
      planDays: Number(planDays),
      planHour: Number(planHour),
      workYymm: thisMonth.replace("-",""),
      reqEmplNo: userData.loginUserId,
      reqEmplName: userData.loginUserNm,
      docNo: approvalDocumentData,
      seqNo: "",
      statusCode: "1",
      docTitlNm: `${selectedForm?.formName}-${userData.loginUserNm}`,
      formId: selectedForm?.formId,
      pgmId: selectedForm?.pgmId,
      mblPgmId: "",
      saveFlag: "",
      bfDocNo: "",
      wcplanmnthreqdtlDtoList:sortPlanData?.map((item: any, i) =>  ({
        docNo: approvalDocumentData,
        title: item.title,
        workDate: item.startTime.split(' ')[0].replace("-","").replace("-",""),
        workYymm: item.startTime.split(' ')[0].replace("-","").replace("-","").substring(0,6),
        workCode: item.workCode,
        workHour: calcWorkHour(item.endTime.split(' ')[1].substring(0,2), item.startTime.split(' ')[1].substring(0,2)),    
        startTime: item.startTime.split(' ')[1].substring(0,2) + "" + item.startTime.split(' ')[1].substring(3,5),
        endTime: item.endTime.split(' ')[1].substring(0,2) + "" + item.endTime.split(' ')[1].substring(3,5),
      })),      
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
  }, [userData, approvalLineData, approvalDocumentData, choosePlanData,])

  // 선택값 변경
  const handleSelectChange = (field: String ,value: any) => {
    if(field === "startHour"){
      setSelectStartHour(value)
    }else if(field === "startMin"){
      setSelectStartMin(value)
    }else if(field === "endHour"){
      setSelectEndHour(value)
    }else if(field === "endMin"){
      setSelectEndMin(value)
    }
  };

  const handleSetTime = () => {    
    form.wcplanmnthreqdtlDtoList[selectIndex].startTime = selectStartHour+""+selectStartMin;
    form.wcplanmnthreqdtlDtoList[selectIndex].endTime = selectEndHour+""+selectEndMin;
    form.wcplanmnthreqdtlDtoList[selectIndex].workHour = calcWorkHour(selectEndHour ,selectStartHour);
    setDetailData(false)
    return;
  }

  // 휴/복직 신청(+결과값 Toast 알림)
  const [openToast, setOpenToast] = useState({
    message: "",
    type: "",
    open: false
  });
  const [disableSave, setDisableSave] = useState(false);
  const [disableApply, setDisableApply] = useState(true);

  const handleSave = async () => {

    if(Number(planHour) !== Number(workHour)){
      alert("소정시간과 계획시간을 맞춰 계획하세요.");
      return false;
    }

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
      const { data } = await axiosInstance.post('/wrk/dbhdocappr/apprflex200', formData,
        // { headers: { 'Content-Type' : 'multipart/form-data' } }
      );
      if (data > 0) {
        setOpenToast({message: "저장에 성공하였습니다.", open: true, type: "success"});
        setTimeout(() => {
          setDisableSave(true);
          setDisableApply(false);
        }, 1000);
      } else {
        setOpenToast({message: "요청에 이상이 있습니다.", open: true, type: "danger"});
      }
    } catch (error: any) {
      alert(error.response.data.message.replace("<br>","\r"));
    } finally {
      setTimeout(() => {
        setOpenToast((prev) => ({ ...prev, open: false }));
      }, 1000);
    }
  }

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
    formData.set("statusCode", "3");
    try {
      const { data } = await axiosInstance.post('/system/aprvlineset', formData);
      if (data === true) {
        setOpenToast({message: "신청이 완료되었습니다.", open: true, type: "success"});
        setTimeout(() => {
          setOpenToast((prev) => ({ ...prev, open: false }));
          setDisableApply(true);
          navigate('/attendance/apply-list');
        }, 1000);
      } else {
        setOpenToast({message: "요청에 이상이 있습니다.", open: true, type: "danger"});
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


  const [detailData, setDetailData] = useState(false);
  const handleFetchDetail = async (params: any) => {
    setSelectStartHour("08");
    setSelectStartMin("30");
    setSelectEndHour("17");
    setSelectEndMin("30");
    if(getDaysBetweenDates(toDay, params.workDate) < 1 ){
      alert("금일 이전일자는 근무일정 조정이 불가합니다.");
      return false;
    }
    setOpenToast({message: "", open: false, type: "danger"});
    try {
      const { data } = await axiosInstance.get(`/wrk/dbhdocappr/apprflex200/getwrklst?start=${params.workDate}&end=${params.workDate}&emplNo=${userData.loginUserId}`)
      if (data.length > 0) {
        setDetailData(false)
        alert("선택기간중에 "+data[0].msg+ "이 존재해\r스케쥴 변경이 불가합니다.");
        return false;
      } else {
        setDetailData(true)
      }
    } catch (error: any) {
      // setOpenToast({message: error.response.msg, open: true, type: "danger"});
    }
  }

  const uiDatePickerRef = useRef<any>(null);

  const chkSelectedDate = (selectedMonth: any) => {    
    const checkDate = new Date();
    const maxMonth = new Date(checkDate.setMonth(checkDate.getMonth() +5))

    if(Number(selectedMonth.replace("-","")) < Number(thisMonth.replace("-",""))){
      alert("현재월보다 이전월은 선택할 수 없습니다.");
      uiDatePickerRef.current.viewSelectedDate(month);      
    }else if(Number(selectedMonth.replace("-","")) > Number(maxMonth.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit'}).replace("-",""))){
      alert("당월포함 6개월까지 등록할 수 있습니다.");
      uiDatePickerRef.current.viewSelectedDate(month);      
    }else{
      setMonth(selectedMonth)
      uiDatePickerRef.current.viewSelectedDate(selectedMonth);
    }
  }
  

  return (
    <>
      <div className="pt-10 pb-10">
        <UIDatePicker ref={uiDatePickerRef} label="계획월" type="year-month-choose" onMonthSelect={(value) => {
              chkSelectedDate(value.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit'}))
                //setMonth(value.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit' }));
              }} placeholder={month} />
      </div>
      <div className="pt-10 pb-10 d-flex gap-10">
        <div className="d-flex">
          <UIInput label="소정(기본)근무일수" readOnly placeholder={workDays} />
        </div>
        <div className="d-flex">
          <UIInput label="소정(기본)근무시간" readOnly placeholder={workHour} />
        </div>
      </div>
      <div className="pt-10 pb-10 d-flex gap-10">
        <div className="d-flex">
          <UIInput label="계획일수" readOnly placeholder={planDays} />
        </div>
        <div className="d-flex">
          <UIInput label="계획시간" readOnly placeholder={planHour} />
        </div>
      </div>

      <div className="pt-10 pb-100">
        <ul className="list">
          {form.wcplanmnthreqdtlDtoList?.map((item: any, index) =>
            <li key={index}>
              <div className="list__content">
                <div className="top"
                  onClick={() => {
                      setSelectIndex(index);
                      handleFetchDetail({
                      workDate: item.workDate.substring(0,4)+"-"+item.workDate.substring(4,6)+"-"+item.workDate.substring(6,8),
                    })}
                  }
                >
                  <div className="date">{item.workDate.substring(0,4)+"-"+item.workDate.substring(4,6)+"-"+item.workDate.substring(6,8)}</div>
                  <div className="icon is-arrow__right"></div>
                </div>
                <div className="info">
                  <div>
                    <strong>근무</strong>
                    <span>{item.title}</span>
                  </div>
                  <div>
                    <strong>계획 근무시간</strong>
                    <span>{item.startTime.substring(0,2)+":"+item.startTime.substring(2,4)} ~ {item.endTime.substring(0,2)+":"+item.endTime.substring(2,4)}</span>
                  </div>
                </div>
              </div>
            </li>
          )}
        </ul>
        <Popover.Root open={detailData} onOpenChange={setDetailData}>
          <Popover.Content className="d-flex flex-direction-column custom__popper">
            <h4 className="p-30">근무시간 입력</h4>
            <div className="custom__popper__in d-flex pl-20 pr-20">
              <div className="d-flex pr-10">
                <UISelect
                  label="시작시간"
                  items={[
                    {label: "06시", error: false, query: "06"},
                    {label: "07시", error: false, query: "07"},
                    {label: "08시", error: false, query: "08"},
                    {label: "09시", error: false, query: "09"},
                    {label: "10시", error: false, query: "10"},
                  ]}
                  placeholder={"08시"}
                  onQuerySelect={(value) => {
                    handleSelectChange("startHour", value)
                  }}
                />
              </div>
              <div className="d-flex align-items-end">
                <UISelect
                  items={[
                    {label: "00분", error: false, query: "00"},
                    {label: "30분", error: false, query: "30"},
                  ]}
                  placeholder={"30분"}
                  onQuerySelect={(value) => {
                    handleSelectChange("startMin", value)
                  }}
                />
              </div>
            </div>
            <div className="custom__popper__in d-flex pl-20 pr-20">
              <div className="d-flex pr-10">
                <UISelect
                  label="종료시간"
                  items={[
                    {label: "15시", error: false, query: "15"},
                    {label: "16시", error: false, query: "16"},
                    {label: "17시", error: false, query: "17"},
                    {label: "18시", error: false, query: "18"},
                    {label: "19시", error: false, query: "19"},
                    {label: "20시", error: false, query: "20"},
                    {label: "21시", error: false, query: "21"},
                    {label: "22시", error: false, query: "22"},
                  ]}
                  placeholder={"17시"}
                  onQuerySelect={(value) => {
                    handleSelectChange("endHour", value)
                  }}
                />
              </div>
              <div className="d-flex align-items-end">
                <UISelect
                  items={[
                    {label: "00분", error: false, query: "00"},
                    {label: "30분", error: false, query: "30"},
                  ]}
                  placeholder={"30분"}
                  onQuerySelect={(value) => {
                    handleSelectChange("endMin", value)
                  }}
                />
              </div>
            </div>
            <UIAlert
                description="저장하시겠습니까?"
                actionProps={{
                  onClick: () => {
                    handleSetTime()
                  },
                }}
              >
              <div className="applyAction">
                  <UIButton type="primary">저장</UIButton>
              </div>
            </UIAlert>
          </Popover.Content>
        </Popover.Root>
      </div>
      {openToast.open && (
        <UIToast message={openToast.message} type={openToast.type} open={openToast.open} onOpenChange={setOpenToast} />
      )}

<div className="applyAction">      
        <UIAlert
          description="저장하시겠습니까?"
          actionProps={{
            onClick: () => {
              handleSave()
            },
          }}
        >
          <UIButton type="border" disabled={disableSave}>저장</UIButton>
        </UIAlert>
        <UIAlert
          description="신청하시겠습니까?"
          actionProps={{
            onClick: () => {
              handleApply()
            },
          }}
        >
          <UIButton type="primary" disabled={disableApply}>결재요청</UIButton>
        </UIAlert>
      </div>
    </>
    
  )
  
}
