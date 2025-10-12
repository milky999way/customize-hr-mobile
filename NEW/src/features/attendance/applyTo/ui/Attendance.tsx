import { axiosInstance } from "@/app/api/axiosInstance";
import { useAuthStore, useDateStore } from "@/app/store/authStore";
import { useApprovalForm, useApprovalLine } from "@/entities/approvalLine";
import { useApprovalDocument } from "@/entities/approvalLine";
import { useAttendanceKind, useAttendanceRemain } from "@/entities/attendance";
import { useUser } from "@/entities/user";
import { getDaysBetweenDates } from "@/shared/lib/daysBetweenDates";
import { formatByType } from "@/shared/lib/formatByType";
import { UIAlert, UIButton, UIDatePicker, UIIconButton, UIInput, UISelect, UITimePicker, UIToast } from "@/shared/ui";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";


export const Attendance = () => {
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
  const { data: userData, isLoading: isUserLoading, error: userError } = useUser();
	if (isUserLoading) return <p>Loading...</p>;
	if (userError) return <p>Error: {userError.message}</p>;

  const { data: approvalFormData, isLoading: isApprovalFormLoading, error: approvalFormError } = useApprovalForm();
  if (isApprovalFormLoading) return <p>Loading...</p>;
  if (approvalFormError) return <p>Something went wrong!</p>;
  const selectedForm = approvalFormData?.filter((i) => i.formId === "LAP")[0]
  
  let { data: approvalLineData, isLoading: isApprovalLineLoading, error: approvalLineError } = useApprovalLine({
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
  const [day, setDay] = useState<string>(toDay);

  // 잔여연차
  const { data: attendanceRemain, isLoading: isAttendanceRemainLoading, error: attendanceRemainError } = useAttendanceRemain({
    emplNo: userData.loginUserId,
    emplNameHan: userData.loginUserNm,
    orgNameHan: userData.loginDeptName,
    positionNameHan: userData.loginPstnName,
    titleNameHan: userData.loginTitleName,
    reqEmplNo: userData.loginUserId,
    reqEmplName: userData.loginUserNm,
    entranceDate: userData.loginEntranceDate,

    startDate: day,
    endDate: day,
    cncDay: day,
    startHour: "00",
    startMin: "00",
    endHour: "00",
    endMin: "00",
  })
  if (isAttendanceRemainLoading) return <p>Loading...</p>;
  if (attendanceRemainError) return <p>Something went wrong!</p>;
  // console.log(attendanceRemain);
  
  // 근태종류
  const { data: attendanceKind, isLoading: isAttendanceKindLoading, error: attendanceKindError } = useAttendanceKind();
  if (isAttendanceKindLoading) return <p>Loading...</p>;
  if (attendanceKindError) return <p>Something went wrong!</p>;
  const workCodeKind = attendanceKind.map((item) => { return {label: item.codeNameHan, error: false, query: item.workCodeKind}})
  

  const [lveCnt, setLveCnt] = useState<string>();
  const [calcDays, setCalcDays] = useState<number>();
  const [gubun, setGubun] = useState<string>();
  const [startHour, setStartHour] = useState<string>();
  const [endHour, setEndHour] = useState<string>();
  const [grantField, setGrantField] = useState<boolean>(false);
  const [calcField, setCalcField] = useState<boolean>(false);

  const [optionField, setOptionField] = useState<boolean>(false);
  const [dayField, setDayField] = useState<boolean>(false);
  const [startDayField, setStartDayField] = useState<boolean>(false);
  const [timeField, setTimeField] = useState<boolean>(false);
  const [fileField, setFileField] = useState<boolean>(false);

  const [womanField, setWomanField] = useState<boolean>(false);
  const [pregnancyField, setPregnancyField] = useState<boolean>(false);
  const [familyField, setFamilyField] = useState<boolean>(false);
  const [familyEvent, setFamilyEvent] = useState();
  const [familyEventTarget, setFamilyEventTarget] = useState([]);
  const defaultFamilyEventTarget =  [{label: "선택해주세요", error: false, query: ""},]
  
  
  const handleSelectKind = async (code: any) => {
    setDateRangeCalcError(false)
    setDateCalcError(false)
    setTimeCalcError(false)
    // 필드 초기화
    setForm((prev) => ({
      ...prev,
      holidays: "",
      startDate: "",
      endDate: "",
      wrkGubun: "",
      startHour: "",
      startMin: "",
      endHour: "",
      endMin: "",
      hours: 0,
      fullDay: "",
      workCodeKind: "",
      cncCode: "",
      lveCnt: "",
      startTime: "",
      endTime: "",
      chkStartTime: "",
      chkEndTime: "",
      periodDays: 0,
      cncDay: day
    }))

    // 결재라인 변경
    const { data } = await axiosInstance.get(`/system/aprvlineset/default?formId=${selectedForm?.formId}&emplNo=${userData.loginUserId}&workCode=${code}`)
    
    setForm((prev) => ({
      ...prev,
      aprvPathOrder: data.map((item: any) => item.emplNameHan).join("^"),
      aprvdetailDtoList: data.map((item: any, index: any) => ({
        docNo: approvalDocumentData,
        aprvSeqNo: index + 1,
        aprvType: item.aprvType,
        aprvEmplNo: item.emplNo,
        transInd: "",
        tarnsEmplNo: "",
        statusCode: item.aprvDepth,
      }))
    }))
    
  if( code === "LP1"){ //공가(항군)
    resetAllField();
    setOptionField(true)
    setDayField(true)
    setFileField(true) 
  }else if( code === "LP2"){ //공가(건강검진)
    setGubun("TM")
    resetAllField();
    setDayField(true)
    setTimeField(true)
    setForm((prev) => ({
      ...prev,
      startMin : "00",
      endMin : "00"
    }))
    
  }else if (code === "LB5"){ //출산휴가(본인)
    resetAllField();
    setDayField(true)
    setPregnancyField(true)
    setFileField(true)
    
  }else if (code === "LB1"){ //유사산휴가
    resetAllField();
    setDayField(true)
    setWomanField(true)
    setFileField(true)

   }else if( code === "LB"){ //태아검진
    resetAllField();
    setGubun("TM")
    setDayField(true)
    setTimeField(true)
    setFileField(true) 
    setForm((prev) => ({
      ...prev,
      startMin : "00",
      endMin : "00"
    }))

  }else if( code === "LMR"){ //여성보건휴가(MR)
    resetAllField();
    setDayField(true)
  }else if( code === "LB3"){ //난임치료휴가
    resetAllField();
    setDayField(true)    
    setFileField(true)    
  } else if (code === "LI") { //경조휴가
    setLveCnt("0/0");
    setCalcDays(0);
    resetAllField();
    setDayField(true)
    setFamilyField(true)
    setFileField(true)
      try {
        const { data } = await axiosInstance.get(`/wrk/dbhabsappr/apprattd100/cncCode`);
        const famEvent = data.map((famItem: any) => { return {label: famItem.cncCodeNameHan, error: false, query: famItem.cncCode}})
        setFamilyEvent(famEvent);
      } catch (error) {
        console.log(error)
      }
    } else {
      resetAllField(); 
      try {
        const { data } = await axiosInstance.get(`/wrk/dbhabsappr/apprattd100/showoptions?workCodeKind=${code}`);
        if (data.length === 0 || code === "LC") {
          setGrantField(true); // 부여시간 필드
          setGubun(""); // 부여시간은 시작일자로 표기
          
          const grantData = await axiosInstance.get(`/wrk/dbhabsappr/apprattd100/wrkLveCnt?emplNo=${userData.loginUserId}&startDate=${day}&endDate=${day}&workCodeKind=${code}`);

          if(code === "LC"){
            setForm((prev) => ({
              ...prev,
              holidays : "1/10"
            }))
          }else{
            setForm((prev) => ({
              ...prev,
              holidays: grantData.data
            })) // 부여날짜 호출
          }
          
          //종료일자 input으로 변경
          if (code === "LR" || code === "LW") {
            setDayField(false)
            setStartDayField(true)
          }else{
            setStartDayField(false)
            setDayField(true)
          }
          
        } else {

          // console.log(data);
          data.forEach((field: any) => {
            if (field === 'timeInd') {
              setOptionField(true)
              setDayField(false)
              setTimeField(false)
              setFileField(false)
              setCalcField(true)
            }
  
            if (field === 'atchInd') {
              setOptionField(false)
              setDayField(false)
              setTimeField(false)
              setFileField(true)
              setForm((prev) => ({
                ...prev,
                startMin : "00",
                endMin : "00"
              }))
            }
  
            if (field === 'rsnInd') {
              setOptionField(false)
              setDayField(false)
              setTimeField(false)
              setFileField(false)
            }
  
            if (field === 'rsnInd' && field === 'atchInd') {
              setDayField(true)
              setFileField(true)
            }
          })
        }
      } catch (error) {
        console.log(error)
        resetAllField();
      }
    }
  }

  const resetAllField = () => {
    setGubun("01")
    form.wrkGubun = "01"
    setOptionField(false)
    setDayField(false)
    setWomanField(false)
    setPregnancyField(false)
    setStartDayField(false)
    setFamilyField(false)
    setTimeField(false)
    setFileField(false)
    setGrantField(false)
    setCalcField(false)
    handleFileRemove(0)
  }

  const [form, setForm] = useState({
    statusCode: "1",
    startDate: "",
    endDate: "",
    workCodeKind: "",
    wrkGubun: "",
    fullDay: "",
    startHour: "",
    startMin: "",
    endHour: "",
    endMin: "",
    hours: 0,
    startTime: "",
    endTime: "",
    days: 0,
    chkStartTime: "",
    chkEndTime: "",
    workPt: "",
    workTime: "",
    shftPt: "",
    holIncYn: "",
    holidays: "",
    cncCode: "",
    cncDay: "",
    relCode: "",
    lveCnt: "",
    maternityCode: "",
    periodCode: "",
    periodDays: 0,
    reqRsn: "",
    atchFileId: "",
    mblPgmId: "",
    saveFlag: "",
    bfDocNo: "",
    rangeDays: "",
    checkEndDate: "",
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
    ]
  });

  const [errors, setErrors] = useState({
    workCodeKind: false,      
    wrkGubun: false,          
    statusCode: false,
    startDate: false,
    endDate: false,
    
    fullDay: false,
    startHour: false,
    startMin: false,
    endHour: false,
    endMin: false,
    hours: false,
    startTime: false,
    endTime: false,    
    chkStartTime: false,
    chkEndTime: false,
    workPt: false,
    workTime: false,
    shftPt: false,
    holIncYn: false,
    holidays: false,
    cncCode: false,
    relCode: false,
    lveCnt: false,
    maternityCode: false,
    periodCode: false,
    periodDays: false,
    reqRsn: false,
    selectedFiles: false,
    mblPgmId: false,
    saveFlag: false,
    bfDocNo: false,
    rangeDays: false,
    checkEndDate: false,
    aprvPathOrder: false,
    cncDay: false,
  });

  const chkUpdateEndDate = (startHour : any, endHour : any) => {
    if(Number(endHour) < Number(startHour)){
      //통상 아닐 시 종료시간 계산하여 종료일 +1
      const tmpDay = new Date(form.startDate);
      tmpDay.setDate(tmpDay.getDate() +1);
      setForm((prev) => ({
        ...prev,
        endDate : tmpDay.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' })
      }))
    }else{
      setForm((prev) => ({
        ...prev,
        endDate : form.startDate,
      }))
    }
  }

  //경조휴가 선택일수와 휴가일수 비교
  const checkFamilyFieldDays = () => {
    if( Number(form.lveCnt) < Number(calcDays)){
      return true;
    }else{
      return false;
    }
  }

  //경조휴가 -> 발생일자와 출산일수(90일) 비교
  const checkFamilyPregnancyDays = () => {
    const chkDays = form.endDate === "" ? 0 : getDaysBetweenDates(formatByType("date",form.cncDay), form.endDate);
   
    if( pregnancyField && form.maternityCode === '01' && Number(form.periodDays) > 90){
      alert("출산휴가는 90일 이내에 사용가능합니다.")
      return true;
    }else if( pregnancyField && form.maternityCode === '02' && Number(form.periodDays) > 120){
      alert("출산휴가는 120일 이내에 사용가능합니다.")
      return true;
    }else if(pregnancyField && form.maternityCode === "01" && form.periodDays < 45) {      
        alert("출산 예정일로부터 최소 45일 이상 사용해야 합니다.")
        return false;
    } else if (pregnancyField && form.maternityCode === "02" && form.periodDays < 60) {
        alert("출산 예정일로부터 최소 60일 이상 사용해야 합니다.")
        return false;    
    }else if(womanField && form.periodCode === '01' && chkDays > 5){
      alert("발생일로부터 5 이내에 사용가능합니다.")
      return true;
    }else if(womanField && form.periodCode === '02' && chkDays > 10){
      alert("발생일로부터 10일 이내에 사용가능합니다.")
      return true;
    }else if(womanField && form.periodCode === '03' && chkDays > 30){
      alert("발생일로부터 30일 이내에 사용가능합니다.")
      return true;
    }else if(womanField && form.periodCode === '04' && chkDays > 60){
      alert("발생일로부터 60일 이내에 사용가능합니다.")
      return true;
    }else if(womanField && form.periodCode === '05' && chkDays > 90){
      alert("발생일로부터 90일 이내에 사용가능합니다.")
      return true;
    }else{
      return false;
    }
  }

  const chkThisYear =(startDate : Date, endDate : Date) =>{
    const thisYear = new Date().getFullYear();
    if(startDate.getFullYear() != thisYear || endDate.getFullYear() != thisYear ){
      return false;
    }else{
      return true;
    }
  }
   //검증
   const validateForm = () => {        
    const twoDayAgo = getDaysBetweenDates(toDay, form.startDate)
    if (twoDayAgo < -1) {
      alert("근무일 기준으로 2일 이전의 근태는 신청할 수 없습니다.")
      return false;
    }else if(getDaysBetweenDates(form.startDate, form.endDate) < 1){
      alert("종료일자가 시작일자 이전입니다.");
      return false;  
    }else if(familyField && form.relCode !== ""){ // 경조휴가 시 휴가일수 체크
      if(checkFamilyFieldDays()){
        alert("사용가능한 휴가일수를 초과하였습니다.")
        return false;
      }
      if(form.cncCode === '09' || form.cncCode === '10' || form.cncCode === '11'){
        if(checkFamilyPregnancyDays()){
          return false;
        }
      } 
    }else if(form.workCodeKind === "LB" && Number(form.hours) > 4){
      alert("태아검진은 최대 4시간까지 사용가능합니다.");
      return false;     
             
    }else if(form.startDate !== '' && form.endDate !== '' && form.workCodeKind === "LNP" && attendanceRemain.rmnLve > 0){
      alert("무급휴가는 잔여연차가 없는 경우에만 신청 가능하며, \r\n 연간 최대 10일까지만 사용 가능합니다.");
      return false;
    }else if(form.startDate !== '' && form.endDate !== '' && grantField && Number(form.holidays) < 1){
      alert("부여휴가일수가 존재하지 않습니다.")
      return false;
    }else if(form.workCodeKind !== 'LI' && form.workCodeKind !== 'LW' && form.workCodeKind !== 'LB1' && form.workCodeKind !== 'LB5' && form.startDate !== '' && form.endDate !== '' && !chkThisYear(new Date(form.startDate), new Date(form.endDate))){
      alert("휴가는 당해년도 내에서만 사용가능합니다")
      return false;
    }else if(form.workPt !== 'N' && Number(form.endTime) < Number(form.startTime)){      
      alert("근태신청은 근무스케줄 내에서 등록 가능합니다.\n"+form.chkStartTime+"~"+form.chkEndTime+"")        
      return false;          
    } else if (gubun === "TM" && ( ((Number(form.chkStartTime) > Number(form.startTime))) || (Number(form.chkEndTime) < Number(form.endTime) ))) {
      if((form.chkStartTime !== '0000' && form.chkEndTime !== '0000' )){
        alert("근태신청은 근무스케줄 내에서 등록 가능합니다.\n"+form.chkStartTime+"~"+form.chkEndTime+"")        
        return false;
      }
   
    }else if (pregnancyField || womanField){ //출산휴가 본인
      
      if(checkFamilyPregnancyDays()){        
        return false;
      }   
     
    }else if (form.holidays !== "" && (form.days > Number(form.holidays))) {
      alert("부여된 휴가일수를 초과할 수 없습니다.")
      setForm((prev) => ({
        ...prev,
        startDate: "",
        endDate: "",
        chkStartTime: "",
        chkEndTime: "",
        startTime: "",
        endTime: "",
        hours: 0,
        shftPt: "",
        fullDay: "",
        periodDays: 0,
      }))
      return 9;
    }    
          
   
    const newErrors = {
      workCodeKind: !form.workCodeKind,        //근태종류
      wrkGubun: !womanField && optionField && !form.wrkGubun,     //전일,시간 구분
  // statusCode: false,
      startDate: !form.startDate,                 //시작일자
      endDate: !form.endDate,                     //종료일자

      cncCode: familyField && !form.cncCode,      //경조휴가 선택 시 =>  사유
      relCode: familyField && !form.relCode && form.relCode === '',      //경조휴가 선택 시 =>  관계 
      startHour: timeField && !form.startHour,
      startMin: timeField && !form.startMin,
      endHour: timeField && !form.endHour,
      endMin:  timeField && !form.endMin,
      hours: timeField && !form.hours,
      startTime:  timeField && !form.startTime,
      endTime:  timeField && !form.endTime,
      selectedFiles : fileField && !selectedFiles,
      cncDay : ( womanField || pregnancyField || familyField) && !form.cncDay,
      periodCode: womanField && !form.periodCode,
      maternityCode :  pregnancyField && !form.maternityCode,
    };
     // 상태 업데이트
     
     setErrors(newErrors);

     // 오류가 없으면 true 반환
     if(Object.values(newErrors).every((error) => !error)){
      return 0;
     }else{
      return 1;
     }
  }


   useEffect(  ()  =>  { 
       // 결재 라인-기안서 세팅
    setForm((prev) => ({
      ...prev,
      files: [],
      filePath: "SYSTEM,PGMG",
      startHour: "00",
      startMin: "00",
      endHour: "00",
      endMin: "00",

      docTitlNm: `${selectedForm?.formName}-${userData.loginUserNm}`,
      formId: selectedForm?.formId,
      pgmId: selectedForm?.pgmId,
      reqEmplNo: userData.loginUserId,
      reqEmplName: userData.loginUserNm,
      entranceDate: userData.loginEntranceDate,
      emplNo: userData.loginUserId,
      emplNameHan: userData.loginUserNm,
      orgNameHan: userData.loginDeptName,
      positionNameHan: userData.loginPstnName,
      titleNameHan: userData.loginTitleName,
      lyLveDays: attendanceRemain.lyLveDays,
      lyUseDays: attendanceRemain.lyUseDays,
      rmnLve: attendanceRemain.rmnLve,
      docNo: approvalDocumentData,     
    }));
  }, [userData, approvalLineData, approvalDocumentData, attendanceRemain])


  const [dateRange, setDateRange] = useState({
    fromDate: "",
    toDate: ""
  });
  // const handleDateRangeChange = async (range: any) => {
  //   setDateRange(range);
  //   // 휴가 구분(전일 일 때 계산) - wrkGubun: 01
  //   const { data: calcDayTimeRange } = await axiosInstance.get(`/wrk/dbhabsappr/apprattd100/findCalc?emplNo=${userData.loginUserId}&startDate=${range.fromDate}&endDate=${range.toDate}&wrkGubun=01`);
  //   const { data: checkWorkTypeRange } = await axiosInstance.get(`/wrk/dbhabsappr/apprattd100/chkTimeInd?emplNo=${userData.loginUserId}&startDate=${range.fromDate}`);
  //   const cDay = getDaysBetweenDates(range.fromDate, range.toDate) - calcDayTimeRange.;

  //   setForm((prev) => ({
  //     ...prev,
  //     chkStartTime: checkWorkTypeRange[0].startTime,
  //     chkEndTime: checkWorkTypeRange[0].endTime,
  //     startTime: checkWorkTypeRange[0].startTime,
  //     endTime: checkWorkTypeRange[0].endTime,
  //     hours: checkWorkTypeRange[0].workTime,
  //     // 기간 선택시 근무조 설정
  //     workPt: checkWorkTypeRange[0].workPt,
  //     workTime: checkWorkTypeRange[0].workTime,
  //     shftPt: checkWorkTypeRange[0].shftPt,
  //     fullDay: `${calcDayTimeRange.sumHourList}시간 / ${cDay}일 `,
  //     days: cDay,
  //   }))
  // };


  const handleDateSelect = async (field: string, value: any) => {    

    if(field === "startDate"){
      form.startDate = value;
      if(form.endDate === ""){
        form.endDate = value;
      }
      if(gubun ==="TM"){
        form.wrkGubun = "TM"
        if(form.workPt === "N"){
          chkUpdateEndDate(startHour, endHour);
        }else{
          form.endDate = value;        
        }
      }else{
        setGubun("01");
        form.wrkGubun = "01"
      }
    }else{
      form.endDate = value;
    }
    
    //종료일자 input
    if(startDayField){
      const tmpDay = new Date(form.startDate);
      const startDay = tmpDay.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace('-', '').replace('-','');
      const days = form.holidays === '' ? form.lveCnt : form.holidays;
      const { data: calcEndDate } = await axiosInstance.get(`/wrk/dbhabsappr/apprattd100/calculateEndDate?emplNo=${userData.loginUserId}&startDate=${startDay}&days=${days}`);

      setForm((prev) => ({
        ...prev,
        endDate : formatByType("date",calcEndDate)
      }))
    }
    
    // 휴가 구분(시간 일 때 계산) - wrkGubun: TM
    const { data: calcDayTime } = await axiosInstance.get(`/wrk/dbhabsappr/apprattd100/findCalc?emplNo=${userData.loginUserId}&startDate=${form.startDate}&endDate=${form.endDate}&wrkGubun=${form.wrkGubun}`);
    // 해당일자에 근무조(스케쥴)
    const { data: checkWorkType } = await axiosInstance.get(`/wrk/dbhabsappr/apprattd100/chkTimeInd?emplNo=${userData.loginUserId}&startDate=${form.startDate}`);

      //   // 휴가 구분(전일 일 때 계산) - wrkGubun: 01
    const cDay = getDaysBetweenDates(form.startDate, form.endDate) - calcDayTime.workDayList;
    
    
    const periodDays = form.endDate === "" ? 0 : getDaysBetweenDates(form.startDate, form.endDate);

    //경조휴가 일자 비교를 위해 세팅
    setCalcDays(Number(cDay));
    setLveCnt(cDay + "/" + form.lveCnt);

    if(form.workCodeKind === "LC"){
      setForm((prev) => ({
        ...prev,
        holidays : calcDayTime.sumHourList/ 8 + "/10"
      }))
    }

    // if (calcDayTime.workDayList === 1) {
    //   alert("휴무가 존재합니다.")
    //   setForm((prev) => ({
    //     ...prev,
    //     hours: 0,
    //     fullDay: "",
    //     workPt: "",
    //     workTime: "",
    //     shftPt: "",
    //     startDate: "",
    //     endDate: "",
    //     startTime: "",
    //     endTime: "",
    //   }))
    // } else {
      setForm((prev) => ({
        ...prev,
        chkStartTime: checkWorkType[0].startTime,
        chkEndTime: checkWorkType[0].endTime,
        startTime: checkWorkType[0].startTime,
        endTime: checkWorkType[0].endTime,
        hours: gubun === "01" ? checkWorkType[0].workTime : form.hours,
        // 기간 선택시 근무조 설정
        workPt: checkWorkType[0].workPt,
        workTime: checkWorkType[0].workTime,
        shftPt: checkWorkType[0].shftPt,
        fullDay: calcDayTime.sumHourList !== 0 ? `${calcDayTime.sumHourList}시간 / ${cDay}일 ` : '',
        days: cDay,
        coCode: checkWorkType[0].nextDayInd,
        emplNo: checkWorkType[0].emplNo,
        wcDate: checkWorkType[0].wcDate,
        periodDays: periodDays
      }))
  //  }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  // 버튼 클릭 핸들러
  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click(); // 첨부창 열기
    }
  };
  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedFiles(files); // 상태 업데이트
      setForm((prevForm) => ({
        ...prevForm,
        files: Array.from(files)
      }));
    }
  };

  const handleFileRemove = (indexToRemove: number) => {
    if (selectedFiles) {
      setSelectedFiles(null);
      const updatedFilesArray = Array.from(selectedFiles).filter((_, index) => index !== indexToRemove);
      const dataTransfer = new DataTransfer();
      updatedFilesArray.forEach((file) => dataTransfer.items.add(file));
      const updatedFiles = dataTransfer.files;
      setForm((prevForm) => ({
        ...prevForm,
        files: Array.from(updatedFiles),
      }));      
    }
  };

  
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
    // console.log(form);
  };

  // 근태신청(+결과값 Toast 알림)
  const [openToast, setOpenToast] = useState({
    message: "",
    type: "",
    open: false
  });
  const [disableSave, setDisableSave] = useState(false);
  const [disableApply, setDisableApply] = useState(true);



  const [fileState, setErrorFileState] = useState(false);
  const [dateCalcError, setDateCalcError] = useState(false);
  const [dateRangeCalcError, setDateRangeCalcError] = useState(false);
  const [timeCalcError, setTimeCalcError] = useState(false);


  // 글로벌 필드 설정
  const [fieldDisable, setFieldDisable] = useState(false);
  
  const handleSave = async () => {
   
    const formData = new FormData();
    const appendFormData = (data: any, parentKey = '') => {
      if (typeof data === 'object' && !Array.isArray(data) && !(data instanceof File)) {
        // 객체 처리
        Object.entries(data).forEach(([key, value]) => {
          appendFormData(value, parentKey ? `${parentKey}.${key}` : key);
        });
      } else if (Array.isArray(data)) {
        // 배열 처리
        data.forEach((item, index) => {
          appendFormData(item, `${parentKey}[${index}]`);
        });
      } else {
        // 기본 데이터 또는 File 처리
        formData.append(parentKey, data);
      }
    };
        appendFormData(form);

    let startDateValue;
    let endDateValue;
    let startTimeValue;
    let endTimeValue;
    let chkStartTimeValue;
    let chkEndTimeValue;
    for (const [key, value] of formData.entries()) {
      if (key === 'startDate') {
        startDateValue = value; // 값 체크
      }
      if (key === 'endDate') {
        endDateValue = value; // 값 체크
      }
      if (key === 'startTime') {
        startTimeValue = value; // 값 체크
      }
      if (key === 'endTime') {
        endTimeValue = value; // 값 체크
      }
      if (key === 'chkStartTime') {
        chkStartTimeValue = value; // 값 체크
      }
      if (key === 'chkEndTime') {
        chkEndTimeValue = value; // 값 체크
      }
      if (startDateValue && endDateValue && startTimeValue && endTimeValue && chkStartTimeValue && chkEndTimeValue) break; // 다 확인되면 루프 종료
    }
    // 상태 업데이트
    
    try {
      const headers = fileField ? { "Content-Type": "multipart/form-data" } : {};
      const {data } = await axiosInstance.post('/wrk/dbhabsappr/apprattd100', formData, { headers });
      if (data > 0 || data.docNo) {          
        setOpenToast({message: "임시저장이 완료되었습니다.", open: true, type: "success"});
        setTimeout(() => {
          setFieldDisable(true);
          setOpenToast((prev) => ({ ...prev, open: false }));
          setDisableSave(true);
          setDisableApply(false);
          
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


  // console.log();
  
  const uiSelectRef = useRef<any>(null);

  const uiSelectReset = () => {
    uiSelectRef.current.handleSelect("선택해주세요");
  }

  return (
    <>
      <div className="pt-10 pb-10 d-flex">
        <div className="d-flex">
          <UIInput label="발생연차" value={Number(attendanceRemain.lyLveDays) < 1 ? '0' : attendanceRemain.lyLveDays} readOnly />
        </div>
        <div className="d-flex pl-20">
          <UIInput label="사용연차" value={Number(attendanceRemain.lyUseDays) < 1 ? '0' : attendanceRemain.lyUseDays}readOnly />
        </div>
      </div>
      <div className="pt-10 pb-10">
        <UIInput label="잔여연차" value={Number(attendanceRemain.rmnLve) < 1 ? '0' : attendanceRemain.rmnLve} readOnly />
      </div>


      {grantField &&
        <div className="pt-10 pb-10">
          <UIInput label="부여휴가일수" value={Number(form.holidays) < 1 ? '0' : form.holidays} readOnly  />
        </div>
      }

      {(gubun === "01" && !grantField  && !familyField && !womanField && !pregnancyField )|| form.workCodeKind === "LMR" || form.workCodeKind === "LB3"?
        <div className="pt-10 pb-10">
          <UIInput label="총합시간" readOnly value={form.fullDay} />
        </div>
      : null}

      {gubun === "TM" && form.workCodeKind !== "" ?
        <div className="pt-10 pb-10">
          <UIInput label="합계시간" readOnly value={form.hours < 1 ? '0' : form.hours} />
        </div>
      : null}


      {/* ************* 고정 ************* */}
      <div className="pt-10 pb-10">
        <UISelect
          label="근태종류"
          items={workCodeKind}
          onQuerySelect={(value: any) => {
            // setForm((prev) => ({
            //   ...prev,
            //   workCodeKind: "",
            //   cncCode: "",
            //   lveCnt: "",
            //   wrkGubun: "",
            //   startDate: "",
            //   endDate: "",
            //   startTime: "",
            //   endTime: "",
            //   fullDay: "",
            // }))
            handleSelectKind(value)
            handleSelectChange("workCodeKind", value)
            handleSelectChange("wrkGubun", "")
          }}
          readOnly={fieldDisable}
          error={errors.workCodeKind}
          hint={errors.workCodeKind ? "근태종류를 선택해주세요." : ""}
        />
      </div>

      {womanField &&
        <>
      <div className="pt-10 pb-10">
            <UISelect
              label="임신기간"
              items={[
                {label: "11주 이내", error: false, query: "01"},
                {label: "12주 ~ 15주", error: false, query: "02"},
                {label: "16주 ~ 21주", error: false, query: "03"},
                {label: "22주 ~ 27주", error: false, query: "04"},
                {label: "28주 이상", error: false, query: "05"},
              ]}
              onQuerySelect={(value) => handleSelectChange("periodCode", value)}
              readOnly={fieldDisable}
              error={errors.periodCode}
              hint={errors.periodCode ? "임신기간을 선택해주세요." : ""}
            />
          </div>
          <div className="pt-10 pb-10">
            <UIInput label="일수" value={Number(form.periodDays) < 1 ? '0' : form.periodDays} readOnly />
          </div>
          <div className="pt-10 pb-10">
            <UIDatePicker
              label="발생일자"
              onDateSelect={(value) => {
                handleSelectChange("cncDay", value)
              }}
              placeholder={day}
              readOnly={fieldDisable}
              error={errors.cncDay}
              hint={errors.cncDay ? "발생일자를 선택해주세요." : ""}
             
            />
          </div>
          </>
      }
      {pregnancyField &&
        <>
          <div className="pt-10 pb-10">
            <UIInput label="일수" value={Number(form.periodDays) < 1 ? '0' : form.periodDays} readOnly />
          </div>
          
          <div className="pt-10 pb-10">
            <UISelect
              label="태아"
              items={[
                {label: "단태아", error: false, query: "01"},
                {label: "다태아", error: false, query: "02"}
              ]}
              onQuerySelect={(value) => handleSelectChange("maternityCode", value)}
              readOnly={fieldDisable}
              error={errors.maternityCode}
              hint={errors.maternityCode ? "태아구분을 선택해주세요." : ""}
            />
          </div>
          <div className="pt-10 pb-10">
            <UIDatePicker
              label="발생일자"
              onDateSelect={(value) => {
                handleSelectChange("cncDay", value)
              }}
              placeholder={day}
              readOnly={fieldDisable}
              error={errors.cncDay}
              hint={errors.cncDay ? "발생일자를 선택해주세요." : ""}
             
            />
          </div>
        </>
      }
      {familyField &&
        <>
          <div className="pt-10 pb-10">
            <UIInput label="휴가일수" value={lveCnt} readOnly />
          </div>
          <div className="pt-10 pb-10">
            <UISelect
              label="경조사유"
              items={familyEvent}
              onQuerySelect={ async(query) => {    
                try {               
                  const { data } = await axiosInstance.get(`/wrk/dbhabsappr/apprattd100/relCode?cncCode=${query}`)                  
                  
                  const famEventTarget = data.map((relItem: any) => { return {label: relItem.relCodeNameHan, error: false, query: relItem.relCode}})
                  const tmpItem = [{label: "선택해주세요", error: false, query: ""}];
                  const tmpItemList = tmpItem.concat(famEventTarget);
                  setFamilyEventTarget(tmpItemList);

                  uiSelectReset();
                  setForm((prev) => ({
                    ...prev,
                    relCode: ""
                  }))    
                    setLveCnt('0/0');
                  handleSelectChange("cncCode", query)
                } catch (error) {
                  console.log(error)
                }
              }}
              readOnly={fieldDisable}
              error={errors.cncCode}
              hint={errors.cncCode ? "경조사유를 선택해주세요." : ""}
            />
          </div>
          <div className="pt-10 pb-10">
            <UISelect ref={uiSelectRef}
              label="관계"
              
              items={familyEventTarget}
              onQuerySelect={ async(query) => {
                try {
                  const { data } = await axiosInstance.get(`/wrk/dbhabsappr/apprattd100/accruedYear?cncCode=${form.cncCode}&relCode=${query}`)
                  setLveCnt(calcDays + '/' + data);
                  handleSelectChange("lveCnt", data)
                  handleSelectChange("relCode", query)
                } catch (error) {
                  console.log(error)
                }
              }}
              readOnly={fieldDisable}
              error={errors.relCode}
              hint={errors.relCode ? "관계를 선택해주세요." : ""}
            />
          </div>
          <div className="pt-10 pb-10">
            <UIDatePicker
              label="발생일자"
              onDateSelect={(value) => {
                handleSelectChange("cncDay", value)
              }}
              placeholder={day}
              readOnly={fieldDisable}
              error={errors.cncDay}
              hint={errors.cncDay ? "발생일자를 선택해주세요." : ""}
             
            />
          </div>
        </>
      }
      {optionField &&
        <div className="pt-10 pb-10">
          <UISelect
            label="구분"
            items={[
              {label: "전일", error: false, query: "01"},
              {label: "시간", error: false, query: "TM"},
            ]}
            onQuerySelect={(value) => {
              handleSelectChange("wrkGubun", value);
              setGubun(value);
              setDayField(true);
              if (value === "TM") {
                setTimeField(true);
                setForm((prev) => ({
                  ...prev,
                  startMin : "00",
                  endMin : "00",
                  endDate : form.startDate
                }))
              }
              if (value === "01") setTimeField(false);
            }}
            readOnly={fieldDisable}
            error={errors.wrkGubun}
            hint={errors.wrkGubun ? "전일/시간구분을 선택해주세요." : ""}
          />
        </div>
      }
      {dayField &&
        <div className="pt-10 pb-10">
          <UIDatePicker
            type="date"
            label="시작일자"
            onDateSelect={(value) => {
              handleDateSelect("startDate", formatByType("date", value));
              handleSelectChange("startDate", formatByType("date", value));              
            }}
            
            error={errors.startDate }
            hint={errors.startDate ? "시작일자를 선택해주세요." : ""}            
            readOnly={fieldDisable}
          />
          {gubun !== "TM"?
            <UIDatePicker
              type="date"
              label="종료일자"
              onDateSelect={(value) => {
                handleDateSelect("endDate", formatByType("date", value));
                handleSelectChange("endDate", formatByType("date", value));
              }}
              error={errors.endDate }
              hint={errors.endDate ? "종료일자를 선택해주세요." : ""}
              readOnly={fieldDisable}
              disabled={gubun === "TM" ? true : false}
            />
            : 
            <UIInput label="종료일자" value={form.endDate} readOnly placeholder={"시작일자를 선택해주세요"} />
          }
        </div>
      }

{startDayField &&
        <div className="pt-10 pb-10">
          <UIDatePicker
            type="date"
            label="시작일자"
            onDateSelect={(value) => {
              handleDateSelect("startDate", formatByType("date", value));
              handleSelectChange("startDate", formatByType("date", value));              
            }}
            
            error={errors.startDate }
            hint={errors.startDate ? "시작일자를 선택해주세요." : ""}  
            readOnly={fieldDisable}
          />
           <UIInput label="종료일자" value={form.endDate} readOnly placeholder={"시작일자를 선택해주세요"} />
        </div>
      }


      {timeField &&
        <>
          <div className="pt-10 pb-10 d-flex gap-10">
            <div className="d-flex">
              <UISelect
                label="시작시간"
                items={hourValue}
                readOnly={fieldDisable}
                disabled={form.startDate === ''}
                onQuerySelect={(hour) => {
                  setStartHour(hour)
                  handleSelectChange("startHour", hour)
                  handleSelectChange("startTime", hour + form.startMin)
                  // handleSelectChange("hours", Number(form.endHour) - Number(hour))
                  let exceptLunch = 0;
                  if(endHour !== undefined){
                    if ((form.shftPt === "A" || form.shftPt === "C") && form.workPt === "O" && (Number(hour) <= 12 && Number(endHour) >= 13)) {
                      exceptLunch = Number(endHour) - Number(hour) - 1; // 점심시간빼기                      
                    } else {
                      exceptLunch = Number(endHour) - Number(hour);
                    }
                  }
                  if(form.workPt === "N"){
                    chkUpdateEndDate(hour, endHour)
                    if(Number(exceptLunch) < 0){
                      exceptLunch = 24 + Number(exceptLunch);
                    }
                  }
                  form.hours =  Number(exceptLunch)
                }}
                error={errors.startHour}
                hint={errors.startHour? "시작시간을 선택해주세요." : ""}
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
                  handleSelectChange("endMin", minute)
                  handleSelectChange("startTime", form.startHour + minute)
                }}
                readOnly={fieldDisable}
                disabled={form.startDate === ''}
                placeholder={"00분"}
                error={errors.startMin }
                hint={errors.startMin? "시작시간을 선택해주세요." : ""}
              />
            </div>
          </div>
          <div className="pt-10 pb-10 d-flex gap-10">
            <div className="d-flex">
              <UISelect
                label="종료시간"
                items={hourValue}
                readOnly={fieldDisable}
                disabled={form.startDate === ''}
                onQuerySelect={(hour) => {
                  setEndHour(hour)
                  handleSelectChange("endHour", hour)
                  handleSelectChange("endTime", hour + form.endMin)
                  let exceptLunch = 0;
                  if(startHour !== undefined ){
                    if ((form.shftPt === "A" || form.shftPt === "C") && form.workPt === "O" && (Number(startHour) <= 12 && Number(hour) >= 13)) {
                      exceptLunch = Number(hour) - Number(startHour) - 1; // 점심시간빼기
                    } else {
                      exceptLunch = Number(hour) - Number(startHour);
                    }                    
                  }
                  
                  if(form.workPt === "N"){
                    chkUpdateEndDate(startHour, hour);                    
                    if(Number(exceptLunch) < 0){
                      exceptLunch = 24 + Number(exceptLunch);
                    }
                  }
                  form.hours =  Number(exceptLunch)
                }}
                error={errors.endHour}
                hint={errors.endHour? "종료시간을 선택해주세요." : ""}
              />
            </div>
            <div className="d-flex align-items-end">
              <UISelect
                placeholder={form.endMin + "분"}
                items={[
                  {label: "00분", error: false, query: "00"},
                  {label: "30분", error: false, query: "30"},
                ]}
                disabled={true}
              />
            </div>
          </div>
        </>
      }

      {fileField &&
        <>
          <div className="pt-10 pb-180">
            <div className="attach__file">
              <input
                type="file"
                ref={fileInputRef} // useRef로 파일 입력 요소 참조
                style={{ display: "none" }} // 화면에 보이지 않게 숨김
                onChange={handleFileChange}
                multiple // multiple 속성 추가
                
              />
              <UIInput label="첨부파일" placeholder="증빙서류첨부" disabled  error={!selectedFiles}
               hint={!selectedFiles? "증빙서류첨부는 필수입니다." : ""}
               />
              <UIIconButton onClick={handleFileClick} className="is-file has-pressed-action" />              
            </div>            
            {selectedFiles && (
              <ul className="attach__file__list">
                {Array.from(selectedFiles).map((file, index) => (
                  <li key={index}>
                    <UIInput value={file.name} readOnly />
                    <div className="icon is-delete mt-10 ml-10 mr-10" onClick={() => handleFileRemove(index)}></div>
                  </li>
                ))}
              </ul>
            )}
            <p className="fs-14 pt-10 text-point-1">* 출산휴가/경조휴가/공가 등 개인정보가 포함된 서류를 첨부파일로 제출할 경우, 주민등록번호 뒷자리를 가리고<br/> 제출해 주세요.</p>
          </div>
        </>
      }


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