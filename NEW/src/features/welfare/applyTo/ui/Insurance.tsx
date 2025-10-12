import { axiosInstance } from "@/app/api/axiosInstance";
import { useDateStore } from "@/app/store/authStore";
import { useUser } from "@/entities/user/api/useUser";
import { useInsurance, useInsurancePrevious } from "@/entities/welfare/api/useWelfare";
import { UIAlert, UIButton, UISelect, UIToast } from "@/shared/ui";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


export const Insurance = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    baseYear: "",
    reqDate: "",
    emplNo: "",
    emplNameHan: "",
    insGrpSeqBef: 0,
    insGrpSeq: 0,
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({
    baseYear: false,
    insGrpSeq: false,
  }); // 에러 메시지 관리


  // 조회일(today)
  const {currentDate, setCurrentDate} = useDateStore();
  const toDay = currentDate.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  
  // 사용자 기본정보
  const { data: userData, isLoading: isUserLoading, error: userError } = useUser();
	if (isUserLoading) return <p>Loading...</p>;
	if (userError) return <p>Error: {userError.message}</p>;

  // 보험 종류
  const { data: insuranceData, isLoading: isInsuranceLoading, error: insuranceError } = useInsurance({
    reqDate: toDay,
    emplNo: userData.loginUserId,
    emplNameHan: userData.loginUserNm,
  });
  if (isInsuranceLoading) return <p>Loading...</p>;
  if (insuranceError) return <p>Something went wrong!</p>;
  const insTarget = insuranceData.map((item) => { return {label: item.insName, error: false, query: {qs1: item.baseYear, qs2: item.insGrpSeq} } })

  // (이전 신청된)선택된 보험
  // const { data: insurancPreviouseData, isLoading: isInsurancePreviousLoading, error: insurancePreviousError } = useInsurancePrevious({
  //   reqDate: toDay,
  //   emplNo: userData.loginUserId,
  //   emplNameHan: userData.loginUserNm,
  // });
  // if (isInsurancePreviousLoading) return <p>Loading...</p>;
  // if (insurancePreviousError) return <p>Something went wrong!</p>;
  // console.log(insurancPreviouseData);

  


  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      baseYear: "",
      reqDate: toDay,
      emplNo: userData.loginUserId,
      emplNameHan: userData.loginUserNm,
      insGrpSeqBef: 0,
      insGrpSeq: 0,
    }));
  }, [userData])



  // 선택값 변경
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
    setErrors((prevErrors) => ({ ...prevErrors, [field]: false })); // Clear error on change
  };



  const validateForm = () => {
    const newErrors = {
      // certiCodeKind: !form.certiCodeKind, // 공통 필수값 검증
      baseYear: !form.baseYear,
      insGrpSeq: !form.insGrpSeq,
    };
    // 상태 업데이트
    setErrors(newErrors);
    // 오류가 없으면 true 반환
    return Object.values(newErrors).every((error) => !error);
  };


  // 보험 신청(+결과값 Toast 알림)
  const [openToast, setOpenToast] = useState({ message: "", type: "", open: false });
  const handleApply = async () => {
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
        const { data } = await axiosInstance.post('/wlf/wlfinsurance/wlfinsurance100/save', formData);
        if (data > 0) {
          setOpenToast({message: "결재요청이 완료되었습니다.", open: true, type: "success"});
          setTimeout(() => {
            setOpenToast((prev) => ({ ...prev, open: false }));
            navigate('/welfare')
          }, 1000);
        } else {
          setOpenToast({message: "결재요청에 이상이 있습니다.", open: true, type: "danger"});
        }
      } catch (error: any) {
        setOpenToast({message: error.response.data.message, open: true, type: "danger"});
      }
    }
  }

  return (
    <>
      <div className="pt-10 pb-10">
        <UISelect label="보험유형"
          items={insTarget}
          onQuerySelect={(value: any) => {
            handleSelectChange("baseYear", value.qs1);
            handleSelectChange("insGrpSeq", value.qs2);
          }}
          error={errors.insGrpSeq}
          hint={errors.insGrpSeq ? "필수값입니다." : ""}
        />
      </div>

      {/* <div className="pt-10 pb-10">
        {insuranceData.map((item: any, i) => 
          <div key={i}>
            <div dangerouslySetInnerHTML={{ __html: item.insVouch }}></div>
          </div>
        )}
      </div> */}

      {insuranceData.length === 0 ?
        <div className="applyAction">
          <UIButton type="primary" disabled>마감</UIButton>
        </div>
      :
        <>
          <div className="applyAction">
            <UIAlert
              description="신청하시겠습니까?"
              actionProps={{
                onClick: () => {
                  handleApply();
                },
              }}
            >
              <UIButton type="primary">신청</UIButton>
            </UIAlert>
          </div>
          {openToast.open && (
            <UIToast message={openToast.message} type={openToast.type} open={openToast.open} onOpenChange={setOpenToast} />
          )}
        </>
      }
    </>
  )
}