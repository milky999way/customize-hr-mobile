import { axiosInstance } from "@/app/api/axiosInstance";
import { useAuthStore, useDateStore } from "@/app/store/authStore";
import { useApprovalForm, useApprovalLine, useApprovalDocument } from "@/entities/approvalLine";
import { useAttendanceOverTime } from "@/entities/attendance";
import { useUser } from "@/entities/user";
import { getDaysBetweenDates } from "@/shared/lib/daysBetweenDates";
import { formatByType } from "@/shared/lib/formatByType";
import { UIAlert, UIButton, UICheckbox, UIDatePicker, UIInput, UIRadio, UISelect, UITimePicker, UIToast } from "@/shared/ui";
import { dataListItemPropDefs } from "@radix-ui/themes/dist/esm/components/data-list.props.js";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";


export const OverTime = () => {
  // 글로벌 필드 설정
  const [fieldDisable, setFieldDisable] = useState(false);

  const hourValue = [
    {label: "00시", error: false, query: "00"},
    {label: "01시", error: false, query: "01"},
    {label: "02시", error: false, query: "02"},
    {label: "03시", error: false, query: "03"},
    {label: "04시", error: false, query: "04"},
    {label: "05시", error: false, query: "05"},
    {label: "06시", error: false, query: "06"},
    {label: "07시", error: false, query: "07"},
    {label: "08시", error: false, query: "08"},
    {label: "09시", error: false, query: "09"},
    {label: "10시", error: false, query: "10"},
    {label: "11시", error: false, query: "11"},
    {label: "12시", error: false, query: "12"},
    {label: "13시", error: false, query: "13"},
    {label: "14시", error: false, query: "14"},
    {label: "15시", error: false, query: "15"},
    {label: "16시", error: false, query: "16"},
    {label: "17시", error: false, query: "17"},
    {label: "18시", error: false, query: "18"},
    {label: "19시", error: false, query: "19"},
    {label: "20시", error: false, query: "20"},
    {label: "21시", error: false, query: "21"},
    {label: "22시", error: false, query: "22"},
    {label: "23시", error: false, query: "23"},
  ]

  
  

  const navigate = useNavigate();
  // 조회일(today)
  const {currentDate, setCurrentDate} = useDateStore();
  const toDay = currentDate.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const [day, setDay] = useState<string>(toDay);

  const [form, setForm] = useState({
    filePath: "SYSTEM,PGMG",
    emplNo: "",
    emplNameHan: "",
    orgNameHan: "",
    positionNameHan: "",
    titleNameHan: "",
    otCode: "",
    workDate: day,
    nextDayInd: "",
    endDate: "",
    startHour: "",
    startMin: "",
    endHour: "",
    endMin: "",
    otTime: 0,
    workHour: "",
    reqRsnCode: "",
    befDayInd: "",
    otRsn: "",
    atchFileId: "",
    reqEmplNo: "",
    reqEmplName: "",
    reqDate: "",
    docNo: "",
    statusCode: "",
    docTitlNm: "",
    formId: "",
    pgmId: "",
    mblPgmId: "",
    saveFlag: "",
    bfDocNo: "",
    workCode: "",
    workPt: "",
    realWorkPt: "",
    befDay: "",
    startTime: "",
    endTime: "",
    shftPt: "",
    jobGroupCode: "",
    otKind: "",
    aprvPathOrder: "",
    aprvdetailDtoList: [
      {
        docNo: "",
        aprvType: "",
        aprvEmplNo: "",
        transInd: "",
        tarnsEmplNo: "",
        aprvSeqNo: 0,
        statusCode: 0
      }
    ]
  });

  const [errors, setErrors] = useState({    
    workDate: false,
    startHour: false,
    startMin: false,
    endHour: false,
    endMin: false,
    reqRsnCode: false,
    otRsn: false    
  });

  const { data: userData, isLoading: isUserLoading, error: userError } = useUser();
	if (isUserLoading) return <p>Loading...</p>;
	if (userError) return <p>Error: {userError.message}</p>;

  const { data: approvalFormData, isLoading: isApprovalFormLoading, error: approvalFormError } = useApprovalForm();
  if (isApprovalFormLoading) return <p>Loading...</p>;
  if (approvalFormError) return <p>Something went wrong!</p>;
  const selectedForm = approvalFormData?.filter((i) => i.formId === "OW")[0]
  
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


  const calcYesterDay = (workDate:any) => {   
    const tmpDay = new Date(formatByType("date",workDate));
    tmpDay.setDate(tmpDay.getDate() -1);
    return tmpDay.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

    const hourArea = useRef<HTMLDivElement>(null);
    // 초과근무 관련 세팅값
    const { data: overTimeData, isLoading: isOverTimeLoading, error: overTimeError } = useAttendanceOverTime({
      emplNo: userData.loginUserId,
      workDate: form.workDate,
      befDay: calcYesterDay(form.workDate)
    });
    
    if (isOverTimeLoading) return <p>Loading...</p>;
    if (overTimeError) return <p>Something went wrong!</p>;
    const [selectHourItem, setSelectHourItem] = useState<string>("0");
    // console.log(overTimeData)
    
    if(overTimeData[0]?.shftPt !== "C"){      
      if(hourArea.current){
        hourArea.current.style.setProperty("display","block");
      }
    }

  //검증
  const validateForm = () => {      
    const newErrors = {
      workDate: !form.workDate,                 //근무일
      startHour: form.shftPt !== 'C' && !form.startHour,
      startMin: form.shftPt !== 'C' && !form.startMin,
      endHour: form.shftPt !== 'C' && !form.endHour,
      endMin: form.shftPt !== 'C' && !form.endMin,
      reqRsnCode: !form.reqRsnCode,
      otRsn: !form.otRsn,
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
      files: [],
      filePath: "SYSTEM,PGMG",
      emplNo: userData.loginUserId,
      emplNameHan: userData.loginUserNm,
      orgNameHan: userData.loginDeptName,
      positionNameHan: userData.loginPstnName,
      titleNameHan: userData.loginTitleName,
      // otKind: "",     
      // workDate: overTimeData[0],
      // startHour: "19",
      // startMin: "00",
      // endHour: "22",
      // endMin: "00",
      otTime: 0,
      befDayInd:"N",
      // reqRsnCode: "1",      
      // otRsn: "",
      // atchFileId: "",
      // reqDate: "",
      // mblPgmId: "",
      // saveFlag: "",
      // bfDocNo: "",
      // befDay: "20241128",
      // startTime: "1900",
      // endTime: "2200",
      nextDayInd: "N",
      endDate: "",
      workCode: overTimeData[0]?.workCode,
      realWorkPt: overTimeData[0]?.realWorkPt,
      otCode: overTimeData[0]?.realWorkPt === "O"? 'D1' : 'H1',
      shftPt: overTimeData[0]?.shftPt,
      jobGroupCode: overTimeData[0]?.jobGroupCode,
      workPt: overTimeData[0]?.workPt,
      reqEmplNo: userData.loginUserId,
      reqEmplName: userData.loginUserNm,
      docNo: approvalDocumentData,
      statusCode: "1",
      docTitlNm: `${selectedForm?.formName}-${userData.loginUserNm}`,
      formId: selectedForm?.formId,
      pgmId: selectedForm?.pgmId,
      
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
  }, [userData, approvalLineData, approvalDocumentData, overTimeData, selectHourItem])


  // 선택값 변경
  const handleSelectChange = (field: string, value: any) => {
    setErrors((prevErrors) => ({ ...prevErrors, [field]: false })); // Clear error on change
  
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

  // 초과근무 신청(+결과값 Toast 알림)
  const [openToast, setOpenToast] = useState({
    message: "",
    type: "",
    open: false
  });
  const [disableSave, setDisableSave] = useState(false);
  const [disableApply, setDisableApply] = useState(true);


  const handleSave = async () => {
    if(getDaysBetweenDates(toDay, formatByType("date", form.workDate)) < 1){
      alert(toDay + " 이전일 날짜는 선택 불가합니다.");
      return false;
    }
    if(form.shftPt !== "C" && form.befDayInd !== "Y" && (Number(form.endHour) ===  Number(form.startHour))){
      alert("시작시간과 종료시간이 동일합니다.\r시간을 다시 입력해주세요.");
      return false;
    }

    if(form.shftPt === "C" && selectHourItem === "0"){        
      alert("근무시간을 선택해주세요.")
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
   
    if((Number(form.endHour) - Number(form.startHour)) > 0 ){
      form.endDate = formatByType("date", form.workDate);
      form.nextDayInd = "N";  
    }else{
      const tmpDay = new Date(formatByType("date",form.workDate));
      tmpDay.setDate(tmpDay.getDate() +1);
      form.endDate = tmpDay.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace("-","").replace("-","");
      form.nextDayInd = "Y";
      form.befDay = calcYesterDay(form.workDate).replace("-","").replace("-","");
    }

    form.otTime = Number(calcOverTimeHour());
    form.workHour = selectHourItem;
    if(form.shftPt === 'C'){
      form.nextDayInd = "N";  
      form.otTime = Number(form.workHour);
      form.startHour = "00";
      form.startMin = "00";
      form.startTime = "0000";
      form.endHour = "00";
      form.endMin = "00";
      form.endTime = "0000";
      if(form.workHour == "8N"){
        form.otTime = 8;
        form.otKind = "N";
      }else if(form.workHour == "4D1") {
          form.otTime = 4;
      }else {
          form.otKind = "";
      }
    }

    
    form.workDate =  formatByType("date", form.workDate);
    form.otCode = form.realWorkPt === "-"? 'H1' : 'D1';
    

    appendFormData(form);
    
    try {
      const { data } = await axiosInstance.post('/uhr/docappr/approvtm200', formData);
      if (data > 0 || data.docNo) {
        setOpenToast({message: "임시저장이 완료되었습니다.", open: true, type: "success"});
        setTimeout(() => {
          setFieldDisable(true);
          setOpenToast((prev) => ({ ...prev, open: false }));
          setDisableSave(true);
          setDisableApply(false);
          setForm((prevForm) => ({
            ...prevForm,
            statusCode: "3",
          }));
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


  const calcOverTimeHour = () =>{
    let overTimeHour = "";
    
    if(form.endHour !== ""){
      if((Number(form.endHour) - Number(form.startHour)) > 0 ){
      overTimeHour = (Number(form.endHour) - Number(form.startHour)) + ""
     }else{ 
      overTimeHour = (Number(form.endHour) - Number(form.startHour)) + 24 + ""
     }
    }

     if(form.startMin === "30" && form.endMin === "00"){
      overTimeHour = Number(overTimeHour) -1 + ".5";
     }else if(form.startMin === "00" && form.endMin === "30"){
      overTimeHour = Number(overTimeHour) + ".5";
     }
    return overTimeHour;
  }

  return (
    <>
      <div className="pt-10 pb-10">
        <UIDatePicker
          label="근무일"
          onDateSelect={(value) => handleSelectChange("workDate", value)}
          placeholder={day}
          readOnly={fieldDisable}
          error={errors.workDate }
          hint={errors.workDate ? "근무일을 선택해주세요." : ""}            
        />
      </div>
      <div className="pt-10 pb-10">
        <UISelect
          label="근무구분"
          placeholder={form.realWorkPt === "-" ? "휴일근무" : "연장근무"}
          readOnly
        />
      </div>
      {form.workPt === 'N'?
      <div className="d-flex pt-10 pb-10">
          <UICheckbox          
            label="전일여부"
            onChecked={
              (isChecked) => {
                if(isChecked){
                  form.befDayInd = "Y";
                }else{
                  form.befDayInd = "N";
                }                          
              }                 
            }
            
          />
      </div>
      :null}
      {form.shftPt !== "C" ?
      <div ref={hourArea} style={{ display : "none" }}>
      <div className="pt-10 pb-10 d-flex gap-10">
        <div className="d-flex">
          <UISelect
            label="시작시간"
            items={hourValue}
            readOnly={fieldDisable}
            onQuerySelect={(hour) => {
              handleSelectChange("startHour", hour)
              form.startMin = '00';
              handleSelectChange("startMin", '00')
              handleSelectChange("endMin", '00')
              handleSelectChange("startTime", hour + form.startMin)
            }}
            error={errors.startHour }
            hint={errors.startHour ? "시작시간을 선택해주세요." : ""}            
          />
        </div>
        <div className="d-flex align-items-end">
          <UISelect
            items={[
              {label: "00분", error: false, query: "00"},
              {label: "30분", error: false, query: "30"},
            ]}
            onQuerySelect={(minute) => {
              handleSelectChange("startMin", minute)
              handleSelectChange("startTime", form.startHour + minute)
            }}
            placeholder={form.endMin ? `${form.endMin}분` : '00분'}
            readOnly={fieldDisable}
            error={errors.startMin }
            hint={errors.startMin ? "시작시간을 선택해주세요." : ""}            
          />
        </div>
      </div>

      <div className="pt-10 pb-10 d-flex gap-10">
        <div className="d-flex">
          <UISelect
            label="종료시간"
            items={hourValue}
            onQuerySelect={(hour) => {
              handleSelectChange("endHour", hour)
              handleSelectChange("endTime", hour + form.endMin)
            }}
            readOnly={fieldDisable}
            error={errors.endHour }
            hint={errors.endHour ? "종료시간을 선택해주세요." : ""}            
          />
        </div>
        <div className="d-flex align-items-end">
          <UISelect
            placeholder={form.endMin ? `${form.endMin}분` : '00분'}
            items={[
              {label: "00분", error: false, query: "00"},
              {label: "30분", error: false, query: "30"},
            ]}
            onQuerySelect={(minute) => {
              handleSelectChange("endMin", minute)
              handleSelectChange("endTime", form.endHour + minute)
            }}
            error={errors.endMin }
            hint={errors.endMin ? "종료시간을 선택해주세요." : ""}       
          />
        </div>
      </div>
      <div className="pt-10 pb-10">
        <UIInput label="초과시간" readOnly value={calcOverTimeHour()} />
      </div>
    </div>
      :
      <div className="pt-10 pb-10">        
        <div className="select__box pb-5">
          <label className="select__label">근무시간</label>
        </div>
        <div className="d-flex">
            <UIRadio
                    items={form.realWorkPt === "-" ?
                      [{label: "4시간", value: "4"},
                        {label: "6시간", value: "6"},
                        {label: "8시간", value: "8"},
                        {label: "야간8시간", value: "8N"},

                      ] :
                      [{label: "2시간", value: "2"},
                        {label: "3시간", value: "3"},
                        {label: "4시간", value: "4D1"},
                        ]
                    }
                    onItemSelect={(value) => {
                      setSelectHourItem(value)
                    }}
                    name="근무시간"    
            />
        </div>
      </div>
      
      }
      <div className="pt-10 pb-10">
        <UISelect
          label="신청사유"
          items={[
            {label: "장비에러 대응", error: false, query: 1},
            {label: "결원인원 업무대응", error: false, query: 2},
            {label: "긴급고객대응", error: false, query: 3},
            {label: "긴급개발과제", error: false, query: 4},
            {label: "긴급업무대응", error: false, query: 5},
            {label: "주말당직근무", error: false, query: 6},
            {label: "기타", error: false, query: 7}
          ]}
          onQuerySelect={(value: any) => {
            handleSelectChange("reqRsnCode", value);
          }}
          readOnly={fieldDisable}
          error={errors.reqRsnCode }
          hint={errors.reqRsnCode ? "신청사유를 선택해주세요." : ""}    
        />
      </div>
      <div className="pt-10 pb-100">
        <UIInput label="상세사유" onChange={(e) => handleSelectChange("otRsn", e.target.value) } readOnly={fieldDisable}
          error={errors.otRsn }
          hint={errors.otRsn ? "상세사유를 입력해주세요." : ""}    
          />
      </div>

      <div className="applyAction">
        <UIAlert
          description="저장하시겠습니까?"
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
                handleSave();
              }
            },
          }}
        >
          <UIButton type="border" disabled={disableSave}>저장</UIButton>
        </UIAlert>
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
          <UIButton type="primary" disabled={disableApply}>결재요청</UIButton>
        </UIAlert>
      </div>
      {openToast.open && (
        <UIToast message={openToast.message} type={openToast.type} open={openToast.open} onOpenChange={setOpenToast} />
      )}
    </>
  )
}