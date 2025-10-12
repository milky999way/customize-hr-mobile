import { useDateStore } from "@/app/store/authStore";
import { useEducationReport } from "@/entities/education";
import { useUser } from "@/entities/user";
import { UIAlert, UIButton, UIInput, UISelect, UITextarea, UIToast } from "@/shared/ui";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "@/app/api/axiosInstance";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";




export const Report = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    filePath: "",
    mentorEmplNameHan: "",
    mentorOrgNameHan: "",
    mentorTitleNameHan: "",
    menteeEmplNameHan: "",
    menteeOrgNameHan: "",
    menteeTitleNameHan: "",
    startDate: "",
    finishDate: "",
    subject: "",
    act1Content: "",
    act1Comment: "",
    act2Content: "",
    act2Comment: "",
    act3Content: "",
    act3Comment: "",
    expenseComment: "",
    expense: "",
    atchFileId: "",
    resultMentee: "",
    resultMentor: "",
    feedbackMentee: "",
    feedbackMentor: "",
    remark: "",
    planId: "",
    yyyy: "",
    mm: "",
    comYnMentee: "",
    comYnMentor: "",
    menteeEmplNo: "",
    mentorEmplNo: "",
  });

  const [errors, setErrors] = useState({});
  const [openToast, setOpenToast] = useState({ message: "", type: "", open: false });

  const [disableSave, setDisableSave] = useState(false);
  const [disableApply, setDisableApply] = useState(true);
  


  const { data: userData, isLoading: isUserLoading, error: userError } = useUser();
	if (isUserLoading) return <p>Loading...</p>;
	if (userError) return <p>Error: {userError.message}</p>;

  const {currentDate, setCurrentDate} = useDateStore();
  const toYear = currentDate.toLocaleDateString('sv-SE', { year: 'numeric' });
  const [selectYear, setSelectYear] = useState(toYear);
  

  const { data: educationReportData, isLoading: isEducationReportLoading, error: educationReportError } = useEducationReport({
    baseYear: selectYear,
    searchEmplNo: userData.loginUserId,
    searchEmplNameHan: userData.loginUserNm,
    isAdmin: false
  });
	if (isEducationReportLoading) return <p>Loading...</p>;
	if (educationReportError) return <p>Error: {educationReportError.message}</p>;



  const isMentee = educationReportData.some((mentor) => mentor.menteeEmplNo === userData.loginUserId)
  const isMentor = educationReportData.some((mentor) => mentor.mentorEmplNo === userData.loginUserId)



  const validateForm = () => {
    const newErrors = {
      // transferReason: !form.transferReason,
      // transferNote1: !form.transferNote1,
      // transferNote2: !form.transferNote2,
      // transferNote3: !form.transferNote3,
      // transferNote4: !form.transferNote4,
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    } else {
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
        const response = await axiosInstance.post("/edu/dbhedumt/edumt700/saveDasommonRep", formData);
        if (response.status === 200 && response.data) {
          setOpenToast({message: "임시저장이 완료되었습니다.", open: true, type: "success"});
          setTimeout(() => {
            setOpenToast((prev) => ({ ...prev, open: false }));
            setDisableSave(true);
            setDisableApply(false);
          }, 1000);
        } else {
          setOpenToast({ message: "결재요청에 실패하였습니다.", type: "danger", open: true });
        }
      } catch (error: any) {
        setOpenToast({ message: error.response?.data?.message || "오류가 발생하였습니다.", type: "danger", open: true });
      }
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
      const response = await axiosInstance.post("/edu/dbhedumt/edumt700/saveDasommonRepComyn", formData);
      if (response.status === 200 && response.data) {
        setOpenToast({message: "전송이 완료되었습니다.", open: true, type: "success"});
        setTimeout(() => {
          setOpenToast((prev) => ({ ...prev, open: false }));
          setDisableSave(true);
          setDisableApply(false);
        }, 1000);
      } else {
        setOpenToast({ message: "결재요청에 실패하였습니다.", type: "danger", open: true });
      }
    } catch (error: any) {
      setOpenToast({ message: error.response?.data?.message || "오류가 발생하였습니다.", type: "danger", open: true });
    }
  }


  const handleRadioCheck = (value: any) => {
    console.log(value)
  }


  const getYearRange = (start: number, end: number) => {
    return Array.from({ length: end - start + 1 }, (_, i) => ({
      label: `${start + i}`,
      error: false,
      query: `${start + i}`,
    }));
  };


  const getYearRangeFormatted = () => {
    const currentYear = new Date().getFullYear(); // 현재 연도
    const startYear = currentYear - 10; // 10년 전
    const endYear = currentYear + 10; // 10년 후
    const yearRange = [];
    for (let year = startYear; year <= endYear; year++) {
      yearRange.push({
        label: String(year),
        error: false,
        query: String(year)
      });
    }
    return yearRange;
  }


  return (
    <>
      <div className="pt-10 pb-10">
        <UISelect
          label="기간"
          // items={getYearRangeFormatted().reverse()}
          items={getYearRange(2010, 2025).reverse()}
          onQuerySelect={(value) => setSelectYear(value)}
          placeholder={toYear}
        />
      </div>
      <div className="pt-10 pb-10">
        <div className="count__control">
          <div className="count">총 <em>{educationReportData.length}</em> 건</div>
        </div>
        <ul className="list">
          {educationReportData.length === 0 ?
            <li className="fs-15 text-center">데이터가 없습니다.</li>
          : educationReportData.map((item: any, i) =>
            <li key={i}>
              <Popover>
                {item.comYnMentee === "Y" && isMentor ?
                  <PopoverTrigger asChild>
                    <div className="list__content">
                      <div className="top">
                        <div className="date">{item.yyyyMm}</div>
                        {/* <div className="icon is-arrow__right"></div> */}
                        <div className="fs-14 text-information-dark">
                          작성완료
                          <span className="icon is-arrow__right" style={{display: "inline-block", verticalAlign: "middle"}}></span>
                        </div>
                      </div>
                      <div className="info">
                        <div>
                          <strong>주제</strong>
                          <span className="text-point-1">{item.subject}</span>
                        </div>
                        <div>
                          <strong>시작일 ~ 종료일</strong>
                          <span>{item.startDate} ~ {item.finishDate}</span>
                        </div>
                        <div>
                          <strong>Mentor</strong>
                          <span>{item.mentorEmplNameHan}</span>
                        </div>
                        <div>
                          <strong>Mentee</strong>
                          <span>{item.menteeEmplNameHan}</span>
                        </div>
                      </div>
                    </div>
                  </PopoverTrigger>
                : item.comYnMentee === "" && isMentor ?
                  <div className="list__content">
                    <div className="top">
                      <div className="date">{item.yyyyMm}</div>
                      <div className="fs-14 text-information-dark">미작성</div>
                    </div>
                    <div className="info">
                      <div>
                        <strong>주제</strong>
                        <span className="text-point-1">{item.subject}</span>
                      </div>
                      <div>
                        <strong>시작일 ~ 종료일</strong>
                        <span>{item.startDate} ~ {item.finishDate}</span>
                      </div>
                      <div>
                        <strong>Mentor</strong>
                        <span>{item.mentorEmplNameHan}</span>
                      </div>
                      <div>
                        <strong>Mentee</strong>
                        <span>{item.menteeEmplNameHan}</span>
                      </div>
                    </div>
                  </div>
                : item.comYnMentee === "" && isMentee ?
                  <PopoverTrigger asChild>
                    <div className="list__content">
                      <div className="top">
                        <div className="date">{item.yyyyMm}</div>
                        {/* <div className="icon is-arrow__right"></div> */}
                        <div className="fs-14 text-information-dark">
                          미작성
                          <span className="icon is-arrow__right" style={{display: "inline-block", verticalAlign: "middle"}}></span>
                        </div>
                      </div>
                      <div className="info">
                        <div>
                          <strong>주제</strong>
                          <span className="text-point-1">{item.subject}</span>
                        </div>
                        <div>
                          <strong>시작일 ~ 종료일</strong>
                          <span>{item.startDate} ~ {item.finishDate}</span>
                        </div>
                        <div>
                          <strong>Mentor</strong>
                          <span>{item.mentorEmplNameHan}</span>
                        </div>
                        <div>
                          <strong>Mentee</strong>
                          <span>{item.menteeEmplNameHan}</span>
                        </div>
                      </div>
                    </div>
                  </PopoverTrigger>
                : item.comYnMentee === "Y" && isMentee ?
                  <div className="list__content">
                    <div className="top">
                      <div className="date">{item.yyyyMm}</div>
                      <div className="fs-14 text-information-dark">작성완료</div>
                    </div>
                    <div className="info">
                      <div>
                        <strong>주제</strong>
                        <span className="text-point-1">{item.subject}</span>
                      </div>
                      <div>
                        <strong>시작일 ~ 종료일</strong>
                        <span>{item.startDate} ~ {item.finishDate}</span>
                      </div>
                      <div>
                        <strong>Mentor</strong>
                        <span>{item.mentorEmplNameHan}</span>
                      </div>
                      <div>
                        <strong>Mentee</strong>
                        <span>{item.menteeEmplNameHan}</span>
                      </div>
                    </div>
                  </div>
                : null}



                <PopoverContent className="d-flex flex-direction-column custom__popper mt-100" style={{overflowY: "scroll"}}>
                  <h4 className="p-30">{item.subject}</h4>
                  <div className="custom__popper__in pl-20 pr-20">
                    <div className="fs-16 pt-40 pb-10">1. 월간 다솜활동 내용</div>
                    <div>
                      <UITextarea
                        label="지식 및 업무기술 개발"
                        onChange={(e) => { setForm( (prev) => ({...prev, act1Content: e.target.value}) ) }}
                        disabled={item.comYnMentee === "Y"}
                        value={item.act1Content}
                      />
                      <UITextarea
                        label="지식 및 업무기술 개발 (멘토의견)"
                        onChange={(e) => { setForm( (prev) => ({...prev, act1Content: e.target.value}) ) }}
                        // readOnly={item.comYnMentee === "Y" && isMentee}
                      />
                      <UITextarea
                        label="인성개발"
                        onChange={(e) => { setForm( (prev) => ({...prev, act2Content: e.target.value}) ) }}
                        // readOnly={item.comYnMentee === "Y" && isMentee}
                        disabled={item.comYnMentee === "Y"}
                        value={item.act2Content}
                      />
                      <UITextarea
                        label="인성개발 (멘토의견)"
                        onChange={(e) => { setForm( (prev) => ({...prev, act2Content: e.target.value}) ) }}
                        // readOnly={item.comYnMentee === "Y" && isMentee}
                      />
                      <UITextarea
                        label="기타"
                        onChange={(e) => { setForm( (prev) => ({...prev, act3Content: e.target.value}) ) }}
                        // readOnly={item.comYnMentee === "Y" && isMentee}
                        disabled={item.comYnMentee === "Y"}
                        value={item.act3Content}
                      />
                      <UITextarea
                        label="기타 (멘토의견)"
                        onChange={(e) => { setForm( (prev) => ({...prev, act3Content: e.target.value}) ) }}
                        // readOnly={item.comYnMentee === "Y" && isMentee}
                      />
                    </div>
                  </div>
                  <div className="custom__popper__in pl-20 pr-20">
                    <div className="fs-16 pt-40 pb-10">2. 다솜활동비 사용내역</div>
                    <div>
                      <UIInput
                        label="사용내역"
                        onChange={(e) => { setForm( (prev) => ({...prev, expenseComment: e.target.value}) ) }}
                        readOnly={isMentee}
                      />
                      <UIInput
                        label="비용(원)"
                        type="number"
                        onChange={(e) => { setForm( (prev) => ({...prev, expense: e.target.value}) ) }}
                        readOnly={isMentee}
                      />
                    </div>
                  </div>
                  <div className="custom__popper__in pl-20 pr-20">
                    <div className="fs-16 pt-40 pb-10">3. 자신의 월간 다솜활동을 평가한다면?</div>
                    <div>
                      <UIInput
                        label="Mentee"
                        onChange={(e) => { setForm( (prev) => ({...prev, resultMentee: e.target.value}) ) }}
                        readOnly={item.comYnMentee === "Y"}
                        value={item.resultMentee}
                      />
                      <UIInput
                        label="Mentor"
                        onChange={(e) => { setForm( (prev) => ({...prev, resultMentor: e.target.value}) ) }}
                      />
                    </div>
                  </div>
                  <div className="custom__popper__in pl-20 pr-20">
                    <div className="fs-16 pt-40 pb-10">4. 요청 및 건의사항</div>
                    <div>
                      <UIInput
                        label="Mentee"
                        onChange={(e) => { setForm( (prev) => ({...prev, feedbackMentee: e.target.value}) ) }}
                        readOnly={item.comYnMentee === "Y"}
                        value={item.feedbackMentee}
                      />
                      <UIInput
                        label="Mentor"
                        onChange={(e) => { setForm( (prev) => ({...prev, feedbackMentor: e.target.value}) ) }}
                      />
                    </div>
                  </div>
                  <div className="custom__popper__in pl-20 pr-20 pb-200 mb-200">
                    <div className="fs-16 pt-40 pb-10">5. 비고</div>
                    <div>
                      <UIInput
                        label="담당자 의견"
                        onChange={(e) => { setForm( (prev) => ({...prev, remark: e.target.value}) ) }}
                        readOnly={item.comYnMentee === "Y"}
                        value={item.act3Content}
                      />
                    </div>
                  </div>



                  <div className="applyAction">
                    <UIAlert
                      description="저장하시겠습니까?"
                      actionProps={{
                        onClick: () => {
                          handleSave();
                        },
                      }}
                    >
                      <UIButton type="border" disabled={disableSave}>저장</UIButton>
                    </UIAlert>
                    <UIAlert
                      description="전송하시겠습니까?"
                      actionProps={{
                        onClick: () => {
                          handleApply();
                        },
                      }}
                    >
                      <UIButton type="primary" disabled={disableApply}>전송</UIButton>
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