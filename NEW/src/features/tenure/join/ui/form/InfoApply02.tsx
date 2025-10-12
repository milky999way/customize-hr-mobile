import { axiosInstance } from "@/app/api/axiosInstance";
import { useBaseCode } from "@/entities/approvalLine";
import { useTenureJoinApply } from "@/entities/tenure";
import { useUser } from "@/entities/user";
import { UIAlert, UIButton, UIDatePicker, UIInput, UISelect, UIToast } from "@/shared/ui"
import { useEffect, useState } from "react";


export const InfoApply02 = () => {
  const { data: userData, isLoading: isUserLoading, error: userError } = useUser();
  if (isUserLoading) return <p>Loading...</p>;
  if (userError) return <p>Error: {userError.message}</p>;

  const { data: tenureJoinApplyData, isLoading: isJoinApplyLoading, error: joinApplyError, refetch: refetchJoinApply } = useTenureJoinApply({
    apiName: "emppsmstinfo130",
    emplNo: userData.loginUserId,
    loginCoId: userData.loginCoId
  });
  if (isJoinApplyLoading) return <p>Loading...</p>;
  if (joinApplyError) return <p>Error: {joinApplyError.message}</p>;


  const [openToast, setOpenToast] = useState({ message: "", type: "", open: false });
  const [disableSave, setDisableSave] = useState(false);
  const [disableApply, setDisableApply] = useState(false);
  const [fieldDisable, setFieldDisable] = useState(false);
  const [form, setForm] = useState({
    emplNo: "",
    loginCoId: "",

    coCode: "",
    armyCode: "",
    rankCode: "",
    serviceNo: "",
    serviceDateFrom: "",
    serviceDateTo: "",
    rsnCodeDischarge: "",
  });
  

  useEffect(() => {
    if (tenureJoinApplyData && userData) {
      setForm((prev) => ({
        ...prev,
        ...tenureJoinApplyData
        // emplNo: tenureJoinApplyData.emplNo || userData.loginUserId,
        // loginCoId: tenureJoinApplyData.coCode || userData.loginCoId,

        // coCode: tenureJoinApplyData.coCode || "",
        // armyCode: tenureJoinApplyData.armyCode || "",
        // rankCode: tenureJoinApplyData.rankCode || "",
        // serviceNo: tenureJoinApplyData.serviceNo || "",
        // serviceDateFrom: tenureJoinApplyData.serviceDateFrom || "",
        // serviceDateTo: tenureJoinApplyData.serviceDateTo || "",
        // rsnCodeDischarge: tenureJoinApplyData.rsnCodeDischarge || "",
      }))
    }
  }, [tenureJoinApplyData, userData])


  // 병역 코드 쿼리
  const parameters = {
    baseCodList: [
      { "patternCode": "PS27", "effDateYn": true, "companyYn": true },
      { "patternCode": "PS29", "effDateYn": true, "companyYn": true },
      { "patternCode": "PS26", "effDateYn": true, "companyYn": true },
    ]
  }
  const { data: baseCodeData, isLoading: isBaseCodeLoading, error: baseCodeError } = useBaseCode(parameters);
	if (isBaseCodeLoading) return <p>Loading...</p>;
	if (baseCodeError) return <p>Something went wrong!</p>;
  const codeData = baseCodeData && baseCodeData.map((code: any) =>
    code.cdbaseList.map((cd: any) => (
      {codeKey : cd.baseCode, codeName: cd.codeNameHan}
    ))
  )
  const militaryType = codeData[0]?.map((codeItem: any) => { return {label: codeItem.codeName, error: false, query: codeItem.codeKey}})
  const militaryClass = codeData[1]?.map((codeItem: any) => { return {label: codeItem.codeName, error: false, query: codeItem.codeKey}})
  const militaryDischarge = codeData[2]?.map((codeItem: any) => { return {label: codeItem.codeName, error: false, query: codeItem.codeKey}})




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
      const response = await axiosInstance.post("/emp/psmstinfombl/emppsmstinfo100/emppsmstinfo130", formData);
      if (response.status === 200 && response.data) {
        setOpenToast({ message: "저장이 완료되었습니다.", type: "success", open: true });
        setTimeout(async () => {
          setOpenToast((prev) => ({ ...prev, open: false }));
          await refetchJoinApply();
        }, 1000);
      } else {
        setOpenToast({ message: "저장이 실패하였습니다.", type: "danger", open: true });
      }
    } catch (error: any) {
      setOpenToast({ message: error.response?.data?.message || "오류가 발생하였습니다.", type: "danger", open: true });
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
      const response = await axiosInstance.post("/emp/psmstinfombl/emppsmstinfo100/emppsmstinfo130", formData);
      if (response.status === 200 && response.data) {
        const { data } = await axiosInstance.post("/emp/psmstinfombl/emppsmstinfo100/send", formData);
        if (data) {
          setOpenToast({ message: "제출이 완료되었습니다.", type: "success", open: true });
          setTimeout(async () => {
            setOpenToast((prev) => ({ ...prev, open: false }));
            setFieldDisable(true);
            setDisableSave(true);
            setDisableApply(true);
          }, 1000);
        } else {
          setOpenToast({ message: "제출에 실패하였습니다.", type: "danger", open: true });
        }
      } else {
        setOpenToast({ message: "제출에 실패하였습니다.", type: "danger", open: true });
      }
    } catch (error: any) {
      setOpenToast({ message: error.response?.data?.message || "오류가 발생하였습니다.", type: "danger", open: true });
    }
  }
  


  
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
  };



  return (
    <>
      <div className="pt-10 pb-10">
        <UISelect
          label="군별"
          items={militaryType}
          // onQuerySelect={(value) =>
          //   setForm((prev) => ({
          //     ...prev,
          //     armyCode: value
          //   }))
          // }
          onQuerySelect={(value) => handleSelectChange("armyCode", value)}
          defaultValue={tenureJoinApplyData.armyCode}
          readOnly={fieldDisable}
        />
      </div>
      <div className="pt-10 pb-10">
        <UISelect
          label="계급"
          items={militaryClass}
          // onQuerySelect={(value) =>
          //   setForm((prev) => ({
          //     ...prev,
          //     rankCode: value
          //   }))
          // }
          onQuerySelect={(value) => handleSelectChange("rankCode", value)}
          defaultValue={tenureJoinApplyData.rankCode}
          readOnly={fieldDisable}
        />
      </div>
      <div className="pt-10 pb-10">
        <UIInput
          label="군번"
          onChange={(e) => handleSelectChange("serviceNo", e.target.value )}
          defaultValue={tenureJoinApplyData.serviceNo}
          readOnly={fieldDisable}
        />
      </div>
      <div className="pt-10 pb-10">
        <UIDatePicker
          label="복무시작일"
          // onDateSelect={(value) =>
          //   setForm((prev) => ({
          //     ...prev,
          //     serviceDateFrom: value
          //   }))
          // }
          onDateSelect={(value) => handleSelectChange("serviceDateFrom", value )}
          placeholder={tenureJoinApplyData.serviceDateFrom}
          readOnly={fieldDisable}
        />
      </div>
      <div className="pt-10 pb-10">
        <UIDatePicker
          label="복무종료일"
          // onDateSelect={(value) =>
          //   setForm((prev) => ({
          //     ...prev,
          //     serviceDateTo: value
          //   }))
          // }
          onDateSelect={(value) => handleSelectChange("serviceDateTo", value )}
          placeholder={tenureJoinApplyData.serviceDateTo}
          readOnly={fieldDisable}
        />
      </div>
      <div className="pt-10 pb-200">
        <UISelect
          label="전역사유"
          items={militaryDischarge}
          // onQuerySelect={(value) =>
          //   setForm((prev) => ({
          //     ...prev,
          //     rsnCodeDischarge: value
          //   }))
          // }
          onQuerySelect={(value) => handleSelectChange("rsnCodeDischarge", value )}
          defaultValue={tenureJoinApplyData.rsnCodeDischarge}
          readOnly={fieldDisable}
        />
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
          description="제출하시겠습니까?"
          actionProps={{
            onClick: () => {
              handleApply();
            },
          }}
        >
          <UIButton type="primary" disabled={disableApply}>제출</UIButton>
        </UIAlert>
      </div>


      {openToast.open && (
        <UIToast message={openToast.message} type={openToast.type} open={openToast.open} onOpenChange={setOpenToast} />
      )}
    </>
  )
}