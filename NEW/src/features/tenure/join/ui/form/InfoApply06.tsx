import { axiosInstance } from "@/app/api/axiosInstance";
import { useBaseCode } from "@/entities/approvalLine";
import { useTenureJoinApplyList } from "@/entities/tenure";
import { useUser } from "@/entities/user";
import { UIAlert, UIButton, UIDatePicker, UIInput, UISelect, UIToast } from "@/shared/ui"
import { useEffect, useState } from "react";



export const InfoApply06 = () => {
  const [disableSave, setDisableSave] = useState(false);
  const [disableApply, setDisableApply] = useState(false);
  const [fieldDisable, setFieldDisable] = useState(false);
  const [openToast, setOpenToast] = useState({ message: "", type: "", open: false });
  const [form, setForm] = useState({
    emplNo: "",
    loginCoId: "",
    psmstrMblList: [{
      coCode: "",
      emplNo: "",
      lisncCodeKind: "",
      lisncCodeGrade: "",
      acquireDate: "",
      lisncNo: "",
      orgNameIssue: "",
      file: "",
      atchFileId: "",
      fileSn: "",
      filePath: "",
      fileName: "",
    }],
  });



  const { data: userData, isLoading: isUserLoading, error: userError } = useUser();
  if (isUserLoading) return <p>Loading...</p>;
  if (userError) return <p>Error: {userError.message}</p>;

  const { data: tenureJoinApplyListData, isLoading: isJoinApplyListLoading, error: joinApplyListError, refetch: refetchJoinApplyList } = useTenureJoinApplyList({
    apiName: "emppsmstinfo180",
    emplNo: userData.loginUserId,
    loginCoId: userData.loginCoId
  });
  if (isJoinApplyListLoading) return <p>Loading...</p>;
  if (joinApplyListError) return <p>Error: {joinApplyListError.message}</p>;



  useEffect(() => {
    if (tenureJoinApplyListData && userData) {
      setForm((prev: any) => ({
        ...prev,
        emplNo: userData.loginUserId,
        loginCoId: userData.loginCoId,
        psmstrMblList: tenureJoinApplyListData.map((item: any, index: number) => ({
          ...item,
          emplNo: prev.psmstrMblList?.[index]?.emplNo || userData.loginUserId,
          coCode: prev.psmstrMblList?.[index]?.coCode || userData.loginCoId,
        })),
      }));
    }
  }, [tenureJoinApplyListData, userData]);



  // 자격증 코드 쿼리
  const parameters = {
    baseCodList: [
      { "patternCode": "PS39", "effDateYn": true, "companyYn": true },
      { "patternCode": "PS40", "effDateYn": true, "companyYn": true },
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
  const certificateType = codeData[0]?.map((codeItem: any) => { return {label: codeItem.codeName, error: false, query: codeItem.codeKey}})
  const certificateGrade = codeData[1]?.map((codeItem: any) => { return {label: codeItem.codeName, error: false, query: codeItem.codeKey}})



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
      const response = await axiosInstance.post("/emp/psmstinfombl/emppsmstinfo100/emppsmstinfo180", formData);
      if (response.status === 200 && response.data) {
        setOpenToast({ message: "저장이 완료되었습니다.", type: "success", open: true });
        setTimeout(async () => {
          setOpenToast((prev) => ({ ...prev, open: false }));
          await refetchJoinApplyList();
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
      const response = await axiosInstance.post("/emp/psmstinfombl/emppsmstinfo100/emppsmstinfo180", formData);
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



  const handleAdd = () => {
    setForm((prevForm: any) => ({
      ...prevForm,
      psmstrMblList: [
        ...prevForm.psmstrMblList,
        {
          coCode: userData.loginCoId,
          emplNo: userData.loginUserId,
          workplaceName: "",
          entranceDate: "",
          retireDate: "",
          gradeNameHan: "",
          jobkindNameHan: "",
          jobNameHan: "",
          jobNameDtl: "",
          file: "",
          atchFileId: "",
          fileSn: "",
          filePath: "",
        }
      ],
    }));
  };
  


  return (
    <>
      {form.psmstrMblList.map((family, index) => (
        <div key={index} className="pb-30 mb-30" style={{borderBottom: "0.1rem dashed #07ae55"}}>
          <div className="pt-10 pb-10">
            <UISelect
              label="자격증종류"
              items={certificateType}
              onQuerySelect={(value) => 
                setForm((prev) => ({
                  ...prev,
                  psmstrMblList: prev.psmstrMblList.map((item, i) =>
                    i === index ? { ...item, lisncCodeKind: value } : item
                  ),
                }))
              }
              defaultValue={tenureJoinApplyListData[index]?.lisncCodeKind}
              readOnly={fieldDisable}
            />
          </div>
          <div className="pt-10 pb-10">
            <UISelect
              label="자격증등급"
              items={certificateGrade}
              onQuerySelect={(value) => 
                setForm((prev) => ({
                  ...prev,
                  psmstrMblList: prev.psmstrMblList.map((item, i) =>
                    i === index ? { ...item, lisncCodeGrade: value } : item
                  ),
                }))
              }
              defaultValue={tenureJoinApplyListData[index]?.lisncCodeGrade}
              readOnly={fieldDisable}
            />
          </div>
          <div className="pt-10 pb-10">
            <UIDatePicker
              label="취득일"
              onDateSelect={(value) => 
                setForm((prev) => ({
                  ...prev,
                  psmstrMblList: prev.psmstrMblList.map((item, i) =>
                    i === index ? { ...item, acquireDate: value } : item
                  ),
                }))
              }
              placeholder={tenureJoinApplyListData[index]?.acquireDate}
              readOnly={fieldDisable}
            />
          </div>
          <div className="pt-10 pb-10">
            <UIInput
              label="자격증번호"
              onChange={(e) => 
                setForm((prev) => ({
                  ...prev,
                  psmstrMblList: prev.psmstrMblList.map((item, i) =>
                    i === index ? { ...item, lisncNo: e.target.value } : item
                  ),
                }))
              }
              defaultValue={tenureJoinApplyListData[index]?.lisncNo}
              readOnly={fieldDisable}
            />
          </div>
          <div className="pt-10 pb-10">
            <UIInput
              label="발급기관"
              onChange={(e) => 
                setForm((prev) => ({
                  ...prev,
                  psmstrMblList: prev.psmstrMblList.map((item, i) =>
                    i === index ? { ...item, orgNameIssue: e.target.value } : item
                  ),
                }))
              }
              defaultValue={tenureJoinApplyListData[index]?.orgNameIssue}
              readOnly={fieldDisable}
            />
          </div>
          <div className="pt-10 pb-10">
            <input
              type="file"
              onChange={ async (e: React.ChangeEvent<HTMLInputElement>) => {
                const { data } = await axiosInstance.post("/files/upload-atchfile", e.target.files,
                  { headers: { "Content-Type" : "multipart/form-data" } }
                );
                const fileList = Array.from(data).map((file:any, index:any) => ({
                  fileSn: file.fileSn,
                  atchFileId: file.atchFileId,
                }))
                setForm((prev) => ({
                  ...prev,
                  psmstrMblList: prev.psmstrMblList.map((item: any, i) =>
                    i === index ? {
                      ...item,
                      file: e.target.files,
                      fileSn: fileList[0].fileSn,
                      atchFileId: fileList[0].atchFileId,
                    }: item
                  ),
                }))
              }}
              readOnly={fieldDisable}
            />
            <div className="pt-10 pb-10 fs-14 text-point-1">{form.psmstrMblList[index].fileName}</div>
          </div>
        </div>
      ))}


      <div className="pt-10 pb-200">
        <UIButton type="border" onClick={handleAdd}>자격추가 +</UIButton>
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