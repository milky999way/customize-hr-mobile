import { axiosInstance } from "@/app/api/axiosInstance";
import { useBaseCode } from "@/entities/approvalLine";
import { useTenureJoinApplyList } from "@/entities/tenure";
import { useUser } from "@/entities/user";
import { UIAlert, UIButton, UIDatePicker, UIInput, UISelect, UIToast } from "@/shared/ui"
import { useEffect, useState } from "react";



export const InfoApply04 = () => {
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
      entranceDate: "",
      grdtnDate: "",
      careerCodeSchool: "",
      schoolName: "",
      majorField: "",
      majorCode: "",
      degreeCode: "",
      degreeNo: "",
      remoteNm: "",
      paper: "",
      atchFileId1: "",
      fileSn1: "",
      fileName1: "",
      atchFIleId2: "",
      fileSn2: "",
      fileName2: "",
    }],
  });



  const { data: userData, isLoading: isUserLoading, error: userError } = useUser();
  if (isUserLoading) return <p>Loading...</p>;
  if (userError) return <p>Error: {userError.message}</p>;

  const { data: tenureJoinApplyListData, isLoading: isJoinApplyListLoading, error: joinApplyListError, refetch: refetchJoinApplyList } = useTenureJoinApplyList({
    apiName: "emppsmstinfo150",
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



  // 학력 코드 쿼리
  const parameters = {
    baseCodList: [
      { "patternCode": "PS21", "effDateYn": true, "companyYn": true },
      { "patternCode": "EDU14", "effDateYn": true, "companyYn": true },
      { "patternCode": "PS15", "effDateYn": true, "companyYn": true },
      { "patternCode": "EDU13", "effDateYn": true, "companyYn": true },
      { "patternCode": "SH40", "effDateYn": true, "companyYn": true },
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
  const academicDegree = codeData[0]?.map((codeItem: any) => { return {label: codeItem.codeName, error: false, query: codeItem.codeKey}})
  const academicMajor = codeData[1]?.map((codeItem: any) => { return {label: codeItem.codeName, error: false, query: codeItem.codeKey}})
  const academicAbility = codeData[2]?.map((codeItem: any) => { return {label: codeItem.codeName, error: false, query: codeItem.codeKey}})
  const academicMajorField = codeData[3]?.map((codeItem: any) => { return {label: codeItem.codeName, error: false, query: codeItem.codeKey}})
  const academicMajorName = codeData[4]?.map((codeItem: any) => { return {label: codeItem.codeName, error: false, query: codeItem.codeKey}})



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
      const response = await axiosInstance.post("/emp/psmstinfombl/emppsmstinfo100/emppsmstinfo150", formData);
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
      const response = await axiosInstance.post("/emp/psmstinfombl/emppsmstinfo100/emppsmstinfo150", formData);
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
    setForm((prevForm) => ({
      ...prevForm,
      psmstrMblList: [
        ...prevForm.psmstrMblList,
        {
          coCode: userData.loginCoId,
          emplNo: userData.loginUserId,
          entranceDate: "",
          grdtnDate: "",
          careerCodeSchool: "",
          schoolName: "",
          majorField: "",
          majorCode: "",
          degreeCode: "",
          degreeNo: "",
          remoteNm: "",
          paper: "",
          atchFileId1: "",
          fileSn1: "",
          fileName1: "",
          atchFIleId2: "",
          fileSn2: "",
          fileName2: "",
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
              label="학력구분"
              items={academicAbility}
              onQuerySelect={(value) => 
                setForm((prev) => ({
                  ...prev,
                  psmstrMblList: prev.psmstrMblList.map((item, i) =>
                    i === index ? { ...item, careerCodeSchool: value } : item
                  ),
                }))
              }
              defaultValue={tenureJoinApplyListData[index]?.careerCodeSchool}
              readOnly={fieldDisable}
            />
          </div>

          {form.psmstrMblList[index]?.careerCodeSchool === "05" ?
            <div className="pt-10 pb-10">
              <UISelect
                label="학교명"
                items={academicMajorName}
                onQuerySelect={(value) => 
                  setForm((prev) => ({
                    ...prev,
                    psmstrMblList: prev.psmstrMblList.map((item, i) =>
                      i === index ? { ...item, schoolName: value } : item
                    ),
                  }))
                }
                defaultValue={tenureJoinApplyListData[index]?.schoolName}
                readOnly={fieldDisable}
              />
            </div>
          : null}

          {form.psmstrMblList[index]?.careerCodeSchool !== "05" ?
            <div className="pt-10 pb-10">
              <UIInput
                label="학교명"
                onChange={(e) => 
                  setForm((prev) => ({
                    ...prev,
                    psmstrMblList: prev.psmstrMblList.map((item, i) =>
                      i === index ? { ...item, schoolName: e.target.value } : item
                    ),
                  }))
                }
                defaultValue={tenureJoinApplyListData[index]?.schoolName}
                readOnly={fieldDisable}
              />
            </div>
          : null}

          <div className="pt-10 pb-10">
            <UISelect
              label="전공계열"
              items={academicMajorField}
              onQuerySelect={(value) => 
                setForm((prev) => ({
                  ...prev,
                  psmstrMblList: prev.psmstrMblList.map((item, i) =>
                    i === index ? { ...item, majorField: value } : item
                  ),
                }))
              }
              defaultValue={tenureJoinApplyListData[index]?.majorField}
              readOnly={fieldDisable}
            />
          </div>
          <div className="pt-10 pb-10">
            <UISelect
              label="전공코드"
              items={academicMajor}
              onQuerySelect={(value) => 
                setForm((prev) => ({
                  ...prev,
                  psmstrMblList: prev.psmstrMblList.map((item, i) =>
                    i === index ? { ...item, majorCode: value } : item
                  ),
                }))
              }
              defaultValue={tenureJoinApplyListData[index]?.majorCode}
              readOnly={fieldDisable}
            />
          </div>
          <div className="pt-10 pb-10">
            <UIDatePicker
              label="입학일"
              onDateSelect={(value) => 
                setForm((prev) => ({
                  ...prev,
                  psmstrMblList: prev.psmstrMblList.map((item, i) =>
                    i === index ? { ...item, entranceDate: value } : item
                  ),
                }))
              }
              placeholder={tenureJoinApplyListData[index]?.entranceDate}
              readOnly={fieldDisable}
            />
          </div>
          <div className="pt-10 pb-10">
            <UIDatePicker
              label="졸업일"
              onDateSelect={(value) => 
                setForm((prev) => ({
                  ...prev,
                  psmstrMblList: prev.psmstrMblList.map((item, i) =>
                    i === index ? { ...item, grdtnDate: value } : item
                  ),
                }))
              }
              placeholder={tenureJoinApplyListData[index]?.grdtnDate}
              readOnly={fieldDisable}
            />
          </div>
          <div className="pt-10 pb-10">
            <UISelect
              label="학위코드"
              items={academicDegree}
              onQuerySelect={(value) => 
                setForm((prev) => ({
                  ...prev,
                  psmstrMblList: prev.psmstrMblList.map((item, i) =>
                    i === index ? { ...item, degreeCode: value } : item
                  ),
                }))
              }
              defaultValue={tenureJoinApplyListData[index]?.degreeCode}
              readOnly={fieldDisable}
            />
          </div>
          <div className="pt-10 pb-10">
            <UIInput
              label="소재지"
              onChange={(e) => 
                setForm((prev) => ({
                  ...prev,
                  psmstrMblList: prev.psmstrMblList.map((item, i) =>
                    i === index ? { ...item, remoteNm: e.target.value } : item
                  ),
                }))
              }
              defaultValue={tenureJoinApplyListData[index]?.remoteNm}
              readOnly={fieldDisable}
            />
          </div>
          <div className="pt-10 pb-10">
            <UIInput
              label="논문"
              onChange={(e) => 
                setForm((prev) => ({
                  ...prev,
                  psmstrMblList: prev.psmstrMblList.map((item, i) =>
                    i === index ? { ...item, paper: e.target.value } : item
                  ),
                }))
              }
              defaultValue={tenureJoinApplyListData[index]?.paper}
              readOnly={fieldDisable}
            />
          </div>
          <div className="pt-10 pb-10">
            <UIInput
              label="학위번호"
              onChange={(e) => 
                setForm((prev) => ({
                  ...prev,
                  psmstrMblList: prev.psmstrMblList.map((item, i) =>
                    i === index ? { ...item, degreeNo: e.target.value } : item
                  ),
                }))
              }
              defaultValue={tenureJoinApplyListData[index]?.degreeNo}
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
                      file1: e.target.files,
                      fileSn1: fileList[0].fileSn,
                      atchFileId1: fileList[0].atchFileId,
                    }: item
                  ),
                }))
              }}
              readOnly={fieldDisable}
            />
            <div className="pt-10 pb-10 fs-14 text-point-1">{form.psmstrMblList[index].fileName1}</div>
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
                      file2: e.target.files,
                      fileSn2: fileList[0].fileSn,
                      atchFileId2: fileList[0].atchFileId,
                    }: item
                  ),
                }))
              }}
              readOnly={fieldDisable}
            />
            <div className="pt-10 pb-10 fs-14 text-point-1">{form.psmstrMblList[index].fileName2}</div>
          </div>
        </div>
      ))}


      <div className="pt-10 pb-200">
        <UIButton type="border" onClick={handleAdd}>학력추가 +</UIButton>
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