import { axiosInstance } from "@/app/api/axiosInstance";
import { TenureLeaveSurvey, useTenureLeaveSurvey } from "@/entities/tenure";
import { useUser } from "@/entities/user";
import { UIAlert, UIButton, UICheckbox, UISelect, UITextarea, UIToast } from "@/shared/ui";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";


export const Survey = () => {
  const [openToast, setOpenToast] = useState({ message: "", type: "", open: false });
  const [errors, setErrors] = useState({
    emprt140Pop01List: []
  });
  const [form, setForm] = useState({
    emplNo: "",
    retireReqDate: "",
    rtflowId: "",
    emprt140Pop01List: []
  });


  const location = useLocation();
  const lastSegment = location.pathname.split('/').filter(Boolean).pop();

  const { data: userData, isLoading: isUserLoading, error: userError } = useUser();
	if (isUserLoading) return <p>Loading...</p>;
	if (userError) return <p>Error: {userError.message}</p>;

  
  const { data: tenureLeaveSurveyData, isLoading: isTenureLeaveSurveyLoading, error: tenureLeaveSurveyError } = useTenureLeaveSurvey({
    emplNo: userData.loginUserId,
    retireReqDate: lastSegment,
    rtflowId: "A01", // 프로그램 코드
  });
	if (isTenureLeaveSurveyLoading) return <p>Loading...</p>;
	if (tenureLeaveSurveyError) return <p>Error: {tenureLeaveSurveyError.message}</p>;


  // console.log(tenureLeaveSurveyData);

  useEffect(() => {
    if (tenureLeaveSurveyData && lastSegment) {
      setForm((prev: any) => ({
        ...prev,
        emplNo: userData.loginUserId,
        retireReqDate: lastSegment,
        rtflowId: "A01", // 프로그램 코드
        emprt140Pop01List: tenureLeaveSurveyData.length > 0 ? tenureLeaveSurveyData : [{ ans1: "", ans2: "", ans3: "" }],
      }))
    }
  }, [tenureLeaveSurveyData, lastSegment])



  // console.log(form);

  const validateForm = () => {
    const newErrors = {
      emprt140Pop01List: [],
    };
    // setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleApply = async () => {
    // if (!validateForm()) {
    //   // setOpenToast({ message: "필수 값을 입력해주세요.", type: "danger", open: true });
    //   return;
    // } else {
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
        const response = await axiosInstance.post("/emp/dbhemprt/emprt140/pop01", formData);
        if (response.status === 200 && response.data) {
          setOpenToast({ message: "제출이 완료되었습니다.", type: "success", open: true });
        } else {
          setOpenToast({ message: "제출에 실패하였습니다.", type: "danger", open: true });
        }
      } catch (error: any) {
        setOpenToast({ message: error.response?.data?.message || "오류가 발생하였습니다.", type: "danger", open: true });
      }
    // }
  };

  const handleSelectChange = (field: string, value: any) => {
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



  
  return (
    <>
      <div className="pt-10 pb-10">
        <h3 className="fs-15 mt-15 mb-5">1. 귀하가 퇴사를 고민하게 된 주된 원인은 무엇인가요?(복수응답 가능)</h3>
        <div className="checkbox__list">
          {tenureLeaveSurveyData?.length > 0 && (
            <>
              <UICheckbox
                label="연봉"
                checked={tenureLeaveSurveyData[0]?.ans1 === "1" || false}
                onChecked={(chk) => handleSelectChange("emprt140Pop01List[0].ans1", chk ? "1" : "")}
              />
              <UICheckbox
                label="복리후생"
                checked={tenureLeaveSurveyData[0]?.ans2 === "2" || false}
                onChecked={(chk) => handleSelectChange("emprt140Pop01List[0].ans2", chk ? "Y" : "")}
              />
              <UICheckbox
                label="근무환경"
                checked={tenureLeaveSurveyData[0]?.ans3 === "3" || false}
                onChecked={(chk) => handleSelectChange("emprt140Pop01List[0].ans3", chk ? "Y" : "")}
              />
              <UICheckbox
                label="업무강도"
                checked={tenureLeaveSurveyData[0]?.ans4 === "4" || false}
                onChecked={(chk) => handleSelectChange("emprt140Pop01List[0].ans4", chk ? "Y" : "")}
              />
              <UICheckbox
                label="직무적성"
                checked={tenureLeaveSurveyData[0]?.ans5 === "5" || false}
                onChecked={(chk) => handleSelectChange("emprt140Pop01List[0].ans5", chk ? "Y" : "")}
              />
              <UICheckbox
                label="인간관계(상사)"
                checked={tenureLeaveSurveyData[0]?.ans6 === "6" || false}
                onChecked={(chk) => handleSelectChange("emprt140Pop01List[0].ans6", chk ? "Y" : "")}
              />
              <UICheckbox
                label="인간관계(동료/후배)"
                checked={tenureLeaveSurveyData[0]?.ans7 === "7" || false}
                onChecked={(chk) => handleSelectChange("emprt140Pop01List[0].ans7", chk ? "Y" : "")}
              />
              <UICheckbox
                label="육아/가사"
                checked={tenureLeaveSurveyData[0]?.ans8 === "8" || false}
                onChecked={(chk) => handleSelectChange("emprt140Pop01List[0].ans8", chk ? "Y" : "")}
              />
              <UICheckbox
                label="지역(출퇴근)"
                checked={tenureLeaveSurveyData[0]?.ans9 === "9" || false}
                onChecked={(chk) => handleSelectChange("emprt140Pop01List[0].ans9", chk ? "Y" : "")}
              />
              <UICheckbox
                label="건강"
                checked={tenureLeaveSurveyData[0]?.ans10 === "10" || false}
                onChecked={(chk) => handleSelectChange("emprt140Pop01List[0].ans10", chk ? "Y" : "")}
              />
              <UICheckbox
                label="가족간병/봉양"
                checked={tenureLeaveSurveyData[0]?.ans11 === "11" || false}
                onChecked={(chk) => handleSelectChange("emprt140Pop01List[0].ans11", chk ? "Y" : "")}
              />
              <UICheckbox
                label="기타 개인 사정"
                checked={tenureLeaveSurveyData[0]?.ans12 === "12" || false}
                onChecked={(chk) => handleSelectChange("emprt140Pop01List[0].ans12", chk ? "Y" : "")}
              />
              <UICheckbox
                label="평가"
                checked={tenureLeaveSurveyData[0]?.ans13 === "13" || false}
                onChecked={(chk) => handleSelectChange("emprt140Pop01List[0].ans13", chk ? "Y" : "")}
              />
              <UICheckbox
                label="승진누락"
                checked={tenureLeaveSurveyData[0]?.ans14 === "14" || false}
                onChecked={(chk) => handleSelectChange("emprt140Pop01List[0].ans14", chk ? "Y" : "")}
              />
              <UICheckbox
                label="자기개발"
                checked={tenureLeaveSurveyData[0]?.ans15 === "15" || false}
                onChecked={(chk) => handleSelectChange("emprt140Pop01List[0].ans15", chk ? "Y" : "")}
              />
              <UICheckbox
                label="진학"
                checked={tenureLeaveSurveyData[0]?.ans16 === "16" || false}
                onChecked={(chk) => handleSelectChange("emprt140Pop01List[0].ans16", chk ? "Y" : "")}
              />
              <UICheckbox
                label="사업"
                checked={tenureLeaveSurveyData[0]?.ans17 === "17" || false}
                onChecked={(chk) => handleSelectChange("emprt140Pop01List[0].ans17", chk ? "Y" : "")}
              />
            </>
          )}
        </div>
      </div>
      <div className="pt-10 pb-10">
        <h3 className="fs-15 mt-15 mb-5">2. 퇴직 후 계획하고 있는 진로는 무엇인가요?</h3>
        {tenureLeaveSurveyData?.length > 0 && (
          <UISelect
            label=""
            items={[
              {label: "동종업계 이직", error: false, query: "1"},
              {label: "이종업계 이직", error: false, query: "2"},
              {label: "사업", error: false, query: "3"},
              {label: "가사", error: false, query: "4"},
              {label: "이민", error: false, query: "5"},
              {label: "진학", error: false, query: "6"},
              {label: "요양", error: false, query: "7"},
              {label: "그룹사전출", error: false, query: "8"},
              {label: "기타(직접입력)", error: false, query: "9"},
            ]}
            onQuerySelect={(value) => handleSelectChange("emprt140Pop01List[1].ans1", value)}
            defaultValue={
              Object.keys(tenureLeaveSurveyData[1] || {})
                .filter((key) => key.startsWith("ans") && tenureLeaveSurveyData[1][key as keyof TenureLeaveSurvey] !== "")
                .map((key) => tenureLeaveSurveyData[0][key as keyof TenureLeaveSurvey])[0] || ""
            }
          />
        )}
      </div>
      <div className="pt-10 pb-200">
        <h3 className="fs-15 mt-15 mb-5">3. "이런 부분이 개선되었다면, 퇴사하지 않았을 것이다."에 대한 의견을 자유롭게 작성해주시기 바랍니다.</h3>
        {tenureLeaveSurveyData.length > 0 && (
          <UITextarea
            onChange={(value) => handleSelectChange("emprt140Pop01List[2].ans1", value)}
            defaultValue={tenureLeaveSurveyData[2]?.ans1}
          />)}
      </div>



      <div className="applyAction">
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
      {openToast.open && (
        <UIToast message={openToast.message} type={openToast.type} open={openToast.open} onOpenChange={setOpenToast} />
      )}
    </>
  )
}