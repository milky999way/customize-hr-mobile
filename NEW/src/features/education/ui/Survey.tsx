import { useDateStore } from "@/app/store/authStore";
import { useEducationSurvey } from "@/entities/education";
import { useUser } from "@/entities/user";
import { UIAlert, UIButton, UIDatePicker, UIInput, UIRadio, UITextarea, UIToast } from "@/shared/ui";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Popover from "@radix-ui/react-popover";
import { axiosInstance } from "@/app/api/axiosInstance";


export const Survey = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    examSeq: 0,
    examTypeCd: "",
    edust400DtoList: [{
      answer: "",
    }]
  });

  const [disableSave, setDisableSave] = useState(true);
  const [errors, setErrors] = useState([{
    answer: false
  }]);
  const [openToast, setOpenToast] = useState({ message: "", type: "", open: false });
  

  const { data: userData, isLoading: isUserLoading, error: userError } = useUser();
	if (isUserLoading) return <p>Loading...</p>;
	if (userError) return <p>Error: {userError.message}</p>;

  const {currentDate, setCurrentDate} = useDateStore();
  const toDay = currentDate.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' });

  const checkDate = new Date();
  const threeMonthAgo = new Date(checkDate.setMonth(checkDate.getMonth() - 3));
  const threeMonthDay = threeMonthAgo.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' });

  const [dateRange, setDateRange] = useState({
    fromDate: "",
    toDate: ""
  });
  const handleDateRangeChange = (range: any) => {
    setDateRange(range);
  };

  const { data: educationSurveyData, isLoading: isEducationSurveyLoading, error: educationSurveyError, refetch: refetchEducationSurvey } = useEducationSurvey({
    searchStartDate: dateRange.fromDate ? dateRange.fromDate : threeMonthDay,
    searchEndDate: dateRange.toDate ? dateRange.toDate : toDay,
    emplNo: userData.loginUserId,
    searchEmplNameHan: userData.loginUserNm,
  });
	if (isEducationSurveyLoading) return <p>Loading...</p>;
	if (educationSurveyError) return <p>Error: {educationSurveyError.message}</p>;



  const [questionItemList, setQuestionItemList] = useState([]);
  const [detailData, setDetailData] = useState(false);
  const handleFetchSurvey = async (params: any) => {
    setDisableSave(true);
    try {
      const { data } = await axiosInstance.get(`/edu/dbhedust/edust400/pop?examSeq=${params.examSeq}`)
      if (data.length > 0) {
        setDetailData(true)
        setQuestionItemList(data)
        setForm((prev) => ({
          ...prev,
          examSeq: params.examSeq,
          // examTypeCd: "1",
          edust400DtoList: data.map((item: any) => ({
            orderNo: item.orderNo,
            questionTypeCd: item.questionTypeCd,
            examQuestionSeq: item.examQuestionSeq,

            answer: item.optionList[0].answer,
            examSeq: item.optionList[0].examSeq,
            paperQuestionSeq: item.optionList[0].paperQuestionSeq,
          }))
        }))
      } else {
        console.log(data);
      }
    } catch (error: any) {
      console.log(error);
    }
  }



  

  const handleSave = async () => {
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
      const response = await axiosInstance.post("/edu/dbhedust/edust400", formData);
      if (response.status === 200 && response.data) {
        setOpenToast({message: "임시저장이 완료되었습니다.", open: true, type: "success"});
        setTimeout(async () => {
          setOpenToast((prev) => ({ ...prev, open: false }));
          await refetchEducationSurvey();
          // setDetailData(false);
        }, 1000);
      } else {
        setOpenToast({ message: "결재요청에 실패하였습니다.", type: "danger", open: true });
      }
    } catch (error: any) {
      setOpenToast({ message: error.response?.data?.message || "오류가 발생하였습니다.", type: "danger", open: true });
    }
  }



  // const validateForm = () => {
  //   const newErrors = form.edust400DtoList.map((item) => ({
  //     answer: !item.answer,
  //   }))
  //   setErrors(newErrors);
  //   return Object.values(newErrors).every((error) => !error);
  // };


  const handleApply = async () => {
    const updatedForm = {
        ...form,
        examTypeCd: "2",
    };
    setForm(updatedForm);

    const isAnyAnswerEmpty = form.edust400DtoList.some((item) => !item.answer);
    if (isAnyAnswerEmpty) {
      alert("입력되지 않은 문항이 존재합니다.");
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
      formData.set("examTypeCd","2");
      try {
        const response = await axiosInstance.post("/edu/dbhedust/edust400", formData);
        if (response.status === 200 && response.data) {
          setOpenToast({message: "제출이 완료되었습니다.", open: true, type: "success"});
          setTimeout(async () => {
            setOpenToast((prev) => ({ ...prev, open: false }));
            setDetailData(false);
            await refetchEducationSurvey();
          }, 1000);
        } else {
          setOpenToast({ message: "결재요청에 실패하였습니다.", type: "danger", open: true });
        }
      } catch (error: any) {
        setOpenToast({ message: error.response?.data?.message || "오류가 발생하였습니다.", type: "danger", open: true });
      }
    }
  }


  return (
    <>
      <div className="pt-10 pb-10">
        <UIDatePicker
          label="조회월"
          type="range"
          onDateRangeChange={handleDateRangeChange}
        />
      </div>
      <div className="pt-10 pb-10">
        <div className="count__control">
          <div className="count">총 <em>{educationSurveyData.length}</em> 건</div>
        </div>
        <ul className="list">
          {educationSurveyData.length === 0 ?
            <li className="fs-15 text-center">데이터가 없습니다.</li>
          : educationSurveyData.map((item: any, i) =>
            <li key={i}>
              <div className="list__content">
                {item.examTake === "Y" ?
                  <div className="top" onClick={() => handleFetchSurvey({ examSeq: item.examSeq, examTypeCd: item.examTypeCd }) }>
                    <div className="date">{item.examDateRange}</div>
                    <div className="icon is-arrow__right"></div>
                  </div>
                :
                  <div className="top">
                    <div className="date">{item.examDateRange}</div>
                  </div>
                }
                <div className="info">
                  <div>
                    <strong>설문명</strong>
                    <span>{item.examNm}</span>
                  </div>
                  <div>
                    <strong>설문상태</strong>
                    <span className={item.examTypeCdNm === "제출완료" ? "text-information-dark" : "text-point-1"}>
                      {item.examTypeCdNm === "" ? "미응시" : item.examTypeCdNm}
                    </span>
                  </div>
                  <div>
                    <strong>문제수</strong>
                    <span>{item.eduQstCnt}</span>
                  </div>
                </div>
              </div>
            </li>
          )}
        </ul>

        <Popover.Root open={detailData} onOpenChange={setDetailData}>
          <Popover.Content className="d-flex flex-direction-column custom__popper mt-100" style={{overflowY: "scroll"}}>
            <h4 className="p-30">온라인설문</h4>
            {questionItemList.map((item: any, i) =>
              <div key={i} className={(i+1) === questionItemList.length ? "pb-200" : ""}>
                {item.questionTypeCd === "10" ?
                  <div className="custom__popper__in pl-20 pr-20">
                    <div className="fs-16 pt-20 pb-10">{item.question}</div>
                    <div className="d-flex">
                      <UIRadio
                        items={
                          // 마지막 인덱스를 맨 처음으로 보낸 배열 생성 (10지선단 문항만..)
                          [item.optionList[item.optionList.length - 1], ...item.optionList.slice(0, -1)].map((op: any) => {
                            return { label: op.optionCnt, value: op.optionNo };
                          })
                        }
                        onItemSelect={(value) => {
                          setDisableSave(false);
                          setForm((prev) => {
                            const updatedDtoList = [...prev.edust400DtoList];
                            updatedDtoList[i] = { ...updatedDtoList[i], answer: value };
                            return { ...prev, edust400DtoList: updatedDtoList, examTypeCd: "1" };
                          });
                        }}
                        name={item.question}
                        direction="column"
                        defaultValue={item.optionList[0].answer}
                      />
                    </div>
                  </div>
                : item.questionTypeCd === "5" ? 
                  <div className="custom__popper__in pl-20 pr-20">
                    <div className="fs-16 pt-20 pb-10">{item.question}</div>
                    <div>
                      <UIRadio
                        items={item.optionList.map((op: any) => { return { label: op.optionCnt, value: op.optionNo }})}
                        onItemSelect={(value) => {
                          setDisableSave(false);
                          setForm((prev) => {
                            const updatedDtoList = [...prev.edust400DtoList];
                            updatedDtoList[i] = { ...updatedDtoList[i], answer: value };
                            return { ...prev, edust400DtoList: updatedDtoList, examTypeCd: "1" };
                          });
                        }}
                        name={item.question}
                        direction="column"
                        defaultValue={item.optionList[0].answer}
                      />
                    </div>
                  </div>
                : 
                  <div className="custom__popper__in pl-20 pr-20">
                    <div className="fs-16 pt-20 pb-10">{item.question}</div>
                    <div className="d-flex">
                      <UITextarea
                        value={item.optionList[0].answer}
                        onChange={(e) => {
                          setDisableSave(false);
                          setForm((prev) => {
                            const updatedDtoList = [...prev.edust400DtoList];
                            updatedDtoList[i] = { ...updatedDtoList[i], answer: e.target.value };
                            return { ...prev, edust400DtoList: updatedDtoList, examTypeCd: "1" };
                          });
                        }}
                      />
                    </div>
                  </div>
                }
              </div>
            )}

            <div className="applyAction">
              <UIAlert
                description="중간저장하시겠습니까?"
                actionProps={{
                  onClick: () => {
                    handleSave();
                  },
                }}
              >
                <UIButton type="border" disabled={disableSave}>중간저장</UIButton>
              </UIAlert>

              <UIAlert
                description="제출하시겠습니까?"
                actionProps={{
                  onClick: () => {
                    handleApply();
                  },
                }}
              >
                <UIButton type="primary">제출</UIButton>
              </UIAlert>
            </div>

          </Popover.Content>
        </Popover.Root>
      </div>

      {openToast.open && (
        <UIToast message={openToast.message} type={openToast.type} open={openToast.open} onOpenChange={setOpenToast} />
      )}
    </>
  )
}