import { axiosInstance } from "@/app/api/axiosInstance";
import { useBaseCode } from "@/entities/approvalLine";
import { useAttendanceAbsenceDetail } from "@/entities/attendance";
import { UIAlert, UIBadge, UIButton, UIInput, UITimePicker, UIToast } from "@/shared/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";


export const AbsenceDetail = () => {
  const navigate = useNavigate();
  const qs = useOutletContext();
  const { data: absenceDetailData, isLoading: isAbsenceDetailLoading, error: absenceDetailError } = useAttendanceAbsenceDetail(qs);
  if (isAbsenceDetailLoading) return <p>Loading...</p>;
  if (absenceDetailError) return <p>Something went wrong!</p>;

    const parameters = {
      baseCodList: [
        { "patternCode": "WC52", "effDateYn": true, "companyYn": true }
      ]
    }
    const { data: baseCodeData, isLoading: isBaseCodeLoading, error: baseCodeError } = useBaseCode(parameters);
    if (isBaseCodeLoading) return <p>Loading...</p>;
    if (baseCodeError) return <p>Something went wrong!</p>;
    const codeData = baseCodeData && baseCodeData.map((code: any, index) =>
      code.cdbaseList.map((cd: any) => (
        {codeKey : cd.baseCode, codeName: cd.codeNameHan}
      ))
    )
    const reasonCodeData = codeData[0];
    const findMatchingCode = (data: any, value: any) => {
      const matchingCode = data?.find((code: any) => code.codeKey === value); 
      return matchingCode ? matchingCode.codeName : null;
    };


  const [startTime, setStartTime] = useState<string>();
  const [endTime, setEndTime] = useState<string>();
  const [reason, setReason] = useState<string>();


  const [form, setForm] = useState({
    wcabshistDtoList: []
  });

  
  // 취소 신청(+결과값 Toast 알림)
  const [openToast, setOpenToast] = useState({
    message: "",
    type: "",
    open: false
  });
  const handleApply = async (item: any) => {

    const absStartTime = item.absStartTime;
    const absEndTime = item.absEndTime;

    if( !absStartTime &&  Number(endTime) < Number(startTime)){
      alert("업무종료가 업무시작 이전입니다.");
      return false;
    }
    if( Number(startTime) < Number(absStartTime)){
      alert("업무시작시간은 부재시간 내에 작성하세요.");
      return false;
    }
    if( Number(endTime) > Number(absEndTime)){
      alert("업무종료시간은 부재시간 내에 작성하세요.");
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
     if(startTime) {
      form.wcabshistDtoList[0].wkStartTime = startTime;
     }
     if(endTime) {
      form.wcabshistDtoList[0].wkEndTime = endTime;
     }
     if(reason) {
      form.wcabshistDtoList[0].chngRsn = reason;
     }
    appendFormData(form);
    try {
      const { data } = await axiosInstance.put('/wrk/dbhwrkabs/wrkabsstat100', formData);
      if (data > 0) {
        setOpenToast({message: "결재요청이 완료되었습니다.", open: true, type: "success"});
      } else {
        setOpenToast({message: "결재요청에 이상이 있습니다.", open: true, type: "danger"});
      }
    } catch (error: any) {
      setOpenToast({message: error.response.data.message, open: true, type: "danger"});
    } finally {
      setTimeout(() => {
        setOpenToast((prev) => ({ ...prev, open: false }));
        navigate('/attendance/absence');
      }, 1000);
    }
  }

  const handleAbsenceExplain = (prevData: any, newData: any) => {
    let wkStartTime = newData.startTime ? newData.startTime.replace(":", "") : prevData.wkStartTime;
    let wkEndTime =  newData.endTime ? newData.endTime.replace(":", "") : prevData.wkEndTime;

    if(wkStartTime === ""){
      wkStartTime = prevData.absStartTime
    }

    if(wkEndTime === ""){
      wkEndTime = prevData.absEndTime
    }

    setForm((prev: any) => ({
      ...prev,
      wcabshistDtoList: [
        {
          wkStartTime: wkStartTime,
          wkEndTime: wkEndTime,
          chngRsn: newData.reason ? newData.reason : prevData.chngRsn,

          coCode: prevData.coCode,
          emplNo: prevData.emplNo,
          workDate: prevData.workDate,
          seq: prevData.seq,
          absStartTime: prevData.absStartTime,
          absEndTime: prevData.absEndTime,
          absHour: prevData.absHour,
          admitHour: prevData.admitHour,
          nwkDayHour: prevData.nwkDayHour,
          nwkOtHour: prevData.nwkOtHour,
          absRsn: prevData.absRsn,
          closeInd: prevData.closeInd,
          rowKey: "0",
          rowStatus: "U"
        }
      ]
    }))
  }

  return (
    <>
      <div className="bg-primary-500 p-30 mt-10 mb-10 radius-6">
        <div className="fs-20 text-center text-point-2">
          {absenceDetailData.map((item: any, i) => item.workDate)[0]}
        </div>
      </div>
      <div className="pt-10 pb-10">
        <div className="count__control">
          <div className="count">총 <em>{absenceDetailData.length}</em> 건</div>
        </div>
        <ul className="list">
          {absenceDetailData.map((item: any, i) =>             

            <li key={i}>
              <Popover>
                <PopoverTrigger asChild className="list__content">
                  <div>
                    <div className="top">
                      <UIBadge type="border" shape="square" status="primary">기본</UIBadge>
                      <div className="icon is-arrow__right"></div>
                    </div>
                    <div className="info">
                      <div>
                        <strong>사번</strong>
                        <span>{item.emplNo}</span>
                      </div>
                      {/* <div>
                        <strong>성명</strong>
                        <span></span>
                      </div> */}
                      <div>
                        <strong>시작/종료</strong>
                        <span>
                          {item.absStartTime.slice(0,2)}:{item.absStartTime.slice(2)}
                          &nbsp;~&nbsp;
                          {item.absEndTime.slice(0,2)}:{item.absEndTime.slice(2)}
                          &nbsp;
                          ({item.absHour.slice(0,2)}:{item.absHour.slice(2)})
                        </span>
                      </div>
                      <div>
                        <strong>부재사유</strong>
                        <span><span>{findMatchingCode(reasonCodeData, item.absRsn)}</span></span>
                      </div>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="d-flex flex-direction-column custom__popper mt-160">      
                              
                  {item.absStartTime ?                     
                    <>                      
                      <h4 className="pt-30 pl-30 pr-30 pb-10">부재시간</h4>
                      <div className="pl-30 pr-30 mb-30 text-danger-dark fs-16">
                        
                        {item.absStartTime.slice(0,2)}:{item.absStartTime.slice(2)}
                        &nbsp;~&nbsp;
                        {item.absEndTime.slice(0,2)}:{item.absEndTime.slice(2)}
                      </div>
                      <h4 className="pt-30 pl-30 pr-30 pb-10">부재소명 시간 입력</h4>
                      <div className="custom__popper__in pl-30 pr-30">
                        <UITimePicker
                          label="업무시작/종료"
                          type="range"
                          // 기존값
                          start={`${item.wkStartTime.slice(0,2)}:${item.wkStartTime.slice(2)}`}
                          end={`${item.wkEndTime.slice(0,2)}:${item.wkEndTime.slice(2)}`}
                          // 업데이트값
                          onStartTimeChange={(start) => {
                              setStartTime(start.replace(":", ""))
                              handleAbsenceExplain(item, {startTime: start})
                            }
                          }
                          onEndTimeChange={(end) => {
                            setEndTime(end.replace(":", ""))
                            handleAbsenceExplain(item, {endTime: end})}
                          }
                        />
                      </div>
                      <div className="pt-10 pb-10 pl-30 pr-30">
                        <UIInput
                          label="사유"
                          value={item.chngRsn}
                          onChange={(e) => {                                                            
                              setReason(e.target.value)
                              handleAbsenceExplain(item, {reason: e.target.value})
                            }
                          }
                        />
                      </div>
                    </>
                  :
                    <>
                      <h4 className="p-30">부재시간</h4>
                      <div className="pl-30 pr-30 mb-30 text-danger-dark fs-16">
                        {item.absStartTime.slice(0,2)}:{item.absStartTime.slice(2)}
                        &nbsp;~&nbsp;
                        {item.absEndTime.slice(0,2)}:{item.absEndTime.slice(2)}
                      </div>
                      <h4 className="p-30">부재시작 시간 입력</h4>
                      <div className="custom__popper__in pl-30 pr-30">
                        <UITimePicker
                          label="부재시작"
                          type="time"
                          start={`${item.wkStartTime.slice(0,2)}:${item.wkStartTime.slice(2)}`}
                           onStartTimeChange={(start) => {
                              setStartTime(start.replace(":", ""))
                              handleAbsenceExplain(item, {startTime: start})
                            }
                          }
                          
                        />
                      </div>
                      <div className="pt-10 pb-10 pl-30 pr-30">
                        <UIInput label="사유"
                          value={item.chngRsn}
                          onChange={(e) => {
                              setReason(e.target.value)
                              handleAbsenceExplain(item, {reason: e.target.value})
                            }
                          }
                        />
                      </div>
                    </>
                  }

                  <div className="applyAction">
                    <UIAlert
                      description="신청하시겠습니까?"
                      actionProps={{
                        onClick: () => {                                                     
                          handleApply(item);                          
                        },
                      }}
                    >
                      <UIButton type="primary">결재요청</UIButton>
                    </UIAlert>
                  </div>
                </PopoverContent>
              </Popover>
              {openToast.open && (
                <UIToast message={openToast.message} type={openToast.type} open={openToast.open} onOpenChange={setOpenToast} />
              )}
            </li>
          )}
        </ul>
      </div>
    </>
  )
}