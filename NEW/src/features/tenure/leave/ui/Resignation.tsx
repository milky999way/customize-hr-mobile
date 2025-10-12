import { axiosInstance } from "@/app/api/axiosInstance";
import { useApprovalDocument, useApprovalForm, useApprovalLine } from "@/entities/approvalLine";
import { useSalarySeverance } from "@/entities/salary";
import { useTenureLeaveResignation } from "@/entities/tenure";
import { useUser } from "@/entities/user";
import { UIAlert, UIButton, UICheckbox, UIInput, UITextarea, UIToast } from "@/shared/ui"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Resignation = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    chargeJob: "",
    detailReason: "",
    telNo: "",
    docNo: "",
    mblPgmId: "",
    statusCode: "1",
    // saveFlag: "Y",
    // emlpNo: "10006254",
    // emplNameHan: "노태규",
    // entranceDate: "2021-09-01",
    // workPeriod: "3년3개월22일",
    // address: "인천광역시 서구 한들로 73-0 (백석동, 검암역로열파크씨티푸르지오2단지) 208동 1303호",
  });
  const [errors, setErrors] = useState({
    chargeJob: false,
    detailReason: false
  });
  const [openToast, setOpenToast] = useState({ message: "", type: "", open: false });

  const [fieldDisable, setFieldDisable] = useState(false);
  const [disableSave, setDisableSave] = useState(false);
  const [disableApply, setDisableApply] = useState(true);


  const { data: userData, isLoading: isUserLoading, error: userError } = useUser();
	if (isUserLoading) return <p>Loading...</p>;
	if (userError) return <p>Error: {userError.message}</p>;

  const { data: approvalFormData, isLoading: isApprovalFormLoading, error: approvalFormError } = useApprovalForm();
  if (isApprovalFormLoading) return <p>Loading...</p>;
  if (approvalFormError) return <p>Something went wrong!</p>;
  const selectedForm = approvalFormData?.filter((i) => i.formId === "RT")[0] // 퇴직사직원(코드)
  
  const { data: approvalLineData, isLoading: isApprovalLineLoading, error: approvalLineError } = useApprovalLine({
    formId: selectedForm?.formId,
    emplNo: userData.loginUserId,
  });
  if (isApprovalLineLoading) return <p>Loading...</p>;
  if (approvalLineError) return <p>Something went wrong!</p>;

  const { data: approvalDocumentData, isLoading: isApprovalDocumentLoading, error: approvalDocumentError } = useApprovalDocument(userData.loginUserId);
  if (isApprovalDocumentLoading) return <p>Loading...</p>;
  if (approvalDocumentError) return <p>Something went wrong!</p>;

  const { data: tenureLeaveResignation, isLoading: isTenureLeaveResignationLoading, error: tenureLeaveResignationError } = useTenureLeaveResignation({
    reqEmplNo: userData.loginUserId,
    orgCode: userData.loginDeptId,
    orgNameHan: userData.loginDeptName,
    statusCode: "N", // 미제출
    reCd: ""
  });
  if (isTenureLeaveResignationLoading) return <p>Loading...</p>;
  if (tenureLeaveResignationError) return <p>Something went wrong!</p>;

  const { data: severanceData, isLoading: isSeveranceLoading, error: severanceError } = useSalarySeverance({
    emplNo: userData.loginUserId,
  });
	if (isSeveranceLoading) return <p>Loading...</p>;
	if (severanceError) return <p>Something went wrong!</p>;


  console.log(severanceData)


  useEffect(() => {
    // 결재 라인-기안서 세팅
    setForm((prev) => ({
      ...prev,
      chk1: "",
      chk2: "",
      chk3: "",
      chk4: "",
      chk5: "",
      chk6: "",
      chk7: "",
      chk8: "",
      rtOrgNm: userData.loginDeptName,
      emplNo: userData.loginUserId,
      emplNameHan: userData.loginUserNm,
      entranceDate: userData.loginEntranceDate,

      docNo: tenureLeaveResignation[0].docNo ? tenureLeaveResignation[0].docNo : approvalDocumentData,
      docTitlNm: `${selectedForm?.formName}-${userData.loginUserNm}`,
      formId: selectedForm?.formId,
      pgmId: selectedForm?.pgmId,
      reqEmplNo: userData.loginUserId,
      reqEmplName: userData.loginUserNm,
      aprvPathOrder: approvalLineData.map(item => item.emplNameHan).join("^"),
      aprvdetailDtoList: approvalLineData.map((item, index) => ({
        docNo: tenureLeaveResignation[0].docNo ? tenureLeaveResignation[0].docNo : approvalDocumentData,
        aprvSeqNo: index + 1,
        aprvType: item.aprvType,
        aprvEmplNo: item.emplNo,
        transInd: "",
        tarnsEmplNo: "",
        statusCode: item.aprvDepth,
      }))
    }));
  }, [userData, approvalLineData, approvalDocumentData, tenureLeaveResignation])




  const validateForm = () => {
    const newErrors = {
      chargeJob: !form.chargeJob,
      detailReason: !form.detailReason
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
        const response = await axiosInstance.post("/emp/dbhemprt/emprt150", formData);
        if (response.status === 200 && response.data) {
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
      const { data } = await axiosInstance.post('/system/aprvlineset', formData);
      if (data === true) {
        setOpenToast({message: "신청이 완료되었습니다.", open: true, type: "success"});
        setTimeout(() => {
          setOpenToast((prev) => ({ ...prev, open: false }));
          setDisableApply(true);
          navigate("/tenure/leave-flow");
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

  const handleSelectChange = (field: string, value: any) => {
    setForm((prevForm) => ({ ...prevForm, [field]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [field]: false })); // Clear error on change
  };
  
  return (
    <>
      <div className="pt-10 pb-10">
        <UIInput
          label="담당업무"
          onChange={(e) => handleSelectChange("chargeJob", e.target.value)}
          error={errors.chargeJob}
          hint={errors.chargeJob ? "필수값입니다." : ""}
          readOnly={fieldDisable}
        />
      </div>
      <div className="pt-10 pb-10">
        <div className="checkbox__list">
          <UICheckbox
            label="처우"
            value="chk1"
            onChecked={(chk) => handleSelectChange("chk1", chk ? "1" : "")}
            disabled={fieldDisable}
          />
          <UICheckbox
            label="직무/조직"
            value="chk2"
            onChecked={(chk) => handleSelectChange("chk2", chk ? "2" : "")}
            disabled={fieldDisable}
          />
          <UICheckbox
            label="인간관계"
            value="chk3"
            onChecked={(chk) => handleSelectChange("chk3", chk ? "3" : "")}
            disabled={fieldDisable}
          />
          <UICheckbox
            label="자기계발"
            value="chk4"
            onChecked={(chk) => handleSelectChange("chk4", chk ? "4" : "")}
            disabled={fieldDisable}
          />
          <UICheckbox
            label="개인사정"
            value="chk5"
            onChecked={(chk) => handleSelectChange("chk5", chk ? "5" : "")}
            disabled={fieldDisable}
          />
          <UICheckbox
            label="계약종료"
            value="chk6"
            onChecked={(chk) => handleSelectChange("chk6", chk ? "6" : "")}
            disabled={fieldDisable}
          />
          <UICheckbox
            label="승진누락"
            value="chk7"
            onChecked={(chk) => handleSelectChange("chk7", chk ? "7" : "")}
            disabled={fieldDisable}
          />
          <UICheckbox
            label="기타"
            value="chk8"
            onChecked={(chk) => handleSelectChange("chk8", chk ? "8" : "")}
            disabled={fieldDisable}
          />
        </div>
      </div>
      <div className="pt-10 pb-10">
        <UITextarea
          label="상세사유"
          onChange={(e) => handleSelectChange("detailReason", e.target.value)}
          error={errors.detailReason}
          hint={errors.detailReason ? "필수값입니다." : ""}
          disabled={fieldDisable}
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
          description="신청하시겠습니까?"
          actionProps={{
            onClick: () => {
              handleApply();
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